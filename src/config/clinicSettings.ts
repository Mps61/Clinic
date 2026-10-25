export interface ClinicInfo {
  clinicName: string;
  tagline: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  currency: string;
  mapsUrl: string;
  mapsEmbedQuery: string;
  // Contact details - keep configurable; show clear verification status if not yet provided
  phoneNumber: string | null;
  whatsappNumber: string | null;
  isPhoneVerified: boolean;
  isWhatsAppVerified: boolean;
  // Lead Doctor Details
  doctorName: string | null;
  doctorDesignation: string;
  doctorQualifications: string | null;
  doctorRegistration: string | null;
  doctorBio: string | null;
  isDoctorVerified: boolean;
  // Timings
  openingHours: string | null;
  isHoursVerified: boolean;
  emergencyNotice: string;
}

export interface ClinicImage {
  id: string;
  url: string;
  title: string;
  caption: string;
  category: 'operatory' | 'consultation' | 'equipment';
  alt: string;
}

export interface DentalService {
  id: string;
  name: string;
  hindiName: string;
  shortDescription: string;
  fullDescription: string;
  commonSigns: string[];
  benefits: string[];
  isProposedCatalogue: boolean;
}

export const REAL_CLINIC_IMAGES: ClinicImage[] = [
  {
    id: 'image-1',
    url: 'https://i.ibb.co/wrsXnxwS/IMG-91be279a-3170-4efb-93e5-2f52c619f4d7.webp',
    title: 'Modern Dental Operatory Suite',
    caption: 'Sterile treatment station featuring an ergonomic blue dental patient chair, precision surgical operatory lighting, and delivery unit at Indian Dental Clinic.',
    category: 'operatory',
    alt: 'Ergonomic dental chair and treatment operatory with overhead surgical light at Indian Dental Clinic, Chhindwara',
  },
  {
    id: 'image-2',
    url: 'https://i.ibb.co/6JF0WBZK/IMG-8ee2606a-81d8-48b3-af8b-2d193a7d3973.webp',
    title: 'Clinical Consultation & Patient Care',
    caption: 'Chairside oral examination and patient assessment in progress with protective clinical equipment and sanitized instruments.',
    category: 'consultation',
    alt: 'Dentist conducting patient dental examination with sterile instruments in clinical operatory',
  },
  {
    id: 'image-3',
    url: 'https://i.ibb.co/0jfgssCg/IMG-08441d3b-07dd-4980-ac78-467ce0661cbb.webp',
    title: 'Operatory Precision Dental Procedure',
    caption: 'Close-up of clinical treatment in progress with operatory magnification, dedicated dental suction, and sterile isolation.',
    category: 'consultation',
    alt: 'Operatory precision dental procedure with sanitized instruments and illumination',
  },
  {
    id: 'image-4',
    url: 'https://i.ibb.co/Jj0MsHLb/IMG-832610b5-c14f-492c-b5d7-9c50a4f37012.webp',
    title: 'Dental Operatory & Clinical Instruments',
    caption: 'Treatment chair view showcasing clean clinical operatory setup and treatment delivery systems.',
    category: 'equipment',
    alt: 'Dental treatment operatory room and instrument delivery unit at Indian Dental Clinic',
  },
];

export const INITIAL_CLINIC_INFO: ClinicInfo = {
  clinicName: 'Indian Dental Clinic',
  tagline: 'Your Smile Deserves Thoughtful Dental Care',
  address: 'Shop No. 43, Complex, Jail Bagicha Road, Rautha Wada',
  landmark: 'Near Jail Bagicha Road',
  city: 'Chhindwara',
  state: 'Madhya Pradesh',
  postalCode: '480001',
  country: 'India',
  currency: 'INR (₹)',
  mapsUrl: 'https://share.google/BtqpneTy5qH1SZQnR',
  mapsEmbedQuery: 'Shop+No+43+Complex+Jail+Bagicha+Road+Rautha+Wada+Chhindwara+Madhya+Pradesh+480001',
  phoneNumber: null, // Configurable via Admin or Settings
  whatsappNumber: null, // Configurable via Admin or Settings
  isPhoneVerified: false,
  isWhatsAppVerified: false,
  doctorName: null, // Configurable - strictly not invented
  doctorDesignation: 'Lead Dental Surgeon',
  doctorQualifications: null, // Strictly not invented
  doctorRegistration: null,
  doctorBio: null,
  isDoctorVerified: false,
  openingHours: null, // Strictly not invented
  isHoursVerified: false,
  emergencyNotice: 'For acute emergencies involving severe facial swelling, difficulty breathing or swallowing, or uncontrolled oral bleeding, please seek immediate emergency hospital care.',
};

