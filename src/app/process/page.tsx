"use client";

import { 
  FileCode, Layers, Hammer, Settings2, BadgeCheck, 
  ArrowRight, Microscope, Settings 
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    phase: "01",
    title: "CAD/CAM Modeling & Simulation",
    desc: "Every component begins with Finite Element Analysis (FEA) modeling. We simulate mechanical displacement curves, magnetic flux distribution, and voice coil thermal dissipation to prevent field failures.",
    icon: FileCode,
  },
  {
    phase: "02",
    title: "Tooling & Mold Development",
    desc: "Using high-speed CNC milling and wire-EDM setups, we machine molds for cones, spiders, and baskets directly in our facility, maintaining geometry errors under ±0.02 mm.",
    icon: Hammer,
  },
  {
    phase: "03",
    title: "Composite Hydraulic Pressing",
    desc: "Carbon fiber, Kevlar, and paper pulp matrices are pressed under custom temperature cycles. Voice coil wire tension is monitored on automatic winding setups.",
    icon: Layers,
  },
  {
    phase: "04",
    title: "Precision Adhesion & Curing",
    desc: "Dampers and cones are assembled using heat-curing B-stage epoxy adhesives, ensuring structural integrity under high continuous mechanical loads.",
    icon: Settings2,
  },
  {
    phase: "05",
    title: "Acoustic Chamber Calibration",
    desc: "Pre-production samples undergo sweeps in our anechoic chambers. Frequency response curves are recorded alongside Total Harmonic Distortion (THD) metrics.",
    icon: Microscope,
  },
  {
    phase: "06",
    title: "Final QA & Vacuum Packaging",
    desc: "100% of finished parts undergo Klippel sweeps on the lines. Approved components are packed in moisture-proof vacuum bags to protect against ocean shipping humidity.",
    icon: BadgeCheck,
  },
];

export default function ProcessPage() {
  return (
    <div className="flex flex-col w-full font-sans bg-white text-[#4A4A4F]">
      
      {/* Header */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#F7F7F8] border-b border-[#EAEAEA]">
        <div className="max-w-[1400px] mx-auto text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#0F0F10] uppercase">MANUFACTURING PROCESS</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0F0F10] tracking-tight">
            Engineering Precision from Tooling to Assembly
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light font-sans">
            How we translate raw materials into certified high-fidelity speaker parts in our Jaipur export facilities.
          </p>
        </div>
      </section>

      {/* Steps Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-white border border-[#EAEAEA] hover:border-[#D6D6D8] p-8 rounded-premium flex flex-col justify-between min-h-[280px] shadow-sm transition-colors font-sans"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="font-numbers text-2xl font-bold text-[#0F0F10]">{step.phase}</span>
                  <div className="w-10 h-10 rounded-lg bg-[#F7F7F8] border border-[#EAEAEA] flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <h3 className="font-display text-base font-bold text-[#0F0F10] border-b border-[#EAEAEA] pb-2.5">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-1.5 text-[9px] font-bold text-[#5C5C63] uppercase tracking-widest font-mono">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>INLINE PARAMETER INSPECTED</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent border-t border-[#EAEAEA] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="font-display text-2xl font-extrabold text-[#0F0F10]">Need Custom Tooling for Your Transducer Line?</h3>
          <p className="text-slate-500 text-xs max-w-xl mx-auto leading-relaxed font-light font-sans">
            We provide fast prototyping options and build tooling molds according to your specific geometric schematics.
          </p>
          <div className="pt-2 font-sans">
            <Link
              href="/contact"
              className="bg-[#0F0F10] hover:bg-[#2E2E33] text-white inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-xs font-bold tracking-widest shadow-sm uppercase transition-colors cursor-pointer"
            >
              <span>DISCUSS TOOLING REQUIREMENTS</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
