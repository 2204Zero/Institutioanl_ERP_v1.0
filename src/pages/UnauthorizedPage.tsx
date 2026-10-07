import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, KeyRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Role } from '../types/authTypes';
import { useAuthentication } from '../hooks/useAuthentication';

export interface UnauthorizedPageProps {
  requiredRoles?: Role[];
  userRole?: Role;
  onNavigateHome?: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  requiredRoles = ['SuperAdmin', 'Admin'],
  userRole,
  onNavigateHome,
}) => {
  const { user, logout } = useAuthentication();
  const currentRole = userRole || user?.role || 'Student';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-left">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 relative overflow-hidden">
        {/* Top subtle alert accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-red-600" />

        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-6 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider uppercase text-rose-600">
              Error 403 · Access Forbidden
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Insufficient Institutional Permissions
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current account credentials do not grant access to this administrative ERP module. Elevated privileges are required.
          </p>
        </div>

        {/* Role Comparison Card */}
        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Your Active Role:</span>
            <Badge variant="neutral" className="font-bold">
              {currentRole}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Required Clearance:</span>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {requiredRoles.map((r) => (
                <span
                  key={r}
                  className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-slate-400">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Audit Trail: Authorization policy enforced by RBAC Guard.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onNavigateHome && (
            <Button
              variant="primary"
              className="w-full justify-center text-xs py-2.5 font-bold"
              onClick={onNavigateHome}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Authorized Dashboard
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full justify-center text-xs py-2 text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
            onClick={() => logout()}
            icon={<LogOut className="w-4 h-4" />}
          >
            Sign In with Different Account
          </Button>
        </div>
      </div>
    </div>
  );
};
