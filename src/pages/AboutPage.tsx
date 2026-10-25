import React from 'react';
import {
  ShieldCheck,
  Award,
  HeartHandshake,
  MapPin,
  Calendar,
  AlertTriangle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { REAL_CLINIC_IMAGES, ClinicImage } from '../config/clinicSettings';
import { useSettings } from '../context/SettingsContext';
import { LocalDirectionsCard } from '../components/seo/LocalDirectionsCard';

interface AboutPageProps {
  onNavigate: (page: string) => void;
  onSelectImage: (image: ClinicImage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onSelectImage }) => {
  const { clinicInfo } = useSettings();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16 text-left">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-teal-700" />
          <span>About Indian Dental Clinic</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          Thoughtful, Compassionate Dental Care in Chhindwara
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Indian Dental Clinic is established with a clear mission: to provide comfortable, ethical, and clinically rigorous dental treatments to the community of Chhindwara and nearby areas of Madhya Pradesh.
        </p>
      </div>

      {/* Care Philosophy & Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Patient Comfort First
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We understand dental visits can cause anxiety. Our team focuses on gentle techniques, clear explanations before each step, and respectful care.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Sterility & Hygiene Protocols
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Patient safety is paramount. All non-disposable dental instruments undergo ultrasonic cleaning and high-pressure steam autoclaving.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Honest Clinical Guidance
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We recommend only necessary dental procedures, prioritize saving your natural teeth wherever possible, and maintain open communication regarding care.
          </p>
        </div>
      </div>

      {/* Doctor Profile Section with Honest Transparency */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <div
              className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group relative shadow-md"
              onClick={() => onSelectImage(REAL_CLINIC_IMAGES[1])}
            >
              <img
                src={REAL_CLINIC_IMAGES[1].url}
                alt={REAL_CLINIC_IMAGES[1].alt}
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs text-teal-300 font-semibold">
                  Verified clinical photograph • Click to inspect
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Doctor Verification Notice</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Lead Dental Practitioner
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              At Indian Dental Clinic, we pride ourselves on transparency. To ensure complete regulatory and medical ethics compliance, the lead dentist's verified full name, academic degree, and state dental council registration number are awaiting final owner confirmation before being published on this page.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900">
                What you can expect during your visit:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Detailed intraoral examination and diagnosis of your symptoms.</li>
                <li>Explanation of dental X-rays or findings in plain language.</li>
                <li>Clear breakdown of treatment alternatives and procedural steps.</li>
                <li>Follow-up post-treatment instructions for lasting oral wellness.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Request a Consultation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Operatory Environment Photos */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">
            Clinic Infrastructure
          </h2>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Our Operatory Environment
          </h3>
          <p className="text-xs text-slate-500">
            Click on any image to view a detailed inspection with clinical captions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REAL_CLINIC_IMAGES.slice(0, 3).map((img) => (
            <div
              key={img.id}
              onClick={() => onSelectImage(img)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-xs text-slate-900 mb-1">{img.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Local Transit & Landmark Directions */}
        <LocalDirectionsCard />
      </div>
    </div>
  );
};
