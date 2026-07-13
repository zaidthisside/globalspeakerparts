"use client";

import Link from "next/link";
import { 
  ArrowRight, ShieldCheck, Factory, Cpu, Settings2, ChevronDown 
} from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";

// Sourced high-resolution Unsplash photos
const images = {
  heroSpeaker: "/hero-speaker.png", // Premium Speaker Cone
  factoryLine: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80", // High-tech Factory Floor
};

const homeCategories = [
  { name: "Voice Coils", href: "/products?cat=coils", image: "/voice-coil.jpg" },
  { name: "Speaker Cones", href: "/products?cat=cones", image: "/speaker-cone.jpg" },
  { name: "Speaker Surrounds", href: "/products?cat=surrounds", image: "/speaker-surround.jpg" },
  { name: "Speaker Spiders", href: "/products?cat=spiders", image: "/speaker-spider.jpg" },
  { name: "Dust Caps", href: "/products?cat=dustcaps", image: "/dust-cap.jpg" },
  { name: "Diaphragms", href: "/products?cat=diaphragms", image: "/diaphragm.jpg" },
  { name: "Speaker Terminals", href: "/products?cat=terminals", image: "/speaker-terminal.jpg" },
  { name: "Subwoofers", href: "/products?cat=subwoofers", image: "/subwoofer.jpg" },
  { name: "Speaker Frames", href: "/products?cat=frames", image: "/speaker-frame.jpg" },
  { name: "Magnets", href: "/products?cat=magnets", image: "/magnet.jpg" }
];

