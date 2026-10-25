import React, { useState } from 'react';
import {
  Menu,
  X,
  Calendar,
  Sparkles,
  MapPin,
  Globe,
  Shield,
  PhoneCall,
  Activity,
} from 'lucide-react';
import { ToothIcon } from '../icons/ToothIcon';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenChat: () => void;
  onOpenVoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenChat,
  onOpenVoice,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { clinicInfo, language, setLanguage } = useSettings();
  const { currentUser, isAdmin } = useAuth();

  const navLinks = [
    { id: 'home', label: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home' },
    { id: 'about', label: language === 'hi' ? 'परिचय' : 'About' },
    { id: 'services', label: language === 'hi' ? 'उपचार सेवाएं' : 'Services' },
    { id: 'gallery', label: language === 'hi' ? 'क्लीनिक गैलरी' : 'Gallery' },
    { id: 'contact', label: language === 'hi' ? 'अपॉइंटमेंट व संपर्क' : 'Contact' },
  ];

  const handleNav = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top micro banner */}
      <div className="bg-teal-900 text-teal-100 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-teal-300" />
            <span className="truncate">
              Shop No. 43, Complex, Jail Bagicha Road, Chhindwara, MP 480001
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 hover:text-white transition-colors font-medium cursor-pointer"
              title="Switch language between English and Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-teal-300" />
              <span>{language === 'en' ? 'हिंदी में देखें' : 'View in English'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="flex items-center gap-1 text-teal-200 hover:text-white font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>Admin Staff</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="container mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand logo & name */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <ToothIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight font-heading">
                {clinicInfo.clinicName}
              </span>
            </div>
            <p className="text-xs text-teal-700 font-medium">
              Chhindwara • Dental Care Clinic
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'text-teal-700 bg-teal-50/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* AI Assistant Quick Trigger */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 hover:bg-teal-100/80 transition-all cursor-pointer shadow-xs"
            title="Ask dental queries to AI Assistant"
          >
            <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
            <span>AI Assistant</span>
          </button>

          {/* AI Voice Call Trigger */}
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-all cursor-pointer"
            title="Start a real-time Voice Call with AI Assistant"
          >
            <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
            <span>Voice Call</span>
          </button>

          {/* Book Appointment CTA */}
          <button
            onClick={() => handleNav('contact')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 transition-all shadow-sm shadow-teal-900/10 active:scale-98 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{language === 'hi' ? 'अपॉइंटमेंट लें' : 'Book Appointment'}</span>
          </button>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenChat}
            className="p-2 text-teal-700 bg-teal-50 rounded-lg border border-teal-200"
            aria-label="AI Assistant"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === link.id
                    ? 'text-teal-800 bg-teal-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 border-t border-slate-100 mt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenVoice();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-teal-50 text-teal-800 font-semibold text-sm border border-teal-200"
              >
                <PhoneCall className="w-4 h-4 text-teal-600" />
                <span>AI Voice Call Consultation</span>
              </button>

              <button
                onClick={() => handleNav('contact')}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-teal-700 text-white font-bold text-sm shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                <span>{language === 'hi' ? 'अपॉइंटमेंट का अनुरोध करें' : 'Request Appointment'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNav('admin');
                }}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-slate-600 text-xs hover:bg-slate-50 font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Clinic Staff Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
