"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";

function ContactDeskSection() {
  const searchParams = useSearchParams();
  const rfq = searchParams.get("rfq");

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start font-sans">
      
      {/* Left side coordinates block (Col 5) */}
      <div className="lg:col-span-5 space-y-8">
        
        {/* Office Contact Info Card */}
        <div className="bg-white border border-[#EAEAEA] p-6 sm:p-8 rounded-premium space-y-6 shadow-sm">
          <div className="border-b border-[#EAEAEA] pb-4.5">
            <h2 className="font-display text-lg font-extrabold text-[#0F0F10] leading-tight">Export Sales Headquarters</h2>
            <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider mt-1 font-sans">Global Speaker Parts India Ltd</p>
          </div>

          <ul className="space-y-4.5 text-xs text-[#4A4A4F]">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#5C5C63] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0F0F10] font-bold block mb-1">Corporate Address</strong>
                <span className="font-light">
                  Plot 142-A, Industrial Estate Phase-II, Sector 4, export zone, Jaipur, Rajasthan, 302022, India
                </span>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#5C5C63] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0F0F10] font-bold block mb-1">Global Sales Phone</strong>
                <a href="tel:+919829062390" className="hover:text-[#0F0F10] transition-colors font-light">
                  +91 98290 62390 (Mon - Sat, 09:00 - 18:00 IST)
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#5C5C63] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0F0F10] font-bold block mb-1">B2B Procurement Email</strong>
                <a href="mailto:globalspeakerparts@gmail.com" className="hover:text-[#0F0F10] transition-colors font-light">
                  globalspeakerparts@gmail.com
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#5C5C63] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0F0F10] font-bold block mb-1">Operational Desk Hours</strong>
                <span className="font-light block">Monday - Friday: 09:00 - 18:00 (IST)</span>
                <span className="font-light block">Saturday: 09:00 - 14:00 (IST)</span>
                <span className="font-light block text-slate-400 font-sans">Sunday: Closed (Operations on sea freight standby)</span>
              </div>
            </li>
          </ul>

        </div>

        {/* SVG Geodesic Map Marker */}
        <div className="bg-white border border-[#EAEAEA] p-6 rounded-premium relative overflow-hidden shadow-sm">
          <div className="absolute top-4 left-4 bg-[#F7F7F8] text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded border border-[#EAEAEA]">
            GEODESIC COORDINATES
          </div>

          <svg 
            viewBox="0 0 400 200" 
            className="w-full h-auto text-[#0F0F10] border border-[#EAEAEA] rounded-lg bg-[#F7F7F8]/30 mt-8"
          >
            {/* Background grids */}
            <path d="M 0,50 L 400,50 M 0,100 L 400,100 M 0,150 L 400,150" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
            <path d="M 100,0 L 100,200 M 200,0 L 200,200 M 300,0 L 300,200" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
            
            {/* Concentric waves around factory site */}
            <circle cx="200" cy="100" r="40" fill="none" stroke="#2E2E33" strokeWidth="0.75" opacity="0.3" strokeDasharray="2,2" />
            <circle cx="200" cy="100" r="70" fill="none" stroke="#2E2E33" strokeWidth="0.75" opacity="0.2" strokeDasharray="2,2" />

            {/* Factory Coordinate pin: (200, 100) */}
            <circle cx="200" cy="100" r="8" fill="#1E1E20" opacity="0.4" />
            <circle cx="200" cy="100" r="4" fill="#0F0F10" />

            <text x="215" y="105" fontSize="10" fontWeight="bold" fill="#0F0F10">Jaipur Export Facility</text>
            <text x="215" y="120" fontSize="8" fill="#5C5C63">26°55&apos; N, 75°49&apos; E</text>
          </svg>
        </div>

      </div>

      {/* Right side intake form block (Col 7) */}
      <div className="lg:col-span-7">
        <InquiryForm defaultCategory={rfq ? "Custom OEM Component" : "Speaker Cones"} />
      </div>

    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full font-sans bg-white text-[#4A4A4F] min-h-screen pb-20">
      
      {/* Header */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#F7F7F8] border-b border-[#EAEAEA]">
        <div className="max-w-[1400px] mx-auto text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#0F0F10] uppercase">B2B INTAKE</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0F0F10] tracking-tight">
            OEM Component Inquiry Desk
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light font-sans">
            Contact our export coordinators to request catalog PDFs, check tooling availabilities, or log wholesale custom RFQs.
          </p>
        </div>
      </section>

      {/* Main Desk */}
      <Suspense fallback={
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center text-sm text-slate-400">
          Loading contact channels...
        </div>
      }>
        <ContactDeskSection />
      </Suspense>

    </div>
  );
}
