const fs = require('fs');
let file = './src/pages/StudentProfile.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import React from 'react';\r?\n/, "");
content = content.replace(/Clock, Loader2, /g, "");
content = content.replace(/, UserSquare2/g, "");

fs.writeFileSync(file, content, 'utf8');