"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  BarChart3, FileText, Cpu, Globe, Search, Truck, Box, Plus, Lock, ShieldAlert, X, Upload,
  Edit, Trash2, Eye, EyeOff, Star, ChevronDown, ChevronUp, Save, Copy, ArrowLeft, Layers, Tag, Settings, Image as ImageIcon, HelpCircle, Download, GripVertical
} from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabaseClient";


// ─── Types ───────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_hidden: boolean;
  sort_order: number;
  seo_meta: Record<string, string> | null;
  product_count?: number;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_desc: string | null;
  long_desc: string | null;
  featured_image: string | null;
  is_hidden: boolean;
  is_featured: boolean;
  seo_meta: Record<string, string> | null;
  tags: string[] | null;
  applications: string | null;
  price: number | null;
  technical_specs: Record<string, string> | null;
  media_urls: string[] | null;
  sort_order: number;
  moq: string | null;
  category?: { name: string; slug: string };
  gallery?: string[];
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
  part_numbers?: PartNumber[];
}

interface PartNumber {
  id: string;
  variant_id: string;
  code: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  order_index: number;
}

interface DownloadItem {
  id: string;
  product_id: string;
  type: string;
  url: string;
  title: string | null;
}

interface FAQ {
  id: string;
  product_id: string;
  question: string;
  answer: string;
  order_index: number;
}

// ─── Helper: Generate slug ───────────────────────────────────────
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ─── Reusable Input Component ────────────────────────────────────
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-bold text-slate-400 uppercase tracking-wider text-[9px] font-sans">
        {label} {required && "*"}
      </label>
      {children}
    </div>
  );
}

const inputClass = "bg-[#F7F7F8] border border-[#EAEAEA] rounded-lg px-3 py-2.5 text-xs text-[#0F0F10] outline-none focus:border-[#0F0F10] focus:bg-white transition-all font-sans";
const btnPrimary = "btn-primary inline-flex items-center justify-center px-4 py-2.5 text-[10px] font-bold tracking-wider cursor-pointer gap-1.5";
const btnSecondary = "btn-secondary inline-flex items-center justify-center px-4 py-2 text-[10px] font-bold tracking-wider cursor-pointer gap-1.5";
const btnDanger = "inline-flex items-center justify-center px-3 py-2 text-[10px] font-bold tracking-wider cursor-pointer gap-1 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-all";

