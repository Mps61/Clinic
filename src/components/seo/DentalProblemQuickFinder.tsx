import React from 'react';
import {
  Zap,
  Shield,
  Bug,
  Droplets,
  ThermometerSnowflake,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export interface DentalProblemQuickItem {
  id: string;
  guideId: string;
  icon: React.ReactNode;
  titleHi: string;
  titleEn: string;
  symptomHi: string;
  symptomEn: string;
  badge: string;
}

export const DENTAL_PROBLEMS_LIST: DentalProblemQuickItem[] = [
  {
    id: 'toothache',
    guideId: 'toothache-pain-relief',
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    titleHi: 'तीव्र दांत दर्द',
    titleEn: 'Severe Toothache',
    symptomHi: 'अचानक तेज दर्द, रात में टीस मारना',
    symptomEn: 'Sharp throbbing pain, sleep disruption',
    badge: 'Emergency First Aid',
  },
  {
    id: 'rct',
    guideId: 'root-canal-treatment-rct',
    icon: <Shield className="w-5 h-5 text-teal-600" />,
    titleHi: 'रूट कैनाल (RCT)',
    titleEn: 'Root Canal / RCT',
    symptomHi: 'गहरा संक्रमण, दांत को उखड़ने से बचाएं',
    symptomEn: 'Infected nerve pulp, save natural tooth',
    badge: 'Pain Relief & Save Tooth',
  },
  {
    id: 'cavity',
    guideId: 'tooth-fillings-cavities',
    icon: <Bug className="w-5 h-5 text-rose-500" />,
    titleHi: 'दांत में कीड़ा / कैविटी',
    titleEn: 'Cavity & Decay',
    symptomHi: 'काला गड्ढा, खाना फंसना, हल्का दर्द',
    symptomEn: 'Dark spots, food impaction, decay',
    badge: 'Composite Fillings',
  },
  {
    id: 'gums',
    guideId: 'teeth-cleaning-scaling-gums',
    icon: <Droplets className="w-5 h-5 text-red-500" />,
    titleHi: 'मसूड़ों से खून / पायरिया',
    titleEn: 'Bleeding Gums & Tartar',
    symptomHi: 'ब्रश करते समय खून, मुंह से बदबू, सूजन',
    symptomEn: 'Bleeding on brushing, bad breath, tartar',
    badge: 'Ultrasonic Scaling',
  },
  {
    id: 'sensitivity',
    guideId: 'tooth-sensitivity-erosion',
    icon: <ThermometerSnowflake className="w-5 h-5 text-cyan-600" />,
    titleHi: 'ठंडा-गर्म पानी लगना',
    titleEn: 'Teeth Sensitivity',
    symptomHi: 'ठंडे पानी या गर्म चाय से तेज झनझनाहट',
    symptomEn: 'Sharp twinge with cold or hot foods',
    badge: 'Enamel Care',
  },
  {
    id: 'wisdom',
    guideId: 'wisdom-tooth-pain',
    icon: <AlertCircle className="w-5 h-5 text-indigo-600" />,
    titleHi: 'अक्ल दाढ़ का दर्द',
    titleEn: 'Wisdom Tooth Pain',
    symptomHi: 'जबड़े में सूजन, मुंह खोलने में परेशानी',
    symptomEn: 'Jaw stiffness, tender gum flap swelling',
    badge: 'Gentle Extraction',
  },
  {
    id: 'braces',
    guideId: 'braces-orthodontics-alignment',
    icon: <Sparkles className="w-5 h-5 text-purple-600" />,
    titleHi: 'टेढ़े-मेढ़े दांत / ब्रेसेस',
    titleEn: 'Crooked Teeth & Braces',
    symptomHi: 'दांतों का आगे-पीछे होना या बीच में गैप',
    symptomEn: 'Crowding, uneven bite, spacing gaps',
    badge: 'Smile Alignment',
  },
  {
    id: 'missing',
    guideId: 'missing-tooth-crown-bridge',
    icon: <HelpCircle className="w-5 h-5 text-emerald-600" />,
    titleHi: 'गायब या टूटा दांत',
    titleEn: 'Broken / Missing Tooth',
    symptomHi: 'चबाने में दिक्कत, फिक्स कैप व ब्रिज',
    symptomEn: 'Difficulty chewing, crowns & dentures',
    badge: 'Crowns & Bridges',
  },
];

interface DentalProblemQuickFinderProps {
  onSelectProblem?: (guideId: string) => void;
}

export const DentalProblemQuickFinder: React.FC<DentalProblemQuickFinderProps> = ({
  onSelectProblem,
}) => {
  const { language } = useSettings();

  const handleSelect = (guideId: string) => {
    if (onSelectProblem) {
      onSelectProblem(guideId);
    } else {
      // Scroll to articles section smoothly
      const element = document.getElementById('articles');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      // Dispatch custom event so DentalHealthGuides opens this exact guide
      window.dispatchEvent(new CustomEvent('select-dental-guide', { detail: { guideId } }));
    }
  };

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 border-y border-slate-200/80 py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <span>दांतों की समस्या एवं समाधान • Dental Problem Solver</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            {language === 'hi'
              ? 'आप किस दंत समस्या का सामना कर रहे हैं?'
              : 'What Dental Problem Are You Experiencing?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {language === 'hi'
              ? 'अपनी समस्या पर क्लिक करें और छिंदवाड़ा में डेंटिस्ट द्वारा जांची गई प्राथमिक सलाह और उपचार विकल्प जानें।'
              : 'Tap your symptom to view instant first aid steps and clinical treatment options at Indian Dental Clinic, Chhindwara.'}
          </p>
        </div>

        {/* 8-Grid Problem Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {DENTAL_PROBLEMS_LIST.map((problem) => (
            <button
              key={problem.id}
              onClick={() => handleSelect(problem.guideId)}
              className="group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-500/60 transition-all text-left flex flex-col justify-between cursor-pointer active:scale-98"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {problem.icon}
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    {problem.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-teal-700 transition-colors">
                  {language === 'hi' ? problem.titleHi : problem.titleEn}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mb-2">
                  {language === 'hi' ? problem.titleEn : problem.titleHi}
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {language === 'hi' ? problem.symptomHi : problem.symptomEn}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-teal-700 group-hover:text-teal-800">
                <span>{language === 'hi' ? 'सलाह देखें' : 'View Guide'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
