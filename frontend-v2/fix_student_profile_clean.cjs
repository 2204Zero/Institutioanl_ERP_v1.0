const fs = require('fs');
let file = './src/pages/StudentProfile.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add useAuthStore
content = content.replace(/import \{ useQuery, useMutation, useQueryClient \} from '@tanstack\/react-query';/, "import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\nimport { useAuthStore } from '../store/useAuthStore';");

// Add user and canManage
content = content.replace(/const navigate = useNavigate\(\);/, "const navigate = useNavigate();\n  const { user } = useAuthStore();\n  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';");

// Hide Edit Button
content = content.replace(/<Button variant="outline" className="border-slate-200" onClick=\{\(\) => toast\.info\('Edit modal coming soon!'\)\}>\s*<Edit className="w-4 h-4 mr-2" \/> Edit Profile\s*<\/Button>/,
`{canManage && (
          <Button variant="outline" className="border-slate-200" onClick={() => toast.info('Edit modal coming soon!')}>
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
          )}`);

// Hide DropdownMenu
content = content.replace(/<DropdownMenu>[\s\S]*?<\/DropdownMenu>/, 
`{canManage && (
$&
)}`);

fs.writeFileSync(file, content, 'utf8');