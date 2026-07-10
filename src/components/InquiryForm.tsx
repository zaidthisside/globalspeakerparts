"use client";

import { useState } from "react";
import { Send, FileText, CheckCircle, ShieldAlert } from "lucide-react";

interface InquiryFormProps {
  defaultCategory?: string;
}

export default function InquiryForm({ defaultCategory = "Speaker Cones" }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    country: "",
    category: defaultCategory,
    quantity: "1000-5000",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        country: "",
        category: defaultCategory,
        quantity: "1000-5000",
        message: "",
      });
    } catch {
      setError("An error occurred. Please contact export@globalspeakerparts.com directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-panel p-8 rounded-premium text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <CheckCircle className="w-14 h-14 text-accent-cyan mb-4" />
        <h3 className="font-display text-xl font-extrabold text-primary-midnight mb-2">Inquiry Logged</h3>
        <p className="text-body-slate text-xs max-w-sm mb-6 leading-relaxed font-light">
          Thank you for contacting Global Speaker Parts. Our B2B Export & Wholesale desk will review your technical requirements and reply with a formal quote within 24 business hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-xs font-semibold tracking-wider bg-bg-snow hover:bg-border-cool text-primary-midnight border border-border-cool rounded-full px-5 py-3 transition-all duration-150"
        >
          SUBMIT ANOTHER SPECIFICATION
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-premium relative overflow-hidden">
      
      <div className="flex items-center gap-3.5 mb-6">
        <div className="w-10 h-10 rounded-lg bg-bg-snow border border-border-cool flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary-midnight" />
        </div>
        <div>
          <h3 className="font-display text-base font-extrabold text-primary-midnight leading-tight">B2B Quote Request</h3>
          <p className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">OEM Technical Specifications Intake</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-body-slate">
        
        {/* Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="bg-bg-snow border border-border-cool rounded-premium px-3.5 py-3 text-body-slate outline-none focus:border-accent-cyan focus:bg-white transition-all font-light"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Corporate Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="bg-bg-snow border border-border-cool rounded-premium px-3.5 py-3 text-body-slate outline-none focus:border-accent-cyan focus:bg-white transition-all font-light"
              placeholder="name@company.com"
            />
          </div>
        </div>

        {/* Company and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="company" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Company Name *</label>
            <input
              type="text"
              id="company"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className="bg-bg-snow border border-border-cool rounded-premium px-3.5 py-3 text-body-slate outline-none focus:border-accent-cyan focus:bg-white transition-all font-light"
              placeholder="e.g. Acoustic Systems Ltd"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Contact Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="bg-bg-snow border border-border-cool rounded-premium px-3.5 py-3 text-body-slate outline-none focus:border-accent-cyan focus:bg-white transition-all font-light"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        {/* Country and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="country" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Country of Import *</label>
            <input
              type="text"
              id="country"
              name="country"
              required
              value={formData.country}
              onChange={handleChange}
              className="bg-bg-snow border border-border-cool rounded-premium px-3.5 py-3 text-body-slate outline-none focus:border-accent-cyan focus:bg-white transition-all font-light"
              placeholder="e.g. Germany"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Product Category *</label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="bg-bg-snow border border-border-cool rounded-premium px-3 py-3 text-body-slate outline-none focus:border-accent-cyan focus:bg-white transition-all cursor-pointer font-light"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Volume */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="quantity" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Target Order Volume *</label>
          <select
            id="quantity"
            name="quantity"
            required
            value={formData.quantity}
            onChange={handleChange}
            className="bg-bg-snow border border-border-cool rounded-premium px-3 py-3 text-body-slate outline-none focus:border-accent-cyan focus:bg-white transition-all cursor-pointer font-light"
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
          <label htmlFor="message" className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Technical Specifications & Custom Requests</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="bg-bg-snow border border-border-cool rounded-premium px-3.5 py-3 text-body-slate outline-none focus:border-accent-cyan focus:bg-white transition-all resize-none font-light"
            placeholder="Specify dimensions, voice coil former types, composite cone materials, suspension stiffness coefficients, compliance certifications, etc."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center py-3 px-5 text-xs font-bold tracking-widest text-white bg-primary-midnight hover:bg-secondary-graphite rounded-full transition-all duration-150 shadow-sm cursor-pointer uppercase"
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
      </form>

    </div>
  );
}
