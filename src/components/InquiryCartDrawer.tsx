'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';

interface CartItem {
  id: string;
  name: string;
  category: string;
  startingPrice: string;
  moq: string;
  variants?: string;
  date: string;
}

export default function InquiryCartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { convertPrice } = useCurrency();
  const router = useRouter();

  const loadCart = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gsp_enquiry_cart');
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

  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => {
      loadCart();
    };

    const handleOpenCart = () => {
      loadCart();
      setIsOpen(true);
    };

    window.addEventListener('gsp_cart_updated', handleCartUpdate);
    window.addEventListener('gsp_open_cart', handleOpenCart);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('gsp_cart_updated', handleCartUpdate);
      window.removeEventListener('gsp_open_cart', handleOpenCart);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  const handleRemove = (nameToRemove: string) => {
    const updated = cartItems.filter((item) => item.name !== nameToRemove);
    localStorage.setItem('gsp_enquiry_cart', JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new Event('gsp_cart_updated'));
  };

  const getWhatsAppUrl = () => {
    const phone = '919829062390';
    if (cartItems.length === 0) {
      return `https://wa.me/${phone}?text=${encodeURIComponent(
        "Hi, I'm interested in speaker components from Global Speaker Parts. Please share pricing and catalogue details."
      )}`;
    }
    const itemsList = cartItems.map((item) => `- ${item.name} (MOQ: ${item.moq})`).join('\n');
    const msg = `Hi, I am interested in placing an OEM B2B inquiry for the following speaker components:\n\n${itemsList}\n\nPlease share the quote and specifications checklist.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-white border-l border-black shadow-2xl flex flex-col font-sans text-black"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#EAEAEA] flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-extrabold uppercase tracking-wider">
                  Inquiry Cart ({cartItems.length})
                </h3>
                <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">
                  B2B Component Selection
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-[#F7F7F8] text-slate-400 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <p className="text-slate-400 text-xs">Your inquiry cart is empty.</p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/products');
                    }}
                    className="mt-3 text-[10px] font-bold uppercase tracking-wider bg-black text-white px-4 py-2.5 rounded-lg border border-black hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between gap-4 p-3 rounded-lg border-2 border-black bg-white hover:shadow-xs transition-shadow relative"
                  >
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">
                        {item.category}
                      </span>
                      <h4 className="text-[11px] font-extrabold uppercase leading-snug pr-4">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-3 pt-1 text-[9px] font-semibold text-slate-500 uppercase">
                        <span>Price: <span className="text-black font-bold">{item.startingPrice}</span></span>
                        <span>•</span>
                        <span>MOQ: <span className="text-black font-bold">{item.moq}</span></span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.name)}
                      className="text-slate-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer self-start"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer with CTAs */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-[#EAEAEA] bg-[#F7F7F8] space-y-2.5">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/contact?rfq=true');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-[10px] font-bold tracking-widest text-white bg-black hover:bg-accent-cyan-hover border border-black hover:border-accent-cyan-hover rounded-lg transition-all cursor-pointer uppercase"
                >
                  <span>Submit B2B Inquiry Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-[10px] font-bold tracking-widest text-black bg-white hover:bg-slate-50 border border-black rounded-lg transition-all uppercase"
                >
                  <img src="/whatsapp.png" alt="WhatsApp" className="w-4 h-4 shrink-0" />
                  <span>Contact Us on WhatsApp</span>
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
