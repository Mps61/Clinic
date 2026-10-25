import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileActionBar } from './components/layout/MobileActionBar';
import { Lightbox } from './components/ui/Lightbox';
import { AIChatDrawer } from './components/ai/AIChatDrawer';
import { AIVoiceModal } from './components/ai/AIVoiceModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { AdminPage } from './pages/AdminPage';
import { VoiceConsultationPage } from './pages/VoiceConsultationPage';
import { ClinicImage } from './config/clinicSettings';
import { Sparkles, PhoneCall } from 'lucide-react';

function DentalClinicApp() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedImage, setSelectedImage] = useState<ClinicImage | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [appointmentPrefill, setAppointmentPrefill] = useState<{ name?: string; phone?: string } | undefined>(undefined);

  // Sync hash routing if user enters specific URL
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'about', 'services', 'gallery', 'contact', 'privacy', 'admin', 'voice'].includes(hash)) {
        setCurrentPage((prev) => (prev !== hash ? hash : prev));
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (window.location.hash.replace('#', '') !== page) {
      window.location.hash = page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenVoice = () => {
    handleNavigate('voice');
  };

  const handleNavigateToAppointmentWithPrefill = (prefill?: { name?: string; phone?: string }) => {
    if (prefill) {
      setAppointmentPrefill(prefill);
    }
    handleNavigate('contact');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-teal-500/20 selection:text-teal-900 pb-16 sm:pb-0">
      {/* Top Navbar (Hidden on active voice page for full immersion) */}
      {currentPage !== 'voice' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenVoice={handleOpenVoice}
        />
      )}

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenVoice={handleOpenVoice}
            onSelectImage={setSelectedImage}
          />
        )}
        {currentPage === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            onSelectImage={setSelectedImage}
          />
        )}
        {currentPage === 'services' && (
          <ServicesPage
            onNavigate={handleNavigate}
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}
        {currentPage === 'gallery' && (
          <GalleryPage onSelectImage={setSelectedImage} />
        )}
        {currentPage === 'contact' && (
          <ContactPage initialPrefill={appointmentPrefill} />
        )}
        {currentPage === 'privacy' && <PrivacyPolicyPage />}
        {currentPage === 'admin' && <AdminPage />}
        {currentPage === 'voice' && (
          <VoiceConsultationPage
            onBack={() => handleNavigate('home')}
            onNavigateToAppointment={handleNavigateToAppointmentWithPrefill}
          />
        )}
      </main>

      {/* Footer (Hidden on voice page for clean app-like UI) */}
      {currentPage !== 'voice' && (
        <Footer
          onNavigate={handleNavigate}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenVoice={handleOpenVoice}
        />
      )}

      {/* Sticky Mobile Action Bar (Hidden on voice page) */}
      {currentPage !== 'voice' && (
        <MobileActionBar onBookClick={() => handleNavigate('contact')} />
      )}

      {/* Floating AI Consultation Triggers (Desktop - hidden on voice page) */}
      {currentPage !== 'voice' && (
        <div className="hidden sm:flex fixed bottom-6 right-6 z-30 flex-col gap-2.5 items-end">
          <button
            onClick={handleOpenVoice}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 rounded-full shadow-lg border border-slate-700 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Start real-time voice call with AI Assistant"
          >
            <PhoneCall className="w-4 h-4 text-teal-400" />
            <span>AI Voice Call</span>
          </button>

          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-xl shadow-teal-900/30 text-sm font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Ask dental queries to AI Virtual Assistant"
          >
            <Sparkles className="w-5 h-5 text-teal-200 animate-pulse" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      )}

      {/* AI Assistant Chat Drawer */}
      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSwitchToVoice={() => {
          setIsChatOpen(false);
          handleOpenVoice();
        }}
        onOpenAppointment={() => handleNavigate('contact')}
      />

      {/* AI Real-Time Voice Modal (Fallback if triggered as modal) */}
      <AIVoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onOpenAppointment={(prefill) => handleNavigateToAppointmentWithPrefill(prefill)}
      />

      {/* Image Lightbox Modal */}
      <Lightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <DentalClinicApp />
      </SettingsProvider>
    </AuthProvider>
  );
}
