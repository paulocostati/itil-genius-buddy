
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Utility to generate UUID v4
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const file1Path = 'c:\\Users\\paulo\\Downloads\\itil4_foundation_fase1_bloom.json';
const file2Path = 'c:\\Users\\paulo\\Downloads\\itil4_foundation_fase2_3_bloom.json';

// We output to a NEW migration file to ensure it runs
const outputPath = path.resolve(__dirname, '../supabase/migrations/20260210050000_fix_import_questions.sql');

console.log(`Reading files...`);

let questions = [];

function loadQuestions(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return [];
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Fix common malformed JSON issues: multiple arrays concatenated like `][`
    // Replace `] [`, `]\n[`, `][` etc with `,` to merge arrays
    if (content.match(/\]\s*\[/)) {
        console.log(`Fixing concatenated arrays in ${path.basename(filePath)}...`);
        content = content.replace(/\]\s*\[/g, ',');
    }

    // Handle potential BOM or leading/trailing garbage
    content = content.trim();
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }

    try {
        const data = JSON.parse(content);
        if (Array.isArray(data)) return data;
        return [];
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e.message);
        const start = content.indexOf('[');
        const end = content.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
            try {
                const sliced = content.substring(start, end + 1);
                const fixed = sliced.replace(/\]\s*\[/g, ',');
                const data = JSON.parse(fixed);
                if (Array.isArray(data)) return data;
            } catch (e2) {
                console.error("Retry failed:", e2.message);
            }
        }
        return [];
    }
}

questions = questions.concat(loadQuestions(file1Path));
questions = questions.concat(loadQuestions(file2Path));

console.log(`Total questions to process: ${questions.length}`);

// Extract Unique Topics
const topics = {}; // name -> { id, area, name }
const categoryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // ITIL 4 Foundation

questions.forEach(q => {
    const topicName = (q.topico || "Tópico Geral").trim();
    const areaName = (q.dominio_syllabus || "Geral").trim();

    if (!topics[topicName]) {
        topics[topicName] = {
            id: uuidv4(),
            area: areaName,
            name: topicName
        };
    }
});

console.log(`Identified ${Object.keys(topics).length} unique topics.`);

// Start SQL Generation
let sql = `-- FIX ITIL QUESTIONS (Generated: ${new Date().toISOString()})

-- 1. Cleanup old data
DELETE FROM public.exam_questions WHERE question_id IN (
    SELECT id FROM public.questions WHERE topic_id IN (
        SELECT id FROM public.topics WHERE category_id = '${categoryId}'
    )
);

DELETE FROM public.questions WHERE topic_id IN (
    SELECT id FROM public.topics WHERE category_id = '${categoryId}'
);

DELETE FROM public.topics WHERE category_id = '${categoryId}';

-- 2. Insert Topics
`;

Object.values(topics).forEach(t => {
    const safeName = t.name.replace(/'/g, "''");
    const safeArea = t.area.replace(/'/g, "''");
    sql += `INSERT INTO public.topics (id, name, area, weight, category_id) VALUES ('${t.id}', '${safeName}', '${safeArea}', 1, '${categoryId}');\n`;
});

sql += `\n-- 3. Insert Questions\n`;

// Helper for shuffling
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Helper to get random distinct items
function getRandom(arr, n, exclude) {
    let result = [];
    let taken = new Set([exclude]);
    let attempts = 0;
    while (result.length < n && attempts < 100) {
        attempts++;
        const item = arr[Math.floor(Math.random() * arr.length)];
        if (!taken.has(item)) {
            result.push(item);
            taken.add(item);
        }
    }
    while (result.length < n) {
        result.push(`Opção ${result.length + 1}`);
    }
    return result;
}

const allAnswers = questions.map(q => q.resposta).filter(Boolean);

let processedCount = 0;

questions.forEach(q => {
    const topicName = (q.topico || "Tópico Geral").trim();
    const topic = topics[topicName];

    const correctAnswer = q.resposta || "Resposta Correta";
    const questionText = q.pergunta || "Pergunta vazia";

    // Distractors
    const distractors = getRandom(allAnswers, 3, correctAnswer);

    const options = [correctAnswer, ...distractors];
    const shuffledOptions = shuffle([...options]);

    const correctIndex = shuffledOptions.indexOf(correctAnswer);
    const correctLetter = ['A', 'B', 'C', 'D'][correctIndex];

    const safeStatement = questionText.replace(/'/g, "''");
    const safeExplanation = `Resposta correta: ${correctAnswer}`.replace(/'/g, "''");

    let type = 'standard';
    const rawType = (q.tipo_pergunta || "").toLowerCase();

    if (rawType.includes('negativa')) type = 'negative';
    else if (rawType.includes('lista')) type = 'list';
    else if (rawType.includes('missing') || rawType.includes('falta')) type = 'missing_word';

    sql += `INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type) VALUES ('${topic.id}', '${safeStatement}', '${shuffledOptions[0].replace(/'/g, "''")}', '${shuffledOptions[1].replace(/'/g, "''")}', '${shuffledOptions[2].replace(/'/g, "''")}', '${shuffledOptions[3].replace(/'/g, "''")}', '${correctLetter}', '${safeExplanation}', '${type}');\n`;

    processedCount++;
});

console.log(`Generated SQL for ${processedCount} questions.`);

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Successfully wrote migration file to: ${outputPath}`);
