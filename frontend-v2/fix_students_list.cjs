const fs = require('fs');
let file = './src/pages/StudentsList.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useAuthStore')) {
    content = content.replace(/import \{ useQuery \} from '@tanstack\/react-query';/, "import { useQuery } from '@tanstack/react-query';\nimport { useAuthStore } from '../store/useAuthStore';");
}
if (!content.includes('const { user } = useAuthStore()')) {
    content = content.replace(/const navigate = useNavigate\(\);/, "const navigate = useNavigate();\n  const { user } = useAuthStore();\n  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';");
}

content = content.replace(/<CreateStudentDialog \/>/, "{canManage && <CreateStudentDialog />}");

fs.writeFileSync(file, content, 'utf8');