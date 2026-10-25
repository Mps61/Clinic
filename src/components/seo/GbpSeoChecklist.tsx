import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Search,
  Globe,
  MapPin,
  Camera,
  Star,
  FileCheck,
} from 'lucide-react';

export const GbpSeoChecklist: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 text-xs text-slate-700">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Clinic Owner Local SEO & Google Business Profile Guide</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-heading">
          Google Business Profile & Search Console Action Plan for Chhindwara
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Follow these guidelines to legitimately maximize local visibility for "dentist in Chhindwara", "dental clinic Chhindwara", and treatment searches without risky gimmicks or fake reviews.
        </p>
      </div>

      {/* Part 1: Google Business Profile Checklist */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-700" />
          <span>1. Google Business Profile (GBP) Optimization Checklist</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Exact Business Name</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Use only <strong>Indian Dental Clinic</strong>. Never add spammy keyword-stuffing like "Indian Dental Clinic - Best Dentist RCT Chhindwara" as Google suspends profiles with stuffed names.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Primary & Secondary Categories</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Set Primary Category to <strong>Dentist</strong>. Add Secondary Categories: <em>Dental Clinic</em>, <em>Cosmetic Dentist</em>, and <em>Emergency Dental Service</em>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Precise Address & Pin Location</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Match website NAP exactly: <strong>Shop No. 43, Complex, Jail Bagicha Road, Rautha Wada, Chhindwara, MP 480001</strong>. Ensure the map pin sits directly on your operatory entrance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Operating Hours & Special Hours</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Once confirmed, publish exact morning and evening consultation slots. Keep holiday hours updated during Diwali, Holi, and national holidays.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-600" />
              <span>Real High-Resolution Photos</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Upload genuine photos of the clinic reception, sterile dental chair, autoclave sterilizer, and exterior sign board. Never use stock photos on GBP.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Genuine Patient Reviews Protocol</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Politely invite satisfied in-person patients to leave an honest Google review. Never buy reviews or incentivize ratings, and reply professionally to all feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Part 2: Google Search Console Checklist */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-700" />
          <span>2. Google Search Console (GSC) Setup & Indexing Steps</span>
        </h4>

        <div className="space-y-2.5">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div>
              <div className="font-bold text-slate-800">Add Property to Google Search Console</div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline font-semibold">search.google.com/search-console</a> and add your domain property (e.g., <code>https://indiandentalclinic.in</code>).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <div>
              <div className="font-bold text-slate-800">Submit XML Sitemap</div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Under the "Sitemaps" tab, enter <code>sitemap.xml</code> and click Submit. Your sitemap has already been generated at <code>/sitemap.xml</code> with clean canonical URLs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <div>
              <div className="font-bold text-slate-800">Use URL Inspection for Faster Indexing</div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Paste your homepage URL into the search bar at the top of GSC and click "Request Indexing" to prompt Googlebot to crawl your new rich Schema and content immediately.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </span>
            <div>
              <div className="font-bold text-slate-800">Monitor Search Queries & Impressions Weekly</div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Check the "Performance" report after 7-14 days. Observe impressions for queries like "dentist in Chhindwara", "root canal treatment Chhindwara", and "दांत दर्द छिंदवाड़ा".
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Part 3: Remaining Clinic Owner Tasks */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
        <div className="font-bold text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <span>Remaining Verified Clinic Owner Verification Tasks</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-[11px] leading-relaxed">
          <li>Confirm official clinic phone and WhatsApp contact numbers in the Admin "Clinic Information Settings" tab to show active click-to-call buttons.</li>
          <li>Confirm lead dental surgeon registration number and degrees (BDS / MDS) before publicly publishing doctor bio.</li>
          <li>Confirm clinical opening hours (e.g., 10:00 AM - 1:30 PM & 4:30 PM - 8:30 PM) so patient expectations match reality.</li>
          <li>Never believe any agency promising "Guaranteed #1 ranking on Google" — legitimate local ranking depends on consistent patient care, accurate location data, and genuine patient satisfaction over time.</li>
        </ul>
      </div>
    </div>
  );
};
