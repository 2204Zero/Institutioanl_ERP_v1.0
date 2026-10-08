const fs = require('fs');
let file = './src/pages/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

// Import Eye, EyeOff
if (!content.includes('Eye,')) {
    content = content.replace(/import { (.*?) } from 'lucide-react';/, "import { $1, Eye, EyeOff } from 'lucide-react';");
}

// Add state
if (!content.includes('const [showPassword, setShowPassword]')) {
    content = content.replace(/const \[password, setPassword\] = useState\(''\);/, 
    "const [password, setPassword] = useState('');\n  const [showPassword, setShowPassword] = useState(false);");
}

// Replace the password input
content = content.replace(/<Input\s*type="password"\s*value=\{password\}\s*onChange=\{\(e\) => setPassword\(e\.target\.value\)\}\s*required\s*className="w-full bg-slate-50 border-slate-200"\s*\/>/g,
`<div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border-slate-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>`);

fs.writeFileSync(file, content, 'utf8');