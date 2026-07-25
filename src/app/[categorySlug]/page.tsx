"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Package,
  Tag as TagIcon,
  Box as BoxIcon,
  MessageCircle,
  Info,
  Check,
  ArrowRight,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import ProductCardGallery from "@/components/ProductCardGallery";
import PageLoader from "@/components/PageLoader";


/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_hidden: boolean;
}

interface Variant {
  id: string;
  product_id: string;
  name: string;
  specs: Record<string, string>;
  stock: number | null;
  price: number | null;
  is_active: boolean;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  short_desc: string | null;
  featured_image: string | null;
  category_name: string | null;
  category_slug: string | null;
  is_featured: boolean;
  tags: string[] | null;
  applications: string | null;
  variants?: Variant[];
  moq?: string | null;
  product_images?: Array<{ url: string }> | null;
  seo_meta?: Record<string, any> | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStartingPrice(p: Product): string {
  if (p.seo_meta?.hide_price === true) {
    return "On request";
  }
  if (p.variants && p.variants.length > 0) {
    const prices = p.variants
      .map((v) => parseFloat(v.price as any))
      .filter((price) => !isNaN(price));
    if (prices.length > 0) return `$${Math.min(...prices).toFixed(2)}`;
  }
  return "$1.80";
}

function getMOQ(p: Product): string {
  if (p.moq) return p.moq;
  if (p.variants) {
    for (const v of p.variants) {
      if (v.specs) {
        for (const [key, val] of Object.entries(v.specs)) {
          if (key.toLowerCase().includes("moq")) return String(val);
        }
      }
    }
  }
  return "1,000 units";
}

function getTolerance(p: Product): string {
  if (p.variants) {
    for (const v of p.variants) {
      if (v.specs) {
        for (const [key, val] of Object.entries(v.specs)) {
          if (key.toLowerCase().includes("tolerance"))
            return `TOLERANCE: ${String(val).toUpperCase()}.`;
        }
      }
    }
  }
  return "TOLERANCE: ±0.15 MM THICKNESS BOUNDS.";
}

function getSpecsSummary(p: Product): string {
  const sizesSet = new Set<string>();
  const edgesSet = new Set<string>();
  const colorsSet = new Set<string>();

  p.variants?.forEach((v) => {
    if (v.specs) {
      Object.entries(v.specs).forEach(([key, val]) => {
        const k = key.toLowerCase();
        const valStr = String(val).trim();
        if (!valStr) return;
        if (k.includes("diameter") || k.includes("size") || k.includes("dimension"))
          sizesSet.add(valStr);
        if (k.includes("edge") || k.includes("surround")) edgesSet.add(valStr);
        if (k.includes("color") || k.includes("colour")) colorsSet.add(valStr);
      });
    }
  });

  const parts: string[] = [];
  if (sizesSet.size > 0) parts.push(`Sizes: ${[...sizesSet].join(", ")}`);
  if (edgesSet.size > 0) parts.push(`Edges: ${[...edgesSet].join(", ")}`);
  if (colorsSet.size > 0) parts.push(`Colors: ${[...colorsSet].join(", ")}`);
  return parts.join(" · ");
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = Array.isArray(params?.categorySlug)
    ? params.categorySlug[0]
    : (params?.categorySlug as string);

  const { convertPrice } = useCurrency();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetch("/api/categories?t=" + Date.now()),
          fetch("/api/products?t=" + Date.now()),
        ]);
        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();

        if (Array.isArray(catsData)) {
          const found = catsData.find(
            (c: Category) => c.slug === categorySlug && !c.is_hidden
          );
          if (found) setCategory(found);
        }
        if (Array.isArray(prodsData)) {
          setProducts(prodsData);
        }
      } catch (err) {
        console.error("Error loading category data", err);
      } finally {
        setLoading(false);
      }
    }
    if (categorySlug) loadData();
  }, [categorySlug]);

  const filteredProducts = useMemo(() => {
    if (!category) return [];
    return products.filter(
      (p) =>
        p.category_slug === categorySlug ||
        p.category_name?.toLowerCase() === category.name.toLowerCase()
    );
  }, [products, category, categorySlug]);

  const handleAddToInquiry = (product: Product) => {
    if (typeof window !== "undefined") {
      const storedStr = localStorage.getItem("gsp_enquiry_cart");
      const cart = storedStr ? JSON.parse(storedStr) : [];
      const exists = cart.some(
        (item: Record<string, string>) => item.name === product.name
      );

      if (!exists) {
        const itemToAdd = {
          id: product.id,
          name: product.name,
          category: product.category_name || "Speaker Component",
          startingPrice: getStartingPrice(product),
          moq: getMOQ(product),
          variants:
            product.variants?.map((v) => v.name).join(", ") || "Standard",
          date: new Date().toISOString().split("T")[0],
        };
        localStorage.setItem(
          "gsp_enquiry_cart",
          JSON.stringify([...cart, itemToAdd])
        );
        window.dispatchEvent(new Event("gsp_cart_updated"));
        window.dispatchEvent(new Event("gsp_open_cart"));
      }

      setAddedProducts((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedProducts((prev) => ({ ...prev, [product.id]: false }));
      }, 2000);
    }
  };

  /* ── Loading State ────────────────────────────────────────────── */
  if (loading) {
    return <PageLoader fullScreen />;
  }

  /* ── Not Found State ──────────────────────────────────────────── */
  if (!category) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Package className="h-16 w-16 text-[#EAEAEA] mx-auto mb-4" />
          <h1 className="font-display text-2xl font-extrabold text-[#0F0F10] mb-2">
            Category Not Found
          </h1>
          <p className="text-sm text-[#5C5C63] mb-6">
            The requested category could not be found.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 btn-primary px-5 py-2.5 text-sm"
          >
            Browse All Products
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav
          className="flex items-center gap-2 text-xs font-sans"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="text-[#5C5C63] hover:text-[#0F0F10] transition-colors"
          >
            Home
          </Link>
          <span className="text-[#EAEAEA]">/</span>
          <Link
            href="/products"
            className="text-[#5C5C63] hover:text-[#0F0F10] transition-colors"
          >
            Products
          </Link>
          <span className="text-[#EAEAEA]">/</span>
          <span className="text-[#0F0F10] font-medium">{category.name}</span>
        </nav>
      </div>

      {/* Category Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F0F10] tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm sm:text-base text-[#4A4A4F] font-light max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black bg-white text-[10px] uppercase tracking-wider font-bold text-black">
              <Package size={12} />
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "Product" : "Products"}
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {filteredProducts.map((product) => {
              const startPrice = getStartingPrice(product);
              const moqVal = getMOQ(product);
              const toleranceVal = getTolerance(product);
              const specsStr = getSpecsSummary(product);
              const isJustAdded = addedProducts[product.id];

              const whatsappMsg = encodeURIComponent(
                `Hi, I'm interested in "${product.name}" from Global Speaker Parts. Please share pricing and technical specifications.`
              );
              const whatsappUrl = `https://wa.me/919829062390?text=${whatsappMsg}`;

              return (
                <div
                  key={product.id}
                  className="group bg-white border border-black rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col justify-between h-full"
                >
                  <Link href={`/${categorySlug}/${product.slug}`} className="flex-1 flex flex-col justify-between cursor-pointer">
                    {/* Product Image Gallery (Swipeable) */}
                    <div className="p-1.5 bg-[#F7F7F8] border-b border-black w-full">
                      <ProductCardGallery product={product} />
                    </div>

                    {/* Content Body */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-[#5C5C63] tracking-widest uppercase block">
                          {product.category_name || category.name}
                        </span>
                        <h2 className="font-display font-black text-base text-[#0F0F10] leading-snug group-hover:text-accent-cyan transition-colors uppercase tracking-tight">
                          {product.name}
                        </h2>
                        {product.short_desc && (
                          <p className="hidden sm:block text-xs text-[#4A4A4F] line-clamp-3 font-light leading-relaxed">
                            {product.short_desc}
                          </p>
                        )}
                      </div>

                      {/* Specs */}
                      <div className="mt-2.5 pt-2 border-t border-[#EAEAEA]/80 space-y-1.5">
                        {/* Price */}
                        <div className="flex items-center justify-between text-[10px] sm:text-xs font-sans">
                          <span className="text-slate-500 font-light flex items-center gap-1">
                            <TagIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                            Starting Price:
                          </span>
                          <span className="font-bold text-[#0f0f10] text-[11px] sm:text-[13px]">
                            {startPrice === "On request" ? "On request" : `${convertPrice(startPrice)} / unit`}
                          </span>
                        </div>

                        {/* MOQ */}
                        <div className="flex items-center justify-between text-[10px] sm:text-xs font-sans">
                          <span className="text-slate-500 font-light flex items-center gap-1">
                            <BoxIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                            MOQ:
                          </span>
                          <span className="font-bold text-[#0f0f10] text-[11px] sm:text-xs">
                            {moqVal}
                          </span>
                        </div>

                        {/* Dimensions & Edges Line */}
                        {specsStr && (
                          <p className="text-[8.5px] sm:text-[10px] text-slate-500 italic leading-snug pt-1">
                            {specsStr}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Action Buttons - Stacked */}
                  <div className="flex flex-col border-t border-black p-1.5 bg-white gap-1.5">
                    <button
                      onClick={() => handleAddToInquiry(product)}
                      className={`inline-flex items-center justify-center gap-1.5 w-full px-3 py-2.5 text-[10px] font-bold tracking-wider rounded-lg border border-black transition-all uppercase cursor-pointer select-none ${
                        isJustAdded
                          ? "bg-[#25D366] text-white border-[#25D366]"
                          : "bg-black text-white hover:bg-white hover:text-black"
                      }`}
                    >
                      {isJustAdded ? <Check size={12} /> : null}
                      {isJustAdded ? "Added!" : "Add To Inquiry"}
                    </button>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2.5 text-[10px] font-bold tracking-wider rounded-lg border border-black bg-white text-black hover:bg-slate-50 transition-all uppercase"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/whatsapp.png"
                        alt="WhatsApp"
                        className="w-3.5 h-3.5 object-contain"
                      />
                      Contact Us
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 border border-dashed border-[#EAEAEA] rounded-premium">
            <Package className="h-12 w-12 text-[#EAEAEA] mx-auto mb-4" />
            <h3 className="font-display font-bold text-lg text-[#0F0F10] mb-1">
              No Products Yet
            </h3>
            <p className="text-sm text-[#5C5C63]">
              Products in this category are coming soon.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 mt-6 btn-primary px-5 py-2.5 text-sm"
            >
              Browse All Products
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
