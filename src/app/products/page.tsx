"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Package, ArrowRight, Tag as TagIcon, Box as BoxIcon, MessageCircle, Info, SlidersHorizontal, Check } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

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
}

function ProductsCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { convertPrice } = useCurrency();

  // State
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>({});
  
  // Sidebar Filters State
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load categories and products on mount
  useEffect(() => {
    async function loadData() {
      setLoadingCats(true);
      setLoadingProds(true);
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetch("/api/categories?t=" + Date.now()),
          fetch("/api/products?t=" + Date.now())
        ]);
        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();
        
        if (Array.isArray(catsData)) {
          setCategories(catsData.filter(c => !c.is_hidden));
        }
        if (Array.isArray(prodsData)) {
          setAllProducts(prodsData);
        }
      } catch (err) {
        console.error("Error loading B2B catalog data", err);
      } finally {
        setLoadingCats(false);
        setLoadingProds(false);
      }
    }
    loadData();

    // Check query params
    const catQuery = searchParams.get("category");
    if (catQuery) {
      setSelectedCategorySlug(catQuery);
    }
  }, [searchParams]);

  // Extract unique Materials & Sizes dynamically from product variants
  const filterOptions = useMemo(() => {
    const materialsSet = new Set<string>();
    const sizesSet = new Set<string>();

    allProducts.forEach(p => {
      // Parse from variants specifications
      p.variants?.forEach(v => {
        if (v.specs) {
          Object.entries(v.specs).forEach(([key, val]) => {
            const k = key.toLowerCase();
            const valStr = String(val).trim();
            if (!valStr) return;

            if (k.includes("material")) {
              materialsSet.add(valStr);
            } else if (k.includes("diameter") || k.includes("size") || k.includes("dimension")) {
              sizesSet.add(valStr);
            }
          });
        }
      });
      // Parse tags for materials if variants are empty
      if (p.tags) {
        p.tags.forEach(t => {
          const tLower = t.toLowerCase();
          if (["carbon fiber", "kevlar", "paper", "foam", "rubber", "copper", "ccaw", "aluminum"].includes(tLower)) {
            materialsSet.add(t);
          }
        });
      }
    });

    return {
      materials: Array.from(materialsSet).sort(),
      sizes: Array.from(sizesSet).sort()
    };
  }, [allProducts]);

  // Handle inquiry cart additions
  const handleAddToInquiry = (product: Product) => {
    if (typeof window !== "undefined") {
      const storedStr = localStorage.getItem("gsp_enquiry_cart");
      const cart = storedStr ? JSON.parse(storedStr) : [];
      const exists = cart.some((item: any) => item.name === product.name);
      
      const price = getStartingPrice(product);
      const moq = getMOQ(product);
      const variantsStr = product.variants?.map((v: any) => v.name).join(", ") || "Standard";
      
      if (!exists) {
        const itemToAdd = {
          id: product.id,
          name: product.name,
          category: product.category_name || "Speaker Component",
          startingPrice: price,
          moq: moq,
          variants: variantsStr,
          date: new Date().toISOString().split("T")[0]
        };
        const updated = [...cart, itemToAdd];
        localStorage.setItem("gsp_enquiry_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("gsp_cart_updated"));
      }

      setAddedProducts(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedProducts(prev => ({ ...prev, [product.id]: false }));
      }, 2000);
    }
  };

  // Helper values extraction
  const getStartingPrice = (p: Product) => {
    if (p.variants && p.variants.length > 0) {
      const prices = p.variants.map(v => parseFloat(v.price as any)).filter(price => !isNaN(price));
      if (prices.length > 0) {
        return `$${Math.min(...prices).toFixed(2)}`;
      }
    }
    return "$1.80"; // fallback
  };

  const getMOQ = (p: Product) => {
    if (p.moq) return p.moq;
    if (p.variants) {
      for (const v of p.variants) {
        if (v.specs) {
          for (const [key, val] of Object.entries(v.specs)) {
            if (key.toLowerCase().includes("moq")) {
              return String(val);
            }
          }
        }
      }
    }
    return "1,000 units"; // default fallback
  };

  const getTolerance = (p: Product) => {
    if (p.variants) {
      for (const v of p.variants) {
        if (v.specs) {
          for (const [key, val] of Object.entries(v.specs)) {
            if (key.toLowerCase().includes("tolerance")) {
              return `TOLERANCE: ${String(val).toUpperCase()}.`;
            }
          }
        }
      }
    }
    return "TOLERANCE: ±0.15 MM THICKNESS BOUNDS.";
  };

  const getSpecsSummary = (p: Product) => {
    const specsList: string[] = [];
    const sizesSet = new Set<string>();
    const edgesSet = new Set<string>();
    const colorsSet = new Set<string>();
    
    p.variants?.forEach(v => {
      if (v.specs) {
        Object.entries(v.specs).forEach(([key, val]) => {
          const k = key.toLowerCase();
          const vStr = String(val).trim();
          if (!vStr) return;

          if (k.includes("diameter") || k.includes("size")) {
            sizesSet.add(vStr);
          } else if (k.includes("edge")) {
            edgesSet.add(vStr);
          } else if (k.includes("color")) {
            colorsSet.add(vStr);
          }
        });
      }
    });

    if (sizesSet.size > 0) specsList.push(`Sizes: ${Array.from(sizesSet).join(", ")}`);
    if (edgesSet.size > 0) specsList.push(`Edge: ${Array.from(edgesSet).join(", ")}`);
    if (colorsSet.size > 0) specsList.push(`Colors: ${Array.from(colorsSet).join(", ")}`);
    
    return specsList.join(" • ") || "Custom materials & sizing configurations available.";
  };

  // Toggle Filters Selection Helpers
  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials(prev => 
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      // Search term
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesDesc = p.short_desc?.toLowerCase().includes(term) ?? false;
        if (!matchesName && !matchesDesc) return false;
      }

      // Category
      if (selectedCategorySlug && p.category_slug !== selectedCategorySlug) {
        return false;
      }

      // Material
      if (selectedMaterials.length > 0) {
        let hasMat = false;
        // Check variants
        p.variants?.forEach(v => {
          if (v.specs) {
            Object.entries(v.specs).forEach(([key, val]) => {
              if (key.toLowerCase().includes("material") && selectedMaterials.includes(String(val).trim())) {
                hasMat = true;
              }
            });
          }
        });
        // Check tags
        if (p.tags) {
          p.tags.forEach(t => {
            if (selectedMaterials.includes(t)) hasMat = true;
          });
        }
        if (!hasMat) return false;
      }

      // Size
      if (selectedSizes.length > 0) {
        let hasSize = false;
        p.variants?.forEach(v => {
          if (v.specs) {
            Object.entries(v.specs).forEach(([key, val]) => {
              if ((key.toLowerCase().includes("diameter") || key.toLowerCase().includes("size")) && selectedSizes.includes(String(val).trim())) {
                hasSize = true;
              }
            });
          }
        });
        if (!hasSize) return false;
      }

      return true;
    });
  }, [allProducts, search, selectedCategorySlug, selectedMaterials, selectedSizes]);

  return (
    <div className="w-full">
      {/* Search Header Hero */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-black">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] font-bold tracking-widest text-[#0F0F10] uppercase">B2B CATALOG EXPLORER</span>
            <h1 className="font-display text-3xl font-extrabold text-[#0F0F10] tracking-tight uppercase">
              OEM Speaker Components
            </h1>
            <p className="text-slate-550 text-xs max-w-lg font-light font-sans">
              Filter by material, size, or category to discover high‑temperature voice coils, Kevlar/carbon composite cones, and export‑ready spiders.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full max-w-sm relative font-sans flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search components..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F7F7F8] border border-black rounded-lg px-4 py-3 pl-10 text-xs text-[#0F0F10] outline-none focus:border-black focus:bg-white transition-all placeholder:text-slate-400"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-black text-[10px] font-bold tracking-wider cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Mobile Filters Toggle */}
            <button
              onClick={() => setShowMobileFilters(prev => !prev)}
              className="lg:hidden p-3 border border-black rounded-lg bg-[#F7F7F8] hover:bg-white text-black shrink-0"
              aria-label="Toggle Filters"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ─── SIDEBAR FILTERS (DESKTOP) ────────────────────────── */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="border border-black bg-white p-5 rounded-lg space-y-5">
              <div className="flex justify-between items-center border-b border-black pb-2.5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-black">Filter Selection</h3>
                {(selectedCategorySlug || selectedMaterials.length > 0 || selectedSizes.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedCategorySlug("");
                      setSelectedMaterials([]);
                      setSelectedSizes([]);
                    }}
                    className="text-[9px] font-bold text-red-600 hover:underline uppercase tracking-wide"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-405">Category</h4>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setSelectedCategorySlug("")}
                    className={`text-left text-xs py-1 px-2 rounded-md transition-colors ${
                      !selectedCategorySlug ? "bg-black text-white font-bold" : "text-slate-800 hover:bg-slate-50 hover:text-black"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      className={`text-left text-xs py-1 px-2 rounded-md transition-colors flex justify-between items-center ${
                        selectedCategorySlug === cat.slug ? "bg-black text-white font-bold" : "text-slate-800 hover:bg-slate-50 hover:text-black"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        selectedCategorySlug === cat.slug ? "bg-white text-black" : "bg-slate-100 text-slate-500"
                      }`}>
                        {cat.product_count ?? 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Materials */}
              {filterOptions.materials.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Material</h4>
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {filterOptions.materials.map(mat => (
                      <label key={mat} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedMaterials.includes(mat)}
                          onChange={() => handleMaterialToggle(mat)}
                          className="rounded border-slate-300 text-black focus:ring-black h-3.5 w-3.5"
                        />
                        <span>{mat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {filterOptions.sizes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Sizing / Dimensions</h4>
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {filterOptions.sizes.map(sz => (
                      <label key={sz} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(sz)}
                          onChange={() => handleSizeToggle(sz)}
                          className="rounded border-slate-300 text-black focus:ring-black h-3.5 w-3.5"
                        />
                        <span>{sz}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ─── MOBILE FILTERS DRAWERS (ACCORDION TYPE) ──────────── */}
          {showMobileFilters && (
            <div className="lg:hidden border border-black bg-white p-4 rounded-lg space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-black pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-black">Active Filters</h3>
                <button
                  onClick={() => {
                    setSelectedCategorySlug("");
                    setSelectedMaterials([]);
                    setSelectedSizes([]);
                    setShowMobileFilters(false);
                  }}
                  className="text-[9px] font-bold text-red-600 uppercase"
                >
                  Clear All
                </button>
              </div>

              {/* Mobile Category */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategorySlug("")}
                    className={`text-[10px] py-1 px-2.5 rounded-full border transition-all ${
                      !selectedCategorySlug ? "bg-black text-white border-black" : "bg-slate-50 border-slate-200 text-slate-650"
                    }`}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      className={`text-[10px] py-1 px-2.5 rounded-full border transition-all ${
                        selectedCategorySlug === cat.slug ? "bg-black text-white border-black" : "bg-slate-50 border-slate-200 text-slate-650"
                      }`}
                    >
                      {cat.name} ({cat.product_count ?? 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Material */}
              {filterOptions.materials.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Materials</span>
                  <div className="flex flex-wrap gap-1">
                    {filterOptions.materials.map(mat => (
                      <button
                        key={mat}
                        onClick={() => handleMaterialToggle(mat)}
                        className={`text-[9px] py-1 px-2.5 rounded-md border transition-all ${
                          selectedMaterials.includes(mat) ? "bg-black text-white border-black" : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Size */}
              {filterOptions.sizes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Sizes</span>
                  <div className="flex flex-wrap gap-1">
                    {filterOptions.sizes.map(sz => (
                      <button
                        key={sz}
                        onClick={() => handleSizeToggle(sz)}
                        className={`text-[9px] py-1 px-2.5 rounded-md border transition-all ${
                          selectedSizes.includes(sz) ? "bg-black text-white border-black" : "bg-slate-50 border-slate-200 text-slate-650"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── PRODUCT LIST GRID (100% SUPABASE SYNCED) ─────────── */}
          <section className="flex-1 space-y-6">
            <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span>Showing <strong className="text-black font-semibold">{filteredProducts.length}</strong> OEM speaker components</span>
              {loadingProds && <span>Syncing Supabase database...</span>}
            </div>

            {loadingProds ? (
              <div className="py-24 text-center text-xs text-slate-400 font-light">
                Syncing product database with Supabase...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="border border-black bg-white p-20 text-center rounded-lg">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-500 font-light">No OEM components found matching the selected filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategorySlug("");
                    setSelectedMaterials([]);
                    setSelectedSizes([]);
                    setSearch("");
                  }}
                  className="mt-4 text-xs font-bold text-black hover:underline uppercase tracking-wider"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => {
                  const catSlug = product.category_slug || "uncategorized";
                  const startPrice = getStartingPrice(product);
                  const moqVal = getMOQ(product);
                  const toleranceVal = getTolerance(product);
                  const specsStr = getSpecsSummary(product);
                  const isJustAdded = addedProducts[product.id];

                  // PREFILL WHATSAPP LINK
                  const whatsappMsg = encodeURIComponent(
                    `Hi, I'm interested in "${product.name}" from Global Speaker Parts. Please share pricing and technical specifications.`
                  );
                  const whatsappUrl = `https://wa.me/919829062390?text=${whatsappMsg}`;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white border border-black rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col justify-between h-full"
                    >
                      {/* Product Image - SQUARE with border padding */}
                      <div className="p-2 bg-[#F7F7F8] border-b border-black">
                        <div className="relative w-full aspect-square rounded-lg border border-black bg-white flex items-center justify-center overflow-hidden p-2">
                          {product.featured_image ? (
                            <img
                              src={product.featured_image}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-103 transition-transform duration-300"
                            />
                          ) : (
                            <Package className="h-12 w-12 text-[#EAEAEA]" />
                          )}
                          {/* CAD: READY Badging */}
                          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs border border-black px-2 py-0.5 rounded text-[8px] font-mono font-bold text-black uppercase tracking-wider shadow-xs select-none">
                            CAD: READY
                          </div>
                        </div>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          {/* Upper Category */}
                          <span className="text-[9px] font-bold text-[#5C5C63] tracking-widest uppercase block">
                            {product.category_name || "Speaker Component"}
                          </span>
                          
                          {/* Product Title */}
                          <Link href={`/${catSlug}/${product.slug}`}>
                            <h2 className="font-display font-black text-base text-[#0F0F10] leading-snug group-hover:text-accent-cyan transition-colors uppercase tracking-tight">
                              {product.name}
                            </h2>
                          </Link>
                          
                          {/* Short Description */}
                          {product.short_desc && (
                            <p className="text-xs text-[#4A4A4F] line-clamp-3 font-light leading-relaxed">
                              {product.short_desc}
                            </p>
                          )}
                        </div>

                        {/* Specs Section */}
                        <div className="mt-5 pt-3.5 border-t border-[#EAEAEA]/80 space-y-2">
                          {/* Price */}
                          <div className="flex items-center justify-between text-xs font-sans">
                            <span className="text-slate-500 font-light flex items-center gap-1.5">
                              <TagIcon size={12} className="text-slate-400 shrink-0" />
                              Starting Price:
                            </span>
                            <span className="font-bold text-[#0f0f10] text-[13px]">
                              {convertPrice(startPrice)} / unit
                            </span>
                          </div>

                          {/* MOQ */}
                          <div className="flex items-center justify-between text-xs font-sans">
                            <span className="text-slate-500 font-light flex items-center gap-1.5">
                              <BoxIcon size={12} className="text-slate-400 shrink-0" />
                              MOQ:
                            </span>
                            <span className="font-bold text-[#0f0f10]">
                              {moqVal}
                            </span>
                          </div>

                          {/* Dimensions & Edges Line */}
                          {specsStr && (
                            <p className="text-[10px] text-slate-500 italic leading-snug pt-1">
                              {specsStr}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Specs Bar */}
                      <div className="px-4 py-2 border-t border-black bg-slate-50/50 flex items-center justify-between select-none">
                        <span className="text-[9px] text-slate-500 uppercase tracking-tight font-sans">
                          {toleranceVal}
                        </span>
                        <Link
                          href={`/${catSlug}/${product.slug}`}
                          className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-[#0F0F10] hover:text-accent-cyan transition-colors"
                        >
                          Specs / RFQ
                          <Info size={11} className="text-[#0F0F10]" />
                        </Link>
                      </div>

                      {/* Double B2B Actions Panel */}
                      <div className="grid grid-cols-2 border-t border-black p-2 bg-white gap-2">
                        {/* Add to Inquiry */}
                        <button
                          onClick={() => handleAddToInquiry(product)}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-[10px] font-bold tracking-wider rounded-lg border border-black transition-all uppercase cursor-pointer select-none ${
                            isJustAdded
                              ? "bg-[#25D366] text-white border-[#25D366]"
                              : "bg-black text-white hover:bg-white hover:text-black"
                          }`}
                        >
                          {isJustAdded ? <Check size={12} /> : null}
                          {isJustAdded ? "Added!" : "Add To Inquiry"}
                        </button>

                        {/* Contact Us WhatsApp */}
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-[10px] font-bold tracking-wider rounded-lg border border-black bg-white text-black hover:bg-slate-50 transition-all uppercase"
                        >
                          <MessageCircle size={13} className="text-[#25D366]" />
                          Contact Us
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
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
