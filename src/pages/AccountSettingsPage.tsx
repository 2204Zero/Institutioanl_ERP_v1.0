import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useERP } from '../hooks/useERP';
import {
  User as UserIcon,
  Shield,
  Sun,
  Moon,
  Monitor,
  Key,
  Globe,
  Smartphone,
  Laptop,
  Check,
  AlertCircle,
  LogOut,
  Save,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AccountSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addToast } = useERP();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'theme' | 'accounts' | 'devices'>('profile');

  // Form states
  const [name, setName] = useState(user?.name || 'Dr. Rajesh Kumar');
  const [email, setEmail] = useState(user?.email || 'rajesh.kumar@institution.edu');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [department, setDepartment] = useState(user?.department || 'Academic & Financial Administration');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Connected accounts state
  const [googleConnected, setGoogleConnected] = useState(true);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [githubConnected, setGithubConnected] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('Password Mismatch', 'New password and confirmation do not match.', 'error');
      return;
    }
    addToast('Password Changed', 'Your security password has been updated.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 text-left">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Account & System Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, security options, connected social accounts, theme, and session devices.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'profile', label: 'Profile Information', icon: UserIcon },
            { id: 'security', label: 'Security & Password', icon: Shield },
            { id: 'theme', label: 'Theme & Appearance', icon: Sun },
            { id: 'accounts', label: 'Connected Accounts', icon: Globe },
            { id: 'devices', label: 'Sessions & Devices', icon: Laptop },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-brand-600 dark:bg-purple-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          {/* 1. Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
              <div className="flex items-center gap-4">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500 dark:ring-purple-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user?.role || 'SuperAdmin'}</p>
                  <button
                    type="button"
                    onClick={() => addToast('Avatar Upload', 'Opening image selector...', 'info')}
                    className="mt-2 text-[11px] font-bold text-brand-600 dark:text-purple-400 hover:underline"
                  >
                    Change Profile Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 dark:bg-purple-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Account Password</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 dark:bg-purple-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>Update Security Password</span>
              </button>
            </form>
          )}

          {/* 3. Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Theme & Appearance Preferences</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { mode: 'light', label: 'Light Mode', icon: Sun },
                  { mode: 'dark', label: 'Dark Mode', icon: Moon },
                  { mode: 'system', label: 'System Default', icon: Monitor },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = theme === t.mode;
                  return (
                    <button
                      key={t.mode}
                      onClick={() => {
                        setTheme(t.mode as ThemeMode);
                        addToast('Theme Updated', `Switched theme to ${t.label}`, 'info');
                      }}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-brand-600 dark:border-purple-500 bg-brand-50/50 dark:bg-purple-950/40 text-brand-700 dark:text-purple-300 ring-2 ring-brand-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-bold">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Connected Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Connected Single Sign-On Providers</h3>
              {[
                { name: 'Google Workspace', connected: googleConnected, set: setGoogleConnected, color: 'text-blue-500' },
                { name: 'Microsoft Azure AD', connected: microsoftConnected, set: setMicrosoftConnected, color: 'text-sky-500' },
                { name: 'GitHub Enterprise', connected: githubConnected, set: setGithubConnected, color: 'text-slate-800 dark:text-slate-200' },
              ].map((acc) => (
                <div key={acc.name} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <Globe className={`w-5 h-5 ${acc.color}`} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{acc.name}</h4>
                      <p className="text-[11px] text-slate-500">{acc.connected ? 'Connected for SSO sign-in' : 'Not linked'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      acc.set(!acc.connected);
                      addToast('Account Connection Updated', `${acc.name} ${!acc.connected ? 'linked' : 'unlinked'}.`, 'info');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      acc.connected
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-brand-600 text-white hover:bg-brand-700 dark:bg-purple-600'
                    }`}
                  >
                    {acc.connected ? 'Disconnect' : 'Connect Account'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 5. Sessions & Devices Tab */}
          {activeTab === 'devices' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Sessions & Devices</h3>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Windows Workstation (Current Device)</h4>
                    <p className="text-[11px] text-slate-500 font-mono">Chrome 128.0 • 192.168.1.45 • Active now</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">Active Session</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">iPhone 15 Pro (Safari Mobile)</h4>
                    <p className="text-[11px] text-slate-500 font-mono">Safari 17.4 • 2 hours ago</p>
                  </div>
                </div>
                <button
                  onClick={() => addToast('Session Revoked', 'Logged out from mobile device.', 'warning')}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Revoke
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
