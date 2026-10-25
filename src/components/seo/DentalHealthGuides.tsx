import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  Sparkles,
  Search,
  X,
  Share2,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export interface HealthGuideArticle {
  id: string;
  category: string;
  titleEn: string;
  titleHi: string;
  hindiQuery: string;
  englishQuery: string;
  readTime: string;
  summaryEn: string;
  summaryHi: string;
  causesEn: string[];
  causesHi: string[];
  immediateStepsEn: string[];
  immediateStepsHi: string[];
  clinicCareEn: string;
  clinicCareHi: string;
  mythsAndFactsEn?: { myth: string; fact: string };
  mythsAndFactsHi?: { myth: string; fact: string };
}

export const DENTAL_ARTICLES: HealthGuideArticle[] = [
  {
    id: 'toothache-pain-relief',
    category: 'Toothache & Emergency Care',
    titleEn: 'Tooth Pain Relief: Causes, First Aid & When to See a Dentist in Chhindwara',
    titleHi: 'दांत दर्द (Toothache) का इलाज: कारण, प्राथमिक उपचार और डेंटिस्ट से कब मिलें',
    hindiQuery: 'दांत दर्द का इलाज छिंदवाड़ा',
    englishQuery: 'toothache treatment Chhindwara, tooth pain dentist near me',
    readTime: '3 min read',
    summaryEn: 'Toothache typically signals irritation or infection of the sensitive nerve pulp inside the tooth. Early clinical assessment prevents the infection from spreading.',
    summaryHi: 'दांत में तेज दर्द अक्सर तब होता है जब कैविटी या सड़न दांत की अंदरूनी नस (पल्प) तक पहुँच जाती है। समय पर जांच कराने से दांत को बचाया जा सकता है।',
    causesEn: [
      'Deep dental cavity reaching the inner pulp (pulpitis)',
      'Cracked or fractured tooth from chewing hard foods',
      'Food impaction or gum pocket infection',
      'Erupting or impacted wisdom tooth',
    ],
    causesHi: [
      'दांत में गहरा कीड़ा/सड़न जो नस तक पहुँच चुकी हो',
      'सख्त चीज चबाने से दांत में दरार (क्रैक) आ जाना',
      'दांतों के बीच खाना फंसना या मसूड़ों में सूजन',
      'अक्ल दाढ़ का टेढ़ा निकलना या संक्रमण',
    ],
    immediateStepsEn: [
      'Rinse gently with lukewarm saltwater (1/2 teaspoon salt in a glass of warm water).',
      'Gently floss to remove any trapped food debris around the painful tooth.',
      'Apply a cold ice pack to the outside of your cheek if there is swelling (never apply heat).',
      'Avoid placing pain relief tablets directly on your gum, as this causes severe chemical burns.',
    ],
    immediateStepsHi: [
      'हल्के गुनगुने पानी में थोड़ा नमक मिलाकर दिन में 2-3 बार कुल्ला करें।',
      'दांतों के बीच फंसे खाने को निकालने के लिए सावधानी से डेंटल फ्लॉस का उपयोग करें।',
      'गाल के बाहर ठंडी सिकाई करें; चेहरे पर गर्म सिकाई बिल्कुल न करें।',
      'दर्द की गोली को सीधे मसूड़े पर न रखें, इससे मसूड़े जल सकते हैं।',
    ],
    clinicCareEn: 'Our clinic in Rautha Wada, Chhindwara provides chairside diagnosis and intraoral examination to determine whether the tooth requires a protective filling or gentle root canal treatment.',
    clinicCareHi: 'छिंदवाड़ा स्थित इंडियन डेंटल क्लिनिक में विस्तृत जांच कर यह तय किया जाता है कि फिलिंग या रूट कैनाल ट्रीटमेंट द्वारा दांत को सुरक्षित कैसे रखा जाए।',
    mythsAndFactsEn: {
      myth: 'Placing crushed cloves or tablets on the tooth cures deep cavities.',
      fact: 'Home remedies only temporarily numb sensation; they cannot remove bacterial infection from inside the tooth structure.',
    },
    mythsAndFactsHi: {
      myth: 'लौंग का तेल या गोली रखने से दांत का कीड़ा हमेशा के लिए खत्म हो जाता है।',
      fact: 'घरेलू उपाय केवल कुछ देर के लिए दर्द दबा सकते हैं, वे अंदरूनी संक्रमण को ठीक नहीं कर सकते। इसके लिए डेंटिस्ट द्वारा सफाई जरूरी है।',
    },
  },
  {
    id: 'root-canal-treatment-rct',
    category: 'Root Canal Treatment (RCT)',
    titleEn: 'Root Canal Treatment (RCT): Complete Guide, Pain Relief & Saving Natural Teeth',
    titleHi: 'रूट कैनाल ट्रीटमेंट (RCT) क्या है? दांत को उखड़ने से कैसे बचाता है?',
    hindiQuery: 'रूट कैनाल ट्रीटमेंट छिंदवाड़ा, RCT dentist in Chhindwara',
    englishQuery: 'root canal treatment Chhindwara, RCT specialist dentist Chhindwara',
    readTime: '4 min read',
    summaryEn: 'Root Canal Treatment cleans and disinfects the inflamed or infected root canals, saving your natural tooth and eliminating pain without extraction.',
    summaryHi: 'रूट कैनाल ट्रीटमेंट दांत की सड़ी हुई या संक्रमित नस को निकालकर साफ करने और सील करने की एक आधुनिक प्रक्रिया है, जिससे प्राकृतिक दांत को निकालना नहीं पड़ता।',
    causesEn: [
      'Severe, throbbing tooth pain that worsens when lying down at night',
      'Prolonged sensitivity to hot tea/coffee or cold drinks lasting minutes',
      'Pain on biting or touching the tooth',
      'Small pimple-like swelling or pus discharge on the gum near the tooth root',
    ],
    causesHi: [
      'रात को लेटने पर तेज धड़कने वाला दर्द होना',
      'गर्म चाय या ठंडे पानी से दांत में कई मिनटों तक तेज झनझनाहट रहना',
      'चबाने या दांत छूने पर तेज दर्द होना',
      'दांत के नीचे मसूड़े में छोटी फुंसी या मवाद आना',
    ],
    immediateStepsEn: [
      'Avoid chewing hard foods on the affected side.',
      'Do not delay consultation; waiting allows infection to spread to the jawbone.',
      'Maintain regular brushing on adjacent teeth to keep the area hygienic.',
    ],
    immediateStepsHi: [
      'दर्द वाले हिस्से से कड़क चीजें न चबाएं।',
      'इलाज में देरी न करें, ताकि संक्रमण जबड़े की हड्डी तक न फैले।',
      'आस-पास के दांतों की नियमित सफाई बनाए रखें।',
    ],
    clinicCareEn: 'Performed under modern local anesthesia, RCT at our Chhindwara operatory is comfortable and preserves your natural chewing bite. A custom dental crown is recommended afterward to reinforce structural strength.',
    clinicCareHi: 'आधुनिक लोकल एनेस्थीसिया के साथ रूट कैनाल ट्रीटमेंट पूरी तरह सुरक्षित और आरामदायक होता है। इसके बाद दांत को मजबूत बनाए रखने के लिए कैप (क्राउन) लगाया जाता है।',
    mythsAndFactsEn: {
      myth: 'Root canal treatment is extremely painful and tooth extraction is better.',
      fact: 'Modern RCT relieves pain rather than causing it. Saving your natural tooth is always superior to artificial tooth replacements.',
    },
    mythsAndFactsHi: {
      myth: 'रूट कैनाल बहुत दर्दनाक होता है, इसलिए दांत उखड़वाना ज्यादा अच्छा है।',
      fact: 'आधुनिक तकनीकों से RCT दर्दमुक्त होता है। अपना असली दांत बचाना किसी भी नकली दांत से कहीं अधिक टिकाऊ और बेहतर होता है।',
    },
  },
  {
    id: 'teeth-cleaning-scaling-gums',
    category: 'Gums & Cleaning (Scaling)',
    titleEn: 'Bleeding Gums, Tartar & Ultrasonic Teeth Cleaning (Scaling) in Chhindwara',
    titleHi: 'मसूड़ों से खून आना, पायरिया और दांतों की सफाई (स्केलिंग)',
    hindiQuery: 'दांतों की सफाई छिंदवाड़ा, मसूड़ों से खून का इलाज',
    englishQuery: 'teeth cleaning scaling Chhindwara, bleeding gums treatment dentist',
    readTime: '3 min read',
    summaryEn: 'Plaque that hardens into tartar (calculus) cannot be removed by normal brushing. Ultrasonic scaling gently removes bacterial deposits to stop gum bleeding and bad breath.',
    summaryHi: 'ब्रश से साफ न होने वाला मैल जब सख्त होकर पथरी (टार्टर) बन जाता है, तो मसूड़ों से खून आने लगता है। स्केलिंग द्वारा इसे सुरक्षित रूप से साफ किया जाता है।',
    causesEn: [
      'Bleeding gums while brushing or biting into apples/hard fruit',
      'Puffy, reddish, or swollen gum margins (Gingivitis)',
      'Persistent unpleasant breath (halitosis) despite brushing',
      'Yellowish or brown tartar crust behind lower front teeth',
    ],
    causesHi: [
      'ब्रश करते समय या सेब जैसी चीजें काटते वक्त मसूड़ों से खून निकलना',
      'मसूड़ों का लाल होना या फूल जाना (जिंजिवाइटिस)',
      'मुंह से लगातार दुर्गंध आना',
      'नीचे के दांतों के पीछे पीली या भूरी परत (टार्टर) जमना',
    ],
    immediateStepsEn: [
      'Use a soft-bristled toothbrush with gentle circular motions—never scrub aggressively.',
      'Do not stop brushing because gums bleed; bleeding signals inflammation that needs hygiene.',
      'Rinse with warm saltwater after meals.',
    ],
    immediateStepsHi: [
      'हमेशा सॉफ्ट ब्रश का प्रयोग करें और हल्के हाथों से गोल घुमाते हुए ब्रश करें।',
      'खून आने के डर से ब्रश करना बंद न करें; सफाई से ही सूजन कम होगी।',
      'भोजन के बाद गुनगुने नमक के पानी से कुल्ला करें।',
    ],
    clinicCareEn: 'Our ultrasonic scaler gently breaks up stubborn tartar with micro-vibrations and water cooling without harming natural tooth enamel.',
    clinicCareHi: 'अल्ट्रासोनिक स्केलर से पानी के हल्के स्प्रे और वाइब्रेशन द्वारा इनेमल को बिना नुकसान पहुंचाए टार्टर साफ किया जाता है।',
    mythsAndFactsEn: {
      myth: 'Teeth cleaning and scaling makes teeth loose or creates gaps.',
      fact: 'Scaling does not make teeth loose. Removing hardened tartar eliminates infection and helps gums re-attach firmly to the teeth.',
    },
    mythsAndFactsHi: {
      myth: 'दांतों की सफाई कराने से दांत ढीले हो जाते हैं या उनमें गैप आ जाता है।',
      fact: 'यह एक भ्रम है। स्केलिंग से जमी हुई गंदगी हटती है जिससे मसूड़े स्वस्थ होकर दांत को और मजबूती से पकड़ते हैं।',
    },
  },
  {
    id: 'tooth-fillings-cavities',
    category: 'Cavity Repair & Fillings',
    titleEn: 'Tooth Decay, Cavities & Natural Tooth-Colored Composite Fillings',
    titleHi: 'दांतों में कीड़ा (Cavity) लगना और कंपोजिट फिलिंग',
    hindiQuery: 'दांतों में कीड़ा लगना छिंदवाड़ा, tooth filling Chhindwara',
    englishQuery: 'tooth filling Chhindwara, composite restorations dentist near me',
    readTime: '3 min read',
    summaryEn: 'Cavities start quietly on the outer enamel. Treating decay early with tooth-colored composite restorations restores strength before pain starts.',
    summaryHi: 'शुरुआत में कैविटी का कोई दर्द नहीं होता, केवल काला निशान दिखता है। सही समय पर फिलिंग कराने से रूट कैनाल या दांत निकालने की नौबत नहीं आती।',
    causesEn: [
      'Dark pits or black spots visible on biting surfaces of molars',
      'Food consistently getting packed between two teeth',
      'Sharp twinge when eating sweet items or chocolates',
      'Rough tooth edge catching your tongue',
    ],
    causesHi: [
      'दांतों की चबाने वाली सतह पर काले धब्बे या गड्ढे दिखना',
      'खाना बार-बार दो दांतों के बीच फंसना',
      'मीठा या चॉकलेट खाने पर दांत में तीखा झनझनाहट होना',
      'दांत का कोई कोना टूटना या जीभ में चुभना',
    ],
    immediateStepsEn: [
      'Rinse thoroughly after consuming sweets or sugary beverages.',
      'Floss daily between contact points to prevent hidden proximal cavities.',
      'Schedule a routine examination before mild decay turns into an acute toothache.',
    ],
    immediateStepsHi: [
      'मीठा या चिपचिपा भोजन करने के तुरंत बाद कुल्ला अवश्य करें।',
      'दांतों के बीच सफाई के लिए फ्लॉस का उपयोग करें।',
      'हल्का काला निशान दिखने पर ही डेंटिस्ट से संपर्क करें।',
    ],
    clinicCareEn: 'We use aesthetic composite resins matched to the exact shade of your tooth, bonding seamlessly to preserve maximum healthy structure.',
    clinicCareHi: 'दांत के प्राकृतिक रंग से मेल खाने वाले बायो-कंपोजिट मटेरियल से फिलिंग की जाती है जो देखने में बिल्कुल असली दांत जैसी लगती है।',
  },
  {
    id: 'tooth-sensitivity-erosion',
    category: 'Teeth Sensitivity & Enamel',
    titleEn: 'Tooth Sensitivity to Hot & Cold: Causes, Enamel Wear & Protection',
    titleHi: 'दांतों में ठंडा-गर्म पानी लगना (Sensitivity): कारण एवं बचाव',
    hindiQuery: 'दांतों में ठंडा गरम लगना छिंदवाड़ा, teeth sensitivity treatment',
    englishQuery: 'tooth sensitivity Chhindwara, sensitive teeth dentist near me',
    readTime: '3 min read',
    summaryEn: 'Sharp sensitivity when drinking ice water or hot tea occurs when the protective enamel layer wears down or gums recede, exposing microscopic dentinal tubules.',
    summaryHi: 'ठंडा पानी या गर्म चाय पीने पर दांतों में बिजली जैसी तेज झनझनाहट इनेमल घिसने या मसूड़े नीचे खिसकने के कारण होती है। सही टूथपेस्ट और फ्लोराइड कोटिंग से इसे नियंत्रित किया जा सकता है।',
    causesEn: [
      'Aggressive horizontal tooth brushing with hard-bristled brushes (abrasion)',
      'Gum recession exposing sensitive tooth roots',
      'Frequent consumption of acidic foods, lemon, or carbonated beverages',
      'Night-time teeth grinding or clenching (bruxism)',
    ],
    causesHi: [
      'कड़क ब्रश से जोर-जोर से घिसकर दांत साफ करना (इनेमल का घिसना)',
      'मसूड़ों का नीचे खिसकना जिससे दांत की जड़ खुल जाती है',
      'अत्यधिक खट्टी चीजें, नींबू या कोल्ड ड्रिंक्स का सेवन',
      'रात में नींद में दांत पीसना (ब्रक्सिज्म)',
    ],
    immediateStepsEn: [
      'Switch immediately to an ultra-soft toothbrush and avoid abrasive tooth powders.',
      'Use a clinically verified potassium-nitrate desensitizing toothpaste gently with your finger.',
      'Avoid sipping extremely chilled or scalding hot liquids back-to-back.',
    ],
    immediateStepsHi: [
      'तुरंत हार्ड ब्रश और दंतमंजन बंद करके अल्ट्रा-सॉफ्ट ब्रश अपनाएं।',
      'सेंसिटिविटी-रोधी टूथपेस्ट को उंगली से झनझनाहट वाले दांत पर 2 मिनट लगाकर छोड़ें।',
      'बहुत अधिक गर्म और एकदम बर्फ जैसे ठंडे पेय पदार्थों से बचें।',
    ],
    clinicCareEn: 'Our clinic applies desensitizing bonding agents, fluoride varnishes, or protective composite coats over exposed cervical root margins in Rautha Wada, Chhindwara.',
    clinicCareHi: 'क्लिनिक में फ्लोराइड वार्निश या कंपोजिट कोटिंग द्वारा घिसी हुई सतह को सील करके झनझनाहट से तुरंत राहत दी जाती है।',
    mythsAndFactsEn: {
      myth: 'Hard tooth powders and vigorous brushing make teeth whiter and healthier.',
      fact: 'Abrasive powders rapidly wear off protective enamel, permanently worsening tooth sensitivity and leading to yellow dentin exposure.',
    },
    mythsAndFactsHi: {
      myth: 'खुरदुरे मंजन से जोर से घिसने से दांत ज्यादा सफेद और चमकदार होते हैं।',
      fact: 'खुरदुरा मंजन दांतों के सुरक्षा कवच (इनेमल) को घिस देता है, जिससे पीलापन और भयानक झनझनाहट शुरू हो जाती है।',
    },
  },
  {
    id: 'wisdom-tooth-pain',
    category: 'Wisdom Teeth & Extractions',
    titleEn: 'Wisdom Tooth Pain, Swelling & Safe Extraction in Chhindwara',
    titleHi: 'अक्ल दाढ़ (Wisdom Tooth) का दर्द, सूजन और उपचार',
    hindiQuery: 'अक्ल दाढ़ का दर्द छिंदवाड़ा, tooth extraction dentist Chhindwara',
    englishQuery: 'wisdom tooth pain Chhindwara, tooth extraction near me',
    readTime: '3 min read',
    summaryEn: 'Wisdom teeth often lack adequate space in the jaw, erupting at awkward angles and trapping bacteria that lead to painful swelling and jaw stiffness.',
    summaryHi: 'जबड़े में जगह की कमी के कारण अक्ल दाढ़ अक्सर टेढ़ी निकलती है, जिससे मसूड़े में खाना फंसकर तेज दर्द और जबड़े में अकड़न हो जाती है।',
    causesEn: [
      'Dull, aching throbbing pain at the very back of the jaw',
      'Difficulty opening your mouth wide or swallowing (Trismus)',
      'Swollen, tender gum flap over a partially erupted tooth (Pericoronitis)',
      'Headache or ear pain radiating from the back of the jaw',
    ],
    causesHi: [
      'जबड़े के सबसे पिछले हिस्से में भारी दर्द व सूजन होना',
      'मुंह पूरा खोलने या खाना निगलने में कठिनाई होना',
      'दाढ़ के ऊपर मसूड़े की चमड़ी में सूजन और मवाद आना',
      'दर्द का कान या सिर के पिछले हिस्से तक फैलना',
    ],
    immediateStepsEn: [
      'Rinse the back of your mouth with warm saltwater after every meal.',
      'Do not apply hot pads externally to the cheek if swelling is present.',
      'Seek professional evaluation if opening your mouth becomes painful.',
    ],
    immediateStepsHi: [
      'हर बार भोजन के बाद गुनगुने नमक के पानी से पीछे की तरफ अच्छे से कुल्ला करें।',
      'गाल पर बाहर से गर्म सिकाई न करें।',
      'मुंह खोलने में परेशानी होने पर तुरंत जांच कराएं।',
    ],
    clinicCareEn: 'Our operatory provides careful assessment to determine whether minor gum trimming or a gentle extraction under local anesthesia is required.',
    clinicCareHi: 'क्लिनिक में जांच कर यह देखा जाता है कि दवा और सफाई से आराम मिलेगा या दाढ़ को सुरक्षित निकालना बेहतर होगा।',
  },
  {
    id: 'braces-orthodontics-alignment',
    category: 'Braces & Smile Alignment',
    titleEn: 'Braces & Teeth Alignment: Solutions for Irregular or Crowded Teeth',
    titleHi: 'टेढ़े-मेढ़े दांतों के लिए तार (Braces) और ऑर्थोडॉन्टिक इलाज',
    hindiQuery: 'टेढ़े दांतों का इलाज छिंदवाड़ा, braces dentist Chhindwara',
    englishQuery: 'braces orthodontist Chhindwara, crooked teeth treatment',
    readTime: '4 min read',
    summaryEn: 'Orthodontic therapy gently guides irregular, crowded, or spaced teeth into proper alignment, boosting smile confidence and improving chewing balance.',
    summaryHi: 'दांतों के तार (ब्रेसेस) द्वारा आगे-पीछे, टेढ़े या गैप वाले दांतों को धीरे-धीरे सही स्थान पर लाया जाता है, जिससे मुस्कान आकर्षक बनती है और चबाना आसान होता है।',
    causesEn: [
      'Overcrowded or overlapping front teeth',
      'Prominent spacing or gaps between upper front teeth',
      'Difficulty chewing or biting evenly',
      'Lower teeth biting into the roof of the mouth (deep bite)',
    ],
    causesHi: [
      'दांतों का एक-दूसरे पर चढ़े होना (क्राउडिंग)',
      'सामने के दांतों के बीच ज्यादा खाली जगह (गैप) होना',
      'दांत आपस में सही से न मिलना',
      'बोलने या चबाने में असुविधा होना',
    ],
    immediateStepsEn: [
      'Orthodontic evaluation is ideal during adolescence (11-14 years), but adult braces are also highly effective.',
      'Avoid hard, sticky sweets that might break brackets.',
      'Use orthodontic interdental brushes to keep braces free from plaque.',
    ],
    immediateStepsHi: [
      '11 से 14 वर्ष की उम्र में ऑर्थोडॉन्टिक जांच सर्वोत्तम होती है, हालांकि वयस्क भी ब्रेसेस लगवा सकते हैं।',
      'ब्रेसेस लगे होने पर बहुत कड़क या चिपचिपी चीजें न चबाएं।',
      'तारों के बीच की सफाई के लिए विशेष इंटरडेंटल ब्रश का उपयोग करें।',
    ],
    clinicCareEn: 'Our clinic in Chhindwara provides orthodontic consultations to evaluate tooth arches, spacing, and tailored treatment timelines.',
    clinicCareHi: 'इंडियन डेंटल क्लिनिक छिंदवाड़ा में दांतों के आर्च, जबड़े और स्पेसिंग की पूरी जांच कर उपयुक्त ब्रेसेस ट्रीटमेंट की सलाह दी जाती है।',
  },
  {
    id: 'missing-tooth-crown-bridge',
    category: 'Missing Teeth, Crowns & Bridges',
    titleEn: 'Missing Teeth Replacement: Dental Crowns, Fixed Bridges & Dentures',
    titleHi: 'टूटा या गायब दांत: फिक्स कैप (Crown), ब्रिज एवं बत्तीसी',
    hindiQuery: 'गायब दांत का इलाज छिंदवाड़ा, dental crown bridge Chhindwara',
    englishQuery: 'missing tooth replacement Chhindwara, dental crown near me',
    readTime: '3 min read',
    summaryEn: 'A missing tooth impairs chewing efficiency and causes adjacent teeth to tilt. Modern ceramic crowns and fixed bridges restore natural aesthetics and chewing function.',
    summaryHi: 'दांत निकलने के बाद खाली जगह छूटने से अगल-बगल के दांत झुकने लगते हैं। फिक्स कैप और ब्रिज लगाने से चबाने की क्षमता और चेहरे की बनावट दोनों सुरक्षित रहती हैं।',
    causesEn: [
      'Tooth lost due to severe cavity or accident/trauma',
      'Tooth fractured after previous root canal therapy without a protective crown',
      'Difficulty chewing rotis, fruits, or solid food on one side of the mouth',
      'Sunken cheek appearance caused by long-standing tooth loss',
    ],
    causesHi: [
      'सड़न या चोट लगने के कारण दांत का निकल जाना',
      'रूट कैनाल के बाद कैप न लगवाने से दांत का टूटना',
      'एक तरफ से खाना चबाने में भारी असुविधा होना',
      'दांत न होने से गाल का अंदर धंसना',
    ],
    immediateStepsEn: [
      'Do not delay replacing an extracted tooth; early replacement prevents teeth drift.',
      'Maintain diligent brushing around existing abutment teeth.',
      'Consult the clinic to compare ceramic crowns, fixed bridges, or removable options.',
    ],
    immediateStepsHi: [
      'दांत निकलने के बाद बहुत अधिक समय तक खाली न छोड़ें, ताकि अन्य दांत अपनी जगह से न हिलें।',
      'बगल के दांतों की अच्छी सफाई रखें।',
      'फिक्स कैप या ब्रिज के विकल्प समझने हेतु परामर्श लें।',
    ],
    clinicCareEn: 'Indian Dental Clinic crafts custom-matched ceramic and zirconia crowns that seamlessly match your remaining teeth in shade and chewing bite.',
    clinicCareHi: 'इंडियन डेंटल क्लिनिक छिंदवाड़ा में उच्च गुणवत्ता वाली जिर्कोनिया एवं सिरेमिक कैप तैयार की जाती हैं जो देखने में असली दांतों जैसी सुंदर होती हैं।',
  },
];

