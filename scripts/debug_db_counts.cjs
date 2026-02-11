
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env from .env file
try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    } else {
        console.log(".env file not found at " + envPath);
    }
} catch (e) {
    console.log("Could not load .env file, assuming env vars are set: " + e.message);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not set.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
    console.log("Checking database counts...");
    console.log("Connecting to: " + supabaseUrl);

    // 1. Topics Count
    const { count: topicCount, error: topicError } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true });

    if (topicError) console.error("Error getting topics:", topicError.message);
    else console.log(`Total Topics: ${topicCount}`);

    // 2. Questions Count
    const { count: questionCount, error: questionError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

    if (questionError) console.error("Error getting questions:", questionError.message);
    else console.log(`Total Questions: ${questionCount}`);

    // 3. Questions per Topic Distribution (First 10 topics)
    const { data: topics, error: topicsListError } = await supabase.from('topics').select('id, name, area').limit(50);

    if (topicsListError) {
        console.error("Error listing topics: " + topicsListError.message);
    } else if (topics && topics.length > 0) {
        console.log("\nSample Topic Question Counts:");
        for (const t of topics.slice(0, 10)) {
            const { count, error } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('topic_id', t.id);

            console.log(`- [${t.area}] ${t.name}: ${count} questions`);
        }
    }

    // 4. Check specific import topic
    const { data: specificTopic } = await supabase.from('topics').select('id, name').ilike('name', '%nível de serviço%').maybeSingle();
    if (specificTopic) {
        const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('topic_id', specificTopic.id);
        console.log(`\nSpecific check for '${specificTopic.name}': ${count} questions`);
    } else {
        console.log("\nSpecific topic 'Gerenciamento de nível de serviço' NOT FOUND.");
    }
}

checkCounts();
