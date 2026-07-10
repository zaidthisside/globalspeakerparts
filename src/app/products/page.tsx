"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Info, X, ShieldCheck, Tag, Box } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";

// Real Unsplash photo URLs for B2B industrial speaker components
const productImages: Record<string, string> = {
  cones: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80", 
  coils: "https://images.unsplash.com/photo-1618976186466-b3a5cfc7df57?auto=format&fit=crop&w=600&q=80", 
  spiders: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80", 
  dustcaps: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80", 
  surrounds: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80", 
  magnets: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", 
  polepieces: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", 
  topplates: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80", 
  bottomplates: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80", 
  frames: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", 
  tyokes: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", 
  terminals: "https://images.unsplash.com/photo-1618976186466-b3a5cfc7df57?auto=format&fit=crop&w=600&q=80", 
  tweeterparts: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80", 
  completecomps: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80" 
};

// Realistic B2B speaker parts catalog data with variants and starting wholesale pricing
const productsData = [
  {
    id: "cones-carbon",
    name: "Carbon Fiber Composite Woofer Cones",
    category: "Speaker Cones",
    imageKey: "cones",
    desc: "Rigid composite speaker cones pressed for high-power woofers and high-fidelity automotive mid-bass drivers.",
    materials: "Carbon Fiber composite, air-dried pulp matrix, polyurethane coatings.",
    dimensions: "5.25 in, 6.5 in, 8.0 in, 10.0 in diameter sizes.",
    tempLimit: "-40°C to 110°C environmental operational limit.",
    frequencyRange: "35 Hz - 4.5 kHz resonance tuning.",
    compliance: "RoHS Compliant, REACH registered.",
    tolerances: "±0.15 mm thickness bounds.",
    startingPrice: "$1.80 / unit",
    moq: "1,000 units",
    variants: "Sizes: 5.25\", 6.5\", 8\", 10\" • Edge: Rubber, Foam, W-Roll"
  },
  {
    id: "cones-kevlar",
    name: "Kevlar Woven Fiber Mid-Range Cones",
    category: "Speaker Cones",
    imageKey: "cones",
    desc: "High-rigidity woven Kevlar mid-range speaker cones designed for low-distortion, smooth vocal frequency playbacks.",
    materials: "DuPont Kevlar woven fiber sheets, resin impregnation.",
    dimensions: "4.0 in, 5.25 in, 6.5 in diameters.",
    tempLimit: "-30°C to 115°C limits.",
    frequencyRange: "80 Hz - 7.0 kHz playback.",
    compliance: "RoHS Compliant, REACH registered.",
    tolerances: "±0.12 mm thickness.",
    startingPrice: "$2.20 / unit",
    moq: "1,000 units",
    variants: "Colors: Amber Orange, Matte Black • Sizes: 4\", 5.25\", 6.5\""
  },
  {
    id: "cones-paper",
    name: "Pressed Air-Dried Paper Cones",
    category: "Speaker Cones",
    imageKey: "cones",
    desc: "Classic high-damping pressed and air-dried paper cones suited for PA subwoofers and high-power instrument cabinet drivers.",
    materials: "Unbleached wood pulp, cotton rag fibers, carbon black dye.",
    dimensions: "8.0 in, 10.0 in, 12.0 in, 15.0 in, 18.0 in.",
    tempLimit: "-40°C to 90°C limits.",
    frequencyRange: "28 Hz - 3.5 kHz sub-bass sweep.",
    compliance: "RoHS Compliant.",
    tolerances: "±0.20 mm concentric bounds.",
    startingPrice: "$0.95 / unit",
    moq: "2,000 units",
    variants: "Sizes: 8\" to 18\" • Edge: Treated Accordion Cloth, Unfinished"
  },
  {
    id: "coils-ccaw",
    name: "CCAW High-Power Voice Coils",
    category: "Voice Coils",
    imageKey: "coils",
    desc: "Precision-wound voice coils using copper-clad aluminum wire (CCAW) on high-insulation Kapton formers for rapid thermal dissipation.",
    materials: "CCAW wire, Kapton polyimide former, high-temp epoxy adhesive.",
    dimensions: "1.0 in, 1.5 in, 2.0 in, 2.5 in former diameters.",
    tempLimit: "Up to 280°C continuous limits.",
    frequencyRange: "Impedances: 2 Ohm, 4 Ohm, 8 Ohm.",
    compliance: "RoHS Compliant, UL94-V0 class.",
    tolerances: "±0.03 mm winding layer precision.",
    startingPrice: "$0.65 / unit",
    moq: "2,500 units",
    variants: "Diameters: 1\", 1.5\", 2\", 2.5\" • Former: Black Kapton"
  },
  {
    id: "coils-copper",
    name: "Pure Copper Heavy-Duty Voice Coils",
    category: "Voice Coils",
    imageKey: "coils",
    desc: "Heavy copper voice coils wound on Til (glass-fiber) formers for high-excursion car audio subwoofers.",
    materials: "99.9% Oxygen-Free Copper wire, TIL glass-fiber former.",
    dimensions: "2.5 in, 3.0 in, 4.0 in former diameters.",
    tempLimit: "Up to 300°C peak operational limit.",
    frequencyRange: "Impedances: Dual 2 Ohm, Dual 4 Ohm.",
    compliance: "RoHS Compliant.",
    tolerances: "±0.05 mm winding thickness.",
    startingPrice: "$1.15 / unit",
    moq: "1,000 units",
    variants: "Diameters: 2.5\", 3\", 4\" • Former: Fiber Glass TIL"
  },
  {
    id: "spiders-nomex",
    name: "Nomex Linear Compliance Spiders",
    category: "Spiders (Dampers)",
    imageKey: "spiders",
    desc: "Linear compliance spiders pressed with specialized phenolic resins to establish stable restoring force curves.",
    materials: "Nomex woven fibers, phenolic resin compound.",
    dimensions: "90 mm, 120 mm, 150 mm outer diameters.",
    tempLimit: "-30°C to 130°C temperature operational.",
    frequencyRange: "Stiffness Index: 0.2 to 1.5 N/mm.",
    compliance: "RoHS Compliant.",
    tolerances: "±5% compliance deviation limit.",
    startingPrice: "$0.45 / unit",
    moq: "3,000 units",
    variants: "Sizes: 90mm to 150mm • Stiffness: Soft, Medium, Rigid"
  },
  {
    id: "spiders-cotton",
    name: "Poly-Cotton Phenolic Resin Spiders",
    category: "Spiders (Dampers)",
    imageKey: "spiders",
    desc: "Standard restoring suspension spiders for commercial consumer speaker designs, balancing compliance and cost.",
    materials: "Polyester-cotton woven fabric, standard phenolic resin.",
    dimensions: "80 mm, 100 mm, 115 mm, 130 mm.",
    tempLimit: "-20°C to 110°C limits.",
    frequencyRange: "Stiffness Index: 0.1 to 1.0 N/mm.",
    compliance: "RoHS Compliant.",
    tolerances: "±8% compliance deviation.",
    startingPrice: "$0.32 / unit",
    moq: "3,000 units",
    variants: "Sizes: 80mm to 130mm • Color: Natural Tan, Black"
  },
  {
    id: "dustcaps-carbon",
    name: "Woven Carbon Fiber Dust Caps",
    category: "Dust Caps",
    imageKey: "dustcaps",
    desc: "Ultra-light carbon fiber dust caps designed to seal the voice coil gap and reinforce high-frequency transients.",
    materials: "Woven Carbon Fiber fabric, clear gel-coat resin.",
    dimensions: "35 mm, 55 mm, 75 mm, 95 mm.",
    tempLimit: "-40°C to 120°C limits.",
    frequencyRange: "High-frequency resonance tuning.",
    compliance: "RoHS Compliant.",
    tolerances: "±0.1 mm concentric diameter.",
    startingPrice: "$0.25 / unit",
    moq: "5,000 units",
    variants: "Diameter: 35mm to 95mm • Finish: Glossy, Matte"
  },
  {
    id: "surrounds-rubber",
    name: "NBR High-Excursion Rubber Surrounds",
    category: "Speaker Surrounds",
    imageKey: "surrounds",
    desc: "Nitrile Butadiene Rubber (NBR) surrounds with high-roll geometries for stable long-stroke transducer excursion.",
    materials: "NBR rubber, anti-oxidant additives.",
    dimensions: "5.0 in, 6.5 in, 8.0 in, 10.0 in, 12.0 in.",
    tempLimit: "-35°C to 95°C operational range.",
    frequencyRange: "Optimized for low-distortion bass roll.",
    compliance: "RoHS Compliant.",
    tolerances: "±0.08 mm thickness tolerance.",
    startingPrice: "$0.50 / unit",
    moq: "3,000 units",
    variants: "Sizes: 5\" to 12\" • Profile: Single-Roll, Double-Roll"
  },
  {
    id: "magnets-ferrite",
    name: "Strontium Y35 Ferrite Ring Magnets",
    category: "Magnets",
    imageKey: "magnets",
    desc: "High-coercivity Strontium Ferrite magnets designed for stable magnetic field lines in B2B speaker motor structures.",
    materials: "Strontium Carbonate, Iron Oxide.",
    dimensions: "OD 80 mm, 100 mm, 120 mm, 140 mm.",
    tempLimit: "Up to 250°C Curie temperature limits.",
    frequencyRange: "Magnetic Flux: Up to 1.15 Tesla.",
    compliance: "REACH Registered.",
    tolerances: "±0.05 mm ground face parallelisms.",
    startingPrice: "$1.40 / unit",
    moq: "1,000 units",
    variants: "Outer Diameter: 80mm to 140mm • Heights: 10mm, 15mm, 20mm"
  },
  {
    id: "magnets-neo",
    name: "Neodymium N42H Concentric Magnets",
    category: "Magnets",
    imageKey: "magnets",
    desc: "Compact, high-energy Neodymium ring magnets for compact automotive drivers and premium home theater tweeters.",
    materials: "Neodymium Iron Boron (NdFeB), Nickel-Copper-Nickel plating.",
    dimensions: "OD 25 mm, 35 mm, 45 mm, 50 mm.",
    tempLimit: "Up to 120°C high-temperature (H-class).",
    frequencyRange: "Magnetic Flux: Up to 1.35 Tesla.",
    compliance: "RoHS Compliant, REACH registered.",
    tolerances: "±0.02 mm outer boundaries.",
    startingPrice: "$3.50 / unit",
    moq: "1,000 units",
    variants: "Grade: N38H, N42H, N45H • Plating: Ni-Cu-Ni, Black Epoxy"
  },
  {
    id: "frames-aluminum",
    name: "Die-Cast Aluminum Speaker Baskets",
    category: "Speaker Frames",
    imageKey: "frames",
    desc: "Die-cast ADC12 aluminum frames offering maximum mechanical rigidity and zero magnetic field shunting.",
    materials: "ADC12 Aluminum Alloy, powder-coated finish.",
    dimensions: "6.5 in, 8.0 in, 10.0 in, 12.0 in, 15.0 in.",
    tempLimit: "High mechanical structural capacity.",
    frequencyRange: "Anti-resonance geometric design.",
    compliance: "RoHS Compliant.",
    tolerances: "±0.15 mm CNC machined circles.",
    startingPrice: "$4.50 / unit",
    moq: "500 units",
    variants: "Sizes: 6.5\" to 15\" • Finish: Matte Black, Hammered Gray"
  },
  {
    id: "tyokes-steel",
    name: "Cold-Forged Low-Carbon Steel T-Yokes",
    category: "T-Yokes",
    imageKey: "tyokes",
    desc: "Cold-forged steel T-yokes with chamfered center cooling vents to guide magnetic lines and cool the voice coil gap.",
    materials: "1006 / 1008 Low-Carbon Steel, trivalent zinc plating.",
    dimensions: "Vented pole sizes: 1.5 in, 2.0 in, 2.5 in, 3.0 in.",
    tempLimit: "Unrestricted temperature bounds.",
    frequencyRange: "High magnetic saturation flux density.",
    compliance: "RoHS Compliant.",
    tolerances: "±0.02 mm concentricity limits.",
    startingPrice: "$2.10 / unit",
    moq: "1,000 units",
    variants: "Pole Vents: 1.5\", 2\", 2.5\", 3\" • Plating: Blue Zinc, Yellow Zinc"
  },
  {
    id: "terminals-post",
    name: "Push-Type Gold-Plated Binding Posts",
    category: "Terminals",
    imageKey: "terminals",
    desc: "Heavy-duty spring push terminals mounted on insulating FR4 board plates to secure thick gauge speaker cables.",
    materials: "FR4 insulating board, gold-plated brass post parts.",
    dimensions: "Custom screw circles & sizes.",
    tempLimit: "Up to 125°C limits.",
    frequencyRange: "Contact Resistance: &lt; 1.5 mOhm.",
    compliance: "RoHS Compliant.",
    tolerances: "Standard terminal layout scales.",
    startingPrice: "$0.85 / unit",
    moq: "2,000 units",
    variants: "Pairs: Single Pair, Dual Pair • Connectors: Push-Type, Solder-Tab"
  }
];

