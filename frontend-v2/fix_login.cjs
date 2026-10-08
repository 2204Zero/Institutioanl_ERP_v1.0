const fs = require('fs');
let file = './src/pages/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the misaligned tabs and broken form
const targetBlock = /<CardContent className="pt-0">[\s\S]*?<\/CardContent>/;

const newBlock = `<CardContent className="pt-0">
          {/* Role Selection Tabs for Demo */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 shadow-inner overflow-x-auto no-scrollbar">
            {[
              { id: 'ADMIN', label: 'Admin', icon: Shield },
              { id: 'FACULTY', label: 'Faculty', icon: Users },
              { id: 'FINANCE', label: 'Finance', icon: Shield },
              { id: 'STUDENT', label: 'Student', icon: GraduationCap },
              { id: 'PARENT', label: 'Parent', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setUsername('');
                  setPassword('');
                }}
                className={\`flex-1 flex flex-col items-center justify-center py-2 px-2 min-w-[60px] rounded-lg text-xs font-semibold transition-all duration-200 \${
                  activeTab === tab.id 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }\`}
              >
                <tab.icon className={\`w-4 h-4 mb-1 \${activeTab === tab.id ? 'text-black' : 'text-slate-400'}\`} />
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700">
                  {activeTab === 'STUDENT' ? 'Student Email' : activeTab === 'PARENT' ? 'Parent Email' : 'Username or Email'}
                </label>
                <button type="button" onClick={handleDemoFill} className="text-xs text-blue-600 hover:underline font-medium">
                  Use Demo Login
                </button>
              </div>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                required
                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-black text-slate-900 transition-all rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
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
              </div>
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-black hover:bg-black/90 text-white font-semibold rounded-xl text-base shadow-lg transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {loading ? 'Authenticating...' : \`Sign In\`}
              </Button>
            </div>
          </form>
        </CardContent>`;

content = content.replace(targetBlock, newBlock);

// Also fix the activeTab state and handleDemoFill
content = content.replace(/const \[activeTab, setActiveTab\] = useState\<'ADMIN' \| 'STAFF' \| 'STUDENT' \| 'GUARDIAN'\>\('ADMIN'\);/, 
  "const [activeTab, setActiveTab] = useState<'ADMIN' | 'FACULTY' | 'FINANCE' | 'STUDENT' | 'PARENT'>('ADMIN');");

const demoFillBlockRegex = /const handleDemoFill = \(\) => \{[\s\S]*?\}\n  \};\n/;
const newDemoFillBlock = `const handleDemoFill = () => {
    switch(activeTab) {
      case 'ADMIN':
        setUsername('admin');
        setPassword('Admin@123');
        break;
      case 'FACULTY':
        setUsername('faculty');
        setPassword('Faculty@123');
        break;
      case 'FINANCE':
        setUsername('finance');
        setPassword('Finance@123');
        break;
      case 'STUDENT':
        setUsername('student');
        setPassword('Student@123');
        break;
      case 'PARENT':
        setUsername('parent');
        setPassword('Parent@123');
        break;
    }
  };\n`;

content = content.replace(demoFillBlockRegex, newDemoFillBlock);

fs.writeFileSync(file, content, 'utf8');