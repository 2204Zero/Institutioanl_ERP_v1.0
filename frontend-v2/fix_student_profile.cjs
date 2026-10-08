const fs = require('fs');
let file = './src/pages/StudentProfile.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useAuthStore')) {
    content = content.replace(/import \{ useQuery, useMutation \} from '@tanstack\/react-query';/, "import { useQuery, useMutation } from '@tanstack/react-query';\nimport { useAuthStore } from '../store/useAuthStore';");
}
if (!content.includes('const { user } = useAuthStore()')) {
    content = content.replace(/const navigate = useNavigate\(\);/, "const navigate = useNavigate();\n  const { user } = useAuthStore();\n  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';");
}

// Hide the Edit button
content = content.replace(/<Button variant="outline" className="border-slate-200" onClick=\{\(\) => toast\.info\('Edit modal coming soon!'\)\}>\s*<Edit className="w-4 h-4 mr-2" \/> Edit Profile\s*<\/Button>/,
`{canManage && (
            <Button variant="outline" className="border-slate-200" onClick={() => toast.info('Edit modal coming soon!')}>
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          )}`);

// Hide the DropdownMenu completely if not canManage
content = content.replace(/<DropdownMenu>[\s\S]*?<\/DropdownMenu>/, 
`{canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-slate-200">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => {
                  if(window.confirm('Are you sure you want to delete this student?')) {
                    deleteMutation.mutate();
                  }
                }}>
                  <Trash className="w-4 h-4 mr-2" /> Delete Student
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}`);

fs.writeFileSync(file, content, 'utf8');