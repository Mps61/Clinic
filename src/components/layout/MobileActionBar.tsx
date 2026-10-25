import React, { useState } from 'react';
import { Phone, MessageSquare, Calendar, AlertCircle, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface MobileActionBarProps {
  onBookClick: () => void;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({ onBookClick }) => {
  const { clinicInfo } = useSettings();
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const handleCall = () => {
    if (clinicInfo.isPhoneVerified && clinicInfo.phoneNumber) {
      window.location.href = `tel:${clinicInfo.phoneNumber}`;
    } else {
      setModalMessage(
        'The direct clinic phone number is currently undergoing official verification by the clinic owner. Please request an appointment through our online booking form.'
      );
    }
  };

  const handleWhatsApp = () => {
    if (clinicInfo.isWhatsAppVerified && clinicInfo.whatsappNumber) {
      const cleanNum = clinicInfo.whatsappNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanNum}?text=Hello%20Indian%20Dental%20Clinic,%20I%20would%20like%20to%20enquire%20about%20dental%20care.`, '_blank');
    } else {
      setModalMessage(
        'The clinic WhatsApp channel is currently being set up and verified. You can ask instant dental questions to our AI Assistant or submit an appointment request below.'
      );
    }
  };

  return (
    <>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg flex items-center justify-between gap-2">
        <button
          onClick={handleCall}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <div className="relative">
            <Phone className="w-5 h-5 text-slate-600" />
            {!clinicInfo.isPhoneVerified && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[11px] font-semibold mt-0.5">Call Clinic</span>
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            {!clinicInfo.isWhatsAppVerified && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[11px] font-semibold mt-0.5">WhatsApp</span>
        </button>

        <button
          onClick={onBookClick}
          className="flex-2 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 active:scale-95 transition-all cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Verification Notice Modal */}
      {modalMessage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
          onClick={() => setModalMessage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalMessage(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">
              Contact Status
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {modalMessage}
            </p>
            <button
              onClick={() => {
                setModalMessage(null);
                onBookClick();
              }}
              className="w-full py-2.5 px-4 bg-teal-700 text-white text-xs font-bold rounded-xl hover:bg-teal-800 transition-colors"
            >
              Go to Appointment Form
            </button>
          </div>
        </div>
      )}
    </>
  );
};
