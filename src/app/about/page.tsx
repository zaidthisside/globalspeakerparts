"use client";

import { ShieldCheck, Wrench, Microscope, ArrowRight, Eye, Milestone } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

const labs = [
  {
    name: "Klippel Analyzer Systems",
    desc: "Used for measuring large signal transducer parameters, assessing cone suspension linearities, and measuring displacement limits."
  },
  {
    name: "SoundCheck electro-acoustic testing",
    desc: "Utilized on active assembly lines for 100% frequency response sweep checks and Total Harmonic Distortion (THD) threshold verification."
  },
  {
    name: "Anechoic Chambers",
    desc: "Fully isolated chambers with calibrated microphones for measuring precise directivity, sensitivity, and polar response plots."
  },
  {
    name: "Climatic & Aging Chambers",
    desc: "Environmental stress chambers to test voice coil adhesive and spider flexibility retention under extreme heat and humidity cycles."
  }
];

const timeline = [
  { year: "2001", title: "Factory Foundation", desc: "Established central stamping and pressing shop for basic paper cones and steel speaker baskets." },
  { year: "2008", title: "ISO 9001 & OEM Expansion", desc: "Obtained ISO certification and began contract manufacturing for international automotive brands." },
  { year: "2015", title: "R&D Testing Center Upgrade", desc: "Inaugurated state-of-the-art laboratory equipped with Klippel scanners and high-temp voice coil winding equipment." },
  { year: "2021", title: "Carbon & Kevlar Molding", desc: "Developed carbon-fiber and Kevlar composite pressing lines, reducing cone mass by 18% while enhancing rigidity." },
  { year: "Present", title: "Global Supply Networks", desc: "Supplying more than 50 destinations worldwide under strict REACH and RoHS compliance standards." }
];

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full font-sans bg-white text-[#4A4A4F]">
      
      {/* Page Header */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#F7F7F8] border-b border-[#EAEAEA]">
        <div className="max-w-[1400px] mx-auto text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#0F0F10] uppercase">CORPORATE PROFILE</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0F0F10] tracking-tight">
            Engineering Precision Audio Since 2001
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light font-sans">
            GLOBAL SPEAKER PARTS is a dedicated OEM/ODM designer, wholesale manufacturer, and exporter of high-precision speaker components worldwide.
          </p>
        </div>
      </section>

      {/* Corporate Overview & Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Core details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-[#0F0F10] text-xs font-bold uppercase tracking-wider">
            <Eye className="w-4 h-4 text-[#5C5C63]" />
            <span>WHO WE ARE</span>
          </div>
          
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F0F10] leading-[1.2]">
            Supplying the Core of the World&apos;s Best Acoustic Transducers
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-light font-sans">
            At GLOBAL SPEAKER PARTS, we understand that a speaker is only as good as the sum of its mechanical parts. A minor compromise in spider compliance, voice coil winding tolerances, or cone surround density will degrade the acoustic output.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-light font-sans">
            For over two decades, we have partnered with professional sound system manufacturers, automotive tier-1 suppliers, and consumer audio brands to engineer speaker parts that stand the test of time, environment, and thermal thresholds.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 font-sans">
            <div className="p-6 bg-white border border-[#EAEAEA] rounded-premium space-y-2">
              <h3 className="text-xs font-bold text-[#0F0F10] uppercase tracking-wider">OUR MISSION</h3>
              <p className="text-[11px] text-slate-550 leading-relaxed font-light">
                To deliver world-class, zero-defect transducer parts that exceed international standards, using advanced materials research and strict process control.
              </p>
            </div>
            <div className="p-6 bg-white border border-[#EAEAEA] rounded-premium space-y-2">
              <h3 className="text-xs font-bold text-[#0F0F10] uppercase tracking-wider">OUR CAPACITY</h3>
              <p className="text-[11px] text-slate-550 leading-relaxed font-light">
                Operating high-speed winding and composite hydraulic pressing facilities, we manufacture over 10 million individual component units monthly.
              </p>
            </div>
          </div>
        </div>

        {/* NDA card */}
        <div className="lg:col-span-5 flex items-center justify-center font-sans">
          <div className="relative w-full max-w-[390px] aspect-square rounded-premium bg-white border border-[#EAEAEA] p-8 flex flex-col justify-between shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-[#F7F7F8] border border-[#EAEAEA] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-2.5">
              <h4 className="font-display text-base font-bold text-[#0F0F10]">OEM Compliance & Confidentiality</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                We operate under strict Non-Disclosure Agreements (NDAs). Custom tooling geometry, polymer blends, and frequency plots are kept strictly confidential for each client.
              </p>
            </div>
            <div className="border-t border-[#EAEAEA] pt-3 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>NDA Security Checked</span>
              <span className="text-[#0F0F10]">Certified</span>
            </div>
          </div>
        </div>

      </section>

      {/* R&D & Quality Control Lab Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent border-y border-[#EAEAEA]">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#0F0F10] uppercase">
              <Microscope className="w-4 h-4 text-[#5C5C63]" />
              <span>QUALITY ASSURANCE LAB</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-[#0F0F10]">Testing for Acoustic Reliability</h2>
            <p className="text-slate-500 text-xs max-w-xl mx-auto leading-relaxed font-light font-sans">
              Every speaker part category is validated in our specialized quality assurance laboratory before bulk batch packing. We minimize structural tolerances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
            {labs.map((lab, i) => (
              <div key={i} className="bg-white border border-[#EAEAEA] hover:border-[#D6D6D8] p-6 rounded-premium flex flex-col justify-between min-h-[210px] shadow-sm transition-colors font-sans">
                <h4 className="font-display text-sm font-bold text-[#0F0F10] border-b border-[#EAEAEA] pb-2">{lab.name}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-4 font-light">{lab.desc}</p>
                <div className="pt-4 flex items-center gap-1.5 text-[9px] font-bold text-[#5C5C63] uppercase tracking-widest font-mono">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>INLINE ACTIVE</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#0F0F10] uppercase">
              <Milestone className="w-4 h-4 text-[#5C5C63]" />
              <span>CORPORATE TIMELINE</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-[#0F0F10]">Milestones of Progress</h2>
            <p className="text-slate-500 text-xs max-w-xl mx-auto leading-relaxed font-light font-sans">
              For over two decades, we have continuously scaled our facilities and upgraded engineering standards.
            </p>
          </div>

          <div className="relative border-l border-[#EAEAEA] max-w-3xl mx-auto pl-6 sm:pl-8 space-y-10">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative group font-sans">
                {/* Brand Logo Icon Bullet */}
                <Logo 
                  className="absolute -left-[39px] sm:-left-[47px] top-1.5 w-6 h-6 bg-white rounded-full ring-4 ring-white" 
                  variant="icon" 
                />
                
                <div className="bg-white border border-[#EAEAEA] hover:border-[#D6D6D8] p-6 rounded-premium space-y-1.5 shadow-sm transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-numbers text-base font-semibold text-[#0F0F10]">{item.year}</span>
                    <span className="text-[9px] text-[#A3A3A8] font-bold uppercase tracking-wider">Verified</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0F0F10]">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent border-t border-[#EAEAEA] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="font-display text-2xl font-extrabold text-[#0F0F10]">Looking for a Reliable OEM Speaker Component Partner?</h3>
          <p className="text-slate-500 text-xs max-w-xl mx-auto leading-relaxed font-light font-sans">
            Speak to our engineering support desk today to discuss customization options, custom tooling costs, and request physical samples.
          </p>
          <div className="pt-2 font-sans">
            <Link
              href="/contact"
              className="bg-[#0F0F10] hover:bg-[#2E2E33] text-white inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-xs font-bold tracking-widest shadow-sm uppercase transition-colors cursor-pointer"
            >
              <span>CONNECT WITH B2B DESK</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
