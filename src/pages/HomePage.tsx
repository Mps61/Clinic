import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  PhoneCall,
  CheckCircle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  HeartHandshake,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  REAL_CLINIC_IMAGES,
  PROPOSED_SERVICES,
  FAQS,
  ClinicImage,
} from '../config/clinicSettings';
import { useSettings } from '../context/SettingsContext';
import { DentalHealthGuides } from '../components/seo/DentalHealthGuides';
import { LocalDirectionsCard } from '../components/seo/LocalDirectionsCard';
import { DentalProblemQuickFinder } from '../components/seo/DentalProblemQuickFinder';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenChat: () => void;
  onOpenVoice: () => void;
  onSelectImage: (image: ClinicImage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenChat,
  onOpenVoice,
  onSelectImage,
}) => {
  const { clinicInfo, language } = useSettings();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroImage = REAL_CLINIC_IMAGES[0];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-slate-50 pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-slate-200/60">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                <span>Rautha Wada, Chhindwara, Madhya Pradesh</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-heading">
                {language === 'hi'
                  ? 'छिंदवाड़ा में सर्वश्रेष्ठ डेंटल क्लिनिक | दांतों की समस्याओं का संपूर्ण इलाज'
                  : 'Best Dental Clinic in Chhindwara | Expert Care for All Dental Problems'}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {language === 'hi'
                  ? 'रूट कैनाल ट्रीटमेंट (RCT), दांतों की सफाई, कीड़ा व फिलिंग, अक्ल दाढ़, मसूड़ों से खून और तार (Braces) का विश्वसनीय उपचार। जेल बगीचा रोड, रौथा वाड़ा, छिंदवाड़ा।'
                  : 'Trusted oral care for toothache relief, Root Canal Treatment (RCT), teeth cleaning, composite fillings, braces, wisdom tooth pain, and gentle dental consultations in Rautha Wada, Jail Bagicha Road, Chhindwara (MP).'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('contact')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md shadow-teal-900/15 transition-all hover:shadow-lg active:scale-98 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{language === 'hi' ? 'अपॉइंटमेंट का अनुरोध करें' : 'Request Appointment'}</span>
                </button>

                <button
                  onClick={onOpenChat}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-teal-50/80 text-teal-800 font-bold text-sm border border-teal-300/80 shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Ask AI Assistant</span>
                </button>

                <button
                  onClick={onOpenVoice}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-teal-600" />
                  <span>Voice Call</span>
                </button>
              </div>

              {/* Truthful highlights */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-200/80 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Autoclave Sterilization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Modern Operatory Unit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Patient-First Advice</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Real Clinic Image */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group">
                  <img
                    src={heroImage.url}
                    alt={heroImage.alt}
                    className="w-full h-80 sm:h-96 object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent flex items-end p-5">
                    <div className="text-white text-left">
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-600/90 px-2 py-0.5 rounded text-white inline-block mb-1">
                        Real Clinic Photograph
                      </span>
                      <p className="text-sm font-semibold">{heroImage.title}</p>
                      <p className="text-xs text-slate-200 line-clamp-1">{heroImage.caption}</p>
                    </div>
                  </div>
                </div>

                {/* Badge indicator */}
                <div className="absolute -bottom-4 -left-4 bg-white border border-slate-200 shadow-lg rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">Operatory Suite</p>
                    <p className="text-[10px] text-slate-500">Shop 43, Jail Bagicha Rd</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DENTAL PROBLEM QUICK FINDER (INTERACTIVE LOCAL SEO & SYMPTOM NAVIGATOR) */}
      <DentalProblemQuickFinder />

      {/* 2. CLINIC INTRODUCTION */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            About Indian Dental Clinic
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Dedicated Oral Healthcare in Chhindwara
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            At Indian Dental Clinic, we believe every patient deserves compassionate, transparent, and evidence-informed dental treatment. Located in the heart of Chhindwara on Jail Bagicha Road, our clinical operatory is equipped with modern ergonomic patient units, sterile instrument protocols, and precision lighting to make your dental visits as comfortable as possible.
          </p>
        </div>
      </section>

      {/* 3. DENTAL SERVICES OVERVIEW */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">
              Proposed Clinical Catalogue
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Dental Treatments & Procedures
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Treatments are confirmed during clinical examination based on your individual oral assessment.
            </p>
          </div>

          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROPOSED_SERVICES.slice(0, 6).map((service) => (
            <div
              key={service.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all hover:border-teal-300 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/50 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5 text-teal-700" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  {service.name}
                </h4>
                <p className="text-xs text-teal-700 font-medium mb-3">
                  {service.hindiName}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {service.shortDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Request Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DENTIST INTRODUCTION (HONEST, UNVERIFIED DETAILS CLEARLY LABELED) */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Real Doctor / Treatment photo */}
            <div className="lg:col-span-5">
              <div
                className="relative rounded-2xl overflow-hidden border-2 border-slate-700 shadow-lg cursor-pointer group"
                onClick={() => onSelectImage(REAL_CLINIC_IMAGES[1])}
              >
                <img
                  src={REAL_CLINIC_IMAGES[1].url}
                  alt={REAL_CLINIC_IMAGES[1].alt}
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <span className="text-[11px] text-teal-300 font-medium">
                    Click to inspect verified clinic photograph
                  </span>
                </div>
              </div>
            </div>

            {/* Content & Verification Transparency */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Doctor Credentials Verification Notice</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                Meet the Clinical Team
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Indian Dental Clinic provides focused oral health evaluations and restorative treatments. In strict compliance with healthcare ethics and accuracy standards, the lead dental surgeon’s formal degree, registration number, and bio are awaiting final clinic-owner verification before official publication on this portal.
              </p>

              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-2 text-xs text-slate-300">
                <p className="font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Our Commitment to Patient Care:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Transparent discussions about necessary procedures and care options.</li>
                  <li>Gentle treatment approach with modern operatory equipment.</li>
                  <li>Strict autoclaving of dental instruments between every patient.</li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('contact')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
              >
                <span>Book a Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CLINIC PHOTOGRAPHS / GALLERY PREVIEW */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Real Clinic Photographs
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Inside Indian Dental Clinic
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            These photographs depict the authentic operatory facility and clinical equipment at our Chhindwara clinic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REAL_CLINIC_IMAGES.map((img) => (
            <div
              key={img.id}
              onClick={() => onSelectImage(img)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-slate-950/70 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                  Inspect
                </div>
              </div>
              <div className="p-4 text-left flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">
                    {img.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {img.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. WHY CHOOSE US (TRUTHFUL STATEMENTS) */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700">
              Why Choose Indian Dental Clinic
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Thoughtful, Professional Dental Care
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              We focus on clinical hygiene, clear explanations, and patient comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                Sterilization & Infection Control
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                We adhere to strict multi-stage autoclave sterilization and surface disinfection protocols to ensure a safe, hygienic clinical environment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                Patient-Centric Consultations
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                We explain your oral condition clearly, discuss conservative treatment options, and ensure you make fully informed decisions about your teeth.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                Accessible Chhindwara Location
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conveniently situated at Shop No. 43, Complex on Jail Bagicha Road, Rautha Wada, easily accessible from all central neighborhoods in Chhindwara.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AI ASSISTANT BANNER */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-teal-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-500/50 text-teal-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>AI Dental Assistant • Chat & Real-Time Voice Call</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Have a Dental Question? Talk to our Virtual Assistant
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ask about tooth sensitivity, root canals, oral hygiene routines, or clinic appointment scheduling in Hindi or English. You can even start a live voice call!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenChat}
              className="py-3 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer text-center"
            >
              Start Text Chat
            </button>
            <button
              onClick={onOpenVoice}
              className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-teal-400" />
              <span>Start Voice Call</span>
            </button>
          </div>
        </div>
      </section>

      {/* DENTAL HEALTH & SYMPTOMS GUIDES (LOCAL SEO & PATIENT EDUCATION) */}
      <DentalHealthGuides
        onOpenAppointment={() => onNavigate('contact')}
        onOpenChat={onOpenChat}
      />

      {/* 8. LOCATION & GOOGLE MAPS SECTION */}
      <section className="container mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Chhindwara Location • Rautha Wada</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Visit Indian Dental Clinic
            </h3>

            <address className="not-italic text-sm text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <p className="font-bold text-slate-900 text-base mb-1">
                Indian Dental Clinic
              </p>
              <p>Shop No. 43, Complex,</p>
              <p>Jail Bagicha Road, Rautha Wada,</p>
              <p>Chhindwara, Madhya Pradesh 480001, India</p>
            </address>

            <a
              href={clinicInfo.mapsUrl || 'https://share.google/BtqpneTy5qH1SZQnR'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="lg:col-span-7">
            <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-100 relative">
              <iframe
                title="Indian Dental Clinic Location Map"
                src={`https://maps.google.com/maps?q=${clinicInfo.mapsEmbedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Detailed Local Directions */}
        <LocalDirectionsCard />
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Got Questions?
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3 text-left">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm text-slate-900 hover:text-teal-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-teal-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. FINAL APPOINTMENT CTA */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-teal-50 border border-teal-200 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Schedule Your Visit to Indian Dental Clinic
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Fill in our quick online appointment request form. Our clinic staff will review your preferred date and contact you to confirm your consultation time slot.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
            >
              Request Appointment Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
