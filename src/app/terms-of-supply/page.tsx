import React from "react";
import Link from "next/link";
import { ArrowLeft, Truck, DollarSign, RefreshCw, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Supply | Global Speaker Parts",
  description: "Read the B2B logistics, shipping, duties, currency conversion, and cancellation policies for sample orders and wholesale production runs.",
};

export default function TermsOfSupplyPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-black uppercase tracking-wider font-bold mb-8 transition-colors"
          id="back_to_home_btn_supply"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>

        {/* Premium Header Card */}
        <div className="bg-black text-white rounded-xl p-8 sm:p-12 mb-8 shadow-sm border border-black relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
            <Truck className="w-80 h-80" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
              Logistics & Supply Document
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight font-display">
              Terms of Supply
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-light max-w-xl">
              Last Updated: July 28, 2026. This document governs payment processing, logistics, duties, shipping terms, and sample evaluations for all B2B orders.
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white border-2 border-black rounded-xl p-6 sm:p-10 space-y-8 shadow-sm">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              <DollarSign className="w-4 h-4 text-black shrink-0" />
              1. Pricing & Payments
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              All prices shown in checkout are in US Dollars (USD) or converted currency. 
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-655 font-light pl-2 space-y-1">
              <li>Prepaid sample orders can be made securely online via Razorpay (card/UPI) or PayPal.</li>
              <li>For custom wholesale factory runs, we accept wire transfers (T/T) and letters of credit (L/C) according to the terms specified on your proforma invoice.</li>
              <li>Sample charges are eligible for partial or full rebate credits against your initial bulk contract production run.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              <Truck className="w-4 h-4 text-black shrink-0" />
              2. Logistics, Shipping & Delivery
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              We ship worldwide. All sample packages are dispatched within 2–5 business days under EXW (Ex Works) or DAP (Delivered at Place) terms via express B2B air cargo carriers (DHL Express, FedEx, or UPS).
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-655 font-light pl-2 space-y-1">
              <li>Tracking reference IDs are emailed automatically when the shipment leaves our logistics warehouse.</li>
              <li>Estimated delivery timelines generally vary between 4 to 8 business days depending on customs processing in the destination country.</li>
              <li>The purchaser is responsible for any local import duties, tariffs, and customs clearance charges.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              <RefreshCw className="w-4 h-4 text-black shrink-0" />
              3. Sample Order Returns & Refund Policy
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              Due to the industrial and B2B custom-evaluation nature of the products, sample orders are non-returnable unless the items received do not match the dimensions or model numbers specified on the order receipt. In the case of manufacturing defects or shipping damage:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-655 font-light pl-2 space-y-1">
              <li>Report the damage within 72 hours of package arrival, including photos of the outer box and products.</li>
              <li>Verified defects are eligible for immediate replacement dispatch at our cost or a gateway refund.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              <FileText className="w-4 h-4 text-black shrink-0" />
              4. Custom Packaging & Preservation
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              To protect delicate components during air transit, all speaker cones and diaphragms are vacuum sealed in moisture-proof plastic bags before being packed into double-wall industrial corrugated boxes with custom foam inserts. Keep materials sealed until installation to prevent atmospheric moisture absorption.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
