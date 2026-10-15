import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../config/api';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Shield, 
  Users, 
  GraduationCap, 
  User, 
  FileText, 
  UserPlus, 
  LogIn,
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('tab') === 'applicant' || searchParams.get('role')?.toLowerCase() === 'applicant'
    ? 'APPLICANT'
    : 'ERP';

  const [mode, setMode] = useState<'ERP' | 'APPLICANT'>(initialMode);
  const [applicantSubMode, setApplicantSubMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const roleParam = searchParams.get('role')?.toUpperCase();
  const initialRole: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'FINANCE' =
    (roleParam === 'FACULTY' || roleParam === 'STUDENT' || roleParam === 'PARENT' || roleParam === 'FINANCE')
      ? roleParam
      : 'ADMIN';

  // Institutional ERP Form State
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'FINANCE'>(initialRole);
  const [username, setUsername] = useState(searchParams.get('username') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Applicant Registration Form State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState('MALE');
  const [regAddress, setRegAddress] = useState('');

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const roleParam = searchParams.get('role');
    const userParam = searchParams.get('username');
    if (tabParam === 'applicant' || roleParam?.toLowerCase() === 'applicant') {
      setMode('APPLICANT');
    } else {
      if (tabParam === 'erp' || roleParam) {
        setMode('ERP');
      }
      if (roleParam) {
        const upper = roleParam.toUpperCase();
        if (['ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE'].includes(upper)) {
          setActiveTab(upper as any);
        }
      }
      if (userParam) {
        setUsername(userParam);
      }
    }
  }, [searchParams]);

  // Handle ERP Institutional Sign In
  const handleErpSubmit = async (e: React.FormEvent) => {
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

  // Handle Applicant Sign In
  const handleApplicantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('Please enter both email/username and password.');
      return;
    }
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { 
        username: username.trim(), 
        password,
        role: 'APPLICANT'
      });
      const { accessToken, refreshToken, username: user, role, permissions } = response.data;

      login(accessToken, refreshToken, { username: user, role, permissions });
      toast.success(`Welcome back, ${user}!`);
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Invalid applicant credentials.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Applicant Account Registration
  const handleApplicantRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      toast.error('Please complete all required registration fields.');
      return;
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/v1/admissions/public/register', {
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        dateOfBirth: regDob || undefined,
        gender: regGender,
        address: regAddress.trim() || undefined,
      });

      toast.success('Applicant account registered! Signing in...');

      // Auto sign-in
      const loginRes = await apiClient.post('/auth/login', {
        username: regEmail.trim(),
        password: regPassword,
        role: 'APPLICANT',
      });
      const data = loginRes.data;
      login(data.accessToken, data.refreshToken, {
        username: data.username,
        role: data.role,
        permissions: data.permissions || [],
      });

      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    switch(activeTab) {
      case 'ADMIN':
        if (username === 'superadmin') {
          setUsername('admin');
        } else {
          setUsername('superadmin');
        }
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
    toast.info(`Filled demo credentials for ${activeTab}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      
      {/* Decorative Structural Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-slate-900 transform -skew-y-6 -translate-y-24 z-0"></div>

      <Card className="w-full max-w-lg shadow-2xl border-0 rounded-2xl p-2 sm:p-4 z-10 bg-white">
        <CardHeader className="flex flex-col items-center mb-0 pb-3 text-center">
          <Link to="/" className="group flex flex-col items-center">
            <img 
              src="/logo.jpg" 
              alt="EduPulse Logo" 
              className="w-16 h-16 rounded-xl object-cover mb-3 shadow-md border border-slate-100 group-hover:scale-105 transition-transform" 
            />
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">EduPulse ERP</CardTitle>
          </Link>
          <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
            Unified Institutional Management Platform
          </CardDescription>

          {/* Top-Level Mode Selector: Institutional ERP vs Applicant Portal */}
          <div className="w-full grid grid-cols-2 p-1 bg-slate-100 rounded-xl mt-4 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setMode('ERP');
                setSearchParams({});
                setUsername('');
                setPassword('');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'ERP'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Institutional Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('APPLICANT');
                setSearchParams({ tab: 'applicant' });
                setUsername('');
                setPassword('');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'APPLICANT'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              Applicant Account
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {mode === 'ERP' ? (
            /* ================= MODE: INSTITUTIONAL ERP USERS ================= */
            <div>
              {/* Role Selection Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-5 shadow-inner overflow-x-auto no-scrollbar">
                {[
                  { id: 'ADMIN', label: 'Admin', icon: Shield },
                  { id: 'FACULTY', label: 'Faculty', icon: Users },
                  { id: 'STUDENT', label: 'Student', icon: GraduationCap },
                  { id: 'PARENT', label: 'Parent', icon: User },
                  { id: 'FINANCE', label: 'Finance', icon: DollarSign },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setUsername('');
                      setPassword('');
                    }}
                    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-w-[55px] rounded-lg text-xs font-semibold transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-white text-slate-900 shadow-sm font-bold' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 mb-1 ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleErpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {activeTab === 'STUDENT' ? 'Student Username or Email' : activeTab === 'PARENT' ? 'Guardian Username or Email' : 'Username or Email'}
                    </label>
                    {!import.meta.env.PROD && (
                      <button type="button" onClick={handleDemoFill} className="text-xs text-amber-700 hover:underline font-semibold">
                        Use Demo Login
                      </button>
                    )}
                  </div>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={activeTab === 'STUDENT' ? 'e.g. stu_xxxxx or student@institution.edu' : 'Enter your identifier'}
                    required
                    className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-slate-900 text-slate-900 transition-all rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-slate-900 text-slate-900 transition-all rounded-xl pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {loading ? 'Authenticating...' : `Sign In as ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}`}
                  </Button>
                </div>

                {/* Clear entry point to Applicant Portal */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Prospective student or applicant?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('APPLICANT');
                      setSearchParams({ tab: 'applicant' });
                      setUsername('');
                      setPassword('');
                    }}
                    className="font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
                  >
                    Applicant Portal &rarr;
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ================= MODE: APPLICANT PORTAL ================= */
            <div>
              {/* Applicant Sub-Mode Toggle: Sign In vs Register */}
              <div className="flex border-b border-slate-200 mb-5">
                <button
                  type="button"
                  onClick={() => setApplicantSubMode('LOGIN')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    applicantSubMode === 'LOGIN'
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Applicant Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setApplicantSubMode('REGISTER')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    applicantSubMode === 'REGISTER'
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Create Applicant Account
                </button>
              </div>

              {applicantSubMode === 'LOGIN' ? (
                /* APPLICANT SIGN IN FORM */
                <form onSubmit={handleApplicantLogin} className="space-y-4">
                  <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed">
                    Sign in to track your admissions applications, upload required verification documents, or communicate with admissions officers.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Applicant Email or Username
                    </label>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. applicant@example.com"
                      required
                      className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-slate-900 text-slate-900 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-slate-900 text-slate-900 rounded-xl pr-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {loading ? 'Signing In...' : 'Sign In to Applicant Portal'}
                    </Button>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Don't have an account yet?</span>
                    <button
                      type="button"
                      onClick={() => setApplicantSubMode('REGISTER')}
                      className="font-bold text-amber-700 hover:underline"
                    >
                      Register New Account &rarr;
                    </button>
                  </div>
                </form>
              ) : (
                /* APPLICANT REGISTRATION FORM */
                <form onSubmit={handleApplicantRegister} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-900">
                    Create an applicant account to apply for degree programs, submit transcripts, and track onboarding status.
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">First Name *</label>
                      <Input
                        type="text"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="John"
                        required
                        className="h-9 text-xs bg-slate-50 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Last Name *</label>
                      <Input
                        type="text"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Doe"
                        required
                        className="h-9 text-xs bg-slate-50 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Email Address *</label>
                      <Input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="john.doe@example.com"
                        required
                        className="h-9 text-xs bg-slate-50 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Phone Number *</label>
                      <Input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+1-555-0100"
                        required
                        className="h-9 text-xs bg-slate-50 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Password (min 6 chars) *</label>
                    <Input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-9 text-xs bg-slate-50 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Date of Birth</label>
                      <Input
                        type="date"
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className="h-9 text-xs bg-slate-50 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Gender</label>
                      <select
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                        className="w-full h-9 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 text-slate-800"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Mailing Address</label>
                    <Input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="Street, City, Postal Code"
                      className="h-9 text-xs bg-slate-50 rounded-lg"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {loading ? 'Registering Account...' : 'Create Applicant Account & Sign In'}
                    </Button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setApplicantSubMode('LOGIN')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Already have an applicant account? <span className="text-amber-700 underline">Sign In</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <Link to="/admissions" className="font-semibold text-slate-600 hover:underline">
                  &larr; Browse Degree Programs
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMode('ERP');
                    setSearchParams({});
                  }}
                  className="font-bold text-slate-800 hover:underline"
                >
                  Staff / Student Login &rarr;
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6 text-xs text-slate-400 z-10 flex items-center gap-3">
        <span>&copy; {new Date().getFullYear()} EduPulse ERP Solutions.</span>
        <span>•</span>
        <Link to="/" className="hover:text-slate-600 underline">Product Website</Link>
        <span>•</span>
        <Link to="/admissions" className="hover:text-slate-600 underline">Admissions Catalogue</Link>
      </div>
    </div>
  );
}