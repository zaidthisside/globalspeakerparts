"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";

// Sourced high-resolution Unsplash photos
const galleryData = [
  {
    title: "Pressed Carbon-Fiber Cones",
    category: "Finished Components",
    img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "High-Temperature CCAW Winding",
    category: "Production Line",
    img: "https://images.unsplash.com/photo-1618976186466-b3a5cfc7df57?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Nomex Damper Hot Pressing",
    category: "Production Line",
    img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Strontium Y35 Ferrite Magnet Grinding",
    category: "Finished Components",
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "CNC Machining Center for Top Plates",
    category: "Machining Floor",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Anechoic Sound Calibration Check",
    category: "QA Laboratory",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
  }
];

const categories = ["All Photos", "Finished Components", "Production Line", "Machining Floor", "QA Laboratory"];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All Photos");
  const [zoomImg, setZoomImg] = useState<typeof galleryData[0] | null>(null);

  const filteredGallery = galleryData.filter(
    (item) => activeCategory === "All Photos" || item.category === activeCategory
  );

  return (
    <div className="flex flex-col w-full font-sans bg-transparent text-body-slate min-h-screen pb-20">
      
      {/* Header */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent border-b border-border-cool">
        <div className="max-w-[1400px] mx-auto text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-accent-cyan uppercase">MEDIA GRID</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-heading-charcoal tracking-tight">
            Factory Floor & Component Gallery
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light">
            A visual overview of our automatic winding, high-pressure pressing, CNC steel machining, and acoustic sweep labs in Jaipur.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-wrap justify-center gap-2 border-b border-border-cool pb-5">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-full tracking-wide transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary-midnight text-white font-bold shadow-sm"
                    : "bg-white text-slate-550 border border-border-cool hover:bg-bg-snow"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGallery.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => setZoomImg(item)}
              className="glass-panel glass-panel-hover p-4 rounded-premium group cursor-pointer"
            >
              <div className="w-full aspect-video rounded-lg overflow-hidden border border-border-cool/40 mb-4 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary-midnight/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                    <Eye className="w-4 h-4 text-primary-midnight" />
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-bold text-highlight-royal uppercase tracking-wider block mb-1">
                {item.category}
              </span>
              <h3 className="font-display text-xs font-bold text-primary-midnight">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Zoom Modal */}
      {zoomImg && (
        <div 
          onClick={() => setZoomImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-midnight/40 backdrop-blur-xs animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-4xl rounded-premium border border-border-cool overflow-hidden shadow-2xl relative"
          >
            <div className="p-4 bg-bg-snow border-b border-border-cool flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-highlight-royal uppercase block">{zoomImg.category}</span>
                <h4 className="font-display text-xs font-bold text-primary-midnight">{zoomImg.title}</h4>
              </div>
              <button
                onClick={() => setZoomImg(null)}
                className="p-1.5 rounded-lg bg-white border border-border-cool hover:bg-bg-snow text-slate-500 hover:text-primary-midnight"
                aria-label="Close image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="w-full aspect-video bg-primary-midnight flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoomImg.img}
                alt={zoomImg.title}
                className="max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
