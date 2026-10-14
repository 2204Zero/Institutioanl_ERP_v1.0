import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ShieldCheck, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Policy rules check
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isPolicySatisfied = 
    hasMinLength && 
    hasUpperCase && 
    hasLowerCase && 
    hasNumber && 
    hasSpecial && 
    passwordsMatch;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }
    if (!isPolicySatisfied) {
      setErrorMessage('Please ensure your new password satisfies all policy requirements and matches confirmation.');
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMessage('New password cannot be the same as your current password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success(res.data?.message || 'Password changed successfully!');
      handleClose();
    } catch (err: any) {
      const backendMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to change password';
      setErrorMessage(backendMsg);
      toast.error(backendMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Change Password</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Update your account password. All active sessions will require the new password.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <div className="p-3 rounded border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="text-xs pr-9"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 8 characters)"
                className="text-xs pr-9"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="text-xs pr-9"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Policy Checklist */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1.5">
            <p className="font-semibold text-slate-700 text-xs flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Password Security Policy</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-slate-600">
              <span className={`flex items-center space-x-1 ${hasMinLength ? 'text-emerald-600 font-medium' : ''}`}>
                {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                <span>8+ Characters</span>
              </span>
              <span className={`flex items-center space-x-1 ${hasUpperCase ? 'text-emerald-600 font-medium' : ''}`}>
                {hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                <span>Uppercase (A-Z)</span>
              </span>
              <span className={`flex items-center space-x-1 ${hasLowerCase ? 'text-emerald-600 font-medium' : ''}`}>
                {hasLowerCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                <span>Lowercase (a-z)</span>
              </span>
              <span className={`flex items-center space-x-1 ${hasNumber ? 'text-emerald-600 font-medium' : ''}`}>
                {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                <span>Number (0-9)</span>
              </span>
              <span className={`flex items-center space-x-1 ${hasSpecial ? 'text-emerald-600 font-medium' : ''}`}>
                {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                <span>Special Char (!@#$...)</span>
              </span>
              <span className={`flex items-center space-x-1 ${passwordsMatch ? 'text-emerald-600 font-medium' : ''}`}>
                {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                <span>Passwords Match</span>
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !isPolicySatisfied || !currentPassword}
              className="text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Updating Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
