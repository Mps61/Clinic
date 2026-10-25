import React from 'react';
import {
  Calendar,
  AlertCircle,
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { PROPOSED_SERVICES, DentalService } from '../config/clinicSettings';
import { useSettings } from '../context/SettingsContext';
import { DentalHealthGuides } from '../components/seo/DentalHealthGuides';
import { DentalProblemQuickFinder } from '../components/seo/DentalProblemQuickFinder';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
  onOpenChat: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate, onOpenChat }) => {
  const { language } = useSettings();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 text-left">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-teal-700" />
          <span>Dental Treatments in Chhindwara • Rautha Wada</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          {language === 'hi'
            ? 'छिंदवाड़ा में दंत चिकित्सा सेवाएं एवं उपचार (Dental Treatments)'
            : 'Dental Treatments & Care Services in Chhindwara, MP'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {language === 'hi'
            ? 'रूट कैनाल ट्रीटमेंट (RCT), दांतों की सफाई, फिलिंग, अक्ल दाढ़ की देखभाल और ब्रेसिज संबंधी विचारशील परामर्श। हर उपचार क्लिनिकल जांच के बाद व्यक्तिगत आवश्यकता के अनुसार तय किया जाता है।'
            : 'Explore our comprehensive treatments: Root Canal Treatment (RCT), ultrasonic teeth cleaning, aesthetic tooth-colored fillings, braces, crowns & bridges, extractions, and dentures. Every treatment plan is tailored after careful chairside examination in Rautha Wada, Chhindwara.'}
        </p>

        {/* Catalogue Transparency Notice */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Proposed Offerings Notice: </span>
            The services listed below represent our proposed clinical offerings. Specific procedure suitability, complexity, and exact cost estimates are established strictly during an in-person dental consultation at our Chhindwara clinic. We do not offer unconditional treatment guarantees.
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROPOSED_SERVICES.map((service: DentalService) => (
          <div
            key={service.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all hover:border-teal-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/50 flex items-center justify-center font-bold text-sm">
                  <Activity className="w-5 h-5 text-teal-700" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Proposed
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-0.5 font-heading">
                  {service.name}
                </h3>
                <p className="text-xs text-teal-700 font-medium">
                  {service.hindiName}
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {service.fullDescription}
              </p>

              {/* Common signs */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  When to consider:
                </p>
                <ul className="space-y-1">
                  {service.commonSigns.map((sign, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clinical benefits */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Care goals:
                </p>
                <ul className="space-y-1">
                  {service.benefits.map((benefit, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => onNavigate('contact')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Request Appointment</span>
              </button>

              <button
                onClick={onOpenChat}
                className="p-2.5 rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors"
                title={`Ask AI Assistant about ${service.name}`}
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Care Notice */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-950 flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-1" />
        <div className="text-xs sm:text-sm leading-relaxed space-y-1">
          <h4 className="font-bold text-red-900 text-base">
            Emergency Dental Symptoms
          </h4>
          <p>
            If you are suffering from severe facial swelling that is spreading, fever accompanying oral pain, difficulty swallowing or breathing, or excessive continuous bleeding from a tooth injury, please seek urgent medical attention at the nearest hospital emergency department immediately.
          </p>
        </div>
      </div>

      {/* Dental Problem & Symptom Quick Finder */}
      <DentalProblemQuickFinder />

      {/* Dentist-Reviewed Dental Health Guides */}
      <DentalHealthGuides
        onOpenAppointment={() => onNavigate('contact')}
        onOpenChat={onOpenChat}
      />
    </div>
  );
};
