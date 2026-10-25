import React, { useState } from 'react';
import { REAL_CLINIC_IMAGES, ClinicImage } from '../config/clinicSettings';
import { ZoomIn, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

interface GalleryPageProps {
  onSelectImage: (image: ClinicImage) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onSelectImage }) => {
  const [filter, setFilter] = useState<'all' | 'operatory' | 'consultation' | 'equipment'>('all');

  const filteredImages = filter === 'all'
    ? REAL_CLINIC_IMAGES
    : REAL_CLINIC_IMAGES.filter((img) => img.category === filter);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 text-left">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 text-teal-700" />
          <span>Real Clinic Facility • Chhindwara</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          Authentic Clinic Photographs
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Take a look inside Indian Dental Clinic at Shop No. 43, Complex, Jail Bagicha Road, Chhindwara. We only publish authentic photographs of our actual operatory suites and clinical equipment.
        </p>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            Patient privacy assured: All images adhere to medical privacy standards with clinical authorization.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Photographs ({REAL_CLINIC_IMAGES.length})
        </button>
        <button
          onClick={() => setFilter('operatory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'operatory'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Operatory Suites
        </button>
        <button
          onClick={() => setFilter('consultation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'consultation'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Procedures & Care
        </button>
        <button
          onClick={() => setFilter('equipment')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'equipment'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Clinical Equipment
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            onClick={() => onSelectImage(img)}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col"
          >
            <div className="relative aspect-16/10 overflow-hidden bg-slate-950">
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-900 rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <ZoomIn className="w-4 h-4 text-teal-700" />
                  <span>Inspect Photograph</span>
                </div>
              </div>
              <div className="absolute top-3 left-3 bg-teal-800/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-xs">
                Verified Photo
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5 font-heading">
                  {img.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {img.caption}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
                <span>Indian Dental Clinic, Chhindwara</span>
                <span className="text-slate-400">Click to view full screen</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
