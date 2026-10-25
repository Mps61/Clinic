import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { createAppointment } from '../firebase/firestoreService';
import { LocalDirectionsCard } from '../components/seo/LocalDirectionsCard';

interface ContactPageProps {
  initialPrefill?: {
    name?: string;
    phone?: string;
  };
}

export const ContactPage: React.FC<ContactPageProps> = ({ initialPrefill }) => {
  const { clinicInfo, language } = useSettings();

  // Form State
  const [patientName, setPatientName] = useState(initialPrefill?.name || '');
  const [mobileNumber, setMobileNumber] = useState(initialPrefill?.phone || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('morning');
  const [reason, setReason] = useState('');
  const [consentGranted, setConsentGranted] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessId, setSubmissionSuccessId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!patientName.trim() || patientName.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    // Indian 10-digit mobile number validation: starts with 6-9
    const cleanMobile = mobileNumber.replace(/[\s-]/g, '');
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (!preferredDate) {
      setErrorMessage('Please select a preferred appointment date.');
      return;
    }

    if (!consentGranted) {
      setErrorMessage('Consent is required to submit your information to Indian Dental Clinic.');
      return;
    }

    setIsSubmitting(true);

    try {
      const aptId = await createAppointment({
        patientName: patientName.trim(),
        mobileNumber: cleanMobile,
        preferredDate,
        preferredTime: preferredTime === 'morning' ? 'Morning (10 AM - 1 PM)' : preferredTime === 'afternoon' ? 'Afternoon (1 PM - 5 PM)' : 'Evening (5 PM - 8 PM)',
        reason: reason.trim() || undefined,
        consentGranted: true,
      });

      setSubmissionSuccessId(aptId);
      // Reset form
      setPatientName('');
      setMobileNumber('');
      setPreferredDate('');
      setReason('');
      setConsentGranted(false);
    } catch (err) {
      console.error('Failed to submit appointment request:', err);
      setErrorMessage(
        'Unable to save your request due to a network connection issue. Please verify your connection or try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 text-left">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-teal-700" />
          <span>Appointments & Contact</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          Connect with Indian Dental Clinic
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Request an appointment online or find our location in Chhindwara. Our clinic team reviews every request and will contact you directly to confirm your scheduled time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Contact Info & Maps */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
              Clinic Address & Location
            </h2>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                <p className="font-bold text-slate-900">Indian Dental Clinic</p>
                <p>Shop No. 43, Complex,</p>
                <p>Jail Bagicha Road, Rautha Wada,</p>
                <p>Chhindwara, Madhya Pradesh 480001, India</p>
              </div>
            </div>

            <a
              href={clinicInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors shadow-xs w-full justify-center"
            >
              <span>Open Directions in Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Contact Status Info */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Direct Contact Channels
              </h3>

              <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">Verification in Progress: </span>
                  Official clinic telephone lines and WhatsApp helpline are being finalized by clinic administration. In the meantime, please submit your appointment request through the form to receive a prompt callback.
                </div>
              </div>
            </div>

            {/* Opening Hours Info */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Operating Timings</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clinic schedule details are confirmed during consultation scheduling. Appointments are arranged Monday through Saturday.
              </p>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="w-full h-64 sm:h-72 rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
            <iframe
              title="Clinic Location Map"
              src={`https://maps.google.com/maps?q=${clinicInfo.mapsEmbedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Right: Appointment Request Form */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs relative">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2 font-heading">
              Request an Appointment
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Submit your preferred date and contact number. Our team will verify chair availability and contact you with confirmation.
            </p>

            {submissionSuccessId ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Appointment Request Received!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you. Your request (Ref: <span className="font-mono font-semibold text-teal-800">{submissionSuccessId}</span>) has been securely saved in our database. Clinic staff will call your number to confirm your final appointment time.
                  </p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/60 text-xs text-slate-500 max-w-sm mx-auto">
                  Note: An appointment is officially confirmed only after clinic staff reaches out to verify your slot.
                </div>
                <button
                  onClick={() => setSubmissionSuccessId(null)}
                  className="px-5 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition-colors cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Patient Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Amit Sharma"
                      maxLength={100}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (10 digits) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white focus:outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Preferred Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={minDateStr}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Preferred Time Window */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white focus:outline-none transition-all"
                    >
                      <option value="morning">Morning (10:00 AM – 01:00 PM)</option>
                      <option value="afternoon">Afternoon (01:00 PM – 05:00 PM)</option>
                      <option value="evening">Evening (05:00 PM – 08:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Reason for visit (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason for Visit / Symptoms (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Tooth sensitivity, routine checkup, pain when chewing, gum bleeding..."
                    maxLength={500}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Consent Checkbox */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGranted}
                      onChange={(e) => setConsentGranted(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Consent & Agreement:</strong> I authorize Indian Dental Clinic to collect and store my submitted name and mobile number for the sole purpose of scheduling and confirming my dental appointment.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving Request to Database...' : 'Submit Appointment Request'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Local Directions & Landmarks for Chhindwara */}
        <div className="mt-10">
          <LocalDirectionsCard />
        </div>
      </div>
    </div>
  );
};
