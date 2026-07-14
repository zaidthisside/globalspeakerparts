"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useCurrency } from "@/context/CurrencyContext";

// Main Menu hierarchy strictly matching user's uploaded branding menu structure
const navigationItems = [
  {
    name: "Products",
    href: "/products",
    subItems: [
      { name: "Voice Coils", href: "/products?cat=coils" },
      { name: "Speaker Cones", href: "/products?cat=cones" },
      { name: "Speaker Surrounds", href: "/products?cat=surrounds" },
      { name: "Speaker Spiders", href: "/products?cat=spiders" },
      { name: "Dust Caps", href: "/products?cat=dustcaps" },
      { name: "Diaphragms", href: "/products?cat=tweeterparts" },
      { name: "Lead Wires", href: "/products" },
      { name: "Speaker Terminals", href: "/products?cat=terminals" },
      { name: "Subwoofers", href: "/products" },
    ]
  },
  {
    name: "OEM Manufacturing",
    href: "/process",
    subItems: [
      { name: "Private Label", href: "/process" },
      { name: "Custom Specifications", href: "/process" },
      { name: "Bulk Orders", href: "/process" },
      { name: "Quality Control", href: "/process" },
    ]
  },
  {
    name: "Industries",
    href: "/about",
    subItems: [
      { name: "Car Audio", href: "/about" },
      { name: "Home Audio", href: "/about" },
      { name: "DJ Speakers", href: "/about" },
      { name: "PA Systems", href: "/about" },
      { name: "subwoofers", href: "/about" },
    ]
  },
  {
    name: "About Us",
    href: "/about",
    subItems: [
      { name: "Company Profile", href: "/about" },
      { name: "Our Factory", href: "/about" },
      { name: "Our Team", href: "/about" },
      { name: "Infrastructures", href: "/about" },
      { name: "Certificates", href: "/about" },
      { name: "Why Choose Us", href: "/about" },
    ]
  },
  {
    name: "Export",
    href: "/export",
    subItems: [
      { name: "Countries We Export to", href: "/export" },
      { name: "Export Process", href: "/export" },
      { name: "Packaging", href: "/export" },
      { name: "Shipping", href: "/export" },
      { name: "Payment Terms", href: "/export" },
      { name: "Frequently Asked Questions", href: "/export" },
    ]
  },
  {
    name: "Quality",
    href: "/about",
    subItems: [
      { name: "Klippel QA Sweeps", href: "/about" },
      { name: "Anechoic Chamber Audits", href: "/about" },
      { name: "THD Threshold Audits", href: "/about" },
      { name: "ISO 9001:2015 Standards", href: "/about" },
    ]
  },
  {
    name: "Resources",
    href: "/products",
    subItems: [
      { name: "Component Catalog PDF", href: "/products" },
      { name: "CAD Model Library", href: "/products" },
      { name: "Material Data Sheets", href: "/about" },
      { name: "B2B Procurement FAQs", href: "/" },
    ]
  },
  {
    name: "Contact Us",
    href: "/contact",
    subItems: [
      { name: "RFQ Specification Intake", href: "/contact" },
      { name: "Jaipur HQ Location", href: "/contact" },
      { name: "Logistics Shipping Desk", href: "/contact" },
      { name: "Direct Sales Phone Line", href: "/contact" },
    ]
  }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const { currency, setCurrency } = useCurrency();
  
  const pathname = usePathname();

  useEffect(() => {
    const updateCount = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("gsp_enquiry_cart");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCartCount(parsed.length);
          } catch {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
      }
    };
    
    updateCount();
    window.addEventListener("gsp_cart_updated", updateCount);
    window.addEventListener("storage", updateCount);
    
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("gsp_cart_updated", updateCount);
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out bg-white border-b border-slate-200 ${
        scrolled ? "py-2 shadow-sm scrolled" : "py-4"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between">
          
          {/* Left Block: Brand Logo (Top left) - using exact uploaded image */}
          <div className="flex items-center justify-start flex-1 lg:flex-initial lg:w-[220px] xl:w-[260px] 2xl:w-[300px] shrink-0 z-10">
            <Link href="/" className="flex items-center group">
              <Image 
                src="/logo-horizontal.jpg"
                alt="Global Speaker Parts"
                width={275}
                height={90}
                priority
                className="navbar-logo hover:opacity-90 transition-opacity" 
              />
            </Link>
          </div>

          {/* Center Block: Desktop Navigation Menu (Centered symmetrically in header) */}
          <nav className="hidden lg:flex items-center justify-center flex-1 space-x-1.5 xl:space-x-3.5 2xl:space-x-6 font-sans text-[10px] xl:text-[12px] 2xl:text-[13px] font-semibold uppercase tracking-wider">
            {navigationItems.map((item) => {
              const isHovered = hoveredMenu === item.name;
              const isActive = pathname.startsWith(item.href);

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredMenu(item.name)}
                  onMouseLeave={() => setHoveredMenu(null)}
                  className="relative py-2.5"
                >
                  <Link 
                    href={item.href}
                    className={`px-1 py-1 rounded transition-colors duration-150 hover:text-accent-cyan whitespace-nowrap ${
                      isActive ? "text-[#000000] font-bold" : "text-slate-800"
                     }`}
                  >
                    {item.name}
                  </Link>

                  {/* Glassmorphic Sub-Menu Dropdown (Opens on hover) */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-60 bg-white border border-slate-200/80 rounded-lg shadow-xl overflow-hidden py-2 text-left z-50 text-[11px] font-sans normal-case tracking-normal"
                      >
                        <div className="px-3.5 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 mb-1">
                          {item.name} Options
                        </div>
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-4 py-2.5 text-slate-800 hover:bg-slate-50 hover:text-accent-cyan font-medium transition-colors border-b border-slate-100/50 last:border-0"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Right Block: Actions & Mobile Hamburger */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 flex-1 lg:flex-initial lg:w-[240px] xl:w-[280px] 2xl:w-[300px] shrink-0 z-10 whitespace-nowrap">
            {/* Search Icon */}
            <Link 
              href="/products"
              className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Search Products"
            >
              <Search className="w-5 h-5 text-slate-800 hover:text-black transition-colors" />
            </Link>

            {/* Cart Icon */}
            <Link 
              href="/products?cart=true"
              className="relative p-1.5 rounded-full hover:bg-black/5 transition-colors mr-1"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-800 hover:text-black transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-cyan text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-accent-cyan font-mono shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Currency Selector */}
            <div className="relative flex items-center mr-1">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent border border-black hover:bg-black/5 text-black font-semibold text-[10px] tracking-wider uppercase rounded-md px-1.5 py-1.5 transition-all cursor-pointer outline-none font-sans"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD ($)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            {/* Quote button (desktop/tablet) */}
            <Link href="/contact?rfq=true" className="hidden sm:block shrink-0">
              <button className="bg-black text-white border border-black px-4 py-2.5 rounded-lg font-semibold text-xs tracking-wider hover:bg-slate-800 transition-all uppercase cursor-pointer whitespace-nowrap">
                Request Quote
              </button>
            </Link>

            {/* Hamburger menu button (mobile/tablet - Triggered below lg screen width) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-black hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Sidebar Drawer (With Accordion Submenus) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-primary-midnight/20 z-40 lg:hidden backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-md z-50 lg:hidden flex flex-col shadow-2xl border-r border-border-cool"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-cool">
                <div className="flex items-center">
                  <Image src="/logo-horizontal.jpg" alt="Global Speaker Parts" width={128} height={42} className="h-7 w-auto object-contain" />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-[#000000] hover:text-[#5C5C63] cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>
              
              {/* Accordion List */}
              <nav className="flex-1 flex flex-col px-4 py-6 space-y-2.5 overflow-y-auto text-xs font-semibold uppercase tracking-wider scrollbar-thin">
                {navigationItems.map((item) => {
                  const isMobileSubOpen = openMobileSub === item.name;
                  return (
                    <div key={item.name} className="border-b border-[#EAEAEA] pb-2">
                      <button
                        onClick={() => setOpenMobileSub(isMobileSubOpen ? null : item.name)}
                        className="w-full flex items-center justify-between py-2 text-[#000000] hover:text-[#5C5C63] text-left font-bold"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isMobileSubOpen ? "transform rotate-180 text-[#5C5C63]" : ""
                        }`} />
                      </button>

                      {/* Sub-Items Accordion Loop strictly matching uploaded list */}
                      {isMobileSubOpen && (
                        <div className="pl-4 py-2 flex flex-col space-y-2 normal-case tracking-normal text-[11px] font-medium text-slate-600 bg-[#F7F7F8] rounded-lg mt-1 border border-[#EAEAEA]">
                          {item.subItems.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setIsOpen(false)}
                              className="py-1.5 block hover:text-accent-cyan border-b border-[#EAEAEA]/40 last:border-0"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="mt-auto px-6 py-6 border-t border-[#EAEAEA] space-y-4">
                {/* Mobile Currency Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#4A4A4F] tracking-widest uppercase font-sans">Currency</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-transparent border border-black hover:bg-black/5 text-black font-semibold text-[10px] tracking-wider uppercase rounded-md px-2 py-1.5 transition-all cursor-pointer outline-none font-sans"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CNY">CNY (¥)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
                <Link href="/contact?rfq=true" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-[#000000] text-white py-3 rounded-lg font-bold text-xs tracking-widest hover:bg-[#2E2E33] transition-all cursor-pointer">
                    REQUEST B2B QUOTE
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