export const PROPOSED_SERVICES: DentalService[] = [
  {
    id: 'consultation',
    name: 'Dental Consultation & Examination',
    hindiName: 'दांतों का परामर्श एवं जांच',
    shortDescription: 'Comprehensive oral cavity examination, digital intraoral assessment, and personalized treatment planning.',
    fullDescription: 'A thorough clinical examination evaluating teeth, gums, occlusion (bite), and oral soft tissues to identify any underlying cavities, plaque buildup, or structural issues early.',
    commonSigns: ['Routine 6-month checkup', 'Mild tooth sensitivity', 'General oral health review'],
    benefits: ['Early cavity detection', 'Preventive oral care advice', 'Customized treatment roadmap'],
    isProposedCatalogue: true,
  },
  {
    id: 'root-canal',
    name: 'Root Canal Treatment (RCT)',
    hindiName: 'रूट कैनाल ट्रीटमेंट (RCT)',
    shortDescription: 'Gentle therapy to preserve severely decayed or infected teeth, relieving pain and restoring function.',
    fullDescription: 'Cleans, disinfects, and fills the inflamed or infected pulp inside your tooth root canals, protecting your natural tooth from extraction.',
    commonSigns: ['Persistent throbbing toothache', 'Sensitivity to hot or cold food', 'Swelling near the root of the tooth'],
    benefits: ['Saves the natural tooth', 'Eliminates infection and pain', 'Restores normal chewing ability'],
    isProposedCatalogue: true,
  },
  {
    id: 'fillings',
    name: 'Dental Fillings & Restorations',
    hindiName: 'दांतों की फिलिंग व बहाली',
    shortDescription: 'Tooth-colored composite restorations to repair cavities and restore structural integrity.',
    fullDescription: 'Durable, aesthetic composite resin fillings matched to your natural tooth shade to seal cavities and prevent progressive decay.',
    commonSigns: ['Visible dark spot or hole in tooth', 'Food trapping between teeth', 'Sharp sensation when chewing sweets'],
    benefits: ['Blends naturally with tooth color', 'Preserves tooth structure', 'Long-lasting and biocompatible'],
    isProposedCatalogue: true,
  },
  {
    id: 'scaling',
    name: 'Teeth Cleaning & Scaling',
    hindiName: 'दांतों की सफाई (स्केलिंग व पॉलिशिंग)',
    shortDescription: 'Ultrasonic removal of stubborn plaque, calculus (tartar), and surface stains for fresh breath and healthy gums.',
    fullDescription: 'Non-invasive ultrasonic scaling removes hardened bacterial deposits above and below the gumline, followed by polishing for a smooth surface.',
    commonSigns: ['Bleeding gums while brushing', 'Yellowish or brown tartar buildup', 'Persistent bad breath (halitosis)'],
    benefits: ['Prevents gum disease (gingivitis)', 'Freshens breath', 'Removes external tea/coffee stains'],
    isProposedCatalogue: true,
  },
  {
    id: 'extractions',
    name: 'Tooth Extractions & Wisdom Tooth Care',
    hindiName: 'दांत निकालना एवं अक्ल दाढ़ की देखभाल',
    shortDescription: 'Gentle, sterile removal of unrestorable teeth or problematic impacted wisdom teeth.',
    fullDescription: 'Safe removal performed under local anesthesia when a tooth is cracked beyond repair, severely infected, or causing crowding.',
    commonSigns: ['Severe tooth fracture below gumline', 'Impacted wisdom tooth pain', 'Uncontrolled decay'],
    benefits: ['Relieves acute pain and infection spread', 'Prevents damage to adjacent teeth', 'Rapid healing guidance'],
    isProposedCatalogue: true,
  },
  {
    id: 'orthodontics',
    name: 'Braces & Orthodontic Consultation',
    hindiName: 'दांतों के तार (ब्रेसेस) परामर्श',
    shortDescription: 'Alignment assessment for crowded, crooked, or spaced teeth for both teenagers and adults.',
    fullDescription: 'Orthodontic evaluation of dental arch alignment and jaw relationship, outlining treatment options to achieve a balanced bite.',
    commonSigns: ['Irregular or overlapping teeth', 'Gaps between teeth', 'Difficulty biting or chewing'],
    benefits: ['Improves smile aesthetics', 'Facilitates easier brushing', 'Optimizes bite function'],
    isProposedCatalogue: true,
  },
  {
    id: 'crowns-bridges',
    name: 'Crowns & Fixed Bridges',
    hindiName: 'दांतों के कैप (क्राउन) और ब्रिज',
    shortDescription: 'Protective custom-fitted caps to reinforce weakened teeth or bridge missing gaps.',
    fullDescription: 'High-strength ceramic or zirconia crowns that cover weakened teeth after root canal therapy, or multi-unit bridges to replace missing teeth.',
    commonSigns: ['Tooth treated with root canal', 'Heavily restored or cracked tooth', 'Single missing tooth space'],
    benefits: ['Restores full chewing power', 'Protects brittle teeth from fracture', 'Natural aesthetics'],
    isProposedCatalogue: true,
  },
  {
    id: 'gum-care',
    name: 'Gum Care & Periodontal Therapy',
    hindiName: 'मसूड़ों की देखभाल व उपचार',
    shortDescription: 'Therapeutic care for red, swollen, or receding gums to prevent bone loss and loose teeth.',
    fullDescription: 'Targeted care for periodontal pockets, root planing, and oral hygiene education to arrest gum disease and support tooth stability.',
    commonSigns: ['Puffy or tender gums', 'Receding gumline', 'Slightly mobile teeth'],
    benefits: ['Arrests chronic gum disease', 'Prevents premature tooth loss', 'Supports long-term oral health'],
    isProposedCatalogue: true,
  },
  {
    id: 'dentures',
    name: 'Dentures & Tooth Replacement',
    hindiName: 'बत्तीसी (डेंटर) व दांत प्रतिस्थापन',
    shortDescription: 'Custom removable partial or complete dentures designed for comfortable eating and speaking.',
    fullDescription: 'Tailored prosthetic solutions for replacing multiple or all missing teeth, fabricated to fit the natural contours of your jaw.',
    commonSigns: ['Multiple missing teeth', 'Difficulty chewing hard foods', 'Sunken facial appearance due to tooth loss'],
    benefits: ['Restores dietary nutrition', 'Supports facial musculature', 'Affordable tooth replacement'],
    isProposedCatalogue: true,
  },
];

