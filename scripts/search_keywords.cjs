const fs = require('fs');
const content = fs.readFileSync('study.html', 'utf8');

const searchStrs = ['Syllabus', 'Questões', 'itil', 'pergunta', 'enunciado'];

for (const s of searchStrs) {
    const idx = content.indexOf(s);
    if (idx !== -1) {
        console.log(`Found "${s}" at index ${idx}`);
        console.log('Context:', content.substring(idx - 100, idx + 100));
    }
}
