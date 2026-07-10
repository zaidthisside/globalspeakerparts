"use client";

import { 
  Globe2, BadgeCheck, Anchor, ArrowRight 
} from "lucide-react";
import Link from "next/link";

const exportTerms = [
  {
    title: "Incoterms Supply Options",
    desc: "We supply under EXW (Ex Works), FOB (Free on Board Mumbai Port), CIF (Cost, Insurance & Freight), and DDU (Delivered Duty Unpaid) based on customer freight agreements."
  },
  {
    title: "Moisture-Control Packaging",
    desc: "Cones and voice coils are vacuum sealed in heat-reflective aluminum foil bags with active silica gel desiccant packs to prevent moisture ingress during ocean voyages."
  },
  {
    title: "Port of Exit Logistics",
    desc: "Wholesale consignments are routed through Nhava Sheva (JNPT) Port, Mumbai — India's largest container port, ensuring prompt weekly connections to European, Asian, and American sea channels."
  },
  {
    title: "RoHS & REACH Declarations",
    desc: "Every export container shipment includes material compliance sheets declaring zero trace values of restricted substances under EU regulations."
  }
];

export default function ExportPage() {
  return (
    <div className="flex flex-col w-full font-sans bg-transparent text-body-slate">
      
      {/* Header */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent border-b border-border-cool">
        <div className="max-w-[1400px] mx-auto text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-accent-cyan uppercase">GLOBAL LOGISTICS</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-heading-charcoal tracking-tight">
            Wholesale Global Export Operations
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light">
            Providing reliable sea and air freight logistics to OEM builders in Europe, Asia, and North America.
          </p>
        </div>
      </section>

      {/* Map & Logistics Hub */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Side Logistics Text */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2 text-accent-cyan text-xs font-bold uppercase tracking-wider">
            <Globe2 className="w-4 h-4" />
            <span>EXPORT CAPACITY</span>
          </div>
          
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-heading-charcoal leading-[1.2]">
            NHAVA SHEVA PORT TO Rotterdam, Los Angeles, and Tokyo
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-light">
            GLOBAL SPEAKER PARTS coordinates containerized shipping schedules with major carrier lines (Maersk, MSC, COSCO) to guarantee predictable delivery windows.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-light">
            We manage export documentation, including Certificate of Origin, GSP declarations, bill of lading releases, and custom clearance paperwork.
          </p>
          
          <div className="pt-2">
            <Link href="/contact">
              <button className="btn-primary px-6 py-3 text-xs font-bold tracking-widest flex items-center gap-2 cursor-pointer">
                <span>CONNECT WITH LOGISTICS DESK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* Right Side Map SVG Graphic */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full bg-white border border-border-cool p-6 rounded-premium shadow-soft relative overflow-hidden">
            <div className="absolute top-4 left-4 bg-bg-snow text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded border border-border-cool">
              MAP: GLOBAL OCEAN LOGISTICS CHANNELS
            </div>
            
            {/* SVG Map Graphic */}
            <svg 
              viewBox="0 0 1000 500" 
              className="w-full h-auto text-primary-midnight border border-border-cool/40 rounded-lg bg-bg-snow/30 mt-8"
            >
              {/* Grid Lines */}
              <path d="M 0,100 L 1000,100 M 0,200 L 1000,200 M 0,300 L 1000,300 M 0,400 L 1000,400" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="5,5" />
              <path d="M 200,0 L 200,500 M 400,0 L 400,500 M 600,0 L 600,500 M 800,0 L 800,500" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="5,5" />

              {/* Contours (Minimal representation) */}
              {/* North America */}
              <path d="M 50,150 Q 120,100 200,120 T 300,180 Q 280,250 200,280 T 150,380 Z" fill="#E5E7EB" opacity="0.4" />
              {/* South America */}
              <path d="M 200,350 Q 250,380 270,450 T 220,490 Z" fill="#E5E7EB" opacity="0.4" />
              {/* Eurasia / Africa */}
              <path d="M 450,120 Q 550,80 700,100 T 900,150 Q 880,280 800,320 T 650,420 Q 500,400 480,280 Z" fill="#E5E7EB" opacity="0.4" />
              {/* Australia */}
              <path d="M 800,380 Q 860,390 890,420 T 820,460 Z" fill="#E5E7EB" opacity="0.4" />

              {/* Shipping Lanes (Blue lines originating from India) */}
              {/* India Port (JNPT) Marker: (610, 260) */}
              {/* Rotterdam (520, 140) */}
              {/* Los Angeles (180, 200) */}
              {/* Tokyo (840, 180) */}
              <path d="M 610,260 Q 530,220 520,140" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4,3" />
              <path d="M 610,260 Q 400,380 180,200" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4,3" />
              <path d="M 610,260 Q 750,220 840,180" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4,3" />

              {/* Port Markers */}
              <circle cx="610" cy="260" r="6" fill="#06B6D4" />
              <text x="620" y="265" fontSize="10" fontWeight="bold" fill="#0F172A">JNPT Port (Mumbai)</text>

              <circle cx="520" cy="140" r="4" fill="#0F172A" />
              <text x="530" y="145" fontSize="9" fill="#475569">Rotterdam</text>

              <circle cx="180" cy="200" r="4" fill="#0F172A" />
              <text x="190" y="205" fontSize="9" fill="#475569">Los Angeles</text>

              <circle cx="840" cy="180" r="4" fill="#0F172A" />
              <text x="850" y="185" fontSize="9" fill="#475569">Tokyo Port</text>
            </svg>
            
          </div>
        </div>

      </section>

      {/* Shipping terms grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent border-y border-border-cool">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-primary-midnight uppercase">
              <Anchor className="w-4 h-4 text-accent-cyan" />
              <span>EXPORT STANDARDS</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-heading-charcoal">Supply Parameters & Terms</h2>
            <p className="text-slate-500 text-xs max-w-xl mx-auto leading-relaxed font-light">
              We streamline wholesale international exports to ensure your factory assembly schedules are never disrupted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {exportTerms.map((term, idx) => (
              <div 
                key={idx}
                className="glass-panel glass-panel-hover p-8 rounded-premium flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h4 className="font-display text-sm font-bold text-primary-midnight">{term.title}</h4>
                  <p className="text-xs text-slate-550 leading-relaxed font-light">{term.desc}</p>
                </div>
                <div className="pt-5 flex items-center gap-1.5 text-[9px] font-bold text-highlight-royal uppercase tracking-wider font-mono">
                  <BadgeCheck className="w-4 h-4 text-accent-cyan" />
                  <span>Verified Supply Protocol</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="font-display text-2xl font-extrabold text-primary-midnight">Estimate Shipping Cost & Schedules</h3>
          <p className="text-slate-500 text-xs max-w-xl mx-auto leading-relaxed font-light">
            Contact our supply desk to request ocean container freight rates, transit times, and packaging specifications.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="btn-primary inline-flex items-center justify-center px-6 py-3.5 text-xs font-bold tracking-widest shadow-sm"
            >
              <span>REQUEST SHIPPNG SCHEDULES</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
