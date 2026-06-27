const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/context/domain-context.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace all <<<<<<< HEAD ... ======= ... >>>>>>> blocks by keeping BOTH
content = content.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> [^\r\n]+/g, '$1\n$2');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Conflicts resolved in domain-context.tsx');
