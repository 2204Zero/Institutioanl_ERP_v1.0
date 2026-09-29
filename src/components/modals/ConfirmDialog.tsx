import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';
import { useERP } from '../../hooks/useERP';

export const ConfirmDialog: React.FC = () => {
  const { activeModal, closeModal, addToast } = useERP();

  const isOpen = activeModal === 'confirm';

  const handleConfirm = () => {
    closeModal();
    addToast('Action Executed', 'Operation confirmed successfully.', 'warning');
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} maxWidth="sm">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-800">Confirm Operation</h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to execute this change? This action cannot be undone.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Yes, Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};
