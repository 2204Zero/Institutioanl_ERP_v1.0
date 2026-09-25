import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Settings, Shield, Bell } from 'lucide-react';
import { useERP } from '../../hooks/useERP';

export const SettingsModal: React.FC = () => {
  const { activeModal, closeModal, addToast } = useERP();

  const isOpen = activeModal === 'settings';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    closeModal();
    addToast('Settings Saved', 'Institutional ERP system preferences updated.', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="System Preferences & Configuration" maxWidth="lg">
      <form onSubmit={handleSave} className="text-left space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
          <Settings className="w-4 h-4 text-brand-600" /> Institution Profile
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Institution Name" defaultValue="National Institute of Technology" />
          <Input label="Campus Accreditation ID" defaultValue="NAAC-A-PLUS-908" />
        </div>

        <div className="flex items-center gap-2 pt-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
          <Shield className="w-4 h-4 text-emerald-600" /> Security & Audit Controls
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Session Auto-Timeout"
            defaultValue="30"
            options={[
              { label: '15 Minutes', value: '15' },
              { label: '30 Minutes (Recommended)', value: '30' },
              { label: '60 Minutes', value: '60' },
            ]}
          />

          <Select
            label="Default Currency Format"
            defaultValue="INR"
            options={[
              { label: 'INR (₹ Rupee)', value: 'INR' },
              { label: 'USD ($ Dollar)', value: 'USD' },
            ]}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Configuration
          </Button>
        </div>
      </form>
    </Modal>
  );
};
