const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\paulo\\Downloads\\ITIL 4 Study - Simulados Inteligentes para Foundation (10_02_2026 22：07：00).html';
const content = fs.readFileSync(filePath, 'utf8');

// Try to find the questions array
// It often looks like "questions":[...] or const questions = [...]
const match = content.match(/\"questions\":\s*(\[.*?\])(,\")/s) || content.match(/\"questions\":\s*(\[.*?\])(,\s*\"|$)/s);

if (match) {
    let jsonStr = match[1];
    try {
        const questions = JSON.parse(jsonStr);
        console.log(`Found ${questions.length} questions!`);
        fs.writeFileSync('extracted_itil_questions.json', JSON.stringify(questions, null, 2), 'utf8');
        console.log('Saved to extracted_itil_questions.json');
    } catch (e) {
        console.error('Failed to parse JSON segment:', e.message);
        // Save raw string for inspection
        fs.writeFileSync('raw_extracted.txt', jsonStr, 'utf8');
    }
} else {
    console.log('No "questions" array found in HTML');
    // Save first 10000 chars for inspection
    fs.writeFileSync('html_start.txt', content.substring(0, 50000), 'utf8');
}
