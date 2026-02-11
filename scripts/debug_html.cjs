const fs = require('fs');
const content = fs.readFileSync('study.html', 'utf8');

const searchStr = 'option_a';
const index = content.indexOf(searchStr);

if (index !== -1) {
    console.log(`Found "${searchStr}" at index ${index}`);
    console.log('Context:', content.substring(index - 200, index + 200));
} else {
    console.log(`"${searchStr}" not found`);
    console.log('File length:', content.length);
    console.log('First 100 chars:', content.substring(0, 100));
}
