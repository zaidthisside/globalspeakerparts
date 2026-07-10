"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, Info, X, ShieldCheck, Tag, Box, Trash2, ShoppingBag, CheckCircle, ArrowLeft, Send } from "lucide-react";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");
  const cartParam = searchParams.get("cart");
  const isCartView = cartParam === "true";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedProduct, setSelectedProduct] = useState<typeof productsData[0] | null>(null);
  const [customProducts, setCustomProducts] = useState<typeof productsData>([]);

  const [cartItems, setCartItems] = useState<Record<string, string>[]>([]);
  const [bulkSubmitted, setBulkSubmitted] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    country: "",
    message: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gsp_custom_products");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const timer = setTimeout(() => {
            setCustomProducts(parsed);
          }, 0);
          return () => clearTimeout(timer);
        } catch (e) {
          console.error("Error loading custom products", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gsp_enquiry_cart");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const timer = setTimeout(() => {
            setCartItems(parsed);
          }, 0);
          return () => clearTimeout(timer);
        } catch {}
      } else {
        const timer = setTimeout(() => {
          setCartItems([]);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [cartParam]);

  const handleRemoveFromCart = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("gsp_enquiry_cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("gsp_cart_updated"));
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (typeof window !== "undefined") {
        const storedInqStr = localStorage.getItem("gsp_inquiries");
        const existingInqs = storedInqStr ? JSON.parse(storedInqStr) : [];
        const newInquiries = cartItems.map((item, idx) => ({
          id: `RFQ-${Math.floor(1000 + Math.random() * 9000)}-${idx}`,
          company: bulkForm.company || "Individual Client",
          contact: `${bulkForm.name} (${bulkForm.phone || "No Phone"})`,
          email: bulkForm.email,
          category: item.category,
          quantity: item.moq || "1,000 units",
          specs: `[BULK RFQ INQUIRY] Requested Component: ${item.name}. Custom Sizing: ${item.variants}. Instructions: ${bulkForm.message || "None."}`,
          date: new Date().toISOString().split("T")[0],
          status: "Pending Engineering Review"
        }));
        localStorage.setItem("gsp_inquiries", JSON.stringify([...newInquiries, ...existingInqs]));
        localStorage.removeItem("gsp_enquiry_cart");
        window.dispatchEvent(new Event("gsp_cart_updated"));
      }
      setBulkSubmitted(true);
      setCartItems([]);
    } catch (err) {
      console.error(err);
    } finally {
      setBulkSubmitting(false);
    }
  };

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

  const allProducts = useMemo(() => {
    return [...productsData, ...customProducts];
  }, [customProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((prod) => {
      const matchesSearch = 
        prod.name.toLowerCase().includes(search.toLowerCase()) || 
        prod.category.toLowerCase().includes(search.toLowerCase()) ||
        prod.desc.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All Categories" || 
        prod.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allProducts, search, selectedCategory]);

  if (isCartView) {
    if (bulkSubmitted) {
      return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 font-sans text-center max-w-xl flex flex-col items-center justify-center relative z-10 min-h-[60vh]">
          <CheckCircle className="w-16 h-16 text-[#0F0F10] mb-6 animate-pulse" />
          <h2 className="font-display text-2xl font-extrabold text-[#0F0F10] mb-3 uppercase tracking-tight">Bulk Enquiry Transmitted</h2>
          <p className="text-[#4A4A4F] text-sm leading-relaxed mb-8 font-light max-w-md">
            Thank you. Your consolidated RFQs have been securely transmitted to the Global Speaker Parts export desk. Our acoustic engineering team will contact you within 24 business hours.
          </p>
          <button
            onClick={() => {
              setBulkSubmitted(false);
              router.push("/products");
            }}
            className="bg-[#0F0F10] hover:bg-[#2E2E33] text-white px-8 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-150 cursor-pointer animate-fade-in"
          >
            RETURN TO COMPONENT CATALOG
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans relative z-10">
        
        {/* Back Link */}
        <button
          onClick={() => router.push("/products")}
          className="flex items-center gap-2 text-xs font-bold text-[#5C5C63] hover:text-[#0F0F10] mb-6 uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <h1 className="font-display text-2xl font-extrabold text-[#0F0F10] mb-1 tracking-tight">Your B2B Enquiry List</h1>
        <p className="text-xs text-slate-500 font-light mb-8">Review and submit a consolidated quote request for multiple custom transducer components.</p>

        {cartItems.length === 0 ? (
          <div className="border border-[#EAEAEA] bg-white p-16 text-center rounded-premium max-w-2xl mx-auto space-y-4 shadow-sm animate-fade-in">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-display text-sm font-bold text-[#0F0F10] uppercase tracking-wider">Your Enquiry List is Empty</h3>
            <p className="text-xs text-slate-500 font-light max-w-md mx-auto leading-relaxed">
              Explore our OEM speaker component catalog and click &quot;Add to Enquiry&quot; on components to build your custom wholesale quote request.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="bg-[#0F0F10] hover:bg-[#2E2E33] text-white inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-xs font-bold tracking-wider cursor-pointer mt-4"
            >
              BROWSE CATALOG
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
            
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-500 border-b border-[#EAEAEA] pb-2">
                <span>Components in your list: <strong className="text-[#0F0F10] font-semibold">{cartItems.length}</strong></span>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white border border-[#EAEAEA] rounded-premium p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#D6D6D8] transition-all shadow-sm"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-[#5C5C63] tracking-widest uppercase block">{item.category}</span>
                      <h4 className="font-display text-sm font-bold text-[#0F0F10]">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-light">{item.variants}</p>
                      <div className="text-[10px] text-slate-500 pt-1.5 flex gap-4 font-light">
                        <span>Starting: <strong className="text-[#0F0F10] font-semibold font-numbers">{item.startingPrice}</strong></span>
                        <span>•</span>
                        <span>MOQ: <strong className="text-[#0F0F10] font-semibold">{item.moq}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer sm:self-center"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Consolidated RFQ Form */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#EAEAEA] p-6 sm:p-8 rounded-premium font-sans shadow-sm">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#F7F7F8] border border-[#EAEAEA] flex items-center justify-center">
                    <Send className="w-5 h-5 text-[#0F0F10]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-[#0F0F10] leading-tight">Submit Bulk Enquiry</h3>
                    <p className="text-[9px] text-slate-450 uppercase font-bold tracking-wider font-sans">OEM Wholesale Request Intake</p>
                  </div>
                </div>

                <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs text-[#4A4A4F]">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={bulkForm.name}
                      onChange={(e) => setBulkForm({...bulkForm, name: e.target.value})}
                      className="bg-[#F7F7F8] border border-[#EAEAEA] rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-[#0F0F10] focus:bg-white transition-all font-light font-sans"
                      placeholder="e.g. Jane Smith"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      value={bulkForm.email}
                      onChange={(e) => setBulkForm({...bulkForm, email: e.target.value})}
                      className="bg-[#F7F7F8] border border-[#EAEAEA] rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-[#0F0F10] focus:bg-white transition-all font-light font-sans"
                      placeholder="name@company.com"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={bulkForm.company}
                      onChange={(e) => setBulkForm({...bulkForm, company: e.target.value})}
                      className="bg-[#F7F7F8] border border-[#EAEAEA] rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-[#0F0F10] focus:bg-white transition-all font-light font-sans"
                      placeholder="e.g. Apex Acoustic Labs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Contact Number</label>
                      <input
                        type="tel"
                        value={bulkForm.phone}
                        onChange={(e) => setBulkForm({...bulkForm, phone: e.target.value})}
                        className="bg-[#F7F7F8] border border-[#EAEAEA] rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-[#0F0F10] focus:bg-white transition-all font-light font-sans"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Country of Import *</label>
                      <input
                        type="text"
                        required
                        value={bulkForm.country}
                        onChange={(e) => setBulkForm({...bulkForm, country: e.target.value})}
                        className="bg-[#F7F7F8] border border-[#EAEAEA] rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-[#0F0F10] focus:bg-white transition-all font-light font-sans"
                        placeholder="e.g. United Kingdom"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Additional Specifications / Tooling Requests</label>
                    <textarea
                      rows={3}
                      value={bulkForm.message}
                      onChange={(e) => setBulkForm({...bulkForm, message: e.target.value})}
                      className="bg-[#F7F7F8] border border-[#EAEAEA] rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-[#0F0F10] focus:bg-white transition-all resize-none font-light font-sans"
                      placeholder="Specify custom tooling requirements, magnet grades, adhesive configurations, or delivery schedules."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bulkSubmitting}
                    className="w-full inline-flex items-center justify-center py-3.5 px-5 text-xs font-bold tracking-widest text-white bg-[#0F0F10] hover:bg-[#2E2E33] rounded-lg transition-all duration-150 shadow-sm cursor-pointer uppercase font-sans mt-2"
                  >
                    {bulkSubmitting ? (
                      <span>TRANSMITTING BULK RFQ...</span>
                    ) : (
                      <>
                        <span>SUBMIT CONSOLIDATED RFQ</span>
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

      </div>
    );
  }

  return (
    <>
      {/* Search Header */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-[#F7F7F8] border-b border-[#EAEAEA]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-xs font-bold tracking-widest text-[#0F0F10] uppercase">B2B CATALOG</span>
            <h1 className="font-display text-3xl font-extrabold text-[#0F0F10] tracking-tight">
              OEM Speaker Components
            </h1>
            <p className="text-slate-500 text-xs max-w-lg font-light font-sans">
              Explore our line of export-quality speaker chassis, voice coils, spiders, surrounds, and custom tooling kits.
            </p>
          </div>
          
          {/* Search Box */}
          <div className="w-full max-w-sm relative font-sans">
            <input
              type="text"
              placeholder="Search component catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#EAEAEA] rounded-premium px-4 py-3 pl-10 text-xs text-[#0F0F10] outline-none focus:border-[#0F0F10] transition-colors placeholder:text-slate-400"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#0F0F10] text-[10px] font-bold"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 grid grid-cols-1 lg:grid-cols-4 gap-10 relative z-10 font-sans">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-[#0F0F10] font-bold text-xs uppercase tracking-wider border-b border-[#EAEAEA] pb-2">
            <Filter className="w-4 h-4 text-[#5C5C63]" />
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
                      ? "bg-white border-l-3 border-[#0F0F10] text-[#0F0F10] font-bold"
                      : "text-slate-500 hover:bg-[#F7F7F8] hover:text-[#0F0F10] border-l-3 border-transparent"
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
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-[#EAEAEA] pb-2">
            <span>Showing <strong className="text-[#0F0F10] font-semibold">{filteredProducts.length}</strong> components</span>
            <span>Category: <strong className="text-[#5C5C63] font-semibold">{selectedCategory}</strong></span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="border border-[#EAEAEA] bg-white p-16 text-center rounded-premium">
              <p className="text-xs text-slate-500 font-light">No components match your search filter.</p>
              <button
                onClick={() => { setSearch(""); setSelectedCategory("All Categories"); }}
                className="mt-4 text-xs font-bold text-[#0F0F10] hover:text-[#2E2E33]"
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
                      <div className="w-full h-44 rounded-lg overflow-hidden border border-[#EAEAEA] mb-4 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                        />
                        <div className="absolute top-2 right-2 bg-white text-[8px] font-mono text-slate-500 px-1.5 py-0.5 rounded border border-[#EAEAEA]">
                          CAD: READY
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-[#5C5C63] tracking-wider uppercase block mb-1">
                        {prod.category}
                      </span>
                      <h3 className="font-display text-sm font-bold text-[#0F0F10] mb-2">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-[#4A4A4F] leading-relaxed line-clamp-2 font-light font-sans">
                        {prod.desc}
                      </p>

                      {/* Variants & Pricing Info */}
                      <div className="mt-3.5 space-y-1.5 text-[11px] text-slate-500 font-light border-t border-[#EAEAEA] pt-3">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1 font-sans">
                            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Starting Price:</span>
                          </span>
                          <strong className="text-[#0F0F10] font-bold font-numbers text-xs">{prod.startingPrice}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1 font-sans">
                            <Box className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>MOQ:</span>
                          </span>
                          <span className="font-semibold text-[#0F0F10]">{prod.moq}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 font-light italic truncate font-sans">
                          {prod.variants}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EAEAEA] flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        TOLERANCE: {prod.tolerances}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F0F10]">
                        <span>SPECS / RFQ</span>
                        <Info className="w-4 h-4 text-slate-400 shrink-0" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0F10]/40 backdrop-blur-xs animate-fade-in font-sans">
          <div className="glass-panel-solid w-full max-w-5xl rounded-premium overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col border border-[#D6D6D8]">
            
            {/* Modal Header */}
            <div className="p-5 bg-transparent border-b border-[#EAEAEA] flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-[#5C5C63] tracking-widest uppercase block">{selectedProduct.category}</span>
                <h3 className="font-display text-base font-extrabold text-[#0F0F10] leading-tight">{selectedProduct.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-lg bg-[#F7F7F8] border border-[#EAEAEA] hover:bg-[#E8E8EA] text-slate-500 hover:text-[#0F0F10] transition-colors cursor-pointer"
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
                <div className="w-full h-56 rounded-premium overflow-hidden border border-[#EAEAEA] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImages[selectedProduct.imageKey] || "https://images.unsplash.com/photo-158109226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white text-[8px] font-mono text-slate-500 px-2 py-0.5 rounded border border-[#EAEAEA]">
                    CROSS-SECTION SCHEMATIC
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#0F0F10] uppercase tracking-wider">Acoustic & Mechanical Profile</h4>
                  <p className="text-xs text-[#4A4A4F] leading-relaxed font-light font-sans">{selectedProduct.desc}</p>
                </div>

                {/* Specs Table */}
                <div className="border border-[#EAEAEA] rounded-premium overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F7F7F8] text-[#0F0F10] font-bold border-b border-[#EAEAEA]">
                      <tr>
                        <th className="px-4 py-3">Specification Parameter</th>
                        <th className="px-4 py-3">OEM Compliance Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA] text-[#0F0F10]">
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-400">Product Variants / Sizing</td>
                        <td className="px-4 py-3 font-bold text-[#0F0F10]">{selectedProduct.variants}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-400">B2B Starting Price</td>
                        <td className="px-4 py-3 font-bold text-[#0F0F10] font-numbers text-sm">{selectedProduct.startingPrice}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-400">Minimum Order Volume (MOQ)</td>
                        <td className="px-4 py-3 font-semibold text-[#0F0F10]">{selectedProduct.moq}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-400">Composition / Materials</td>
                        <td className="px-4 py-3 font-light font-sans">{selectedProduct.materials}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-400">Dimensional Ranges</td>
                        <td className="px-4 py-3 font-light font-sans">{selectedProduct.dimensions}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-400">Operating Temperature Limits</td>
                        <td className="px-4 py-3 font-light font-sans">{selectedProduct.tempLimit}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-400">Acoustic / Compliance Tuning</td>
                        <td className="px-4 py-3 font-light font-sans">{selectedProduct.frequencyRange}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-400">Manufacturing Tolerances</td>
                        <td className="px-4 py-3 text-[#0F0F10] font-semibold">{selectedProduct.tolerances}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-400">Compliance Directives</td>
                        <td className="px-4 py-3 flex items-center gap-1.5 font-light font-sans">
                          <ShieldCheck className="w-4 h-4 text-green-550 shrink-0" />
                          <span>{selectedProduct.compliance}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4 p-4 rounded-premium bg-[#F7F7F8] border border-[#EAEAEA] text-xs text-slate-500 leading-relaxed font-light">
                  <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    GLOBAL SPEAKER PARTS supports customization of any sizing, stiffness index, adhesive chemical compositions, and electrical impedance to integrate into your production assembly lines.
                  </span>
                </div>
              </div>

              {/* B2B RFQ Form (Col 5) */}
              <div className="lg:col-span-5">
                <InquiryForm defaultCategory={selectedProduct.category} product={selectedProduct} />
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
