import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import { useAuthStore } from '../store/useAuthStore';
import { Shield, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { accessToken, username: user, role, permissions } = response.data;
      
      login(accessToken, { username: user, role, permissions });
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-border rounded-2xl p-4">
        <CardHeader className="flex flex-col items-center mb-4">
          <img src="/logo.jpg?v=3" alt="EduPulse Logo" className="w-16 h-16 rounded-xl object-cover mb-4 shadow-sm" />
          <CardTitle className="text-2xl font-bold">EduPulse ERP</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-primary/50 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-primary/50 text-slate-900"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-primary-foreground font-semibold rounded-xl text-base shadow-lg shadow-primary/20 hover:brightness-110"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}






