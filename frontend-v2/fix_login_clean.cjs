const fs = require('fs');
let file = './src/pages/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

// The file currently has my updated block. I will just replace the whole component body from `export default function Login()` onwards.

const componentCode = `export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { accessToken, refreshToken, username: user, role, permissions } = response.data;
      
      login(accessToken, refreshToken, { username: user, role, permissions });
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Invalid credentials or server error.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-black transform -skew-y-6 -translate-y-24 z-0"></div>

      <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl p-2 z-10 bg-white">
        <CardHeader className="flex flex-col items-center mb-0 pb-4">
          <img src="/logo.jpg?v=3" alt="EduPulse Logo" className="w-16 h-16 rounded-xl object-cover mb-4 shadow-sm" />
          <CardTitle className="text-2xl font-bold text-slate-900">EduPulse ERP</CardTitle>
          <CardDescription className="text-slate-500">Institutional Management System</CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Username or Email
              </label>
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
            
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-black hover:bg-black/90 text-white font-semibold rounded-xl text-base shadow-lg transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-sm text-slate-500 z-10">
        &copy; {new Date().getFullYear()} EduPulse Solutions. All rights reserved.
      </div>
    </div>
  );
}
`;

content = content.replace(/export default function Login\(\) \{[\s\S]*/, componentCode);

fs.writeFileSync(file, content, 'utf8');