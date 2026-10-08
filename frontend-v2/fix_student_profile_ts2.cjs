const fs = require('fs');
let file = './src/pages/StudentProfile.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/DropdownMenuLabel,/g, "");
content = content.replace(/DropdownMenuSeparator,/g, "");

// also make sure statusMutation is actually removed
content = content.replace(/const statusMutation = useMutation\(\{\n[\s\S]*?\}\);\n/g, "");

fs.writeFileSync(file, content, 'utf8');