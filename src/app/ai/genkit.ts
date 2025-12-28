import { genkit, Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the main instance with the default key (fallback)
const mainInstance = genkit({
    plugins: [googleAI()], // Uses GOOGLE_GENAI_API_KEY by default
    model: 'googleai/gemini-2.5-flash',
});

// Create a pool of instances
const instances: Genkit[] = [mainInstance];

// Initialize additional instances if keys are present
const MAX_KEYS = 10; // Cap to avoid infinite loops if user has many
for (let i = 1; i <= MAX_KEYS; i++) {
    const key = process.env[`GOOGLE_GENAI_API_KEY_${i}`];
    if (key) {
        console.log(`[Genkit] Initializing instance for key ${i}`);
        instances.push(genkit({
            plugins: [googleAI({ apiKey: key })],
            model: 'googleai/gemini-2.5-flash',
        }));
    }
}

console.log(`[Genkit] Initialized pool with ${instances.length} instances.`);

let currentInstanceIndex = 0;

/**
 * rounds robin selection of a Genkit instance
 */
function getNextInstance(): Genkit {
    const instance = instances[currentInstanceIndex];
    currentInstanceIndex = (currentInstanceIndex + 1) % instances.length;
    return instance;
}

/**
 * Execute a function with retry logic specifically for rate limits (429)
 */
async function activeRotationExecute<T>(
    operation: (instance: Genkit) => Promise<T>,
    retries = 3
): Promise<T> {
    let lastError: any;
    // Try up to 'retries' * 'instances.length' times effectively, but let's keep it simple
    // We will try `retries` times, rotating the key each time.
    for (let attempt = 0; attempt < retries; attempt++) {
        const instance = getNextInstance();
        try {
            return await operation(instance);
        } catch (error: any) {
            lastError = error;
            // Check if it's a rate limit error (429) or a generic "resource exhausted"
            const isRateLimit =
                error?.status === 429 ||
                error?.message?.includes('429') ||
                error?.message?.includes('Resource has been exhausted');

            if (isRateLimit) {
                console.warn(`[Genkit] Rate limit hit on attempt ${attempt + 1}. Rotating key...`);
                continue;
            }
            // If it's not a rate limit, throw immediately (unlikely to be fixed by rotation)
            throw error;
        }
    }
    throw lastError;
}

// Create the Proxy object to intercept calls
export const ai = new Proxy(mainInstance, {
    get(target, prop, receiver) {
        // Intercept definePrompt
        if (prop === 'definePrompt') {
            return (options: any) => {
                // Register the prompt on ALL instances to ensure they 'know' about it
                // We map them to executables
                const executables = instances.map(inst => inst.definePrompt(options));

                // Return a wrapper that executes the prompt using the rotation logic
                return async (input: any) => {
                    return activeRotationExecute(async (activeInstance) => {
                        // Find the index of the active instance to use the corresponding executable
                        // Note: strict equality check might fail if instances are recreated, 
                        // but here they are stable. using index is safer.
                        const index = instances.indexOf(activeInstance);
                        if (index === -1) throw new Error("Active instance not found in pool");
                        return executables[index](input);
                    }, instances.length * 2); // Retry more times than keys provided
                };
            };
        }

        // Intercept generate (direct usage)
        if (prop === 'generate') {
            return async (options: any) => {
                return activeRotationExecute(async (activeInstance) => {
                    return activeInstance.generate(options);
                }, instances.length * 2);
            }
        }

        // Pass through everything else (like defineFlow) to the main instance
        // Flows are definitions, not executions, so defining them once on the main instance is usually fine
        // UNLESS the flow *internally* calls methods that aren't intercepted.
        // But our flows call `prompt()` which IS intercepted above (because we wrap the result of definePrompt).
        return Reflect.get(target, prop, receiver);
    }
});
