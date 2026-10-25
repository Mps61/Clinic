import React from 'react';
import {
  MapPin,
  ExternalLink,
  ShieldAlert,
  Lock,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenVoice: () => void;
  onOpenChat: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenVoice,
  onOpenChat,
}) => {
  const { clinicInfo } = useSettings();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-20 sm:pb-12 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Clinic Overview */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base">
                ID
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {clinicInfo.clinicName}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Thoughtful dental care, oral wellness examinations, and restorative procedures in Chhindwara, Madhya Pradesh.
            </p>
            <div className="flex items-start gap-2.5 text-xs text-slate-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                Authentic clinic operatory photographs shown throughout this website represent the actual clinical facility.
              </span>
            </div>
          </div>

          {/* Col 2: Clinic Location & Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Clinic Location</span>
            </h4>
            <address className="not-italic text-sm text-slate-300 space-y-2 mb-4 leading-relaxed">
              <p className="font-semibold text-white">Indian Dental Clinic</p>
              <p>Shop No. 43, Complex,</p>
              <p>Jail Bagicha Road, Rautha Wada,</p>
              <p>Chhindwara, Madhya Pradesh 480001, India</p>
            </address>

            <a
              href={clinicInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-950/60 border border-teal-800/60 px-3 py-2 rounded-lg transition-colors"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="mt-3 text-xs text-amber-300/90 bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Direct phone and WhatsApp numbers are undergoing owner verification. Please use the online appointment request form.
              </span>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Home & Clinic Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About the Clinic & Care Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Proposed Dental Services Catalogue
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Real Clinic Photographs Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Request an Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenChat}
                  className="hover:text-teal-300 text-teal-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>AI Dental Assistant Chat</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenVoice}
                  className="hover:text-teal-300 text-teal-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>AI Real-Time Voice Consultation</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Medical Disclaimer & Transparency */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Medical Disclaimer</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Information on this website and from our AI assistant is for educational and appointment coordination purposes only. It does not constitute medical advice or a clinical diagnosis. An in-person examination by a dentist is required to diagnose and treat dental conditions.
            </p>
            <div className="text-xs text-red-300/90 bg-red-950/40 border border-red-900/40 p-2.5 rounded-lg">
              <p className="font-semibold text-red-200 mb-0.5">Emergency Notice:</p>
              <p>For facial trauma, swelling, or difficulty breathing, visit hospital casualty immediately.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {clinicInfo.clinicName}, Chhindwara, Madhya Pradesh. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy & Terms
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1 hover:text-teal-400 transition-colors cursor-pointer text-slate-400"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
