const fs = require('fs');
let file = './src/components/CreateUserDialog.tsx';
let content = fs.readFileSync(file, 'utf8');

// Import Eye, EyeOff
if (!content.includes('Eye,')) {
    content = content.replace(/import { (.*?) } from 'lucide-react';/, "import { $1, Eye, EyeOff } from 'lucide-react';");
}

// Add state
if (!content.includes('showPassword')) {
    content = content.replace(/const \[open, setOpen\] = useState\(false\);/, "const [open, setOpen] = useState(false);\n  const [showPassword, setShowPassword] = useState(false);");
}

// Replace input
content = content.replace(/<Input\s*type="password"[\s\S]*?\/>/g,
`<div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="pr-10"
                        {...field} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>`);

fs.writeFileSync(file, content, 'utf8');