const allCategories = [
  "All Categories",
  "Speaker Cones",
  "Voice Coils",
  "Spiders (Dampers)",
  "Dust Caps",
  "Speaker Surrounds",
  "Magnets",
  "Pole Pieces",
  "Top Plates",
  "Bottom Plates",
  "Speaker Frames",
  "T-Yokes",
  "Terminals",
  "Tweeter Parts",
  "Complete Speaker Components"
];

function ProductsCatalogSection() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedProduct, setSelectedProduct] = useState<typeof productsData[0] | null>(null);

  useEffect(() => {
    if (catParam) {
      const timer = setTimeout(() => {
        if (catParam === "cones") setSelectedCategory("Speaker Cones");
        else if (catParam === "coils") setSelectedCategory("Voice Coils");
        else if (catParam === "surrounds") setSelectedCategory("Speaker Surrounds");
        else if (catParam === "spiders") setSelectedCategory("Spiders (Dampers)");
        else if (catParam === "dustcaps") setSelectedCategory("Dust Caps");
        else if (catParam === "diaphragms") setSelectedCategory("Tweeter Parts");
        else if (catParam === "tweeters") setSelectedCategory("Tweeter Parts");
        else if (catParam === "terminals") setSelectedCategory("Terminals");
        else if (catParam === "subwoofers") setSelectedCategory("Complete Speaker Components");
        else if (catParam === "frames") setSelectedCategory("Speaker Frames");
        else if (catParam === "magnets") setSelectedCategory("Magnets");
      }, 0);
      return () => clearTimeout(timer);
    }
    const searchParam = searchParams.get("search");
    if (searchParam) {
      const timer = setTimeout(() => {
        setSearch(searchParam);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [catParam, searchParams]);

  const filteredProducts = useMemo(() => {
    return productsData.filter((prod) => {
      const matchesSearch = 
        prod.name.toLowerCase().includes(search.toLowerCase()) || 
        prod.category.toLowerCase().includes(search.toLowerCase()) ||
        prod.desc.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All Categories" || 
        prod.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <>
      {/* Search Header */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-transparent border-b border-border-cool">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-xs font-bold tracking-widest text-accent-cyan uppercase">B2B CATALOG</span>
            <h1 className="font-display text-3xl font-extrabold text-primary-midnight tracking-tight">
              OEM Speaker Components
            </h1>
            <p className="text-slate-555 text-xs max-w-lg font-light">
              Explore our line of export-quality speaker chassis, voice coils, spiders, surrounds, and custom tooling kits.
            </p>
          </div>
          
          {/* Search Box */}
          <div className="w-full max-w-sm relative">
            <input
              type="text"
              placeholder="Search component catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-border-cool rounded-premium px-4 py-3 pl-10 text-xs text-charcoal outline-none focus:border-accent-cyan transition-colors placeholder:text-slate-400 shadow-sm"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-450" />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-charcoal text-[10px] font-bold"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 grid grid-cols-1 lg:grid-cols-4 gap-10 relative z-10">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-primary-midnight font-bold text-xs uppercase tracking-wider border-b border-border-cool pb-2">
            <Filter className="w-4 h-4 text-accent-cyan" />
            <span>Filter Categories</span>
          </div>
          
          <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-thin">
            {allCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-semibold whitespace-nowrap tracking-wide transition-all ${
                    isSelected
                      ? "bg-white border-l-3 border-accent-cyan text-primary-midnight font-bold"
                      : "text-slate-500 hover:bg-bg-snow hover:text-primary-midnight border-l-3 border-transparent"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Cards Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-border-cool pb-2">
            <span>Showing <strong className="text-primary-midnight font-semibold">{filteredProducts.length}</strong> components</span>
            <span>Category: <strong className="text-accent-cyan font-semibold">{selectedCategory}</strong></span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="border border-border-cool bg-white p-16 text-center rounded-premium">
              <p className="text-xs text-slate-500 font-light">No components match your search filter.</p>
              <button
                onClick={() => { setSearch(""); setSelectedCategory("All Categories"); }}
                className="mt-4 text-xs font-bold text-accent-cyan hover:text-accent-cyan-hover"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredProducts.map((prod) => {
                const imgUrl = productImages[prod.imageKey] || "https://images.unsplash.com/photo-158109226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80";
                return (
                  <div 
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="glass-panel glass-panel-hover p-4 rounded-premium cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="w-full h-44 rounded-lg overflow-hidden border border-border-cool/40 mb-4 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                        />
                        <div className="absolute top-2 right-2 bg-white/90 text-[8px] font-mono text-slate-500 px-1.5 py-0.5 rounded border border-border-cool">
                          CAD: READY
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-highlight-royal tracking-wider uppercase block mb-1">
                        {prod.category}
                      </span>
                      <h3 className="font-display text-sm font-bold text-primary-midnight mb-2">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-body-slate leading-relaxed line-clamp-2 font-light">
                        {prod.desc}
                      </p>

                      {/* Variants & Pricing Info */}
                      <div className="mt-3.5 space-y-1.5 text-[11px] text-slate-500 font-light border-t border-border-cool/50 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Starting Price:</span>
                          </span>
                          <strong className="text-accent-cyan font-bold font-numbers text-xs">{prod.startingPrice}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <Box className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>MOQ:</span>
                          </span>
                          <span className="font-semibold text-primary-midnight">{prod.moq}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 font-light italic truncate">
                          {prod.variants}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-cool flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        TOLERANCE: {prod.tolerances}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-cyan">
                        <span>SPECS / RFQ</span>
                        <Info className="w-4 h-4 text-slate-450 shrink-0" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modal Detail Overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-midnight/25 backdrop-blur-xs animate-fade-in">
          <div className="glass-panel-solid w-full max-w-5xl rounded-premium overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-transparent border-b border-border-cool flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-highlight-royal tracking-widest uppercase block">{selectedProduct.category}</span>
                <h3 className="font-display text-base font-extrabold text-primary-midnight leading-tight">{selectedProduct.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-lg bg-white/40 border border-white/40 hover:bg-white/60 text-slate-500 hover:text-primary-midnight transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 scrollbar-thin">
              
              {/* Product Specifications (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Large Product Image in Modal */}
                <div className="w-full h-56 rounded-premium overflow-hidden border border-border-cool relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImages[selectedProduct.imageKey] || "https://images.unsplash.com/photo-158109226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 text-[8px] font-mono text-slate-500 px-2 py-0.5 rounded border border-border-cool">
                    CROSS-SECTION SCHEMATIC
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-primary-midnight uppercase tracking-wider">Acoustic & Mechanical Profile</h4>
                  <p className="text-xs text-body-slate leading-relaxed font-light">{selectedProduct.desc}</p>
                </div>

                {/* Specs Table */}
                <div className="border border-border-cool rounded-premium overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-bg-snow text-primary-midnight font-bold border-b border-border-cool">
                      <tr>
                        <th className="px-4 py-3">Specification Parameter</th>
                        <th className="px-4 py-3">OEM Compliance Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-cool text-charcoal">
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-450">Product Variants / Sizing</td>
                        <td className="px-4 py-3 font-bold text-primary-midnight">{selectedProduct.variants}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-450">B2B Starting Price</td>
                        <td className="px-4 py-3 font-bold text-accent-cyan font-numbers text-sm">{selectedProduct.startingPrice}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-450">Minimum Order Volume (MOQ)</td>
                        <td className="px-4 py-3 font-semibold text-primary-midnight">{selectedProduct.moq}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-450">Composition / Materials</td>
                        <td className="px-4 py-3 font-light">{selectedProduct.materials}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-455">Dimensional Ranges</td>
                        <td className="px-4 py-3 font-light">{selectedProduct.dimensions}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-450">Operating Temperature Limits</td>
                        <td className="px-4 py-3 font-light">{selectedProduct.tempLimit}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-450">Acoustic / Compliance Tuning</td>
                        <td className="px-4 py-3 font-light">{selectedProduct.frequencyRange}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-450">Manufacturing Tolerances</td>
                        <td className="px-4 py-3 text-accent-cyan font-semibold">{selectedProduct.tolerances}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-450">Compliance Directives</td>
                        <td className="px-4 py-3 flex items-center gap-1.5 font-light">
                          <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                          <span>{selectedProduct.compliance}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4 p-4 rounded-premium bg-bg-snow border border-border-cool text-xs text-slate-500 leading-relaxed font-light">
                  <Info className="w-5 h-5 text-slate-gray shrink-0 mt-0.5" />
                  <span>
                    GLOBAL SPEAKER PARTS supports customization of any sizing, stiffness index, adhesive chemical compositions, and electrical impedance to integrate into your production assembly lines.
                  </span>
                </div>
              </div>

              {/* B2B RFQ Form (Col 5) */}
              <div className="lg:col-span-5">
                <InquiryForm defaultCategory={selectedProduct.category} />
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col w-full font-sans bg-transparent text-charcoal min-h-screen pb-20 relative">
      <Suspense fallback={
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center text-sm text-slate-400">
          Loading Component Catalog...
        </div>
      }>
        <ProductsCatalogSection />
      </Suspense>
    </div>
  );
}
