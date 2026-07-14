"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Package, ArrowRight } from "lucide-react";

// ─── Backward Compatibility Exports ────────────────────────────────
export const productsData: ProductItem[] = [];
export const productImages: Record<string, string> = {};
export const allCategories = ["All Categories"];

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  imageKey: string;
  desc: string;
  materials: string;
  dimensions: string;
  tempLimit: string;
  frequencyRange: string;
  tolerances: string;
  startingPrice: string;
  moq: string;
  variants: string;
  mediaUrls?: string;
  mediaList?: string[];
  compliance?: string;
}

export function getProductSlug(product: Pick<ProductItem, "name">) {
  return product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "product";
}

// ─── Interfaces for Local State ───────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_hidden: boolean;
  product_count?: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  short_desc: string | null;
  featured_image: string | null;
  category_name: string | null;
  category_slug: string | null;
}

// Map old query parameter values to new clean slugs
const CATEGORY_REDIRECTS: Record<string, string> = {
  cones: "speaker-cones",
  coils: "voice-coils",
  surrounds: "speaker-surrounds",
  spiders: "speaker-spiders",
  dustcaps: "dust-caps",
  terminals: "terminals",
  diaphragms: "diaphragms",
  tweeters: "diaphragms",
  tweeterparts: "diaphragms",
  frames: "speaker-frames",
  magnets: "magnets",
  subwoofers: "complete-speaker-components"
};

function ProductsCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(false);

  // Handle redirects for old category query parameters (e.g. ?cat=cones)
  useEffect(() => {
    const catParam = searchParams.get("cat");
    if (catParam && CATEGORY_REDIRECTS[catParam]) {
      router.replace(`/${CATEGORY_REDIRECTS[catParam]}`);
    }
  }, [searchParams, router]);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories?t=" + Date.now());
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter out hidden categories
          setCategories(data.filter(c => !c.is_hidden));
        }
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setLoadingCats(false);
      }
    }
    loadCategories();
  }, []);

  // Fetch search results on search term changes
  useEffect(() => {
    if (!search.trim()) {
      setProducts([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoadingProds(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(search)}&t=${Date.now()}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error searching products", err);
      } finally {
        setLoadingProds(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <div className="w-full">
      {/* Search Header Hero */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#EAEAEA]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-xs font-bold tracking-widest text-[#0F0F10] uppercase">B2B CATALOG</span>
            <h1 className="font-display text-3xl font-extrabold text-[#0F0F10] tracking-tight">
              OEM Speaker Components
            </h1>
            <p className="text-slate-500 text-xs max-w-lg font-light font-sans">
              Explore our line of export-quality speaker voice coils, cones, spiders, surrounds, dust caps, and custom assemblies.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full max-w-sm relative font-sans">
            <input
              type="text"
              placeholder="Search component catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F7F7F8] border border-[#EAEAEA] rounded-premium px-4 py-3 pl-10 text-xs text-[#0F0F10] outline-none focus:border-[#0F0F10] focus:bg-white transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-3 text-slate-450 hover:text-[#0F0F10] text-[10px] font-bold tracking-wider cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        {search.trim() ? (
          /* ─── SEARCH RESULTS VIEW ──────────────────────────────── */
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-[#EAEAEA] pb-2">
              <span>Search results for: <strong className="text-[#0F0F10] font-semibold">&quot;{search}&quot;</strong></span>
              <span>Found <strong className="text-[#0F0F10] font-semibold">{products.length}</strong> components</span>
            </div>

            {loadingProds ? (
              <div className="py-20 text-center text-xs text-slate-400 font-light">
                Searching database...
              </div>
            ) : products.length === 0 ? (
              <div className="border border-[#EAEAEA] bg-white p-16 text-center rounded-premium">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-500 font-light">No components match your search term.</p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 text-xs font-bold text-[#0F0F10] hover:text-accent-cyan cursor-pointer uppercase tracking-wider"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => {
                  const catSlug = product.category_slug || "uncategorized";
                  return (
                    <Link
                      key={product.id}
                      href={`/${catSlug}/${product.slug}`}
                      className="group bg-white border border-[#EAEAEA] rounded-premium overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      {/* Product Image */}
                      <div className="aspect-square overflow-hidden bg-[#F7F7F8]">
                        {product.featured_image ? (
                          <img
                            src={product.featured_image}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-[#EAEAEA]" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-1.5">
                        <span className="text-[9px] font-bold text-[#5C5C63] tracking-widest uppercase block">
                          {product.category_name || "Speaker Component"}
                        </span>
                        <h2 className="font-display font-bold text-sm text-[#0F0F10] leading-snug group-hover:text-accent-cyan transition-colors line-clamp-1">
                          {product.name}
                        </h2>
                        {product.short_desc && (
                          <p className="text-xs text-[#4A4A4F] line-clamp-2 font-light leading-normal">
                            {product.short_desc}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#5C5C63] pt-1 group-hover:text-accent-cyan transition-colors">
                          View Details
                          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ─── CATEGORY LIST VIEW ───────────────────────────────── */
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-[#EAEAEA] pb-2">
              <span>Browse by Category</span>
              <span>Total <strong className="text-[#0F0F10] font-semibold">{categories.length}</strong> categories</span>
            </div>

            {loadingCats ? (
              <div className="py-20 text-center text-xs text-slate-400 font-light">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="border border-[#EAEAEA] bg-white p-16 text-center rounded-premium">
                <p className="text-xs text-slate-500 font-light">No categories setup in the database yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/${category.slug}`}
                    className="group bg-white border border-[#EAEAEA] rounded-premium overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    {/* Header + Text */}
                    <div className="p-6 space-y-2.5">
                      <div className="flex justify-between items-start gap-4">
                        <h2 className="font-display font-extrabold text-lg text-[#0F0F10] tracking-tight group-hover:text-accent-cyan transition-colors leading-tight">
                          {category.name}
                        </h2>
                        <span className="shrink-0 inline-flex items-center px-2 py-1 rounded bg-[#F7F7F8] border border-[#EAEAEA] text-[9px] font-mono font-bold text-slate-500">
                          {category.product_count ?? 0} {category.product_count === 1 ? 'Part' : 'Parts'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-xs text-[#4A4A4F] font-light leading-relaxed line-clamp-3">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {/* Image if exists */}
                    {category.image_url ? (
                      <div className="aspect-[21/9] w-full overflow-hidden bg-[#F7F7F8] border-t border-[#EAEAEA]">
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="p-6 pt-0 flex items-center justify-end text-[10px] uppercase tracking-wider font-bold text-[#5C5C63] group-hover:text-accent-cyan transition-colors">
                        <span>Browse Catalog</span>
                        <ArrowRight size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F8]">
      <Suspense fallback={
        <div className="py-32 text-center text-xs text-slate-400 font-light">
          Loading catalog...
        </div>
      }>
        <ProductsCatalog />
      </Suspense>
    </main>
  );
}
