const fs = require('fs');
let file = './src/pages/StudentProfile.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useAuthStore')) {
    content = content.replace(/import \{ useQuery, useMutation \} from '@tanstack\/react-query';/, "import { useQuery, useMutation } from '@tanstack/react-query';\nimport { useAuthStore } from '../store/useAuthStore';");
}

// Remove unused DropdownMenuLabel, DropdownMenuSeparator, statusMutation
content = content.replace(/DropdownMenuLabel, DropdownMenuSeparator, /g, "");

content = content.replace(/const statusMutation = useMutation\([\s\S]*?\}\);\n/, "");

fs.writeFileSync(file, content, 'utf8');