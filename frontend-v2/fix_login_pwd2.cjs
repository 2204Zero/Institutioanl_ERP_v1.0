const fs = require('fs');
let file = './src/pages/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<Input[\s\S]*?type="password"[\s\S]*?\/>/, 
`<div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-black text-slate-900 transition-all rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>`);

fs.writeFileSync(file, content, 'utf8');