interface DentalHealthGuidesProps {
  onOpenAppointment: () => void;
  onOpenChat: () => void;
}

export const DentalHealthGuides: React.FC<DentalHealthGuidesProps> = ({
  onOpenAppointment,
  onOpenChat,
}) => {
  const { language } = useSettings();
  const [selectedArticleId, setSelectedArticleId] = useState<string>(DENTAL_ARTICLES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Listen to custom select-dental-guide event from problem finder
  useEffect(() => {
    const handleCustomSelect = (e: Event) => {
      const customEvt = e as CustomEvent<{ guideId: string }>;
      if (customEvt.detail?.guideId) {
        setSelectedArticleId(customEvt.detail.guideId);
        // Clear search if it hides the target
        setSearchQuery('');
      }
    };
    window.addEventListener('select-dental-guide', handleCustomSelect);
    return () => window.removeEventListener('select-dental-guide', handleCustomSelect);
  }, []);

  // Filter articles based on user search query (English or Hindi)
  const filteredArticles = DENTAL_ARTICLES.filter((art) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      art.titleEn.toLowerCase().includes(q) ||
      art.titleHi.toLowerCase().includes(q) ||
      art.category.toLowerCase().includes(q) ||
      art.hindiQuery.toLowerCase().includes(q) ||
      art.englishQuery.toLowerCase().includes(q) ||
      art.causesEn.some((c) => c.toLowerCase().includes(q)) ||
      art.causesHi.some((c) => c.toLowerCase().includes(q))
    );
  });

  const activeArticle =
    DENTAL_ARTICLES.find((a) => a.id === selectedArticleId) ||
    filteredArticles[0] ||
    DENTAL_ARTICLES[0];

  return (
    <section id="articles" className="py-12 sm:py-16 bg-white border-t border-slate-200/80">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Heading with Local SEO focus */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-teal-700" />
            <span>Dentist-Reviewed Health Knowledge • Chhindwara</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            {language === 'hi'
              ? 'दांतों की सामान्य समस्याओं का सही समाधान'
              : 'Common Dental Symptoms & Patient Care Guides'}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'दांत दर्द, मसूड़ों से खून आना, रूट कैनाल ट्रीटमेंट (RCT), ठंडा-गर्म पानी लगना और ओरल केयर से जुड़ी विश्वसनीय जानकारी। छिंदवाड़ा में डेंटिस्ट द्वारा जांची गई।'
              : 'Evidence-informed guidance on toothache, bleeding gums, root canal treatment (RCT), cavities, sensitivity, braces, wisdom tooth, and dental crowns from Indian Dental Clinic in Chhindwara.'}
          </p>

          {/* Interactive Search Bar for Dental Problems */}
          <div className="pt-2 max-w-md mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'लक्षण या समस्या खोजें (उदा. दर्द, RCT, कीड़ा, खून, ठंडा पानी)...'
                    : 'Search dental problem (e.g. pain, RCT, cavity, bleeding, sensitivity)...'
                }
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-[11px] text-teal-700 text-left mt-1.5 font-medium">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'guide' : 'guides'} found matching "{searchQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Article Selector Tabs / Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {filteredArticles.map((art) => {
            const isSelected = art.id === activeArticle.id;
            return (
              <button
                key={art.id}
                onClick={() => setSelectedArticleId(art.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300'
                }`}
              >
                {language === 'hi' ? art.titleHi.split(':')[0] : art.category}
              </button>
            );
          })}
        </div>

        {/* Selected Article Detail Card */}
        <div id={activeArticle.id} className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Content (Col 8) */}
            <div className="lg:col-span-8 space-y-6 text-left">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-2">
                  <span className="bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                    {activeArticle.category}
                  </span>
                  <span>•</span>
                  <span className="text-slate-500">{activeArticle.readTime}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug font-heading">
                  {language === 'hi' ? activeArticle.titleHi : activeArticle.titleEn}
                </h3>

                <p className="mt-3 text-sm text-slate-700 leading-relaxed font-normal">
                  {language === 'hi' ? activeArticle.summaryHi : activeArticle.summaryEn}
                </p>
              </div>

              {/* Symptoms / Causes Grid */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>
                    {language === 'hi' ? 'मुख्य कारण व लक्षण (Symptoms & Causes)' : 'Common Causes & Warning Signs'}
                  </span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {(language === 'hi' ? activeArticle.causesHi : activeArticle.causesEn).map((cause, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Immediate First Aid / Steps */}
              <div className="bg-teal-50/60 p-5 rounded-2xl border border-teal-200/70">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-700" />
                  <span>
                    {language === 'hi' ? 'तुरंत क्या करें? (Immediate Steps at Home)' : 'Immediate First Aid Steps at Home'}
                  </span>
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-800">
                  {(language === 'hi' ? activeArticle.immediateStepsHi : activeArticle.immediateStepsEn).map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-teal-700">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Myth vs Fact (if available) */}
              {(activeArticle.mythsAndFactsEn || activeArticle.mythsAndFactsHi) && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                    <span>
                      {language === 'hi' ? 'भ्रम और सच्चाई (Myth vs. Fact)' : 'Myth vs. Medical Fact'}
                    </span>
                  </div>
                  <div className="text-slate-700 leading-relaxed pl-5 space-y-1">
                    <p>
                      <strong className="text-amber-900">
                        {language === 'hi' ? 'भ्रम: ' : 'Myth: '}
                      </strong>
                      {language === 'hi' ? activeArticle.mythsAndFactsHi?.myth : activeArticle.mythsAndFactsEn?.myth}
                    </p>
                    <p>
                      <strong className="text-teal-800">
                        {language === 'hi' ? 'सच्चाई: ' : 'Fact: '}
                      </strong>
                      {language === 'hi' ? activeArticle.mythsAndFactsHi?.fact : activeArticle.mythsAndFactsEn?.fact}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Clinic Care Recommendation (Col 4) */}
            <div className="lg:col-span-4 space-y-5 text-left">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <h4>Clinical Care at Chhindwara</h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'hi' ? activeArticle.clinicCareHi : activeArticle.clinicCareEn}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">Indian Dental Clinic</div>
                  <div>Shop No. 43, Complex, Jail Bagicha Road, Rautha Wada, Chhindwara, MP 480001</div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={onOpenAppointment}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>
                      {language === 'hi' ? 'क्लिनिक में अपॉइंटमेंट लें' : 'Request Clinic Appointment'}
                    </span>
                  </button>

                  <button
                    onClick={onOpenChat}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Ask AI Assistant About This</span>
                  </button>
                </div>
              </div>

              {/* Local Search relevance tags */}
              <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-2">
                <div className="font-bold text-slate-700">Verified Local Reference:</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    {activeArticle.englishQuery}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    {activeArticle.hindiQuery}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
