
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns(table) {
    // Attempt to fetch table schema information to get column data types
    // This often requires specific database permissions or a custom RPC function.
    // Supabase's standard client doesn't directly expose `information_schema` easily.

    // Let's try a common approach for PostgreSQL to get column types if possible.
    // This might not work depending on user permissions.
    try {
        const { data: columns, error: schemaError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_schema', 'public') // Assuming 'public' schema
            .eq('table_name', table);

        if (schemaError) {
            console.warn(`Could not fetch schema for ${table} (permissions issue?):`, schemaError.message);
            // Fallback to checking columns via data if schema access is denied
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                console.error(`Error querying ${table}:`, error);
            } else if (data && data.length > 0) {
                console.log(`Columns in ${table} (from sample data):`, Object.keys(data[0]));
                // Cannot get data types this way, only column names
            } else {
                console.log(`Table ${table} is empty, cannot infer columns from data.`);
            }
        } else if (columns && columns.length > 0) {
            console.log(`Schema for ${table}:`);
            columns.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
        } else {
            console.log(`No schema information found for table ${table}.`);
        }
    } catch (e) {
        console.error(`Unexpected error fetching schema for ${table}:`, e);
    }

    // Original check for 'note' column, kept for specific column verification
    const { error: noteError } = await supabase
        .from(table)
        .select('note')
        .limit(1);

    if (noteError) {
        console.log(`Column 'note' does NOT exist or error in ${table}:`, noteError.message);
    } else {
        console.log(`Column 'note' confirmed in ${table}`);
    }
}

async function main() {
    await checkColumns('inventory_items');
}

main();
