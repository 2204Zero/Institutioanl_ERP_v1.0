const fs = require('fs');
let file = './src/types/attendance.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/remarks\?: string;/, "remarks?: string;\n  courseCode?: string;");

fs.writeFileSync(file, content, 'utf8');