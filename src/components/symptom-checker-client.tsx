'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { guideSymptomAssessment } from '@/app/ai/flows/guide-symptom-assessment';
import { speechToText } from '@/app/ai/flows/speech-to-text';
import { textToSpeech } from '@/app/ai/flows/text-to-speech';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    Bot,
    Languages,
    Loader2,
    Mic,
    MicOff,
    Send,
    User,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    options?: string[];
    audioDataUri?: string;
};

const indianLanguages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi (हिन्दी)' },
    { value: 'bn', label: 'Bengali (বাংলা)' },
    { value: 'te', label: 'Telugu (తెలుగు)' },
    { value: 'mr', label: 'Marathi (मराठी)' },
    { value: 'ta', label: 'Tamil (தமிழ்)' },
    { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
    { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'ml', label: 'Malayalam (മലയാളം)' },
    { value: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
];

export function SymptomCheckerClient() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content:
                "Hello! I'm your AI Health Assistant. What is your primary symptom today?",
        },
    ]);
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState('en');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const [isRecording, setIsRecording] = useState(false);
    const [audioPlayback, setAudioPlayback] = useState<{ [key: number]: boolean }>({});
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const latestMessageRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (latestMessageRef.current) {
            latestMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = (messageContent: string) => {
        if (!messageContent.trim() || isPending) return;

        const userMessage: Message = { role: 'user', content: messageContent };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        startTransition(async () => {
            try {
                const conversationHistory = [...messages, userMessage]
                    .map((m) => `${m.role}: ${m.content}`)
                    .join('\n');

                const result = await guideSymptomAssessment({
                    symptoms: messageContent,
                    conversationHistory: conversationHistory,
                    language: indianLanguages.find(l => l.value === language)?.label.split(' ')[0] || 'English',
                });

                let aiResponse = result.nextQuestion;
                if (result.suggestedDiagnosis) {
                    aiResponse += `\n\n**Potential Diagnosis:** ${result.suggestedDiagnosis}`;
                }
                if (result.suggestedMedicines) {
                    aiResponse += `\n\n**Suggested Medicines:** ${result.suggestedMedicines}`;
                }
                if (result.homeRemedies) {
                    aiResponse += `\n\n**Home Remedies:** ${result.homeRemedies}`;
                }
                if (result.urgencyAdvice) {
                    aiResponse += `\n\n**Advice:** ${result.urgencyAdvice}`;
                }

                const { audioDataUri } = await textToSpeech({ text: aiResponse });

                const assistantMessage: Message = {
                    role: 'assistant',
                    content: aiResponse,
                    options: result.options,
                    audioDataUri,
                };
                setMessages((prev) => [...prev, assistantMessage]);

            } catch (error) {
                console.error(error);
                toast({
                    variant: 'destructive',
                    title: 'An error occurred',
                    description: 'Failed to get a response. Please try again.',
                });
                setMessages((prev) => prev.slice(0, -1));
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(input);
    };

    const handleOptionClick = (option: string) => {
        handleSend(option);
    };

    const handleLanguageChange = (value: string) => {
        setLanguage(value);
        setMessages([
            {
                role: 'assistant',
                content:
                    "Hello! I'm your AI Health Assistant. What is your primary symptom today?",
            },
        ]);
    };

    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const handleToggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            await startRecording();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });

            // Audio Context Setup for Silence Detection
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.fftSize = 256;
            source.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            sourceRef.current = source;

            // Silence Detection Logic
            scriptProcessor.onaudioprocess = () => {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                const arraySum = array.reduce((a, value) => a + value, 0);
                const average = arraySum / array.length;

                // Threshold for silence (adjustable)
                if (average < 10) {
                    if (!speechTimeoutRef.current) {
                        speechTimeoutRef.current = setTimeout(() => {
                            stopRecording();
                        }, 2000); // Stop after 2 seconds of silence
                    }
                } else {
                    // Speaking detected, clear timeout
                    if (speechTimeoutRef.current) {
                        clearTimeout(speechTimeoutRef.current);
                        speechTimeoutRef.current = null;
                    }
                }
            };

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64data = reader.result as string;
                    startTransition(async () => {
                        try {
                            const { text } = await speechToText({ audioDataUri: base64data });
                            if (text && text.trim()) {
                                handleSend(text);
                            } else {
                                toast({
                                    title: "No speech detected",
                                    description: "Please try speaking again.",
                                    variant: "default"
                                });
                            }
                        } catch (error) {
                            console.error(error);
                            toast({
                                variant: 'destructive',
                                title: 'Speech-to-Text Error',
                                description: 'Could not transcribe audio. Please try again.',
                            });
                        }
                    });
                };

                // Cleanup Audio Context
                if (audioContextRef.current) {
                    audioContextRef.current.close();
                    audioContextRef.current = null;
                }
                if (speechTimeoutRef.current) {
                    clearTimeout(speechTimeoutRef.current);
                    speechTimeoutRef.current = null;
                }

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            toast({
                title: "Listening...",
                description: "Speak now. Recording will stop automatically when you finish.",
            });

        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast({
                variant: 'destructive',
                title: 'Microphone Access Denied',
                description: 'Please enable microphone permissions in your browser settings.',
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const toggleAudioPlayback = (index: number, audioDataUri?: string) => {
        if (audioPlayback[index]) {
            audioRef.current?.pause();
            setAudioPlayback((prev) => ({ ...prev, [index]: false }));
        } else if (audioDataUri) {
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
                // Reset all other playback states
                setAudioPlayback({});
            }

            const audio = new Audio(audioDataUri);
            audioRef.current = audio;
            setAudioPlayback((prev) => ({ ...prev, [index]: true }));
            audio.play();
            audio.onended = () => {
                setAudioPlayback((prev) => ({ ...prev, [index]: false }));
            };
        }
    };

    const hasOptions =
        (messages[messages.length - 1]?.options?.length ?? 0) > 0 &&
        messages[messages.length - 1].role === 'assistant';

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b bg-card p-4">
                <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">
                        AI Symptom Checker
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-muted-foreground" />
                    <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            {indianLanguages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </header>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            ref={index === messages.length - 1 ? latestMessageRef : null}
                            className={cn(
                                'flex items-start gap-4',
                                message.role === 'user' ? 'justify-end' : ''
                            )}
                        >
                            {message.role === 'assistant' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/20">
                                        <Bot className="h-5 w-5 text-primary" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                    'relative max-w-[85%] rounded-lg p-3 shadow-sm',
                                    message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-card border'
                                )}
                            >
                                <p
                                    className="whitespace-pre-wrap text-sm"
                                    dangerouslySetInnerHTML={{
                                        __html: message.content.replace(
                                            /\*\*(.*?)\*\*/g,
                                            '<strong>$1</strong>'
                                        ),
                                    }}
                                ></p>
                                {message.role === 'assistant' && message.audioDataUri && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute -right-2 -top-2 h-7 w-7 bg-background shadow-sm border rounded-full"
                                        onClick={() => toggleAudioPlayback(index, message.audioDataUri)}
                                    >
                                        {audioPlayback[index] ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    </Button>
                                )}
                                {message.role === 'assistant' && message.options && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {message.options.map((option, i) => (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                size="sm"
                                                className="bg-background"
                                                onClick={() => handleOptionClick(option)}
                                                disabled={
                                                    isPending || (hasOptions && index < messages.length - 1)
                                                }
                                            >
                                                {option}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {message.role === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/20">
                                        <User className="h-5 w-5 text-primary" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isPending && (
                        <div className="flex items-start gap-4" ref={latestMessageRef}>
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/20">
                                    <Bot className="h-5 w-5 text-primary" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="max-w-md rounded-lg bg-card p-3 shadow-sm border">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="border-t bg-card p-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            hasOptions ? 'Select an option above' : 'Type or record your message...'
                        }
                        autoComplete="off"
                        className="flex-1"
                        disabled={isPending || hasOptions || isRecording}
                    />
                    <Button
                        type="button"
                        size="icon"
                        variant={isRecording ? 'destructive' : 'outline'}
                        onClick={handleToggleRecording}
                        disabled={isPending || hasOptions}
                    >
                        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isPending || hasOptions || isRecording}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
