import React from 'react';
import { Shield, Lock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { clinicInfo } = useSettings();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 max-w-4xl text-left space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-teal-700" />
          <span>Patient Data Privacy & Terms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          Privacy Policy & Transparency Notice
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last Updated: October 2026 • Indian Dental Clinic, Chhindwara, MP
        </p>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Clinic Owner Review Note: </span>
            This privacy policy accurately outlines the technical data flows and practices implemented on this website. The clinic management should review and adjust specific internal retention schedules prior to public launch.
          </div>
        </div>
      </div>

      <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>1. What Personal Information We Collect</span>
          </h2>
          <p>
            When you interact with Indian Dental Clinic through this website, we may collect:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
            <li>
              <strong>Appointment Requests:</strong> Patient full name, Indian mobile telephone number, preferred appointment date, preferred time slot, and voluntary symptoms/reason for consultation.
            </li>
            <li>
              <strong>AI Dental Assistant Chats:</strong> Text queries entered into the chat assistant. If you choose to send your enquiry to clinic staff, your name, mobile number, and conversation transcript are stored with your consent.
            </li>
            <li>
              <strong>AI Voice Calls:</strong> If you select Voice Call, your spoken voice is transcribed in real-time. If you check the explicit consent box, the generated text transcript, call duration, and your provided callback number are saved in Firestore for staff review. If you decline consent, the call operates in Private Ephemeral Mode where zero transcripts are saved.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600" />
            <span>2. Why We Collect This Information & How It Is Used</span>
          </h2>
          <p>We process patient information solely for:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
            <li>Scheduling, validating, and confirming dental consultations.</li>
            <li>Enabling clinic staff to review patient questions and symptoms prior to appointments.</li>
            <li>Maintaining required clinical communication records with the patient.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell, rent, or trade your personal data to marketing brokers or third-party advertisers.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            <span>3. How AI Processing Works</span>
          </h2>
          <p>
            The website utilizes the Google Gemini API (hosted via secure server-side infrastructure) to provide intelligent answers to general oral health questions and power real-time speech responses.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
            <li>API keys and backend credentials are strictly kept server-side and never exposed to the browser.</li>
            <li>Voice calls convert audio input to text queries without permanently storing raw audio files.</li>
            <li>The AI assistant is an educational tool and does not provide formal medical diagnoses or prescriptions.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <span>4. Data Retention, Security & Deletion</span>
          </h2>
          <p>
            All submitted appointment and consented conversation records are stored in Google Cloud Firestore with Attribute-Based Access Control security rules. Access is restricted to authorized clinic personnel via Firebase Authentication.
          </p>
          <p>
            <strong>Your Right to Deletion:</strong> Any patient may request the immediate deletion or correction of their appointment requests or stored conversation logs by visiting the clinic or contacting staff. Authorized staff can also purge historical records directly from the protected admin panel.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>5. Contacting the Clinic Regarding Privacy</span>
          </h2>
          <p>
            For any questions regarding your personal information, please visit us in person at:
          </p>
          <address className="not-italic bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 text-xs">
            <strong>Indian Dental Clinic</strong><br />
            Shop No. 43, Complex, Jail Bagicha Road, Rautha Wada,<br />
            Chhindwara, Madhya Pradesh 480001, India
          </address>
        </section>
      </div>
    </div>
  );
};
