"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Box, ChevronLeft, ChevronRight, FileText, Info, MessageCircle, ShieldCheck, ShoppingBag, Sparkles, Tag } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";
import ProductPageActions from "@/components/ProductPageActions";
import { useCurrency } from "@/context/CurrencyContext";
import { productsData, productImages, type ProductItem, getProductSlug } from "@/app/products/page";
import PageLoader from "@/components/PageLoader";

interface ProductApiRecord {
  id: string;
  name: string;
  slug: string;
  short_desc: string | null;
  long_desc: string | null;
  featured_image: string | null;
  category?: { name: string; slug: string } | null;
  category_name?: string | null;
  category_slug?: string | null;
  price?: number | null;
  moq?: string | null;
  technical_specs?: Record<string, string> | null;
  media_urls?: string[] | null;
  variants?: Array<{ id: string; name: string; specs: Record<string, string>; stock: number | null; price: number | null; part_numbers?: Array<{ code: string }> }>;
  images?: Array<{ url: string; alt_text?: string | null }>;
  downloads?: Array<{ title?: string | null; type?: string | null; url: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}

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
  const [adminProduct, setAdminProduct] = useState<ProductApiRecord | null>(null);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isVideoUrl = (url: string) =>
    url.startsWith("data:video/") ||
    url.endsWith(".mp4") ||
    url.endsWith(".webm") ||
    url.endsWith(".ogg") ||
    url.includes("youtube.com") ||
    url.includes("vimeo.com");

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    const scrollLeft = scrollRef.current.scrollLeft;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setActiveMediaIdx(index);
    }
  };

  const scrollToMedia = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: width * index,
      behavior: "smooth"
    });
    setActiveMediaIdx(index);
  };

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
      }
    };

    const fetchAdminProduct = async () => {
      if (!slug) return;
      try {
        const res = await fetch(`/api/products/${slug}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            setAdminProduct(data);
          }
        }
      } catch (err) {
        console.error("Error loading admin product", err);
      }
    };

    Promise.all([fetchCustomProducts(), fetchAdminProduct()]).finally(() => setIsLoading(false));
  }, [slug]);

  const combinedProducts = useMemo<ProductItem[]>(() => {
    return [...productsData, ...customProducts];
  }, [customProducts]);

  const product = useMemo<ProductItem | null>(() => {
    if (!slug) return null;
    const fromStatic = combinedProducts.find((item) => getProductSlug(item) === slug) || null;
    if (adminProduct) {
      return {
        id: adminProduct.id,
        name: adminProduct.name,
        category: adminProduct.category?.name || adminProduct.category_name || "Speaker Component",
        imageKey: adminProduct.featured_image || "",
        desc: adminProduct.long_desc || adminProduct.short_desc || "",
        materials: adminProduct.technical_specs?.Material || "",
        dimensions: adminProduct.technical_specs?.Dimensions || adminProduct.technical_specs?.Diameter || "",
        tempLimit: adminProduct.technical_specs?.["Temperature Rating"] || "",
        frequencyRange: adminProduct.technical_specs?.Impedance || "",
        tolerances: adminProduct.technical_specs?.Tolerance || "",
        startingPrice: adminProduct.price ? `$${adminProduct.price.toFixed(2)}` : "$1.80",
        moq: adminProduct.moq || adminProduct.technical_specs?.MOQ || "1,000 units",
        variants: adminProduct.variants?.map((item) => item.name).join(", ") || "Standard",
        mediaUrls: adminProduct.media_urls?.join(",") || adminProduct.images?.map((image) => image.url).join(",") || undefined,
        mediaList: (adminProduct.media_urls && adminProduct.media_urls.length > 0 ? adminProduct.media_urls : adminProduct.images?.map((image) => image.url) || []).filter(Boolean),
        compliance: adminProduct.technical_specs?.Compliance || "RoHS compliant",
        faqs: adminProduct.faqs,
        variantProfiles: adminProduct.variants?.map((variant) => ({ label: variant.name, specs: variant.specs })) || [],
      } as ProductItem & { faqs?: Array<{ question: string; answer: string }>; variantProfiles?: Array<{ label: string; specs?: Record<string, string> }> };
    }
    return fromStatic;
  }, [combinedProducts, slug, adminProduct]);

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
  const is3DModel = (url: string) => /\.(glb|gltf|obj|stl)$/i.test(url);

  const variantOptions = useMemo(() => {
    if (!product) return [];
    if (Array.isArray((product as ProductItem & { variantProfiles?: Array<{ label: string; specs?: Record<string, string> }> }).variantProfiles)) {
      return (product as ProductItem & { variantProfiles?: Array<{ label: string; specs?: Record<string, string> }> }).variantProfiles!.map((item) => item.label);
    }

    const parsed = (product.variants || "")
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
      { label: "Size", value: product.dimensions || adminProduct?.technical_specs?.Dimensions || adminProduct?.technical_specs?.Diameter || "" },
      { label: "Material", value: product.materials || adminProduct?.technical_specs?.Material || "" },
      { label: "Former", value: activeVariantSpecs.Former || activeVariantSpecs.Material || adminProduct?.technical_specs?.Former || "OEM Formed" },
      { label: "Impedance", value: activeVariantSpecs.Impedance || product.frequencyRange || adminProduct?.technical_specs?.Impedance || "" },
      { label: "Power Rating", value: activeVariantSpecs["Power Rating"] || activeVariantSpecs.Power || adminProduct?.technical_specs?.["Power Rating"] || adminProduct?.technical_specs?.Power || "Custom rated" },
      { label: "Temperature Rating", value: product.tempLimit || adminProduct?.technical_specs?.["Temperature Rating"] || "" },
      { label: "Voice Coil Height", value: activeVariantSpecs["Voice Coil Height"] || activeVariantSpecs.Height || adminProduct?.technical_specs?.["Voice Coil Height"] || adminProduct?.technical_specs?.Height || "Custom" },
      { label: "Outer Diameter", value: activeVariantSpecs["Outer Diameter"] || activeVariantSpecs.OD || adminProduct?.technical_specs?.["Outer Diameter"] || adminProduct?.technical_specs?.OD || "Custom" },
      { label: "Inner Diameter", value: activeVariantSpecs["Inner Diameter"] || activeVariantSpecs.ID || adminProduct?.technical_specs?.["Inner Diameter"] || adminProduct?.technical_specs?.ID || "Custom" },
      { label: "Weight", value: activeVariantSpecs.Weight || adminProduct?.technical_specs?.Weight || "Custom" },
      { label: "Colour", value: activeVariantSpecs.Colour || activeVariantSpecs.Color || adminProduct?.technical_specs?.Colour || adminProduct?.technical_specs?.Color || "Black / Custom" },
      { label: "Application", value: activeVariantSpecs.Application || product.desc || adminProduct?.long_desc || adminProduct?.short_desc || "" }
    ];
    return base.filter((row) => Boolean(row.value));
  }, [activeVariantSpecs, product, adminProduct]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return combinedProducts.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  }, [combinedProducts, product]);

  const downloads = useMemo(() => {
    if (!product) return [];
    if (adminProduct?.downloads && adminProduct.downloads.length > 0) {
      return adminProduct.downloads.map((item) => ({ label: item.title || item.type || "Download", href: item.url }));
    }
    return [
      { label: "Catalogue", href: "/" },
      { label: "Datasheet", href: "/" },
      { label: "Installation Guide", href: "/" }
    ];
  }, [product, adminProduct]);

  const faqs = useMemo(() => {
    if (!product) return fallbackFaqs;
    return (product as ProductItem & { faqs?: Array<{ question: string; answer: string }> }).faqs || fallbackFaqs;
  }, [product]);

  // WhatsApp
  const whatsappMsg = product
    ? encodeURIComponent(`Hi, I'm interested in "${product.name}" from Global Speaker Parts. Please share pricing and technical specifications.`)
    : "";
  const whatsappUrl = `https://wa.me/919829062390?text=${whatsappMsg}`;



  if (!isLoading && !product) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] px-4 py-20 text-center text-[#4A4A4F]">
        <div className="max-w-xl mx-auto rounded-lg border-2 border-black bg-white p-10 shadow-sm">
          <h1 className="font-display text-2xl font-extrabold text-[#0F0F10] uppercase tracking-wider">Product Not Found</h1>
          <p className="mt-3 text-sm text-slate-500">The requested component could not be found. Please return to the catalog and try again.</p>
          <Link href="/products" className="mt-6 inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white border border-black hover:bg-white hover:text-black transition-colors">
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return <PageLoader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#0F0F10] font-sans">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">
          <Link href="/" className="hover:text-[#0F0F10]">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#0F0F10]">Products</Link>
          <span>/</span>
          <span className="text-[#0F0F10]">{product.category}</span>
          <span>/</span>
          <span className="text-[#0F0F10]">{product.name}</span>
        </div>        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 mb-8 bg-white border-2 border-black rounded-lg p-6 sm:p-8">
          
          {/* Left Column: Image/Video Gallery */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg border-2 border-black bg-[#F7F7F8]">
              <div className="relative aspect-square md:aspect-[16/10] lg:max-h-[380px]">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
                >
                  {mediaItems.map((url, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center bg-white p-2">
                      {isVideoUrl(url) ? (
                        <video
                          src={url}
                          className="h-full w-full object-contain"
                          controls
                          muted
                          loop
                          playsInline
                          autoPlay
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`${product.name} - media ${idx + 1}`}
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => scrollToMedia((activeMediaIdx - 1 + mediaItems.length) % mediaItems.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-black bg-white/90 text-[#0F0F10] shadow-sm cursor-pointer z-10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToMedia((activeMediaIdx + 1) % mediaItems.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-black bg-white/90 text-[#0F0F10] shadow-sm cursor-pointer z-10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              <div className="border-t border-black bg-white p-3 text-xs uppercase tracking-[0.2em] text-[#5C5C63]">
                Gallery • Zoom • Swipeable
              </div>
            </div>

            {/* Thumbnails */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {mediaItems.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => scrollToMedia(idx)}
                    className={`relative flex-shrink-0 h-14 w-14 overflow-hidden rounded-lg border-2 transition-all duration-200 bg-white ${
                      idx === activeMediaIdx
                        ? 'border-black shadow-sm'
                        : 'border-[#EAEAEA] hover:border-[#5C5C63]'
                    }`}
                  >
                    {isVideoUrl(url) ? (
                      <div className="h-full w-full relative flex items-center justify-center bg-[#F7F7F8]">
                        <video src={url} className="h-full w-full object-cover" muted playsInline />
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details and B2B interactive actions */}
          <div className="flex flex-col space-y-5 justify-center">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{product.category}</span>
              </div>
              <h1 className="font-display text-2xl font-extrabold leading-tight text-[#0F0F10] sm:text-3xl uppercase tracking-tight">
                {product.name}
              </h1>
              <p className="text-sm leading-7 text-[#4A4A4F] font-light">{product.desc}</p>

              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[#5C5C63]">
                <span className="rounded-full border border-black bg-white px-3 py-1">Part Numbers: {product.id}</span>
                <span className="rounded-full border border-black bg-white px-3 py-1">Availability: In Stock</span>
                <span className="rounded-full border border-black bg-white px-3 py-1">Inquiry Status: Active</span>
              </div>
            </div>

            {/* B2B Actions Panel */}
            <div className="pt-2">
              <ProductPageActions
                product={{
                  id: product.id,
                  name: product.name,
                  category: product.category,
                  startingPrice: String(product.startingPrice),
                  moq: product.moq,
                  variants: product.variants
                }}
                whatsappUrl={whatsappUrl}
              />
            </div>

            {/* Compliance Info */}
            <div className="flex items-center gap-2 text-xs text-[#4A4A4F] font-semibold pt-1">
              <ShieldCheck className="h-4 w-4 text-[#0F0F10]" />
              <span>Product compliance standard: {product.compliance || "RoHS compliant"}</span>
            </div>
          </div>

        </div>

        {/* Variants Section */}
        <section className="mt-8 rounded-lg border-2 border-black bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between border-b border-black pb-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">Variants</p>
              <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Select a variant</h2>
            </div>
            <span className="rounded-full border border-black bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C5C63]">
              Live specs update
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {variantOptions.map((variant, index) => (
              <button
                key={`${variant}-${index}`}
                onClick={() => setSelectedVariant(index)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${selectedVariant === index ? "border-black bg-black text-white" : "border-black bg-white text-[#5C5C63] hover:bg-black hover:text-white"}`}
              >
                {variant}
              </button>
            ))}
          </div>
        </section>

        {/* Specs + Description Grid */}
        <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Technical Specifications */}
          <div className="rounded-lg border-2 border-black bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 border-b border-black pb-3">
              <Info className="h-4 w-4 text-[#0F0F10]" />
              <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Technical Specifications</h2>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <tbody>
                  {specRows.map((row) => (
                    <tr key={row.label} className="border-b border-[#F0F0F2]">
                      <td className="py-3 pr-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5C5C63]">{row.label}</td>
                      <td className="py-3 text-right font-semibold text-[#0F0F10]">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            {/* Product Description */}
            <div className="rounded-lg border-2 border-black bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2 border-b border-black pb-3">
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

            {/* Product Gallery */}
            <div className="rounded-lg border-2 border-black bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2 border-b border-black pb-3">
                <ShoppingBag className="h-4 w-4 text-[#0F0F10]" />
                <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Product Gallery</h2>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {mediaItems.slice(0, 4).map((item, index) => (
                  <div key={`${item}-${index}`} className="overflow-hidden rounded-lg border border-black bg-[#F7F7F8]">
                    {item.startsWith("data:video/") || item.endsWith(".mp4") || item.endsWith(".webm") || item.endsWith(".ogg") || item.includes("youtube.com") || item.includes("vimeo.com") ? (
                      <video src={item} className="h-40 w-full object-cover" muted loop playsInline />
                    ) : is3DModel(item) ? (
                      <div className="flex h-40 flex-col items-center justify-center gap-2 bg-slate-100 p-4 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">3D Model</span>
                        <p className="text-sm font-semibold text-[#0F0F10]">{product.name}</p>
                        <a href={item} target="_blank" rel="noreferrer" className="rounded-full border border-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0F0F10] hover:bg-black hover:text-white">
                          Open file
                        </a>
                      </div>
                    ) : (
                      <img src={item} alt={`${product.name} gallery ${index + 1}`} className="h-40 w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        <section className="mt-8 rounded-lg border-2 border-black bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 border-b border-black pb-3">
            <Box className="h-4 w-4 text-[#0F0F10]" />
            <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Related Products</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/products/${getProductSlug(item)}`} className="rounded-lg border-2 border-black bg-white p-4 transition-colors hover:bg-slate-50 group">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#5C5C63]">{item.category}</p>
                <h3 className="mt-2 font-semibold text-[#0F0F10] uppercase tracking-tight group-hover:text-accent-cyan transition-colors">{item.name}</h3>
                <p className="mt-2 text-sm text-[#4A4A4F] font-light line-clamp-2">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ + Downloads Grid */}
        <section className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          {/* FAQ */}
          <div className="rounded-lg border-2 border-black bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 border-b border-black pb-3">
              <Info className="h-4 w-4 text-[#0F0F10]" />
              <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">FAQ</h2>
            </div>
            <div className="mt-5 space-y-4">
              {faqs.map((faq, index) => (
                <div key={`${faq.question}-${index}`} className="rounded-lg border border-black bg-[#F7F7F8] p-4">
                  <h3 className="font-semibold text-[#0F0F10] uppercase tracking-tight text-sm">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#4A4A4F] font-light">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Downloads */}
          <div className="rounded-lg border-2 border-black bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 border-b border-black pb-3">
              <FileText className="h-4 w-4 text-[#0F0F10]" />
              <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Downloads</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {downloads.map((item) => (
                <a key={item.label} href={item.href} className="rounded-lg border border-black bg-white p-4 text-center text-sm font-semibold text-[#0F0F10] transition-colors hover:bg-black hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry Section */}
        <section id="inquiry-section" className="mt-8 rounded-lg border-2 border-black bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-2 border-b border-black pb-3">
            <ArrowLeft className="h-4 w-4 text-[#0F0F10]" />
            <h2 className="font-display text-lg font-extrabold text-[#0F0F10]">Inquiry Section</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-lg border border-black bg-[#F7F7F8] p-5">
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
