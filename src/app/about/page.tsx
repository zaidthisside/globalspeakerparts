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
    <div className="flex flex-col w-full font-sans bg-bg-snow text-body-slate">
      
      {/* Page Header */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-border-cool">
        <div className="max-w-[1400px] mx-auto text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-accent-cyan uppercase">CORPORATE PROFILE</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-heading-charcoal tracking-tight">
            Engineering Precision Audio Since 2001
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light">
            GLOBAL SPEAKER PARTS is a dedicated OEM/ODM designer, wholesale manufacturer, and exporter of high-precision speaker components worldwide.
          </p>
        </div>
      </section>

      {/* Corporate Overview & Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Core details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-accent-cyan text-xs font-bold uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            <span>WHO WE ARE</span>
          </div>
          
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-heading-charcoal leading-[1.2]">
            Supplying the Core of the World&apos;s Best Acoustic Transducers
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-light">
            At GLOBAL SPEAKER PARTS, we understand that a speaker is only as good as the sum of its mechanical parts. A minor compromise in spider compliance, voice coil winding tolerances, or cone surround density will degrade the acoustic output.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-light">
            For over two decades, we have partnered with professional sound system manufacturers, automotive tier-1 suppliers, and consumer audio brands to engineer speaker parts that stand the test of time, environment, and thermal thresholds.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="p-6 bg-white border border-border-cool rounded-premium space-y-2">
              <h3 className="text-xs font-bold text-primary-midnight uppercase tracking-wider">OUR MISSION</h3>
              <p className="text-[11px] text-slate-550 leading-relaxed font-light">
                To deliver world-class, zero-defect transducer parts that exceed international standards, using advanced materials research and strict process control.
              </p>
            </div>
            <div className="p-6 bg-white border border-border-cool rounded-premium space-y-2">
              <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider">OUR CAPACITY</h3>
              <p className="text-[11px] text-slate-550 leading-relaxed font-light">
                Operating high-speed winding and composite hydraulic pressing facilities, we manufacture over 10 million individual component units monthly.
              </p>
            </div>
          </div>
        </div>

        {/* NDA card */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full max-w-[390px] aspect-square rounded-premium glass-panel p-8 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-lg bg-bg-snow border border-border-cool flex items-center justify-center">
              <Wrench className="w-5 h-5 text-slate-gray" />
            </div>
            <div className="space-y-2.5">
              <h4 className="font-display text-base font-bold text-primary-midnight">OEM Compliance & Confidentiality</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                We operate under strict Non-Disclosure Agreements (NDAs). Custom tooling geometry, polymer blends, and frequency plots are kept strictly confidential for each client.
              </p>
            </div>
            <div className="border-t border-border-cool pt-3 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>NDA Security Checked</span>
              <span className="text-accent-cyan">Certified</span>
            </div>
          </div>
        </div>

      </section>

      {/* R&D & Quality Control Lab Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent border-y border-border-cool">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-accent-cyan uppercase">
              <Microscope className="w-4 h-4" />
              <span>QUALITY ASSURANCE LAB</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-heading-charcoal">Testing for Acoustic Reliability</h2>
            <p className="text-slate-500 text-xs max-w-xl mx-auto leading-relaxed font-light">
              Every speaker part category is validated in our specialized quality assurance laboratory before bulk batch packing. We minimize structural tolerances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {labs.map((lab, i) => (
              <div key={i} className="glass-panel glass-panel-hover p-6 rounded-premium flex flex-col justify-between min-h-[210px]">
                <h4 className="font-display text-sm font-bold text-primary-midnight border-b border-border-cool pb-2">{lab.name}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-4 font-light">{lab.desc}</p>
                <div className="pt-4 flex items-center gap-1.5 text-[9px] font-bold text-highlight-royal uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
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
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-primary-midnight uppercase">
              <Milestone className="w-4 h-4 text-accent-cyan" />
              <span>CORPORATE TIMELINE</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-heading-charcoal">Milestones of Progress</h2>
            <p className="text-slate-550 text-xs max-w-xl mx-auto leading-relaxed font-light">
              For over two decades, we have continuously scaled our facilities and upgraded engineering standards.
            </p>
          </div>

          <div className="relative border-l border-border-cool max-w-3xl mx-auto pl-6 sm:pl-8 space-y-10">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Brand Logo Icon Bullet */}
                <Logo 
                  className="absolute -left-[39px] sm:-left-[47px] top-1.5 w-6 h-6 bg-white rounded-full ring-4 ring-white" 
                  variant="icon" 
                />
                
                <div className="glass-panel glass-panel-hover p-6 rounded-premium space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-numbers text-base font-semibold text-accent-cyan">{item.year}</span>
                    <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Verified</span>
                  </div>
                  <h4 className="text-xs font-bold text-primary-midnight">{item.title}</h4>
                  <p className="text-[10px] text-slate-550 leading-normal font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent border-t border-border-cool text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="font-display text-2xl font-extrabold text-primary-midnight">Looking for a Reliable OEM Speaker Component Partner?</h3>
          <p className="text-slate-500 text-xs max-w-xl mx-auto leading-relaxed font-light">
            Speak to our engineering support desk today to discuss customization options, custom tooling costs, and request physical samples.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="btn-primary inline-flex items-center justify-center px-6 py-3.5 text-xs font-bold tracking-widest shadow-sm"
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
