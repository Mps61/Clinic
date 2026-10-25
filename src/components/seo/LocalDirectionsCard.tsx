import React from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Clock, Car, Train, Bus } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const LocalDirectionsCard: React.FC = () => {
  const { clinicInfo, language } = useSettings();

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-teal-700" />
            <span>Local Location Guide • Chhindwara</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-heading">
            {language === 'hi'
              ? 'क्लिनिक कैसे पहुंचे (Location Directions)'
              : 'How to Reach Indian Dental Clinic in Chhindwara'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Shop No. 43, Complex, Jail Bagicha Road, Rautha Wada, Chhindwara, Madhya Pradesh 480001
          </p>
        </div>

        <a
          href={clinicInfo.mapsUrl || 'https://share.google/BtqpneTy5qH1SZQnR'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <Navigation className="w-4 h-4" />
          <span>{language === 'hi' ? 'गूगल मैप्स पर देखें' : 'Open in Google Maps'}</span>
          <ExternalLink className="w-3.5 h-3.5 text-teal-200" />
        </a>
      </div>

      {/* Transit directions from key Chhindwara hubs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <Train className="w-4 h-4" />
            </div>
            <span>From Chhindwara Junction</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Approx. 2.5 km away. Accessible via auto-rickshaw or taxi towards Rautha Wada via Jail Bagicha Road in about 8-10 minutes.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <Bus className="w-4 h-4" />
            </div>
            <span>From Old/New Bus Stand</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Approx. 1.8 km. Frequent city autos are readily available directly towards Jail Bagicha Road commercial complex.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <MapPin className="w-4 h-4" />
            </div>
            <span>Nearby Local Landmarks</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Located near Jail Bagicha Road in Rautha Wada. Look for Shop No. 43 in the commercial complex.
          </p>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70 flex items-start gap-2">
        <span className="font-bold text-amber-900 shrink-0">Provisional address notice:</span>
        <span>
          Location details are verified with the clinic’s designated location in Chhindwara. For direct directions assistance or wheelchair access inquiries, feel free to use our appointment form or AI Assistant.
        </span>
      </div>
    </div>
  );
};
