"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Box, ChevronLeft, ChevronRight, FileText, Info, ShieldCheck, ShoppingBag, Sparkles, Tag } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";
import { useCurrency } from "@/context/CurrencyContext";
import { productsData, productImages, type ProductItem, getProductSlug } from "@/app/products/page";

const fallbackFaqs = [
  {
    question: "Can this component be customized for OEM tooling?",
    answer: "Yes. We support custom dimensions, impedance, adhesives, and finishing to match your production requirements."
  },
  {
    question: "What is the standard lead time?",
    answer: "Typical industrial B2B lead times range from 3 to 6 weeks depending on tolerance class and tooling scope."
  },
  {
    question: "Do you provide technical documentation for export shipments?",
    answer: "Yes. We can provide dimensional drawings, compliance statements, and installation guidance on request."
  }
];

function ProductDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { convertPrice } = useCurrency();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const initialSampleMode = searchParams.get("mode") === "sample";

  const [customProducts, setCustomProducts] = useState<ProductItem[]>([]);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomProducts = async () => {
      try {
        const res = await fetch("/api/custom-products?t=" + Date.now());
        const data = await res.json();
        if (Array.isArray(data)) {
          setCustomProducts(data);
        }
      } catch (err) {
        console.error("Error loading custom products", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomProducts();
  }, []);

  const combinedProducts = useMemo<ProductItem[]>(() => {
    return [...productsData, ...customProducts];
  }, [customProducts]);

  const product = useMemo<ProductItem | null>(() => {
    if (!slug) return null;
    return combinedProducts.find((item) => getProductSlug(item) === slug) || null;
  }, [combinedProducts, slug]);

  useEffect(() => {
    setActiveMediaIdx(0);
    setSelectedVariant(0);
  }, [product?.id]);

  const mediaUrls = useMemo(() => {
    if (!product) return [];
    const urls = product.mediaUrls
      ? product.mediaUrls.split(",").map((url: string) => url.trim()).filter(Boolean)
      : [];
    if (product.mediaList && product.mediaList.length > 0) {
      return product.mediaList;
    }
    if (urls.length > 0) return urls;
    return [productImages[product.imageKey] || "https://images.unsplash.com/photo-158109226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"];
  }, [product]);

  const mediaItems = mediaUrls;
  const activeMediaUrl = mediaItems[activeMediaIdx] || mediaItems[0];
  const isVideo = activeMediaUrl?.startsWith("data:video/") || activeMediaUrl?.endsWith(".mp4") || activeMediaUrl?.endsWith(".webm") || activeMediaUrl?.endsWith(".ogg") || activeMediaUrl?.includes("youtube.com") || activeMediaUrl?.includes("vimeo.com");

  const variantOptions = useMemo(() => {
    if (!product) return [];
    if (Array.isArray((product as ProductItem & { variantProfiles?: Array<{ label: string; specs?: Record<string, string> }> }).variantProfiles)) {
      return (product as ProductItem & { variantProfiles?: Array<{ label: string; specs?: Record<string, string> }> }).variantProfiles!.map((item) => item.label);
    }

    const parsed = product.variants
      .split(/[•,]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    return parsed.length > 0 ? parsed : ["Standard"]; 
  }, [product]);

  const activeVariantSpecs = useMemo(() => {
    if (!product) return {} as Record<string, string>;
    const variantProfiles = (product as ProductItem & { variantProfiles?: Array<{ label: string; specs?: Record<string, string> }> }).variantProfiles;
    if (variantProfiles && variantProfiles[selectedVariant]?.specs) {
      return variantProfiles[selectedVariant].specs;
    }
    return {};
  }, [product, selectedVariant]);

  const specRows = useMemo(() => {
    if (!product) return [];
    const base = [
      { label: "Size", value: product.dimensions },
      { label: "Material", value: product.materials },
      { label: "Former", value: activeVariantSpecs.Former || activeVariantSpecs.Material || "OEM Formed" },
      { label: "Impedance", value: activeVariantSpecs.Impedance || product.frequencyRange },
      { label: "Power Rating", value: activeVariantSpecs["Power Rating"] || activeVariantSpecs.Power || "Custom rated" },
      { label: "Temperature Rating", value: product.tempLimit },
      { label: "Voice Coil Height", value: activeVariantSpecs["Voice Coil Height"] || activeVariantSpecs.Height || "Custom" },
      { label: "Outer Diameter", value: activeVariantSpecs["Outer Diameter"] || activeVariantSpecs.OD || "Custom" },
      { label: "Inner Diameter", value: activeVariantSpecs["Inner Diameter"] || activeVariantSpecs.ID || "Custom" },
      { label: "Weight", value: activeVariantSpecs.Weight || "Custom" },
      { label: "Colour", value: activeVariantSpecs.Colour || activeVariantSpecs.Color || "Black / Custom" },
      { label: "Application", value: activeVariantSpecs.Application || product.desc }
    ];
    return base;
  }, [activeVariantSpecs, product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return combinedProducts.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  }, [combinedProducts, product]);

  const downloads = useMemo(() => {
    if (!product) return [];
    return [
      { label: "Catalogue", href: "/" },
      { label: "Datasheet", href: "/" },
      { label: "Installation Guide", href: "/" }
    ];
  }, [product]);

  const faqs = useMemo(() => {
    if (!product) return fallbackFaqs;
    return (product as ProductItem & { faqs?: Array<{ question: string; answer: string }> }).faqs || fallbackFaqs;
  }, [product]);

  const handleAddToInquiry = () => {
    if (typeof window !== "undefined" && product) {
      const storedStr = localStorage.getItem("gsp_enquiry_cart");
      const cart = storedStr ? JSON.parse(storedStr) : [];
      const exists = cart.some((item: Record<string, string>) => item.name === product.name);
      if (!exists) {
        const itemToAdd = {
          id: product.id,
          name: product.name,
          category: product.category,
          startingPrice: product.startingPrice,
          moq: product.moq,
          variants: product.variants,
          date: new Date().toISOString().split("T")[0]
        };
        const updated = [...cart, itemToAdd];
        localStorage.setItem("gsp_enquiry_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("gsp_cart_updated"));
      }
    }
    document.getElementById("inquiry-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!isLoading && !product) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] px-4 py-20 text-center text-[#4A4A4F]">
        <div className="max-w-xl mx-auto rounded-premium border border-[#EAEAEA] bg-white p-10 shadow-sm">
          <h1 className="font-display text-2xl font-extrabold text-[#0F0F10] uppercase tracking-wider">Product Not Found</h1>
          <p className="mt-3 text-sm text-slate-500">The requested component could not be found. Please return to the catalog and try again.</p>
          <Link href="/products" className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#0F0F10] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] px-4 py-20 text-center text-sm text-slate-400">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#0F0F10] font-sans">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">
          <Link href="/" className="hover:text-accent-cyan">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-accent-cyan">Products</Link>
          <span>/</span>
          <span className="text-[#0F0F10]">{product.category}</span>
          <span>/</span>
          <span className="text-[#0F0F10]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.4fr]">
          <section className="rounded-premium border border-[#EAEAEA] bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{product.category}</span>
                </div>
                <h1 className="font-display text-2xl font-extrabold leading-tight text-[#0F0F10] sm:text-3xl">
                  {product.name}
                </h1>
                <p className="text-sm leading-7 text-[#4A4A4F] font-light">{product.desc}</p>

                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[#5C5C63]">
                  <span className="rounded-full border border-[#EAEAEA] bg-[#F7F7F8] px-3 py-1">Part Numbers: {product.id}</span>
                  <span className="rounded-full border border-[#EAEAEA] bg-[#F7F7F8] px-3 py-1">Availability: In Stock</span>
                  <span className="rounded-full border border-[#EAEAEA] bg-[#F7F7F8] px-3 py-1">Inquiry Status: Active</span>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => document.getElementById("inquiry-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="rounded-lg bg-[#0F0F10] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent-cyan"
                  >
                    Request Quote
                  </button>
                  <button
                    onClick={handleAddToInquiry}
                    className="rounded-lg border border-[#0F0F10] bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F0F10] transition-colors hover:border-accent-cyan hover:text-accent-cyan"
                  >
                    Add to Inquiry
                  </button>
                  <a
                    href="/products"
                    className="rounded-lg border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C5C63] transition-colors hover:text-accent-cyan"
                  >
                    Download Catalogue
                  </a>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-premium border border-[#EAEAEA] bg-[#F7F7F8]">
                <div className="relative aspect-square">
                  {isVideo ? (
                    <video src={activeMediaUrl} controls muted loop playsInline autoPlay className="h-full w-full object-cover" />
                  ) : (
                    <img src={activeMediaUrl} alt={product.name} className="h-full w-full object-cover" />
                  )}
                  {mediaItems.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveMediaIdx((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)}
                        className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white/90 text-[#0F0F10] shadow-sm"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setActiveMediaIdx((prev) => (prev + 1) % mediaItems.length)}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white/90 text-[#0F0F10] shadow-sm"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                <div className="border-t border-[#EAEAEA] bg-white p-3 text-xs uppercase tracking-[0.2em] text-[#5C5C63]">
                  Gallery • Zoom • Lightbox Ready
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-premium border border-[#EAEAEA] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">Quick Quote</p>
                  <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">{product.name}</h2>
                </div>
                <div className="rounded-full border border-[#EAEAEA] bg-[#F7F7F8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C5C63]">
                  {convertPrice(product.startingPrice)}
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[#4A4A4F]">
                <div className="flex items-start gap-2">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[#0F0F10]" />
                  <span>MOQ: {product.moq}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Box className="mt-0.5 h-4 w-4 shrink-0 text-[#0F0F10]" />
                  <span>{product.variants}</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0F0F10]" />
                  <span>{product.compliance || "RoHS compliant"}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => document.getElementById("inquiry-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="w-full rounded-lg bg-[#0F0F10] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent-cyan"
                >
                  Request Quote
                </button>
                <button
                  onClick={handleAddToInquiry}
                  className="w-full rounded-lg border border-[#0F0F10] bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F0F10] transition-colors hover:border-accent-cyan hover:text-accent-cyan"
                >
                  Add to Inquiry
                </button>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-8 rounded-premium border border-[#EAEAEA] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">Variants</p>
              <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Select a variant</h2>
            </div>
            <span className="rounded-full border border-[#EAEAEA] bg-[#F7F7F8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C5C63]">
              Live specs update
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {variantOptions.map((variant, index) => (
              <button
                key={`${variant}-${index}`}
                onClick={() => setSelectedVariant(index)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${selectedVariant === index ? "border-[#0F0F10] bg-[#0F0F10] text-white" : "border-[#EAEAEA] bg-[#F7F7F8] text-[#5C5C63] hover:border-[#0F0F10]"}`}
              >
                {variant}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-premium border border-[#EAEAEA] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 border-b border-[#EAEAEA] pb-3">
              <Info className="h-4 w-4 text-[#0F0F10]" />
              <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Technical Specifications</h2>
            </div>
            <div className="mt-5 space-y-3">
              {specRows.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 border-b border-[#F0F0F2] py-3 text-sm">
                  <span className="text-[#5C5C63]">{row.label}</span>
                  <span className="text-right font-semibold text-[#0F0F10]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-premium border border-[#EAEAEA] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2 border-b border-[#EAEAEA] pb-3">
                <FileText className="h-4 w-4 text-[#0F0F10]" />
                <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Product Description</h2>
              </div>
              <div className="mt-5 space-y-5 text-sm leading-7 text-[#4A4A4F] font-light">
                <p>{product.desc}</p>
                <div>
                  <h3 className="mb-2 font-semibold uppercase tracking-[0.2em] text-[#0F0F10]">Features</h3>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Precision OEM manufacturing with repeatable tolerance control.</li>
                    <li>Industrial-grade materials suited for export and production deployment.</li>
                    <li>Custom options available for tooling, finish, and impedance fit.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold uppercase tracking-[0.2em] text-[#0F0F10]">Applications</h3>
                  <p>Home audio, automotive transducers, PA systems, industrial acoustic assemblies, and premium OEM speaker integration.</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold uppercase tracking-[0.2em] text-[#0F0F10]">Advantages</h3>
                  <p>High consistency, rapid configuration, strong compliance profile, and logistics-ready export packaging.</p>
                </div>
              </div>
            </div>

            <div className="rounded-premium border border-[#EAEAEA] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2 border-b border-[#EAEAEA] pb-3">
                <ShoppingBag className="h-4 w-4 text-[#0F0F10]" />
                <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Product Gallery</h2>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {mediaItems.slice(0, 4).map((item, index) => (
                  <div key={`${item}-${index}`} className="overflow-hidden rounded-premium border border-[#EAEAEA] bg-[#F7F7F8]">
                    {item.startsWith("data:video/") || item.endsWith(".mp4") || item.endsWith(".webm") || item.endsWith(".ogg") || item.includes("youtube.com") || item.includes("vimeo.com") ? (
                      <video src={item} className="h-40 w-full object-cover" muted loop playsInline />
                    ) : (
                      <img src={item} alt={`${product.name} gallery ${index + 1}`} className="h-40 w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-premium border border-[#EAEAEA] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 border-b border-[#EAEAEA] pb-3">
            <Box className="h-4 w-4 text-[#0F0F10]" />
            <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Related Products</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/products/${getProductSlug(item)}`} className="rounded-premium border border-[#EAEAEA] bg-[#F7F7F8] p-4 transition-colors hover:border-[#0F0F10]">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">{item.category}</p>
                <h3 className="mt-2 font-semibold text-[#0F0F10]">{item.name}</h3>
                <p className="mt-2 text-sm text-[#4A4A4F] font-light line-clamp-2">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-premium border border-[#EAEAEA] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 border-b border-[#EAEAEA] pb-3">
              <Info className="h-4 w-4 text-[#0F0F10]" />
              <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">FAQ</h2>
            </div>
            <div className="mt-5 space-y-4">
              {faqs.map((faq, index) => (
                <div key={`${faq.question}-${index}`} className="rounded-premium border border-[#EAEAEA] bg-[#F7F7F8] p-4">
                  <h3 className="font-semibold text-[#0F0F10]">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#4A4A4F] font-light">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-premium border border-[#EAEAEA] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 border-b border-[#EAEAEA] pb-3">
              <FileText className="h-4 w-4 text-[#0F0F10]" />
              <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Downloads</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {downloads.map((item) => (
                <a key={item.label} href={item.href} className="rounded-premium border border-[#EAEAEA] bg-[#F7F7F8] p-4 text-center text-sm font-semibold text-[#0F0F10] transition-colors hover:border-[#0F0F10]">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="inquiry-section" className="mt-8 rounded-premium border border-[#EAEAEA] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-2 border-b border-[#EAEAEA] pb-3">
            <ArrowLeft className="h-4 w-4 text-[#0F0F10]" />
            <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Inquiry Section</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-premium border border-[#EAEAEA] bg-[#F7F7F8] p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">B2B Manufacturer Inquiry</p>
              <h3 className="mt-2 font-display text-xl font-extrabold text-[#0F0F10]">Request a formal quote or evaluation sample</h3>
              <p className="mt-3 text-sm leading-7 text-[#4A4A4F] font-light">Submit your technical specifications to the Global Speaker Parts export team for pricing, tooling, and lead-time review.</p>
              <div className="mt-5 space-y-3 text-sm text-[#4A4A4F]">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#0F0F10]" /><span>Engineering review within 24 hours</span></div>
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#0F0F10]" /><span>Export-ready documentation available</span></div>
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#0F0F10]" /><span>Custom OEM tooling support</span></div>
              </div>
            </div>
            <InquiryForm defaultCategory={product.category} initialSampleMode={initialSampleMode} product={product} />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Page() {
  return <ProductDetailsPage />;
}
