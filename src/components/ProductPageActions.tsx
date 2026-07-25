'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Package, Tag, ShoppingBag } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface ProductPageActionsProps {
  product: {
    id: string;
    name: string;
    category: string;
    startingPrice: string;
    moq: string;
    variants?: string;
  };
  whatsappUrl: string;
}

export default function ProductPageActions({ product, whatsappUrl }: ProductPageActionsProps) {
  const { convertPrice } = useCurrency();
  const params = useParams();
  const [added, setAdded] = useState(false);
  const slug = params?.productSlug || params?.slug;

  const handleAddToInquiry = () => {
    if (typeof window !== 'undefined') {
      const storedStr = localStorage.getItem('gsp_enquiry_cart');
      const cart = storedStr ? JSON.parse(storedStr) : [];
      const exists = cart.some((item: any) => item.name === product.name);
      
      if (!exists) {
        const itemToAdd = {
          id: product.id,
          name: product.name,
          category: product.category,
          startingPrice: convertPrice(product.startingPrice),
          moq: product.moq,
          variants: product.variants || 'Standard',
          date: new Date().toISOString().split('T')[0]
        };
        const updated = [...cart, itemToAdd];
        localStorage.setItem('gsp_enquiry_cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('gsp_cart_updated'));
      }
      
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      
      // Auto-open the Inquiry Cart Drawer!
      window.dispatchEvent(new Event('gsp_open_cart'));
    }
  };

  return (
    <div className="border-2 border-black rounded-xl p-5 bg-white space-y-4 shadow-sm w-full max-w-md font-sans text-black">
      {/* Price & MOQ Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Price Badge */}
        <div className="flex flex-col gap-1.5 p-3.5 border-2 border-black rounded-lg bg-[#0F0F10] text-white">
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" /> Starting Price
          </span>
          <span className="font-display font-extrabold text-sm leading-none">
            {convertPrice(product.startingPrice)}
          </span>
        </div>

        {/* MOQ Badge */}
        <div className="flex flex-col gap-1.5 p-3.5 border-2 border-black rounded-lg bg-white text-black">
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Package className="w-2.5 h-2.5" /> Minimum Order (MOQ)
          </span>
          <span className="font-display font-extrabold text-xs leading-none">
            {product.moq}
          </span>
        </div>
      </div>

      {/* Action Buttons Stack */}
      <div className="flex flex-col gap-2.5 pt-1">
        <button
          onClick={handleAddToInquiry}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 text-[10px] font-bold tracking-widest text-white bg-black hover:bg-accent-cyan-hover border border-black hover:border-accent-cyan-hover rounded-lg transition-all cursor-pointer uppercase"
        >
          <ShoppingBag className="w-4 h-4 shrink-0" />
          <span>{added ? '✓ Added to Inquiry' : 'Add to Inquiry'}</span>
        </button>

        {slug && (
          <Link
            href={`/checkout?slug=${slug}`}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 text-[10px] font-bold tracking-widest text-black bg-white hover:bg-slate-50 border border-black rounded-lg transition-all uppercase"
          >
            <span>Buy Sample Now</span>
          </Link>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 text-[10px] font-bold tracking-widest text-black bg-white hover:bg-slate-50 border border-black rounded-lg transition-all uppercase"
        >
          <img src="/whatsapp.png" alt="WhatsApp" className="w-4 h-4 shrink-0" />
          <span>Contact Us on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
