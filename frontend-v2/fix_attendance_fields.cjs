const fs = require('fs');
let file = './src/pages/Attendance.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{record\.subject \|\| 'General'\}/g, "{record.courseCode || 'General'}");

fs.writeFileSync(file, content, 'utf8');