import React, { useEffect } from 'react';
import { VoiceConsultationPage } from '../../pages/VoiceConsultationPage';

interface AIVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAppointment: (prefill?: { name?: string; phone?: string }) => void;
}

export const AIVoiceModal: React.FC<AIVoiceModalProps> = ({
  isOpen,
  onClose,
  onOpenAppointment,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 flex flex-col animate-in fade-in duration-200"
    >
      <VoiceConsultationPage
        onBack={onClose}
        onNavigateToAppointment={(prefill) => {
          onClose();
          onOpenAppointment(prefill);
        }}
      />
    </div>
  );
};
