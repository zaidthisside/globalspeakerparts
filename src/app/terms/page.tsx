import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | Global Speaker Parts",
  description: "Review the general terms and conditions governing the use of globalspeakerparts.com for sourcing wholesale speaker components.",
};

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-black uppercase tracking-wider font-bold mb-8 transition-colors"
          id="back_to_home_btn_terms"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>

        {/* Premium Header Card */}
        <div className="bg-black text-white rounded-xl p-8 sm:p-12 mb-8 shadow-sm border border-black relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
            <Scale className="w-80 h-80" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
              Legal Document
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight font-display">
              Terms & Conditions
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-light max-w-xl">
              Last Updated: July 28, 2026. These terms govern your website interaction, catalog access, custom RFQs, and sample order checkout workflows.
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white border-2 border-black rounded-xl p-6 sm:p-10 space-y-8 shadow-sm">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              <FileText className="w-4 h-4 text-black shrink-0" />
              1. B2B Wholesale Focus
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              Global Speaker Parts is a dedicated business-to-business (B2B) original equipment manufacturer (OEM). All information, catalogs, products, and prices provided on this website are specifically directed at audio manufacturers, commercial repair labs, and wholesale distributors. By submitting inquiries or purchasing samples, you represent that you are representing a commercial entity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
              2. Intellectual Property
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              All branding elements, catalog listings, code files, product photography, schematics, and mechanical specifications displayed on <span className="font-semibold text-black">globalspeakerparts.com</span> are the exclusive intellectual property of Global Speaker Parts. Unauthorized replication, framing, or distribution of this material for commercial competing purposes is strictly prohibited.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              <AlertCircle className="w-4 h-4 text-black shrink-0" />
              3. Custom Specifications & Tooling
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              While we make every effort to display accurate dimensions, weight metrics, and materials in our database catalog, custom wholesale runs are manufactured to the technical drawing files approved during the pre-production sign-off phase. Samples are provided to ensure tolerances, adhesive compatibility, and acoustic matching meet your application needs prior to a full factory run.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              4. Disclaimer of Liability
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              Global Speaker Parts shall not be held liable for indirect, incidental, or consequential damages resulting from the integration of our speaker parts (e.g. voice coils, surrounds, cones) into final assemblies. It is the responsibility of the acoustic engineer or product owner to validate component performance under target thermal and mechanical stress levels.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase text-black border-b border-black/10 pb-2">
              5. Governing Law
            </h2>
            <p className="text-xs sm:text-sm text-slate-655 font-light leading-relaxed">
              Any claims or disputes arising out of the website usage or sample procurement shall be governed by international commercial trade frameworks and subject to the exclusive jurisdiction of the regional arbitration courts where our corporate headquarters are located.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
