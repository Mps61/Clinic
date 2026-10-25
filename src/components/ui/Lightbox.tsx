import React, { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { ClinicImage } from '../../config/clinicSettings';

interface LightboxProps {
  image: ClinicImage | null;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ image, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (image) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={onClose}
            aria-label="Close image viewer"
            className="p-2 rounded-full bg-slate-950/70 text-white hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center bg-slate-950 min-h-[320px] max-h-[75vh] overflow-hidden">
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-auto max-h-[75vh] object-contain select-none"
            loading="lazy"
          />
        </div>

        <div className="p-5 bg-slate-900 border-t border-slate-800 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
              Verified Clinic Photograph
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5">{image.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{image.caption}</p>
        </div>
      </div>
    </div>
  );
};
