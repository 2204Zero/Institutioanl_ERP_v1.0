import React from 'react';
import { Settings, Shield, Bell, User, Server } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-7 h-7 text-purple-600" />
          System Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure security settings, notification preferences, system defaults, and API connections.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Security & Authentication</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              JWT token rotation duration, session timeout policies, and password hashing algorithms.
            </p>
          </div>
          <Button variant="outline" size="sm">Configure</Button>
        </div>

        <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Server className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Backend API Gateway URL</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Primary endpoint: <code className="text-blue-600 dark:text-blue-400 font-mono">http://localhost:8080/api/v1</code>
            </p>
          </div>
          <Button variant="outline" size="sm">Test Endpoint</Button>
        </div>
      </Card>
    </div>
  );
};
