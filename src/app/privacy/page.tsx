import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Eye, Lock, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Global Speaker Parts",
  description: "Learn how Global Speaker Parts protects your business data, transaction records, and inquiry information in compliance with international privacy laws.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-black uppercase tracking-wider font-bold mb-8 transition-colors"
          id="back_to_home_btn"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>

        {/* Premium Header Card */}
        <div className="bg-black text-white rounded-xl p-8 sm:p-12 mb-8 shadow-sm border border-black relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
            <ShieldCheck className="w-80 h-80" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
              Legal Document
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight font-display">
              Privacy Policy
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-light max-w-xl">
              Last Updated: July 28, 2026. This policy outlines how we collect, store, process, and safeguard your corporate and personal information when sourcing from Global Speaker Parts.
            </p>
          </div>
        </div>

        {/* Policy Content Card */}
        <div className="bg-white border-2 border-black rounded-xl p-6 sm:p-10 space-y-8 shadow-sm">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              <Eye className="w-4 h-4 text-black shrink-0" />
              1. Information We Collect
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              We collect corporate and contact information essential for processing wholesale inquiries, shipping sample orders, and conducting international B2B transactions. This includes:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-655 font-light pl-2 space-y-1">
              <li>Business credentials (Company Name, Corporate Tax ID/VAT registration).</li>
              <li>Contact details (Name, business email address, direct phone number).</li>
              <li>Billing and logistics shipping addresses.</li>
              <li>Digital usage parameters (cookies, IP addresses, browser specifications for security checks).</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              <Lock className="w-4 h-4 text-black shrink-0" />
              2. How We Use Your Data
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              Your details are strictly utilized to execute B2B activities and guarantee a secure purchasing workflow. Specifically, we use information to:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-655 font-light pl-2 space-y-1">
              <li>Process and verify wholesale inquiries and draft custom pricing quotes.</li>
              <li>Coordinate express air cargo deliveries for sample orders (via DHL/FedEx/UPS).</li>
              <li>Authenticate online payment gateways (Razorpay, PayPal, or wire transfers).</li>
              <li>Send transaction confirmation reports, electronic invoices, and shipping updates.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              <FileText className="w-4 h-4 text-black shrink-0" />
              3. Data Security & Storage
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              All transactions are encrypted using SSL technology. Customer details are securely stored within our private Supabase database infrastructure. We never sell, lease, or distribute your corporate data to external marketing companies. We only share logistical information with trusted freight partners (DHL, FedEx) to complete sample shipments.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              4. Cookies and Analytical Tracking
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              Our website uses basic functional cookies to maintain your shopping inquiry cart state, load currency preferences, and compile general navigation analytics. You can adjust your browser properties to block cookies, although doing so may restrict checkout functionalities.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              5. Contact Our Compliance Office
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              For any questions regarding this Privacy Policy or to request the complete deletion of your customer records, please reach out to our privacy desk at <span className="font-bold text-black select-all">privacy@globalspeakerparts.com</span>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
