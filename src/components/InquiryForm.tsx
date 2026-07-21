"use client";

import { useState, useEffect } from "react";
import { Send, FileText, CheckCircle, ShieldAlert, ShoppingBag, Sparkles } from "lucide-react";

interface InquiryFormProps {
  defaultCategory?: string;
  initialSampleMode?: boolean;
  product?: {
    id: string;
    name: string;
    category: string;
    startingPrice: string;
    moq: string;
    variants: string;
  } | null;
}

export default function InquiryForm({ 
  defaultCategory = "Speaker Cones", 
  initialSampleMode = false, 
  product = null 
}: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    country: "",
    category: defaultCategory,
    quantity: "1,000 - 5,000 units (Wholesale)",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [justAddedCart, setJustAddedCart] = useState(false);
  const [sampleModeActive, setSampleModeActive] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const loadCart = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("gsp_enquiry_cart");
        if (stored) {
          try {
            setCartItems(JSON.parse(stored));
          } catch {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
    };
    loadCart();
    window.addEventListener("gsp_cart_updated", loadCart);
    return () => window.removeEventListener("gsp_cart_updated", loadCart);
  }, []);

  useEffect(() => {
    const timerSample = setTimeout(() => {
      if (initialSampleMode && product) {
        setSampleModeActive(true);
        setFormData((prev) => ({
          ...prev,
          quantity: "Under 1,000 units (Sample Run)",
          message: prev.message.startsWith("[SAMPLE EVALUATION REQUEST]") 
            ? prev.message 
            : `[SAMPLE EVALUATION REQUEST] Requesting a physical evaluation sample of ${product.name}. `
        }));
      } else {
        setSampleModeActive(false);
        setFormData((prev) => ({
          ...prev,
          quantity: "1,000 - 5,000 units (Wholesale)",
          message: prev.message.replace(/^\[SAMPLE EVALUATION REQUEST\].*?\.\s*/, "")
        }));
      }
    }, 0);
    return () => clearTimeout(timerSample);
  }, [initialSampleMode, product]);

  const categories = [
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
    "Complete Speaker Components",
    "Custom OEM Component",
  ];

  const quantities = [
    "Under 1,000 units (Sample Run)",
    "1,000 - 5,000 units (Wholesale)",
    "5,000 - 10,000 units (OEM Scale)",
    "10,000 - 50,000 units (High Volume)",
    "50,000+ units (Contract Supply)",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToEnquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const storedStr = localStorage.getItem("gsp_enquiry_cart");
      const cart = storedStr ? JSON.parse(storedStr) : [];
      
      const itemToAdd = {
        id: product?.id || `item-${Date.now()}`,
        name: product?.name || formData.category,
        category: product?.category || formData.category,
        startingPrice: product?.startingPrice || "$0.00",
        moq: product?.moq || "1,000 units",
        variants: product?.variants || "Standard OEM sizing",
        date: new Date().toISOString().split("T")[0]
      };
      
      // Prevent duplicates
      const isAlreadyInCart = cart.some((item: Record<string, string>) => item.name === itemToAdd.name);
      if (!isAlreadyInCart) {
        const updated = [...cart, itemToAdd];
        localStorage.setItem("gsp_enquiry_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("gsp_cart_updated"));
      }
      
      setJustAddedCart(true);
      setTimeout(() => setJustAddedCart(false), 3000);
    }
  };

  const handleBuySampleNow = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormData((prev) => {
      const samplePrefix = "[SAMPLE EVALUATION REQUEST] ";
      const hasPrefix = prev.message.startsWith(samplePrefix);
      const targetName = product?.name || prev.category;
      return {
        ...prev,
        quantity: "Under 1,000 units (Sample Run)",
        message: hasPrefix 
          ? prev.message 
          : `${samplePrefix}Requesting a physical evaluation sample of ${targetName}. ${prev.message}`
      };
    });
    setSampleModeActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Save submission to localStorage for Admin Hub display
      if (typeof window !== "undefined") {
        const existingStr = localStorage.getItem("gsp_inquiries");
        const existing = existingStr ? JSON.parse(existingStr) : [];
        
        const itemsList = cartItems.map((item: any) => `- ${item.name} (MOQ: ${item.moq}, Category: ${item.category})`).join("\n");
        const specsText = cartItems.length > 0
          ? `[INQUIRY CART ITEMS]:\n${itemsList}\n\n[ADDITIONAL DETAILS]:\n${formData.message}`
          : formData.message || "No specifications description provided.";

        const newInquiry = {
          id: `RFQ-${Math.floor(1000 + Math.random() * 9000)}`,
          company: formData.company || "Individual Client",
          contact: `${formData.name} (${formData.phone || "No Phone"})`,
          email: formData.email,
          category: formData.category,
          quantity: formData.quantity,
          specs: specsText,
          date: new Date().toISOString().split("T")[0],
          status: "Pending Engineering Review"
        };
        
        localStorage.setItem("gsp_inquiries", JSON.stringify([newInquiry, ...existing]));
        localStorage.removeItem("gsp_enquiry_cart");
        window.dispatchEvent(new Event("gsp_cart_updated"));
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        country: "",
        category: defaultCategory,
        quantity: "1,000 - 5,000 units (Wholesale)",
        message: "",
      });
    } catch {
      setError("An error occurred. Please contact globalspeakerparts@gmail.com directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-panel p-8 rounded-premium text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-in font-sans !border-2 !border-black">
        <CheckCircle className="w-14 h-14 text-accent-cyan mb-4" />
        <h3 className="font-display text-xl font-extrabold text-[#0F0F10] mb-2">Inquiry Logged</h3>
        <p className="text-[#4A4A4F] text-xs max-w-sm mb-6 leading-relaxed font-light">
          Thank you for contacting Global Speaker Parts. Our B2B Export & Wholesale desk will review your technical requirements and reply with a formal quote within 24 business hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-xs font-semibold tracking-wider bg-[#F7F7F8] hover:bg-[#E8E8EA] text-[#0F0F10] border border-black rounded-lg px-5 py-3 transition-all duration-150 cursor-pointer hover:text-accent-cyan hover:border-accent-cyan"
        >
          SUBMIT ANOTHER SPECIFICATION
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-premium relative overflow-hidden font-sans !border-2 !border-black">
      
      <div className="flex items-center gap-3.5 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#F7F7F8] border-2 border-black flex items-center justify-center">
          <FileText className="w-5 h-5 text-[#0F0F10]" />
        </div>
        <div>
          <h3 className="font-display text-base font-extrabold text-[#0F0F10] leading-tight">B2B Quote Request</h3>
          <p className="text-[9px] text-slate-450 uppercase font-bold tracking-wider font-sans">OEM Technical Specifications Intake</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-750 text-xs flex items-center gap-2 font-sans">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#4A4A4F]">
        
        {/* Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="bg-[#F7F7F8] border border-black rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-accent-cyan focus:bg-white transition-all font-light font-sans"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Corporate Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="bg-[#F7F7F8] border border-black rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-accent-cyan focus:bg-white transition-all font-light font-sans"
              placeholder="name@company.com"
            />
          </div>
        </div>

        {/* Company and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="company" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Company Name *</label>
            <input
              type="text"
              id="company"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className="bg-[#F7F7F8] border border-black rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-accent-cyan focus:bg-white transition-all font-light font-sans"
              placeholder="e.g. Acoustic Systems Ltd"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Contact Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="bg-[#F7F7F8] border border-black rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-accent-cyan focus:bg-white transition-all font-light font-sans"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        {/* Country and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="country" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Country of Import *</label>
            <input
              type="text"
              id="country"
              name="country"
              required
              value={formData.country}
              onChange={handleChange}
              className="bg-[#F7F7F8] border border-black rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-accent-cyan focus:bg-white transition-all font-light font-sans"
              placeholder="e.g. Germany"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Product Category *</label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="bg-[#F7F7F8] border border-black rounded-premium px-3 py-3 text-[#0F0F10] outline-none focus:border-accent-cyan focus:bg-white transition-all cursor-pointer font-light font-sans"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Cart Components List */}
        {cartItems.length > 0 && (
          <div className="flex flex-col gap-1.5 p-3.5 border border-black/10 bg-[#F7F7F8] rounded-premium">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[8px] font-sans">
              Selected Inquiry Components ({cartItems.length})
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {cartItems.map((item: any) => (
                <div key={item.name} className="flex justify-between items-center bg-white border border-black/10 rounded px-2.5 py-1.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase">{item.name}</span>
                    <span className="text-[7.5px] uppercase tracking-wider text-slate-500 font-bold">MOQ: {item.moq}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = cartItems.filter((i: any) => i.name !== item.name);
                      setCartItems(updated);
                      localStorage.setItem("gsp_enquiry_cart", JSON.stringify(updated));
                      window.dispatchEvent(new Event("gsp_cart_updated"));
                    }}
                    className="text-slate-400 hover:text-red-500 text-[9px] uppercase font-bold tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volume */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="quantity" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Target Order Volume *</label>
          <select
            id="quantity"
            name="quantity"
            required
            value={formData.quantity}
            onChange={handleChange}
            className="bg-[#F7F7F8] border border-black rounded-premium px-3 py-3 text-[#0F0F10] outline-none focus:border-accent-cyan focus:bg-white transition-all cursor-pointer font-light font-sans"
          >
            {quantities.map((qty) => (
              <option key={qty} value={qty}>
                {qty}
              </option>
            ))}
          </select>
        </div>

        {/* Specs / Message */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-sans">Technical Specifications & Custom Requests</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="bg-[#F7F7F8] border border-black rounded-premium px-3.5 py-3 text-[#0F0F10] outline-none focus:border-accent-cyan focus:bg-white transition-all resize-none font-light font-sans"
            placeholder="Specify dimensions, voice coil former types, composite cone materials, suspension stiffness coefficients, compliance certifications, etc."
          />
        </div>

        {justAddedCart && (
          <div className="p-2 bg-sky-50 border border-sky-100 text-sky-700 text-[10px] text-center rounded font-semibold animate-fade-in font-sans">
            ✓ Component added to B2B Enquiry list.
          </div>
        )}

        {sampleModeActive && (
          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] text-center rounded font-semibold animate-fade-in font-sans">
            ★ Sample Order Mode active. Please complete details below and submit.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center py-3 px-5 text-xs font-bold tracking-widest text-white bg-[#0F0F10] hover:bg-accent-cyan-hover rounded-lg transition-all duration-150 shadow-sm cursor-pointer uppercase font-sans"
        >
          {isSubmitting ? (
            <span>TRANSMITTING SPECIFICATIONS...</span>
          ) : (
            <>
              <span>SUBMIT B2B INQUIRY</span>
              <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleAddToEnquiry}
            className="inline-flex items-center justify-center py-2.5 px-2.5 text-[10px] font-bold tracking-wider text-[#0F0F10] bg-white hover:bg-[#F7F7F8] border border-black hover:border-accent-cyan hover:text-accent-cyan rounded-lg transition-all duration-150 cursor-pointer uppercase font-sans"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Add to Enquiry</span>
          </button>
          
          <button
            type="button"
            onClick={handleBuySampleNow}
            className="inline-flex items-center justify-center py-2.5 px-2.5 text-[10px] font-bold tracking-wider text-[#4A4A4F] bg-[#F7F7F8] hover:bg-[#E8E8EA] border border-black hover:border-[#0F0F10] hover:text-[#0F0F10] rounded-lg transition-all duration-150 cursor-pointer uppercase font-sans"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500 shrink-0" />
            <span>Buy Sample Now</span>
          </button>
        </div>
      </form>

    </div>
  );
}