export const FAQS = [
  {
    q: 'Where is Indian Dental Clinic located in Chhindwara?',
    a: 'Indian Dental Clinic is located at Shop No. 43, Complex, Jail Bagicha Road, Rautha Wada, Chhindwara, Madhya Pradesh 480001, India. You can view our exact location on Google Maps through the directions button.',
  },
  {
    q: 'How do I request an appointment?',
    a: 'You can request an appointment directly through our online appointment form on this website. Simply enter your name, mobile number, preferred date, and optional reason. Our clinic staff will contact you to confirm the time slot.',
  },
  {
    q: 'Can the AI assistant diagnose my dental problem?',
    a: 'No. The AI assistant is a helpful informational tool and not a doctor or human receptionist. It provides evidence-informed oral health guidance and service information, but it cannot diagnose conditions or prescribe medications. A physical clinical examination by a qualified dentist is always necessary.',
  },
  {
    q: 'What should I do in a dental emergency?',
    a: 'If you experience severe swelling in your face or jaw, difficulty swallowing or breathing, or uncontrolled bleeding after trauma, you should seek immediate emergency medical care at the nearest hospital casualty rather than waiting for an appointment.',
  },
  {
    q: 'Are treatment prices fixed?',
    a: 'Dental treatment requirements vary significantly from patient to patient based on clinical examination, X-rays, and the complexity of the case. Exact treatment estimates are provided transparently during your in-person consultation.',
  },
  {
    q: 'How is my privacy protected during AI chat or voice calls?',
    a: 'We respect patient privacy. Voice calls and chats are processed securely. Personal details (like your mobile number for a callback) and conversation transcripts are only stored if you explicitly provide consent. You may request review or deletion of your records at any time.',
  },
];