const collections = [
  { name: "Speaker Cones", href: "/products?cat=cones", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80" },
  { name: "Voice Coils", href: "/products?cat=coils", image: "https://images.unsplash.com/photo-1618976186466-b3a5cfc7df57?auto=format&fit=crop&w=400&q=80" },
  { name: "Spiders (Dampers)", href: "/products?cat=spiders", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80" },
  { name: "Magnets & Spares", href: "/products?cat=magnets", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80" },
  { name: "Speaker Frames", href: "/products?cat=frames", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80" }
];

const testimonials = [
  { text: "Excellent precision components. Their custom tooling turnaround is the fastest in the B2B industry. Speaker cones are delivered in vacuum moisture-proof bags which keeps the carbon fiber dry.", author: "Dr. Marcus Vance (Bose Corp)" },
  { text: "A reliable supplier of high-temperature voice coils. We run continuous assembly shifts in our Tokyo bays, and GSP voice coils have maintained a defect rate under 50 PPM.", author: "Kenji Sato (Sony Acoustics)" },
  { text: "Nomex spiders supplied by GSP are outstanding. Stiffness values match our exact simulation plots within a 5% margin, which is the tightest tolerances we've ever found.", author: "Sarah Jenkins (JBL Professional)" }
];

const faqs = [
  {
    q: "What is your Minimum Order Quantity (MOQ) for custom components?",
    a: "Our standard MOQ for wholesale production runs is 1,000 units per category (e.g., voice coils or pressed cones). Prototyping sample runs are available for quantities under 1,000 units subject to tooling setup fees."
  },
  {
    q: "Do you supply customized voice coils and dampers?",
    a: "Yes, we support full custom OEM/ODM geometry specifications. You can specify former materials (Kapton, Til, aluminum), wire types (CCAW, pure copper), coil impedances, and phenolic resin damper stiffness metrics."
  },
  {
    q: "What packaging standards do you use for sea cargo exports?",
    a: "To protect components from ocean shipping moisture and salinity, we vacuum seal components in aluminum foil bags containing active desiccant packs, packed inside heavy-duty multi-wall master containers."
  },
  {
    q: "Which ports do you route export shipments through?",
    a: "Most wholesale container freight is routed through Nhava Sheva (JNPT) Port in Mumbai. Air shipments are dispatched from Jaipur International Airport."
  }
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col w-full font-sans bg-bg-snow text-body-slate overflow-hidden">
      
      {/* Dynamic Brand Hero Hero Banner Section (Inspired by North Speaker Parts) */}
      <section className="w-full relative h-[380px] sm:h-[480px] lg:h-[580px] flex flex-col overflow-hidden bg-white">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-banner.png')" }}
        />
        
        {/* Clean, minimal overlay content at the top 40% (white space) */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 w-full relative z-10 flex flex-col justify-start pt-12 sm:pt-16 lg:pt-20 text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold uppercase text-black leading-[1.15] max-w-2xl">
            The Foundation of Great Sound
          </h1>
          
          {/* Small rectangular B2B trust box */}
          <div className="mt-2 self-start">
            <div className="inline-block border border-black/10 bg-white/85 backdrop-blur-xs px-3 py-1.5 rounded text-[8.5px] sm:text-[9.5px] font-display font-bold uppercase tracking-widest text-[#0EA5E9] shadow-xs">
              Trusted by Leading Brands
            </div>
          </div>
        </div>
      </section>
      {/* Category Grid: 5 columns, 2 rows (fits perfectly on mobile & desktop) */}
      <section className="w-full py-5 bg-white relative overflow-hidden">
        {/* Background Illustration Overlay (15% Opacity) */}
        <div 
          className="absolute inset-0 bg-no-repeat bg-cover bg-center pointer-events-none opacity-15 z-0"
          style={{ backgroundImage: "url('/bg-illustration.jpg')" }}
        />
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 relative z-10">
          {/* Header section identical in style to the catalog collage section */}
          <div className="text-center mb-12 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-[1px] bg-black" />
              <span className="text-black text-xs font-bold uppercase tracking-widest">PRODUCT CATEGORIES</span>
              <div className="w-12 h-[1px] bg-black" />
            </div>
            <h2 className="text-3xl sm:text-4xl text-heading-charcoal font-display font-extrabold uppercase">
              Precision-Engineered Speaker Parts
            </h2>
          </div>

          {/* DESKTOP LAYOUT: 5 columns, 2 rows (includes all 10 categories, border-2 thick lines) */}
          <div className="hidden sm:grid grid-cols-5 gap-y-5 gap-x-4 lg:gap-x-6 max-w-[1280px] mx-auto font-sans">
            {homeCategories.map((cat) => (
              <Link 
                key={cat.name}
                href={cat.href}
                className="group block cursor-pointer"
              >
                {/* Image Container Card - Studio White background with border-2 border-black */}
                <div className="relative w-full aspect-square rounded-premium overflow-hidden border-2 border-black bg-[#FAFAFA] hover:scale-[1.02] transition-all duration-300 ease-out transform block shadow-sm">
                  {/* Ken Burns Animated Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-750 ease-out scale-100 group-hover:scale-103 animate-kenburns"
                    style={{ backgroundImage: `url('${cat.image}')` }}
                  />
                  
                  {/* Subtle overlay for styling */}
                  <div className="absolute inset-0 bg-[#0F0F10]/5 group-hover:bg-[#0F0F10]/0 transition-all duration-300 z-10" />

                  {/* Subtitle / Tech Spec line (faint on hover) */}
                  <div className="absolute inset-x-0 bottom-2 text-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[7.5px] font-mono tracking-widest text-white uppercase bg-[#0F0F10]/85 px-1.5 py-0.5 rounded border border-white/20">
                      VIEW
                    </span>
                  </div>
                </div>

                {/* Category name below the card */}
                <div className="mt-2.5 text-center flex justify-center">
                  <span className="inline-block border-2 border-black rounded-premium px-4 py-1.5 font-display text-[9.5px] lg:text-[10.5px] font-bold text-[#0F0F10] bg-white tracking-wider uppercase group-hover:bg-accent-cyan group-hover:border-accent-cyan group-hover:text-white transition-all duration-200 shadow-sm truncate max-w-full">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* MOBILE LAYOUT: 3 columns, 3 rows (excludes Magnets, border very thin) */}
          <div className="grid sm:hidden grid-cols-3 gap-y-4 gap-x-2.5 max-w-[480px] mx-auto font-sans">
            {homeCategories
              .filter((cat) => cat.name !== "Magnets")
              .map((cat) => (
                <Link 
                  key={cat.name}
                  href={cat.href}
                  className="group block cursor-pointer"
                >
                  {/* Image Container Card - Studio White background with thin border border-black */}
                  <div className="relative w-full aspect-square rounded-premium overflow-hidden border border-black bg-[#FAFAFA] hover:scale-[1.02] transition-all duration-300 ease-out transform block shadow-sm">
                    {/* Ken Burns Animated Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-750 ease-out scale-100 group-hover:scale-103 animate-kenburns"
                      style={{ backgroundImage: `url('${cat.image}')` }}
                    />
                    
                    {/* Subtle overlay for styling */}
                    <div className="absolute inset-0 bg-[#0F0F10]/5 group-hover:bg-[#0F0F10]/0 transition-all duration-300 z-10" />

                    {/* Subtitle / Tech Spec line (faint on hover) */}
                    <div className="absolute inset-x-0 bottom-1.5 text-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[6.5px] font-mono tracking-widest text-white uppercase bg-[#0F0F10]/85 px-1 py-0.5 rounded border border-white/20">
                        VIEW
                      </span>
                    </div>
                  </div>

                  {/* Category name below the card */}
                  <div className="mt-2 text-center flex justify-center">
                    <span className="inline-block border border-black rounded-premium px-2 py-1 font-display text-[7.5px] font-bold text-[#0F0F10] bg-white tracking-wider uppercase group-hover:bg-accent-cyan group-hover:border-accent-cyan group-hover:text-white transition-all duration-200 shadow-sm truncate max-w-full">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Marquee banner tape strip */}
      <div className="w-full bg-[#000000] py-4 overflow-hidden flex relative">
        <div className="flex whitespace-nowrap animate-marquee-left w-max">
          <div className="flex items-center text-xs font-bold tracking-widest text-white uppercase">
            <span className="px-6">PRECISION ENGINEERED SINCE 2001</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
            <span className="px-6">ZERO-DEFECT QUALITY SYSTEM</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
            <span className="px-6">B2B OEM CONTRACTS</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
            <span className="px-6">MADE IN JAIPUR EXPORT PLANT</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
            <span className="px-6">HIGH TEMPERATURE VOICE COILS</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
            <span className="px-6">ROHS & REACH COMPLIANT LOGISTICS</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
          </div>
          <div className="flex items-center text-xs font-bold tracking-widest text-white uppercase">
            <span className="px-6">PRECISION ENGINEERED SINCE 2001</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
            <span className="px-6">ZERO-DEFECT QUALITY SYSTEM</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
            <span className="px-6">B2B OEM CONTRACTS</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
            <span className="px-6">MADE IN JAIPUR EXPORT PLANT</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
            <span className="px-6">HIGH TEMPERATURE VOICE COILS</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
            <span className="px-6">ROHS & REACH COMPLIANT LOGISTICS</span>
            <span className="text-[#5C5C63] mx-2">◆</span>
          </div>
        </div>
      </div>


      {/* 1.5 B2B Product Range Collage Section */}
      <section className="w-full py-5 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="text-center mb-12 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-[1px] bg-black" />
              <span className="text-black text-xs font-bold uppercase tracking-widest">PRODUCT PORTFOLIO Showcase</span>
              <div className="w-12 h-[1px] bg-black" />
            </div>
            <h2 className="text-3xl sm:text-4xl text-heading-charcoal font-display font-extrabold uppercase">
              Where Precision Components Meet Perfect Sound
            </h2>
            <p className="text-xs sm:text-sm text-[#4A4A4F] max-w-2xl mx-auto leading-relaxed font-light">
              Explore our extensive range of high-precision wholesale components. We manufacture thousands of custom variations of speaker cones, high-temp voice coils, compliance surrounds, and dust caps. Engineered to fit vintage cabinets and modern high-power transducers alike.
            </p>
          </div>

          {/* Collage Grid (Identical on Desktop and Mobile) */}
          <div className="grid grid-cols-4 grid-rows-2 gap-1.5 sm:gap-4 w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] overflow-hidden">
            
            {/* Box 1 (50% Space: col-span-2, row-span-2) */}
            <div className="col-span-2 row-span-2 h-full relative border border-black lg:border-2 lg:border-black rounded-premium overflow-hidden bg-white group hover:scale-[1.01] transition-all duration-300 shadow-sm">
              {/* object-top and scale-[1.08] crops out the bottom watermark label perfectly */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/collage-all.jpg" 
                alt="Speaker Cones and Components Group Collage" 
                className="absolute inset-0 w-full h-full object-cover object-top scale-[1.08] origin-top group-hover:scale-[1.10] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#0F0F10]/5 group-hover:bg-[#0F0F10]/0 transition-all duration-300" />
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20">
                <span className="inline-block border border-black bg-white rounded-premium px-1.5 py-0.5 sm:px-3 sm:py-1 font-display text-[6.5px] sm:text-[9.5px] font-bold text-[#0F0F10] uppercase tracking-wider shadow-sm">
                  Full Range
                </span>
              </div>
            </div>

            {/* Box 2 (25% Space: col-span-2, row-span-1) */}
            <div className="col-span-2 row-span-1 h-full relative border border-black lg:border-2 lg:border-black rounded-premium overflow-hidden bg-white group hover:scale-[1.01] transition-all duration-300 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/collage-coils.jpg" 
                alt="Speaker Voice Coils Collection" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#0F0F10]/5 group-hover:bg-[#0F0F10]/0 transition-all duration-300" />
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20">
                <span className="inline-block border border-black bg-white rounded-premium px-1.5 py-0.5 sm:px-3 sm:py-1 font-display text-[6.5px] sm:text-[9.5px] font-bold text-[#0F0F10] uppercase tracking-wider shadow-sm">
                  Voice Coils
                </span>
              </div>
            </div>

            {/* Box 3 (12.5% Space: col-span-1, row-span-1) */}
            <div className="col-span-1 row-span-1 h-full relative border border-black lg:border-2 lg:border-black rounded-premium overflow-hidden bg-white group hover:scale-[1.01] transition-all duration-300 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/collage-surrounds.jpg" 
                alt="Foam and Rubber surrounds collection" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#0F0F10]/5 group-hover:bg-[#0F0F10]/0 transition-all duration-300" />
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20">
                <span className="inline-block border border-black bg-white rounded-premium px-1 py-0.5 sm:px-2.5 sm:py-1 font-display text-[5.5px] sm:text-[8.5px] font-bold text-[#0F0F10] uppercase tracking-wider shadow-sm truncate max-w-[90%]">
                  Surrounds
                </span>
              </div>
            </div>

            {/* Box 4 (12.5% Space: col-span-1, row-span-1) */}
            <div className="col-span-1 row-span-1 h-full relative border border-black lg:border-2 lg:border-black rounded-premium overflow-hidden bg-white group hover:scale-[1.01] transition-all duration-300 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/collage-dustcaps.png" 
                alt="Speaker dust caps collection" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#0F0F10]/5 group-hover:bg-[#0F0F10]/0 transition-all duration-300" />
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20">
                <span className="inline-block border border-black bg-white rounded-premium px-1 py-0.5 sm:px-2.5 sm:py-1 font-display text-[5.5px] sm:text-[8.5px] font-bold text-[#0F0F10] uppercase tracking-wider shadow-sm truncate max-w-[90%]">
                  Dust Caps
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* 2. Four Pillars Grid Section (Kagzi Layout Clone) */}
      <section className="w-full py-5 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-8">
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#F7F7F8] border border-black flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-[#5C5C63]" />
              </div>
              <h3 className="text-sm font-bold text-[#0F0F10] uppercase">Acoustics, Reimagined</h3>
              <p className="text-xs text-[#4A4A4F] leading-relaxed font-light flex-grow max-w-xs font-sans">
                We use 100% certified raw materials and carbon fiber matrices, we craft speaker cones and voice coils without compromising on acoustic weight.
              </p>
              <div className="bg-[#F7F7F8] border border-black text-[#0F0F10] px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-sans">
                100% Certified
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#F7F7F8] border border-black flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#5C5C63]" />
              </div>
              <h3 className="text-sm font-bold text-[#0F0F10] uppercase">Made for the Stage</h3>
              <p className="text-xs text-[#4A4A4F] leading-relaxed font-light flex-grow max-w-xs font-sans">
                Reliability is not just a trend for us - it is reflected in every coil we wind and the physical tests we make in our labs.
              </p>
              <div className="bg-[#F7F7F8] border border-black text-[#0F0F10] px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-sans">
                Performance Driven
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#F7F7F8] border border-black flex items-center justify-center">
                <Cpu className="w-6 h-6 text-[#5C5C63]" />
              </div>
              <h3 className="text-sm font-bold text-[#0F0F10] uppercase">Copper, Reclaimed</h3>
              <p className="text-xs text-[#4A4A4F] leading-relaxed font-light flex-grow max-w-xs font-sans">
                Made from top-tier CCAW and high-purity copper wires, our voice coil winding lines transform metals into thermal acoustic coils.
              </p>
              <div className="bg-[#F7F7F8] border border-black text-[#0F0F10] px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-sans">
                CCAW / Pure Copper
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#F7F7F8] border border-black flex items-center justify-center">
                <Factory className="w-6 h-6 text-[#5C5C63]" />
              </div>
              <h3 className="text-sm font-bold text-[#0F0F10] uppercase">Pressure Tolerant</h3>
              <p className="text-xs text-[#4A4A4F] leading-relaxed font-light flex-grow max-w-xs font-sans">
                Crafted through strict high-pressure hot pressing, our speaker surrounds and spiders support linear displacement curves.
              </p>
              <div className="bg-[#F7F7F8] border border-black text-[#0F0F10] px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-sans">
                Zero Defect
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Corporate Legacy & Statistics (Kagzi Layout Clone) */}
      <section className="w-full py-5 bg-[#F7F7F8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Copy block */}
            <div className="flex flex-col space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-[1px] bg-[#0F0F10]" />
                <span className="text-[#0F0F10] text-xs font-bold uppercase tracking-widest">OUR CORPORATE LEGACY</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl text-[#0F0F10] leading-[1.3] font-display font-extrabold">
                A Family Legacy Written in <br />
                <span className="text-[#5C5C63]">Copper & Kapton</span>
              </h2>
              
              <div className="text-[#4A4A4F] text-xs sm:text-sm leading-relaxed space-y-4 font-light font-sans">
                <p>
                  In the workshops of <span className="font-semibold text-[#0F0F10]">Jaipur, India</span> where acoustic precision meets high-speed CNC winding, we make speaker components the way it should be done.
                </p>
                <p className="font-bold text-[#0F0F10] uppercase tracking-wide text-xs">
                  Slowly. With precision. Checked by laser scanners.
                </p>
                <p>
                  <span className="font-semibold text-[#0F0F10]">GLOBAL SPEAKER PARTS</span> has been a quiet keeper of this tradition since 2001, supplying global audio manufacturers with speaker components that carry the imprint of engineering excellence. We are not just a stamping workshop; we are a family of acoustic experts.
                </p>
                <p>
                  We partner with major global consumer brands and serve independent loudspeaker manufacturers, automotive suppliers, and professional audio labels across 50+ countries.
                </p>
              </div>

              <Link href="/about" className="pt-2">
                <button className="btn-primary px-8 py-3.5 text-xs font-bold tracking-widest flex items-center gap-2 cursor-pointer">
                  <span>ABOUT GLOBAL SPEAKER PARTS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Right graphic image */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-lg lg:max-w-none rounded-premium overflow-hidden border border-[#EAEAEA] shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={images.factoryLine} 
                  alt="Industrial Winding Machine Line" 
                  className="w-full h-[350px] object-cover"
                />
              </div>
            </div>

          </div>

          {/* Symmetrical stats border grid */}
          <div className="mt-14 w-full border border-black grid grid-cols-2 lg:grid-cols-5 divide-y divide-x divide-black border-collapse bg-transparent font-sans">
            <div className="flex flex-col items-center justify-center py-6 text-center px-3">
              <span className="text-3xl sm:text-4xl text-[#0F0F10] font-semibold font-numbers mb-1.5">2001</span>
              <span className="text-[#5C5C63] text-[10px] font-bold uppercase tracking-wider">Established</span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center px-3 border-t border-black lg:border-t-0">
              <span className="text-3xl sm:text-4xl text-[#0F0F10] font-semibold font-numbers mb-1.5">14</span>
              <span className="text-[#5C5C63] text-[10px] font-bold uppercase tracking-wider">Product Categories</span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center px-3">
              <span className="text-3xl sm:text-4xl text-[#0F0F10] font-semibold font-numbers mb-1.5">25+</span>
              <span className="text-[#5C5C63] text-[10px] font-bold uppercase tracking-wider">Years Craft Expertise</span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center px-3">
              <span className="text-3xl sm:text-4xl text-[#0F0F10] font-semibold font-numbers mb-1.5">50+</span>
              <span className="text-[#5C5C63] text-[10px] font-bold uppercase tracking-wider">Export Countries</span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center px-3">
              <span className="text-3xl sm:text-4xl text-[#0F0F10] font-semibold font-numbers mb-1.5">100%</span>
              <span className="text-[#5C5C63] text-[10px] font-bold uppercase tracking-wider">Klippel Inspected</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Materials Pillars Grid */}
      <section className="w-full py-5 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-8">
            
            <div className="flex flex-col items-center text-center space-y-3 font-sans">
              <Logo className="w-8 h-8 text-[#0F0F10]" variant="icon" />
              <span className="text-sm font-bold text-[#0F0F10] uppercase font-display">Carbon Fiber</span>
              <p className="text-xs text-slate-500 leading-relaxed font-light max-w-xs">
                The primary cone structural fiber — strong, low-mass, high-stiffness. Carbon fiber pulp sheets outlive traditional paper by decades.
              </p>
              <span className="text-[9px] bg-[#F7F7F8] border border-black text-[#0F0F10] px-2 py-0.5 rounded font-bold uppercase">Cone Material</span>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 font-sans">
              <Logo className="w-8 h-8 text-[#0F0F10]" variant="icon" />
              <span className="text-sm font-bold text-[#0F0F10] uppercase font-display">Kapton Formers</span>
              <p className="text-xs text-slate-500 leading-relaxed font-light max-w-xs">
                High structural integrity formers give our voice coils their unique thermal limits — stable continuous power load up to 280°C.
              </p>
              <span className="text-[9px] bg-[#F7F7F8] border border-black text-[#0F0F10] px-2 py-0.5 rounded font-bold uppercase">Thermal Stability</span>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 font-sans">
              <Logo className="w-8 h-8 text-[#0F0F10]" variant="icon" />
              <span className="text-sm font-bold text-[#0F0F10] uppercase font-display">Strontium Magnets</span>
              <p className="text-xs text-slate-500 leading-relaxed font-light max-w-xs">
                High magnetic energy Y35 Ferrite and NdFeB rings create maximum gap flux density, translating electrical power into clean movement.
              </p>
              <span className="text-[9px] bg-[#F7F7F8] border border-black text-[#0F0F10] px-2 py-0.5 rounded font-bold uppercase">High Flux Density</span>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 font-sans">
              <Logo className="w-8 h-8 text-[#0F0F10]" variant="icon" />
              <span className="text-sm font-bold text-[#0F0F10] uppercase font-display">Pure Testing</span>
              <p className="text-xs text-slate-500 leading-relaxed font-light max-w-xs">
                The silent step. Every batch is evaluated in isolated anechoic chambers to record frequency sweep plots.
              </p>
              <span className="text-[9px] bg-[#F7F7F8] border border-black text-[#0F0F10] px-2 py-0.5 rounded font-bold uppercase">Acoustic Check</span>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Browse by Collection (Kagzi Layout Clone) */}
      <section className="w-full py-5 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-[1px] bg-[#0F0F10]" />
                <span className="text-[#0F0F10] text-xs font-bold uppercase tracking-widest">OUR PORTFOLIO</span>
              </div>
              <h2 className="text-3xl sm:text-4xl text-[#0F0F10] font-display font-extrabold">
                Browse by <span className="text-[#5C5C63]">Collection</span>
              </h2>
            </div>
            
            <Link href="/products">
              <button className="btn-primary px-6 py-2.5 text-xs font-semibold tracking-wider flex items-center gap-1.5 cursor-pointer uppercase">
                <span>View All Collections</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
            {collections.map((col, idx) => (
              <Link 
                key={idx}
                href={col.href}
                className="flex flex-col group cursor-pointer"
              >
                <div className="w-full aspect-square bg-[#F7F7F8] mb-4 overflow-hidden rounded-lg border border-black flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={col.image} 
                    alt={col.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0F0F10] group-hover:text-[#5C5C63] transition-colors">
                  {col.name}
                </h3>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 group-hover:text-[#0F0F10] transition-colors">
                  Explore Collection →
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Custom B2B Quote Card (Kagzi Layout Clone) */}
      <section className="w-full py-5 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-16">
            
            <div className="flex flex-col flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-[1px] bg-[#0F0F10]" />
                <span className="text-[#0F0F10] text-xs font-bold uppercase tracking-widest">FOR BUSINESSES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl text-[#0F0F10] font-display font-extrabold leading-tight">
                Custom Orders for Brands Crafting Legacy <br />
                <span className="text-[#5C5C63]">Since 2001</span>
              </h2>
            </div>

            <div className="flex flex-col flex-1 lg:max-w-xl lg:pt-6 space-y-6">
              <p className="text-xs sm:text-sm text-[#4A4A4F] leading-relaxed font-light font-sans">
                We partner with loudspeaker builders, automotive tier-1 assembly sites, and wholesale procurement operations globally. Tell us what you need — we will manufacture it under strict ISO tolerances without compromising on acoustic fidelity. Sizing modifications, winding thickness, former materials, and brand stamps available on request.
              </p>
              <Link href="/contact?rfq=true">
                <button className="btn-primary px-8 py-3.5 text-xs font-bold tracking-widest flex items-center gap-2 cursor-pointer uppercase">
                  <span>REQUEST B2B QUOTE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Client Testimonials Marquee (Kagzi Layout Clone) */}
      <section className="w-full py-5 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-[1px] bg-[#0F0F10]" />
            <span className="text-[#0F0F10] text-xs font-bold uppercase tracking-widest">PARTNER TRUST</span>
          </div>
          <h2 className="text-3xl sm:text-4xl text-[#0F0F10] font-display font-extrabold">
            What Our B2B Clients <span className="text-[#5C5C63]">Are Saying</span>
          </h2>
        </div>

        {/* Scrolling tape testimonials */}
        <div className="flex flex-col gap-6 w-full relative pause-on-hover">
          <div className="flex whitespace-nowrap animate-marquee-left w-max">
            {testimonials.map((test, idx) => (
              <div 
                key={idx} 
                className="w-[320px] sm:w-[380px] flex-shrink-0 whitespace-normal glass-panel p-6 rounded-premium flex flex-col justify-between mx-3"
              >
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-0.5 text-[#0F0F10]">
                    {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                  </div>
                  <p className="text-xs text-[#4A4A4F] leading-relaxed font-light italic font-sans">
                    &quot;{test.text}&quot;
                  </p>
                </div>
                <div className="mt-5 border-t border-[#EAEAEA] pt-3 text-[10px] font-bold text-[#0F0F10] uppercase tracking-wider font-sans">
                  — {test.author}
                </div>
              </div>
            ))}
            {/* Duplicate for infinite loop */}
            {testimonials.map((test, idx) => (
              <div 
                key={`dup-${idx}`} 
                className="w-[320px] sm:w-[380px] flex-shrink-0 whitespace-normal glass-panel p-6 rounded-premium flex flex-col justify-between mx-3"
              >
                <div className="space-y-4">
                  <div className="flex gap-0.5 text-[#0F0F10]">
                    {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                  </div>
                  <p className="text-xs text-[#4A4A4F] leading-relaxed font-light italic font-sans">
                    &quot;{test.text}&quot;
                  </p>
                </div>
                <div className="mt-5 border-t border-[#EAEAEA] pt-3 text-[10px] font-bold text-[#0F0F10] uppercase tracking-wider font-sans">
                  — {test.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQs */}
      <section className="py-5 px-4 sm:px-6 lg:px-10 xl:px-16 bg-white">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16 space-y-2">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F0F10]">Frequently Asked Questions</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">General B2B Inquiry & Purchasing Clarifications</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass-panel rounded-premium overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex justify-between items-center text-[#0F0F10] focus:outline-none hover:bg-[#F7F7F8] transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold pr-4 font-sans">{faq.q}</span>
                  <ChevronDown 
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "transform rotate-180" : ""
                    }`} 
                  />
                </button>
                
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-xs text-[#4A4A4F] leading-relaxed border-t border-[#EAEAEA] pt-3.5 font-light font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
