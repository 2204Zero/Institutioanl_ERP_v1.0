const fs = require('fs');
let file = './src/types/attendance.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/remarks\?: string;/, "remarks?: string;\n  courseCode?: string;");

fs.writeFileSync(file, content, 'utf8');

let profile = './src/pages/StudentProfile.tsx';
let pContent = fs.readFileSync(profile, 'utf8');

if (!pContent.includes('useAuthStore')) {
    pContent = pContent.replace(/import \{ useQuery, useMutation \} from '@tanstack\/react-query';/, "import { useQuery, useMutation } from '@tanstack/react-query';\nimport { useAuthStore } from '../store/useAuthStore';");
}

pContent = pContent.replace(/const statusMutation = useMutation\(\{\n[\s\S]*?\}\);\n/g, "");

fs.writeFileSync(profile, pContent, 'utf8');