import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2, Eye, EyeOff, Shield, Users, GraduationCap, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'FINANCE'>('ADMIN');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { username, password, role: activeTab });
      const { accessToken, refreshToken, username: user, role, permissions } = response.data;
      
      login(accessToken, refreshToken, { username: user, role, permissions });
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Invalid credentials or role mismatch.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
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

        <CardContent className="pt-0">
          
          {/* Role Selection Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 shadow-inner overflow-x-auto no-scrollbar">
            {[
              { id: 'ADMIN', label: 'Admin', icon: Shield },
              { id: 'FACULTY', label: 'Faculty', icon: Users },
              { id: 'STUDENT', label: 'Student', icon: GraduationCap },
              { id: 'PARENT', label: 'Parent', icon: User },
              { id: 'FINANCE', label: 'Finance', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setUsername('');
                  setPassword('');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-w-[60px] rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <tab.icon className={`w-4 h-4 mb-1 ${activeTab === tab.id ? 'text-black' : 'text-slate-400'}`} />
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
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
                {loading ? 'Authenticating...' : `Sign In as ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}`}
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