// ═══════════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function AdminPage() {
  // Auth
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  // Navigation
  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "products" | "inquiries" | "settings">("overview");

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [showProdForm, setShowProdForm] = useState(false);
  const [prodCategoryFilter, setProdCategoryFilter] = useState("");
  const [prodSearch, setProdSearch] = useState("");

  // Product detail editing
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailVariants, setDetailVariants] = useState<Variant[]>([]);
  const [detailImages, setDetailImages] = useState<ProductImage[]>([]);
  const [detailDownloads, setDetailDownloads] = useState<DownloadItem[]>([]);
  const [detailFaqs, setDetailFaqs] = useState<FAQ[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Inquiries
  const [inquiries, setInquiries] = useState<Record<string, string>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Settings
  const [whatsappNumber, setWhatsappNumber] = useState("+91 9214361550");

  // ─── Auth ────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("gsp_admin_authenticated") === "true") {
        setIsAuthenticated(true);
      }
      const storedWhatsapp = localStorage.getItem("gsp_whatsapp_number");
      if (storedWhatsapp) setWhatsappNumber(storedWhatsapp);
      const storedInq = localStorage.getItem("gsp_inquiries");
      if (storedInq) {
        try { setInquiries(JSON.parse(storedInq)); } catch {}
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "zaidgsp2026";
    if (passcode === correctPasscode) {
      sessionStorage.setItem("gsp_admin_authenticated", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Access Denied: Invalid Security Passcode.");
    }
  };

  // ─── Fetch Categories ────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res = await fetch("/api/categories?t=" + Date.now());
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) { console.error("Error fetching categories", err); }
    setCatLoading(false);
  }, []);

  // ─── Fetch Products ──────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setProdLoading(true);
    try {
      let url = "/api/products?t=" + Date.now() + "&includeHidden=true";
      if (prodCategoryFilter) url += "&category=" + prodCategoryFilter;
      if (prodSearch) url += "&search=" + encodeURIComponent(prodSearch);
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) { console.error("Error fetching products", err); }
    setProdLoading(false);
  }, [prodCategoryFilter, prodSearch]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchProducts();
    }
  }, [isAuthenticated, fetchCategories, fetchProducts]);

  // ─── Category CRUD ───────────────────────────────────────────────
  const saveCat = async (cat: Partial<Category>) => {
    try {
      const url = editingCat?.id ? `/api/categories/${editingCat.slug}` : "/api/categories";
      const method = editingCat?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save category");
      }
      setShowCatForm(false);
      setEditingCat(null);
      fetchCategories();
    } catch (err) {
      console.error("Error saving category", err);
      alert(err instanceof Error ? err.message : "Unable to save category");
    }
  };

  const deleteCat = async (slug: string) => {
    if (!confirm("Delete this category? Products inside will NOT be deleted but will become uncategorized.")) return;
    try {
      await fetch(`/api/categories/${slug}`, { method: "DELETE" });
      fetchCategories();
    } catch (err) { console.error("Error deleting category", err); }
  };

  const toggleCatVisibility = async (cat: Category) => {
    await fetch(`/api/categories/${cat.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_hidden: !cat.is_hidden })
    });
    fetchCategories();
  };

  // ─── Product CRUD ────────────────────────────────────────────────
  const saveProd = async (prod: Partial<Product>) => {
    try {
      const url = editingProd?.id ? `/api/products/${editingProd.slug}` : "/api/products";
      const method = editingProd?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prod)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save product");
      }
      setShowProdForm(false);
      setEditingProd(null);
      fetchProducts();
      if (detailProduct && (editingProd?.id === detailProduct.id || prod.id === detailProduct.id)) {
        const nextSlug = prod.slug || detailProduct.slug;
        loadProductDetail(nextSlug);
      }
    } catch (err) {
      console.error("Error saving product", err);
      alert(err instanceof Error ? err.message : "Unable to save product");
    }
  };

  const deleteProd = async (slug: string) => {
    if (!confirm("Delete this product and all its variants, images, and related data?")) return;
    try {
      await fetch(`/api/products/${slug}`, { method: "DELETE" });
      fetchProducts();
      setDetailProduct(null);
    } catch (err) { console.error("Error deleting product", err); }
  };

  const toggleProdVisibility = async (prod: Product) => {
    await fetch(`/api/products/${prod.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_hidden: !prod.is_hidden })
    });
    fetchProducts();
  };

  const toggleProdFeatured = async (prod: Product) => {
    await fetch(`/api/products/${prod.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: !prod.is_featured })
    });
    fetchProducts();
  };

  const duplicateProd = async (prod: Product) => {
    const newSlug = prod.slug + "-copy-" + Date.now().toString(36);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...prod,
        id: undefined,
        name: prod.name + " (Copy)",
        slug: newSlug,
        category_id: prod.category_id
      })
    });
    fetchProducts();
  };

  // ─── Product Detail Loading ──────────────────────────────────────
  const loadProductDetail = async (slug: string) => {
    try {
      const res = await fetch(`/api/products/${slug}?t=${Date.now()}`);
      const data = await res.json();
      setDetailProduct(data);
      setDetailVariants(data.variants || []);
      setDetailImages(data.images || []);
      setDetailDownloads(data.downloads || []);
      setDetailFaqs(data.faqs || []);
    } catch (err) { console.error("Error loading product detail", err); }
  };

  // ─── Variant CRUD ────────────────────────────────────────────────
  const saveVariant = async (variant: Partial<Variant>) => {
    try {
      if (variant.id) {
        await fetch(`/api/variants/${variant.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variant)
        });
      } else {
        await fetch("/api/variants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variant)
        });
      }
      if (detailProduct) loadProductDetail(detailProduct.slug);
    } catch (err) { console.error("Error saving variant", err); }
  };

  const deleteVariant = async (id: string) => {
    if (!confirm("Delete this variant and its part numbers?")) return;
    try {
      await fetch(`/api/variants/${id}`, { method: "DELETE" });
      if (detailProduct) loadProductDetail(detailProduct.slug);
    } catch (err) { console.error("Error deleting variant", err); }
  };

  // ─── Part Number CRUD ────────────────────────────────────────────
  const addPartNumber = async (variantId: string, code: string) => {
    try {
      await fetch("/api/part-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId, code })
      });
      if (detailProduct) loadProductDetail(detailProduct.slug);
    } catch (err) { console.error("Error adding part number", err); }
  };

  const deletePartNumber = async (id: string) => {
    try {
      await fetch("/api/part-numbers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (detailProduct) loadProductDetail(detailProduct.slug);
    } catch (err) { console.error("Error deleting part number", err); }
  };

  // ─── Image CRUD ──────────────────────────────────────────────────
  const addImage = async (productId: string, url: string, altText: string) => {
    try {
      await fetch("/api/product-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, url, alt_text: altText, order_index: detailImages.length })
      });
      if (detailProduct) loadProductDetail(detailProduct.slug);
    } catch (err) { console.error("Error adding image", err); }
  };

  const handleMediaUpload = async (productId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const timestamp = Date.now();
        const uniqueName = `${timestamp}-${safeName}`;

        const { data, error } = await supabase.storage
          .from('media')
          .upload(uniqueName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(uniqueName);

        await addImage(productId, publicUrlData.publicUrl, safeName);
      }
    } catch (err: any) {
      console.error("Error uploading media", err);
      alert("Media upload failed: " + (err.message || err));
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (id: string) => {
    try {
      await fetch("/api/product-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (detailProduct) loadProductDetail(detailProduct.slug);
    } catch (err) { console.error("Error deleting image", err); }
  };

  // ─── Download CRUD ───────────────────────────────────────────────
  const addDownload = async (productId: string, type: string, url: string, title: string) => {
    try {
      await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, type, url, title })
      });
      if (detailProduct) loadProductDetail(detailProduct.slug);
    } catch (err) { console.error("Error adding download", err); }
  };

  const deleteDownload = async (id: string) => {
    try {
      await fetch("/api/downloads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (detailProduct) loadProductDetail(detailProduct.slug);
    } catch (err) { console.error("Error deleting download", err); }
  };

  // ─── FAQ CRUD ────────────────────────────────────────────────────
  const addFaq = async (productId: string, question: string, answer: string) => {
    try {
      await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, question, answer, order_index: detailFaqs.length })
      });
      if (detailProduct) loadProductDetail(detailProduct.slug);
    } catch (err) { console.error("Error adding FAQ", err); }
  };

  const deleteFaq = async (id: string) => {
    try {
      await fetch("/api/faqs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (detailProduct) loadProductDetail(detailProduct.slug);
    } catch (err) { console.error("Error deleting FAQ", err); }
  };

  // ─── Inquiry helpers ─────────────────────────────────────────────
  const handleUpdateStatus = (id: string, newStatus: string) => {
    setInquiries(prev => {
      const updated = prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq);
      if (typeof window !== "undefined") localStorage.setItem("gsp_inquiries", JSON.stringify(updated));
      return updated;
    });
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      return (inq.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inq.contact || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inq.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [inquiries, searchQuery]);

  // ═══════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-premium-dusty flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans pt-24">
        <div className="w-full max-w-md relative z-10">
          <form onSubmit={handleLogin} className="glass-panel p-8 rounded-premium shadow-2xl space-y-6 flex flex-col items-center border border-white/40">
            <div className="w-full flex justify-center mb-2">
              <Logo className="h-11" variant="primary" />
            </div>
            <div className="text-center space-y-1.5 w-full">
              <h2 className="font-display text-sm font-extrabold text-[#0F0F10] uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Lock className="w-4 h-4 text-[#5C5C63]" />
                <span>Admin Authentication</span>
              </h2>
              <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                Private Access • Authorized Personnel Only
              </p>
            </div>
            {error && (
              <div className="w-full p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-red-650" />
                <span>{error}</span>
              </div>
            )}
            <div className="w-full flex flex-col gap-1.5">
              <label htmlFor="passcode-input" className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block font-sans">
                Enter Security Passcode
              </label>
              <input type="password" id="passcode-input" required value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full bg-[#F7F7F8] border border-[#EAEAEA] rounded-premium px-4 py-3 text-xs text-[#0F0F10] outline-none focus:border-[#0F0F10] focus:bg-white transition-all font-light tracking-widest" placeholder="••••••••••••" />
            </div>
            <button type="submit" className="w-full btn-primary py-3 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2">
              <span>ACCESS CONSOLE</span>
            </button>
            <div className="w-full border-t border-[#EAEAEA] pt-4 text-center">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block leading-relaxed">
                SECURED SYSTEM • EST. 2001 • JAIPUR INDIA
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-body-slate font-sans pt-12 pb-20">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[#EAEAEA] bg-white p-6 rounded-premium">
          <div>
            <div className="flex items-center gap-2 text-[#5C5C63] text-xs font-bold uppercase tracking-widest mb-1">
              <Box className="w-4.5 h-4.5" />
              <span>Back Office Console</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F0F10] tracking-tight">
              B2B Administration Hub
            </h1>
            <p className="text-slate-400 text-xs font-light">
              GLOBAL SPEAKER PARTS — Product Catalog CMS
            </p>
          </div>
          <div className="text-[10px] font-mono text-slate-500 bg-[#F7F7F8] border border-[#EAEAEA] px-3 py-2 rounded-lg">
            🔐 session: secure_ssl • admin_level: 1
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <div className="lg:col-span-3 bg-white border border-border-cool p-4 rounded-premium shadow-soft space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-3 mb-2.5">
            DASHBOARD INDEX
          </span>
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "categories", label: "Categories", icon: Layers },
            { id: "products", label: "Products", icon: Cpu },
            { id: "inquiries", label: "RFQs & Inquiries", icon: FileText },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as typeof activeTab); setDetailProduct(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? "bg-bg-snow text-primary-midnight border-l-3 border-primary-midnight"
                    : "text-slate-400 hover:bg-bg-snow/50 hover:text-primary-midnight border-l-3 border-transparent"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isSelected ? "text-accent-cyan" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.id === "categories" && categories.length > 0 && (
                  <span className="ml-auto text-[9px] bg-[#F7F7F8] border border-[#EAEAEA] rounded px-1.5 py-0.5 font-mono">{categories.length}</span>
                )}
                {tab.id === "products" && products.length > 0 && (
                  <span className="ml-auto text-[9px] bg-[#F7F7F8] border border-[#EAEAEA] rounded px-1.5 py-0.5 font-mono">{products.length}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-9 space-y-8">

          {/* ─── OVERVIEW TAB ─────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Categories", value: categories.length.toString(), icon: Layers, change: "Total categories" },
                  { label: "Products", value: products.length.toString(), icon: Cpu, change: "Total products" },
                  { label: "Active RFQs", value: inquiries.length.toString(), icon: FileText, change: inquiries.length > 0 ? "In queue" : "No active requests" },
                  { label: "Featured", value: products.filter(p => p.is_featured).length.toString(), icon: Star, change: "Featured products" },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-border-cool p-5 rounded-premium shadow-soft flex flex-col justify-between min-h-[125px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      <stat.icon className="w-5 h-5 text-slate-400 shrink-0" />
                    </div>
                    <div className="mt-4">
                      <div className="font-numbers text-2xl font-semibold text-primary-midnight leading-none">{stat.value}</div>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">{stat.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── CATEGORIES TAB ───────────────────────────────────────── */}
          {activeTab === "categories" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-[#EAEAEA] rounded-premium p-6">
                <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-5 mb-6">
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#0F0F10] uppercase tracking-wider">Category Manager</h3>
                    <p className="text-[10px] text-slate-400 font-light">Create, edit, reorder and manage product categories.</p>
                  </div>
                  <button onClick={() => { setEditingCat(null); setShowCatForm(true); }} className={btnPrimary}>
                    <Plus className="w-3.5 h-3.5" /> ADD CATEGORY
                  </button>
                </div>

                {catLoading ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">No categories yet. Click &quot;Add Category&quot; to create one.</div>
                ) : (
                  <div className="space-y-3">
                    {categories.map(cat => (
                      <div key={cat.id} className={`flex items-center justify-between p-4 rounded-lg border ${cat.is_hidden ? 'border-red-200 bg-red-50/30' : 'border-[#EAEAEA] bg-white'} hover:border-[#D6D6D8] transition-all`}>
                        <div className="flex items-center gap-4">
                          <GripVertical className="w-4 h-4 text-slate-300" />
                          {cat.image_url && (
                            <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border border-[#EAEAEA]" />
                          )}
                          <div>
                            <h4 className="text-sm font-bold text-[#0F0F10]">{cat.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">/{cat.slug} • {cat.product_count ?? 0} products</p>
                          </div>
                          {cat.is_hidden && (
                            <span className="text-[8px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">Hidden</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleCatVisibility(cat)} className="p-1.5 rounded hover:bg-[#F7F7F8] text-slate-400 hover:text-[#0F0F10] cursor-pointer" title={cat.is_hidden ? "Show" : "Hide"}>
                            {cat.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button onClick={() => { setEditingCat(cat); setShowCatForm(true); }} className="p-1.5 rounded hover:bg-[#F7F7F8] text-slate-400 hover:text-[#0F0F10] cursor-pointer" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteCat(cat.slug)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Form Modal */}
              {showCatForm && <CategoryFormModal category={editingCat} categories={categories} onSave={saveCat} onClose={() => { setShowCatForm(false); setEditingCat(null); }} />}
            </div>
          )}

          {/* ─── PRODUCTS TAB ─────────────────────────────────────────── */}
          {activeTab === "products" && !detailProduct && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-[#EAEAEA] rounded-premium p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAEAEA] pb-5 mb-6">
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#0F0F10] uppercase tracking-wider">Product Manager</h3>
                    <p className="text-[10px] text-slate-400 font-light">Full CRUD: create, edit, duplicate, hide/show, feature products.</p>
                  </div>
                  <button onClick={() => { setEditingProd(null); setShowProdForm(true); }} className={btnPrimary}>
                    <Plus className="w-3.5 h-3.5" /> ADD PRODUCT
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="relative">
                    <input type="text" placeholder="Search products..." value={prodSearch} onChange={e => setProdSearch(e.target.value)} className={`${inputClass} pl-8 w-[220px]`} />
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <select value={prodCategoryFilter} onChange={e => setProdCategoryFilter(e.target.value)} className={`${inputClass} cursor-pointer`}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>

                {prodLoading ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Loading products...</div>
                ) : products.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">No products found. Click &quot;Add Product&quot; to create one.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F7F7F8] text-[#0F0F10] font-bold border-b border-[#EAEAEA]">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAEAEA]">
                        {products.map(prod => (
                          <tr key={prod.id} className="hover:bg-[#F7F7F8]/50">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                {prod.featured_image && (
                                  <img src={prod.featured_image} alt={prod.name} className="w-10 h-10 rounded object-cover border border-[#EAEAEA]" />
                                )}
                                <div>
                                  <button onClick={() => loadProductDetail(prod.slug)} className="text-sm font-bold text-[#0F0F10] hover:text-accent-cyan cursor-pointer text-left">{prod.name}</button>
                                  <p className="text-[10px] text-slate-400 font-mono">/{prod.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-500">{prod.category?.name || "—"}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                {prod.is_hidden && <span className="text-[8px] font-bold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase">Hidden</span>}
                                {prod.is_featured && <span className="text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">Featured</span>}
                                {!prod.is_hidden && !prod.is_featured && <span className="text-[8px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded uppercase">Active</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1 justify-end">
                                <button onClick={() => { setEditingProd(prod); setShowProdForm(true); }} className="p-1.5 rounded hover:bg-[#F7F7F8] text-slate-400 hover:text-accent-cyan cursor-pointer" title="Edit Product Info"><Settings className="w-3.5 h-3.5" /></button>
                                <button onClick={() => loadProductDetail(prod.slug)} className="p-1.5 rounded hover:bg-[#F7F7F8] text-slate-400 hover:text-accent-cyan cursor-pointer" title="Edit Details"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => toggleProdFeatured(prod)} className="p-1.5 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-500 cursor-pointer" title={prod.is_featured ? "Unfeature" : "Feature"}><Star className={`w-3.5 h-3.5 ${prod.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} /></button>
                                <button onClick={() => toggleProdVisibility(prod)} className="p-1.5 rounded hover:bg-[#F7F7F8] text-slate-400 hover:text-[#0F0F10] cursor-pointer" title={prod.is_hidden ? "Show" : "Hide"}>{prod.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                                <button onClick={() => duplicateProd(prod)} className="p-1.5 rounded hover:bg-[#F7F7F8] text-slate-400 hover:text-[#0F0F10] cursor-pointer" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteProd(prod.slug)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {showProdForm && <ProductFormModal product={editingProd} categories={categories} onSave={saveProd} onClose={() => { setShowProdForm(false); setEditingProd(null); }} />}
            </div>
          )}

          {/* ─── PRODUCT DETAIL EDITOR ────────────────────────────────── */}
          {activeTab === "products" && detailProduct && (
            <ProductDetailEditor
              product={detailProduct}
              variants={detailVariants}
              images={detailImages}
              downloads={detailDownloads}
              faqs={detailFaqs}
              categories={categories}
              onBack={() => setDetailProduct(null)}
              onSaveProduct={async (data) => { await saveProd(data); if (detailProduct) loadProductDetail(detailProduct.slug); }}
              onEditProduct={(prod) => {
                setEditingProd(prod);
                setShowProdForm(true);
              }}
              onUploadMedia={handleMediaUpload}
              isUploading={isUploading}
              onSaveVariant={saveVariant}
              onDeleteVariant={deleteVariant}
              onAddPartNumber={addPartNumber}
              onDeletePartNumber={deletePartNumber}
              onAddImage={addImage}
              onDeleteImage={deleteImage}
              onAddDownload={addDownload}
              onDeleteDownload={deleteDownload}
              onAddFaq={addFaq}
              onDeleteFaq={deleteFaq}
            />
          )}

          {/* ─── INQUIRIES TAB ────────────────────────────────────────── */}
          {activeTab === "inquiries" && (
            <div className="bg-white border border-border-cool rounded-premium shadow-soft overflow-hidden animate-fade-in space-y-6 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-border-cool pb-5">
                <div>
                  <h3 className="font-display text-sm font-bold text-primary-midnight uppercase tracking-wider">Wholesale Quote Request Inbox</h3>
                  <p className="text-[10px] text-slate-400 font-light">Manage and review global manufacturer technical requests.</p>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Search company..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-8`} />
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-bg-snow text-primary-midnight font-bold border-b border-border-cool">
                    <tr>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Parts</th>
                      <th className="px-4 py-3">Volume</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-cool text-slate-700">
                    {filteredInquiries.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No inquiries.</td></tr>
                    ) : filteredInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-bg-snow/30">
                        <td className="px-4 py-4"><strong className="text-primary-midnight font-bold block">{inq.company}</strong><span className="text-[10px] text-slate-500 block">{inq.contact}</span></td>
                        <td className="px-4 py-4">{inq.category}</td>
                        <td className="px-4 py-4 font-light">{inq.quantity}</td>
                        <td className="px-4 py-4 text-slate-400">{inq.date}</td>
                        <td className="px-4 py-4"><span className="text-[9px] font-bold text-highlight-royal bg-bg-snow border border-border-cool px-2 py-0.5 rounded uppercase">{inq.status}</span></td>
                        <td className="px-4 py-4">
                          <select value={inq.status} onChange={(e) => handleUpdateStatus(inq.id, e.target.value)} className="bg-white border border-border-cool rounded px-2 py-1 text-[10px] cursor-pointer">
                            <option value="Pending Engineering Review">Review</option>
                            <option value="Quoted">Quoted</option>
                            <option value="Samples in Transit">In Transit</option>
                            <option value="Samples Approved">Approved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── SETTINGS TAB ─────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="bg-white border border-border-cool p-6 rounded-premium shadow-soft space-y-4 animate-fade-in">
              <h3 className="font-display text-sm font-bold text-primary-midnight uppercase tracking-wider border-b border-border-cool pb-3">B2B Channel Settings</h3>
              <FormField label="Global WhatsApp Contact Number">
                <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className={inputClass} placeholder="+91 9214361550" />
              </FormField>
              <button onClick={() => { localStorage.setItem("gsp_whatsapp_number", whatsappNumber); alert("Settings saved!"); }} className={btnPrimary}>
                <Save className="w-3.5 h-3.5" /> SAVE SETTINGS
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CATEGORY FORM MODAL
// ═══════════════════════════════════════════════════════════════════
function CategoryFormModal({ category, onSave, onClose }: {
  category: Category | null;
  categories: Category[];
  onSave: (cat: Partial<Category>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    image_url: category?.image_url || "",
    sort_order: category?.sort_order ?? 0,
    is_hidden: category?.is_hidden ?? false,
    seo_meta: {
      title: category?.seo_meta?.title || "",
      description: category?.seo_meta?.description || "",
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description || null,
      image_url: form.image_url || null,
      sort_order: form.sort_order,
      is_hidden: form.is_hidden,
      seo_meta: form.seo_meta.title || form.seo_meta.description ? form.seo_meta : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0F10]/50 backdrop-blur-sm">
      <div className="bg-white border border-[#D6D6D8] w-full max-w-lg rounded-premium shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-4 mb-4">
          <h3 className="font-display text-sm font-bold text-[#0F0F10] uppercase tracking-wider">{category ? "Edit Category" : "New Category"}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F7F7F8] text-slate-400 hover:text-[#0F0F10] cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <FormField label="Category Name" required>
            <input type="text" required value={form.name} onChange={e => { setForm({ ...form, name: e.target.value, slug: category ? form.slug : generateSlug(e.target.value) }); }} className={inputClass} placeholder="e.g. Voice Coils" />
          </FormField>
          <FormField label="Slug">
            <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={inputClass} placeholder="Auto-generated from name" />
          </FormField>
          <FormField label="Description">
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} placeholder="Category description..." />
          </FormField>
          <FormField label="Category Image">
            <MediaUploader
              value={form.image_url}
              onChange={url => setForm({ ...form, image_url: url })}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sort Order">
              <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className={inputClass} />
            </FormField>
            <FormField label="Visibility">
              <select value={form.is_hidden ? "hidden" : "visible"} onChange={e => setForm({ ...form, is_hidden: e.target.value === "hidden" })} className={`${inputClass} cursor-pointer`}>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </FormField>
          </div>
          <FormField label="SEO Title">
            <input type="text" value={form.seo_meta.title} onChange={e => setForm({ ...form, seo_meta: { ...form.seo_meta, title: e.target.value } })} className={inputClass} placeholder="Meta title for search engines" />
          </FormField>
          <FormField label="SEO Description">
            <textarea rows={2} value={form.seo_meta.description} onChange={e => setForm({ ...form, seo_meta: { ...form.seo_meta, description: e.target.value } })} className={`${inputClass} resize-none`} placeholder="Meta description..." />
          </FormField>
          <div className="flex justify-end gap-3 border-t border-[#EAEAEA] pt-4 mt-4">
            <button type="button" onClick={onClose} className={btnSecondary}>CANCEL</button>
            <button type="submit" className={btnPrimary}><Save className="w-3.5 h-3.5" /> {category ? "UPDATE" : "CREATE"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCT FORM MODAL
// ═══════════════════════════════════════════════════════════════════

// Media uploader sub-component
function MediaUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = { current: null as HTMLInputElement | null };

  const ACCEPTED = "image/*,video/*,.glb,.gltf,.obj,.fbx,.stl,.step,.stp";

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const timestamp = Date.now();
      const uniqueName = `${timestamp}-${safeName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(uniqueName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(uniqueName);

      onChange(publicUrlData.publicUrl);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const isImage = value && /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(value);
  const isVideo = value && /\.(mp4|mov|webm|ogg|avi)$/i.test(value);
  const is3D = value && /\.(glb|gltf|obj|fbx|stl|step|stp)$/i.test(value);

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
          dragging ? "border-[#0F0F10] bg-[#F7F7F8]" : "border-[#D6D6D8] hover:border-[#0F0F10] hover:bg-[#FAFAFA]"
        }`}
      >
        <input
          ref={(el) => { inputRef.current = el; }}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFile}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-[#6B6B6F]">
            <div className="w-5 h-5 border-2 border-[#0F0F10] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-medium">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-[#6B6B6F]">
            <Upload className="w-5 h-5" />
            <p className="text-[10px] font-semibold text-[#0F0F10]">Drop file here or click to browse</p>
            <p className="text-[9px]">Images · Videos · 3D Models (.glb .gltf .obj .fbx .stl)</p>
          </div>
        )}
      </div>

      {/* URL fallback */}
      <div className="flex items-center gap-1.5">
        <div className="h-px flex-1 bg-[#EAEAEA]" />
        <span className="text-[9px] text-[#9B9BA0] font-medium uppercase tracking-wider">or paste URL</span>
        <div className="h-px flex-1 bg-[#EAEAEA]" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inputClass + " w-full"}
        placeholder="https://..."
      />

      {/* Preview */}
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-[#EAEAEA] bg-[#F7F7F8]">
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 z-10 bg-white border border-[#D6D6D8] rounded-full p-0.5 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <X className="w-3 h-3 text-[#6B6B6F]" />
          </button>
          {isImage && <img src={value} alt="Preview" className="w-full max-h-40 object-contain" />}
          {isVideo && <video src={value} controls className="w-full max-h-40" />}
          {is3D && (
            <div className="flex items-center gap-2 p-3 text-[10px] text-[#6B6B6F]">
              <Layers className="w-4 h-4" />
              <span className="font-medium">3D Model: {value.split('/').pop()}</span>
            </div>
          )}
          {!isImage && !isVideo && !is3D && (
            <div className="flex items-center gap-2 p-3 text-[10px] text-[#6B6B6F]">
              <ImageIcon className="w-4 h-4" />
              <span className="truncate">{value}</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[10px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}

// Key-value spec builder sub-component
function SpecBuilder({
  specs,
  onChange,
}: {
  specs: Array<{ key: string; value: string }>;
  onChange: (specs: Array<{ key: string; value: string }>) => void;
}) {
  const add = () => onChange([...specs, { key: "", value: "" }]);
  const remove = (i: number) => onChange(specs.filter((_, idx) => idx !== i));
  const update = (i: number, field: "key" | "value", val: string) => {
    const next = specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {specs.length === 0 && (
        <p className="text-[10px] text-[#9B9BA0] italic">No specs yet — click &quot;Add Row&quot; to start.</p>
      )}
      {specs.map((spec, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Spec name (e.g. Material)"
            value={spec.key}
            onChange={e => update(i, "key", e.target.value)}
            className={inputClass + " flex-1 min-w-0"}
          />
          <span className="text-[#9B9BA0] text-xs shrink-0">:</span>
          <input
            type="text"
            placeholder="Value (e.g. Copper)"
            value={spec.value}
            onChange={e => update(i, "value", e.target.value)}
            className={inputClass + " flex-1 min-w-0"}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-[#9B9BA0] transition-colors border border-transparent hover:border-red-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-[10px] font-semibold text-[#0F0F10] border border-dashed border-[#D6D6D8] rounded-lg px-3 py-2 hover:border-[#0F0F10] hover:bg-[#F7F7F8] transition-all w-full justify-center cursor-pointer"
      >
        <Plus className="w-3 h-3" /> Add Row
      </button>
    </div>
  );
}

function ProductFormModal({ product, categories, onSave, onClose }: {
  product: Product | null;
  categories: Category[];
  onSave: (prod: Partial<Product>) => void;
  onClose: () => void;
}) {
  // Convert existing specs object → array of {key,value} rows for the builder
  const specsToRows = (specs: Record<string, string> | null | undefined) =>
    specs ? Object.entries(specs).map(([key, value]) => ({ key, value })) : [];

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    category_id: product?.category_id || (categories[0]?.id || ""),
    short_desc: product?.short_desc || "",
    featured_image: product?.featured_image || "",
    is_hidden: product?.is_hidden ?? false,
    is_featured: product?.is_featured ?? false,
    applications: product?.applications || "",
    tags: (product?.tags || []).join(", "),
    price: product?.price?.toString() || (product as any)?.variants?.[0]?.price?.toString() || "",
    moq: (product as any)?.moq || product?.technical_specs?.MOQ || (product as any)?.variants?.[0]?.specs?.MOQ || "",
    sort_order: product?.sort_order ?? 0,
    seo_meta: {
      title: product?.seo_meta?.title || "",
      description: product?.seo_meta?.description || "",
    },
    gallery: (product as any)?.product_images?.map((img: any) => img.url) || 
             (product as any)?.images?.map((img: any) => img.url) || []
  });

  const [isGalleryUploading, setIsGalleryUploading] = useState(false);

  const [specRows, setSpecRows] = useState<Array<{ key: string; value: string }>>(
    specsToRows(product?.technical_specs || (product as any)?.variants?.[0]?.specs)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert spec rows → plain object, ignoring rows with empty keys
    const technical_specs: Record<string, string> = {};
    for (const { key, value } of specRows) {
      const k = key.trim();
      if (k) technical_specs[k] = value;
    }
    if (form.moq.trim()) {
      technical_specs["MOQ"] = form.moq.trim();
    }

    onSave({
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      category_id: form.category_id,
      short_desc: form.short_desc || null,
      long_desc: null,
      featured_image: form.featured_image || null,
      is_hidden: form.is_hidden,
      is_featured: form.is_featured,
      applications: form.applications || null,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      price: form.price ? parseFloat(form.price) : null,
      technical_specs: Object.keys(technical_specs).length ? technical_specs : null,
      sort_order: form.sort_order,
      seo_meta: form.seo_meta.title || form.seo_meta.description ? form.seo_meta : null,
      moq: form.moq.trim() || null,
      gallery: form.gallery,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0F10]/50 backdrop-blur-sm">
      <div className="bg-white border border-[#D6D6D8] w-full max-w-2xl rounded-premium shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-4 mb-4">
          <h3 className="font-display text-sm font-bold text-[#0F0F10] uppercase tracking-wider">
            {product ? "Edit Product" : "New Product"}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F7F7F8] text-slate-400 hover:text-[#0F0F10] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* ── Name & Category ── */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Product Name" required>
              <input
                type="text" required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value, slug: product ? form.slug : generateSlug(e.target.value) })}
                className={inputClass}
                placeholder="e.g. 82.5 mm Speaker Voice Coil"
              />
            </FormField>
            <FormField label="Category" required>
              <select
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
          </div>

          {/* ── Slug ── */}
          <FormField label="URL Slug">
            <input
              type="text"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              className={inputClass}
              placeholder="auto-generated from name"
            />
          </FormField>

          {/* ── Short Description ── */}
          <FormField label="Short Description">
            <textarea
              rows={2}
              value={form.short_desc}
              onChange={e => setForm({ ...form, short_desc: e.target.value })}
              className={`${inputClass} resize-none w-full`}
              placeholder="Brief one-line product summary…"
            />
          </FormField>

          {/* ── Media Upload ── */}
          <FormField label="Featured Media">
            <MediaUploader
              value={form.featured_image}
              onChange={url => setForm({ ...form, featured_image: url })}
            />
          </FormField>

          {/* ── Gallery Media (Multiple Images/Videos) ── */}
          <FormField label="Gallery Media (Multiple Images/Videos)">
            <div className="space-y-3">
              {/* Dropzone for multiple files */}
              <div
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={async (e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length === 0) return;
                  
                  setIsGalleryUploading(true);
                  try {
                    const urls: string[] = [];
                    for (const file of files) {
                      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
                      const timestamp = Date.now();
                      const uniqueName = `${timestamp}-${safeName}`;
                      
                      const { data, error } = await supabase.storage
                        .from('media')
                        .upload(uniqueName, file, {
                          cacheControl: '3600',
                          upsert: false
                        });
                        
                      if (error) throw error;
                      
                      const { data: publicUrlData } = supabase.storage
                        .from('media')
                        .getPublicUrl(uniqueName);
                        
                      urls.push(publicUrlData.publicUrl);
                    }
                    
                    setForm(prev => ({
                      ...prev,
                      gallery: [...prev.gallery, ...urls]
                    }));
                  } catch (err: any) {
                    alert("Gallery upload failed: " + (err.message || err));
                  } finally {
                    setIsGalleryUploading(false);
                  }
                }}
                className="border border-dashed border-[#D6D6D8] rounded-premium p-4 flex flex-col items-center justify-center bg-[#F7F7F8] hover:bg-[#EAEAEA]/40 hover:border-[#0F0F10] transition-all cursor-pointer relative"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = 'image/*,video/*,.glb,.gltf,.obj,.fbx,.stl';
                  input.onchange = async () => {
                    if (!input.files || input.files.length === 0) return;
                    setIsGalleryUploading(true);
                    try {
                      const urls: string[] = [];
                      for (const file of Array.from(input.files)) {
                        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
                        const timestamp = Date.now();
                        const uniqueName = `${timestamp}-${safeName}`;
                        
                        const { data, error } = await supabase.storage
                          .from('media')
                          .upload(uniqueName, file, {
                            cacheControl: '3600',
                            upsert: false
                          });
                          
                        if (error) throw error;
                        
                        const { data: publicUrlData } = supabase.storage
                          .from('media')
                          .getPublicUrl(uniqueName);
                          
                        urls.push(publicUrlData.publicUrl);
                      }
                      
                      setForm(prev => ({
                        ...prev,
                        gallery: [...prev.gallery, ...urls]
                      }));
                    } catch (err: any) {
                      alert("Gallery upload failed: " + (err.message || err));
                    } finally {
                      setIsGalleryUploading(false);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <p className="text-[10px] font-bold text-slate-500">
                  {isGalleryUploading ? "Uploading files..." : "Drag & drop or click to upload multiple media"}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">Images, Videos (up to 50MB per file)</p>
              </div>

              {/* Grid of uploaded gallery items */}
              {form.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-2.5 pt-1">
                  {form.gallery.map((url: string, idx: number) => {
                    const isVideo = url.startsWith('data:video/') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.includes('youtube.com') || url.includes('vimeo.com');
                    return (
                      <div key={idx} className="relative group aspect-square rounded-lg border border-[#EAEAEA] overflow-hidden bg-[#F7F7F8] flex items-center justify-center p-1">
                        {isVideo ? (
                          <video src={url} className="max-h-full max-w-full object-contain" muted playsInline />
                        ) : (
                          <img src={url} alt={`Gallery ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setForm(prev => ({
                              ...prev,
                              gallery: prev.gallery.filter((_: string, i: number) => i !== idx)
                            }));
                          }}
                          className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                        {isVideo && (
                          <div className="absolute bottom-1 left-1 bg-black/55 text-[8px] text-white px-1 py-0.5 rounded font-bold uppercase">
                            Video
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </FormField>

          {/* ── Price ── */}
          <FormField label="Price (optional — leave blank if on request)">
            <input
              type="number" step="0.01"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className={inputClass}
              placeholder="0.00"
            />
          </FormField>

          {/* ── MOQ ── */}
          <FormField label="MOQ">
            <input
              type="text"
              value={form.moq}
              onChange={e => setForm({ ...form, moq: e.target.value })}
              className={inputClass}
              placeholder="1,000 units"
            />
          </FormField>

          {/* ── Technical Specifications ── */}
          <div>
            <p className="text-[10px] font-semibold text-[#0F0F10] uppercase tracking-wider mb-2">
              Technical Specifications
            </p>
            <div className="border border-[#EAEAEA] rounded-lg p-3 bg-[#FAFAFA]">
              <SpecBuilder specs={specRows} onChange={setSpecRows} />
            </div>
          </div>

          {/* ── Applications ── */}
          <FormField label="Applications">
            <textarea
              rows={2}
              value={form.applications}
              onChange={e => setForm({ ...form, applications: e.target.value })}
              className={`${inputClass} resize-none w-full`}
              placeholder="Home audio, automotive, PA systems…"
            />
          </FormField>

          {/* ── Tags ── */}
          <FormField label="Tags (comma-separated)">
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              className={inputClass}
              placeholder="voice coil, copper, CCAW"
            />
          </FormField>

          {/* ── Sort / Visibility / Featured ── */}
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Sort Order">
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Visibility">
              <select
                value={form.is_hidden ? "hidden" : "visible"}
                onChange={e => setForm({ ...form, is_hidden: e.target.value === "hidden" })}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </FormField>
            <FormField label="Featured">
              <select
                value={form.is_featured ? "yes" : "no"}
                onChange={e => setForm({ ...form, is_featured: e.target.value === "yes" })}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </FormField>
          </div>

          {/* ── SEO ── */}
          <FormField label="SEO Title">
            <input
              type="text"
              value={form.seo_meta.title}
              onChange={e => setForm({ ...form, seo_meta: { ...form.seo_meta, title: e.target.value } })}
              className={inputClass}
            />
          </FormField>
          <FormField label="SEO Description">
            <textarea
              rows={2}
              value={form.seo_meta.description}
              onChange={e => setForm({ ...form, seo_meta: { ...form.seo_meta, description: e.target.value } })}
              className={`${inputClass} resize-none w-full`}
            />
          </FormField>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 border-t border-[#EAEAEA] pt-4 mt-2">
            <button type="button" onClick={onClose} className={btnSecondary}>CANCEL</button>
            <button type="submit" className={btnPrimary}>
              <Save className="w-3.5 h-3.5" /> {product ? "UPDATE" : "CREATE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCT DETAIL EDITOR (Variants, Images, Downloads, FAQs)
// ═══════════════════════════════════════════════════════════════════
function ProductDetailEditor({ product, variants, images, downloads, faqs, categories, onBack, onSaveProduct, onSaveVariant, onDeleteVariant, onAddPartNumber, onDeletePartNumber, onAddImage, onDeleteImage, onAddDownload, onDeleteDownload, onAddFaq, onDeleteFaq, onUploadMedia, isUploading, onEditProduct }: {
  product: Product;
  variants: Variant[];
  images: ProductImage[];
  downloads: DownloadItem[];
  faqs: FAQ[];
  categories: Category[];
  onBack: () => void;
  onSaveProduct: (data: Partial<Product>) => Promise<void>;
  onSaveVariant: (variant: Partial<Variant>) => Promise<void>;
  onDeleteVariant: (id: string) => Promise<void>;
  onAddPartNumber: (variantId: string, code: string) => Promise<void>;
  onDeletePartNumber: (id: string) => Promise<void>;
  onAddImage: (productId: string, url: string, altText: string) => Promise<void>;
  onDeleteImage: (id: string) => Promise<void>;
  onAddDownload: (productId: string, type: string, url: string, title: string) => Promise<void>;
  onDeleteDownload: (id: string) => Promise<void>;
  onAddFaq: (productId: string, question: string, answer: string) => Promise<void>;
  onDeleteFaq: (id: string) => Promise<void>;
  onUploadMedia: (productId: string, files: FileList | null) => Promise<void>;
  isUploading: boolean;
  onEditProduct: (prod: Product) => void;
}) {
  const [activeSection, setActiveSection] = useState<"variants" | "images" | "downloads" | "faqs">("variants");

  // Variant form
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variantForm, setVariantForm] = useState({ name: "", specs: "{}", stock: "", price: "", sort_order: 0 });
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  // Part number input
  const [pnInput, setPnInput] = useState<Record<string, string>>({});

  // Image form
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  // Download form
  const [dlType, setDlType] = useState("datasheet");
  const [dlUrl, setDlUrl] = useState("");
  const [dlTitle, setDlTitle] = useState("");

  // FAQ form
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  const handleSaveVariant = async () => {
    let specs: Record<string, string> = {};
    try { specs = JSON.parse(variantForm.specs); } catch { specs = {}; }
    await onSaveVariant({
      id: editingVariantId || undefined,
      product_id: product.id,
      name: variantForm.name,
      specs,
      stock: variantForm.stock ? parseInt(variantForm.stock) : null,
      price: variantForm.price ? parseFloat(variantForm.price) : null,
      sort_order: variantForm.sort_order,
    });
    setShowVariantForm(false);
    setEditingVariantId(null);
    setVariantForm({ name: "", specs: "{}", stock: "", price: "", sort_order: 0 });
  };

  const startEditVariant = (v: Variant) => {
    setVariantForm({
      name: v.name,
      specs: JSON.stringify(v.specs, null, 2),
      stock: v.stock?.toString() || "",
      price: v.price?.toString() || "",
      sort_order: v.sort_order,
    });
    setEditingVariantId(v.id);
    setShowVariantForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Header */}
      <div className="bg-white border border-[#EAEAEA] rounded-premium p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-[#5C5C63] hover:text-accent-cyan mb-4 uppercase tracking-wider cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[9px] font-bold text-[#5C5C63] uppercase tracking-widest">{categories.find(c => c.id === product.category_id)?.name || "Uncategorized"}</p>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-extrabold text-[#0F0F10]">{product.name}</h2>
              <button
                onClick={() => onEditProduct(product)}
                className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border border-[#EAEAEA] bg-white text-[#5C5C63] hover:text-[#0F0F10] hover:border-[#0F0F10] cursor-pointer"
                title="Edit Product Info"
              >
                <Edit className="w-3 h-3" /> Edit Info
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">/{product.slug}</p>
          </div>
          {product.featured_image && (
            <img src={product.featured_image} alt={product.name} className="w-16 h-16 rounded-lg object-cover border border-[#EAEAEA]" />
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "variants", label: "Variants & Part Numbers", icon: Tag },
          { id: "images", label: "Image Gallery", icon: ImageIcon },
          { id: "downloads", label: "Downloads", icon: Download },
          { id: "faqs", label: "FAQs", icon: HelpCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
              activeSection === tab.id
                ? "bg-[#0F0F10] text-white border-[#0F0F10]"
                : "bg-white text-[#5C5C63] border-[#EAEAEA] hover:border-[#0F0F10]"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ─── VARIANTS SECTION ──────────────────────────────────────── */}
      {activeSection === "variants" && (
        <div className="bg-white border border-[#EAEAEA] rounded-premium p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-4">
            <h3 className="font-display text-sm font-bold text-[#0F0F10] uppercase tracking-wider">Variants ({variants.length})</h3>
            <button onClick={() => { setEditingVariantId(null); setVariantForm({ name: "", specs: '{\n  "Size": "",\n  "Material": "",\n  "Power": ""\n}', stock: "", price: "", sort_order: variants.length }); setShowVariantForm(true); }} className={btnPrimary}>
              <Plus className="w-3.5 h-3.5" /> ADD VARIANT
            </button>
          </div>

          {showVariantForm && (
            <div className="border border-accent-cyan rounded-lg p-4 space-y-3 bg-sky-50/30">
              <h4 className="text-xs font-bold text-[#0F0F10] uppercase">{editingVariantId ? "Edit Variant" : "New Variant"}</h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Variant Name" required>
                  <input type="text" value={variantForm.name} onChange={e => setVariantForm({ ...variantForm, name: e.target.value })} className={inputClass} placeholder="e.g. Copper" />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Price">
                    <input type="text" value={variantForm.price} onChange={e => setVariantForm({ ...variantForm, price: e.target.value })} className={inputClass} placeholder="0.00" />
                  </FormField>
                  <FormField label="Stock">
                    <input type="text" value={variantForm.stock} onChange={e => setVariantForm({ ...variantForm, stock: e.target.value })} className={inputClass} placeholder="Qty" />
                  </FormField>
                </div>
              </div>
              <FormField label="Specifications (JSON)">
                <textarea rows={5} value={variantForm.specs} onChange={e => setVariantForm({ ...variantForm, specs: e.target.value })} className={`${inputClass} font-mono text-[10px] resize-none`} />
              </FormField>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowVariantForm(false)} className={btnSecondary}>Cancel</button>
                <button onClick={handleSaveVariant} className={btnPrimary}><Save className="w-3.5 h-3.5" /> Save</button>
              </div>
            </div>
          )}

          {variants.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No variants yet. Add one above.</p>
          ) : (
            <div className="space-y-4">
              {variants.map(v => (
                <div key={v.id} className="border border-[#EAEAEA] rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-[#0F0F10]">{v.name}</h4>
                      <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                        {v.price && <span>Price: <strong className="text-[#0F0F10] font-numbers">${v.price}</strong></span>}
                        {v.stock !== null && <span>Stock: <strong className="text-[#0F0F10]">{v.stock}</strong></span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEditVariant(v)} className="p-1.5 rounded hover:bg-[#F7F7F8] text-slate-400 hover:text-[#0F0F10] cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onDeleteVariant(v.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Specs table */}
                  {v.specs && Object.keys(v.specs).length > 0 && (
                    <div className="bg-[#F7F7F8] rounded-lg p-3">
                      <table className="w-full text-[10px]">
                        <tbody>
                          {Object.entries(v.specs).map(([key, val]) => (
                            <tr key={key} className="border-b border-[#EAEAEA] last:border-0">
                              <td className="py-1.5 pr-4 text-slate-500 font-medium">{key}</td>
                              <td className="py-1.5 text-[#0F0F10] font-semibold">{String(val)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Part Numbers */}
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Part Numbers</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(v.part_numbers || []).map(pn => (
                        <span key={pn.id} className="inline-flex items-center gap-1 text-[10px] bg-[#F7F7F8] border border-[#EAEAEA] rounded px-2 py-1 font-mono">
                          {pn.code}
                          <button onClick={() => onDeletePartNumber(pn.id)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={pnInput[v.id] || ""} onChange={e => setPnInput({ ...pnInput, [v.id]: e.target.value })} className={`${inputClass} flex-1`} placeholder="Add part number..." onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (pnInput[v.id]) { onAddPartNumber(v.id, pnInput[v.id]); setPnInput({ ...pnInput, [v.id]: "" }); } } }} />
                      <button onClick={() => { if (pnInput[v.id]) { onAddPartNumber(v.id, pnInput[v.id]); setPnInput({ ...pnInput, [v.id]: "" }); } }} className={btnSecondary}><Plus className="w-3 h-3" /> Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── IMAGES SECTION ────────────────────────────────────────── */}
      {activeSection === "images" && (
        <div className="bg-white border border-[#EAEAEA] rounded-premium p-6 space-y-6">
          <h3 className="font-display text-sm font-bold text-[#0F0F10] uppercase tracking-wider border-b border-[#EAEAEA] pb-4">Gallery Images ({images.length})</h3>
          <div className="flex gap-3 flex-wrap">
            <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={`${inputClass} flex-1 min-w-[220px]`} placeholder="Image URL..." />
            <input type="text" value={imageAlt} onChange={e => setImageAlt(e.target.value)} className={`${inputClass} w-[180px]`} placeholder="Alt text..." />
            <button onClick={() => { if (imageUrl) { onAddImage(product.id, imageUrl, imageAlt); setImageUrl(""); setImageAlt(""); } }} className={btnPrimary}><Plus className="w-3.5 h-3.5" /> Add URL</button>
            <label className={`${btnSecondary} cursor-pointer`}>
              <Upload className="w-3.5 h-3.5" /> {isUploading ? "Uploading..." : "Upload Media"}
              <input type="file" multiple accept="image/*,video/*,.glb,.gltf,.obj,.stl" className="hidden" onChange={(e) => onUploadMedia(product.id, e.target.files)} />
            </label>
          </div>
          {images.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No gallery images. Add image URLs above.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-[#EAEAEA]">
                  <img src={img.url} alt={img.alt_text || ""} className="w-full aspect-square object-cover" />
                  <button onClick={() => onDeleteImage(img.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {img.alt_text && <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-2 py-1 truncate">{img.alt_text}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── DOWNLOADS SECTION ─────────────────────────────────────── */}
      {activeSection === "downloads" && (
        <div className="bg-white border border-[#EAEAEA] rounded-premium p-6 space-y-6">
          <h3 className="font-display text-sm font-bold text-[#0F0F10] uppercase tracking-wider border-b border-[#EAEAEA] pb-4">Downloads ({downloads.length})</h3>
          <div className="flex gap-3 flex-wrap">
            <select value={dlType} onChange={e => setDlType(e.target.value)} className={`${inputClass} cursor-pointer`}>
              <option value="datasheet">Datasheet</option>
              <option value="catalogue">Catalogue</option>
              <option value="drawing">Drawing</option>
              <option value="manual">Manual</option>
            </select>
            <input type="text" value={dlUrl} onChange={e => setDlUrl(e.target.value)} className={`${inputClass} flex-1`} placeholder="File URL..." />
            <input type="text" value={dlTitle} onChange={e => setDlTitle(e.target.value)} className={`${inputClass} w-[160px]`} placeholder="Title..." />
            <button onClick={() => { if (dlUrl) { onAddDownload(product.id, dlType, dlUrl, dlTitle); setDlUrl(""); setDlTitle(""); } }} className={btnPrimary}><Plus className="w-3.5 h-3.5" /> Add</button>
          </div>
          {downloads.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No downloads added yet.</p>
          ) : (
            <div className="space-y-2">
              {downloads.map(dl => (
                <div key={dl.id} className="flex items-center justify-between p-3 rounded-lg border border-[#EAEAEA]">
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-[#0F0F10]">{dl.title || dl.type}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[300px]">{dl.url}</p>
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 bg-[#F7F7F8] border border-[#EAEAEA] px-1.5 py-0.5 rounded uppercase">{dl.type}</span>
                  </div>
                  <button onClick={() => onDeleteDownload(dl.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── FAQS SECTION ──────────────────────────────────────────── */}
      {activeSection === "faqs" && (
        <div className="bg-white border border-[#EAEAEA] rounded-premium p-6 space-y-6">
          <h3 className="font-display text-sm font-bold text-[#0F0F10] uppercase tracking-wider border-b border-[#EAEAEA] pb-4">FAQs ({faqs.length})</h3>
          <div className="space-y-3">
            <FormField label="Question">
              <input type="text" value={faqQ} onChange={e => setFaqQ(e.target.value)} className={inputClass} placeholder="Enter question..." />
            </FormField>
            <FormField label="Answer">
              <textarea rows={2} value={faqA} onChange={e => setFaqA(e.target.value)} className={`${inputClass} resize-none`} placeholder="Enter answer..." />
            </FormField>
            <button onClick={() => { if (faqQ && faqA) { onAddFaq(product.id, faqQ, faqA); setFaqQ(""); setFaqA(""); } }} className={btnPrimary}><Plus className="w-3.5 h-3.5" /> Add FAQ</button>
          </div>
          {faqs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No FAQs added yet.</p>
          ) : (
            <div className="space-y-3">
              {faqs.map(faq => (
                <div key={faq.id} className="p-4 rounded-lg border border-[#EAEAEA] space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-[#0F0F10]">{faq.question}</h4>
                    <button onClick={() => onDeleteFaq(faq.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <p className="text-[11px] text-[#4A4A4F] font-light leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
