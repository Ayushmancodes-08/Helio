const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    console.error('Please ensure you have a .env.local file with these keys to perform a full cleanup.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TABLES_TO_CLEAR = [
    'appointments',
    'prescriptions',
    'lab_reports',
    'inventory',
    'pharmacy_sales',
    'disease_reports',
    'health_alerts'
];

async function cleanData() {
    console.log(' Starting cleanup for trial...');

    for (const table of TABLES_TO_CLEAR) {
        try {
            console.log(`Clearing table: ${table}...`);
            const { error } = await supabase
                .from(table)
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows (neq a dummy UUID)

            if (error) {
                console.error(`Status: Failed to clear ${table}:`, error.message);
            } else {
                console.log(`Status: Cleared ${table} successfully.`);
            }
        } catch (err) {
            console.error(`Unexpected error clearing ${table}:`, err.message);
        }
    }

    console.log(' Cleanup detailed complete.');
}

cleanData();
