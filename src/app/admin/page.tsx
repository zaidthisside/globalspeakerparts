"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  BarChart3, FileText, Cpu, Globe, Search, Truck, Box, Plus, Lock, ShieldAlert, X, Upload,
  Edit, Trash2, Eye, EyeOff, Star, ChevronDown, ChevronUp, Save, Copy, ArrowLeft, Layers, Tag, Settings, Image as ImageIcon, HelpCircle, Download, GripVertical, Loader2, CreditCard
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
  seo_meta: Record<string, any> | null;
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
  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "products" | "inquiries" | "settings" | "orders" | "payments" | "payment-settings">("overview");

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
  const [sampleOrders, setSampleOrders] = useState<any[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Payments State
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentGatewayFilter, setPaymentGatewayFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentSortKey, setPaymentSortKey] = useState("created_at");
  const [paymentSortOrder, setPaymentSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [paymentPage, setPaymentPage] = useState(1);
  // Refund state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [processingRefund, setProcessingRefund] = useState(false);

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    enableRazorpay: false,
    enablePaypal: false,
    razorpayKeyId: "",
    razorpaySecret: "",
    paypalClientId: "",
    paypalSecret: "",
    environment: "sandbox",
    defaultCurrency: "USD",
  });
  const [savingSettings, setSavingSettings] = useState(false);


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
      const storedOrders = localStorage.getItem("gsp_sample_orders");
      if (storedOrders) {
        try { setSampleOrders(JSON.parse(storedOrders)); } catch {}
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

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch("/api/payments?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPayments(data);
      }
    } catch (e) {
      console.error("Failed to fetch payments:", e);
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  const fetchPaymentSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/payment-settings?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setPaymentSettings(data);
      }
    } catch (e) {
      console.error("Failed to fetch payment settings:", e);
    }
  }, []);

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentSettings),
      });
      if (res.ok) {
        alert("Payment settings saved securely.");
        fetchPaymentSettings();
      } else {
        alert("Failed to save payment settings.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedPayment) return;
    setProcessingRefund(true);
    try {
      const amountToRefund = refundType === "full" ? selectedPayment.amount : Number(refundAmount);
      
      if (isNaN(amountToRefund) || amountToRefund <= 0 || amountToRefund > selectedPayment.amount) {
        alert("Please enter a valid refund amount.");
        setProcessingRefund(false);
        return;
      }

      const res = await fetch("/api/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPayment.id,
          payment_status: refundType === "full" ? "Refunded" : "Partially Refunded",
          refund_status: refundType === "full" ? "Full Refund" : "Partial Refund",
          refund_amount: (selectedPayment.refund_amount || 0) + amountToRefund,
          gateway_response: {
            refund_processed_at: new Date().toISOString(),
            refund_type: refundType,
            refunded_by: "Admin Session",
          }
        }),
      });

      if (res.ok) {
        alert(`Successfully processed ${refundType} refund for $${amountToRefund.toFixed(2)}.`);
        setShowRefundModal(false);
        setRefundAmount("");
        fetchPayments();
        setSelectedPayment(null);
      } else {
        alert("Refund processing failed on database update.");
      }
    } catch (e) {
      console.error(e);
      alert("Error processing refund.");
    } finally {
      setProcessingRefund(false);
    }
  };


  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchProducts();
      fetchPayments();
      fetchPaymentSettings();
    }
  }, [isAuthenticated, fetchCategories, fetchProducts, fetchPayments, fetchPaymentSettings]);

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

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setSampleOrders(prev => {
      const updated = prev.map(order => order.orderId === orderId ? { ...order, status: newStatus } : order);
      if (typeof window !== "undefined") localStorage.setItem("gsp_sample_orders", JSON.stringify(updated));
      return updated;
    });
  };

  const filteredOrders = useMemo(() => {
    return sampleOrders.filter(order => {
      return (order.customer?.company || "").toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        (order.customer?.name || "").toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        (order.productName || "").toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        (order.payment?.transactionId || "").toLowerCase().includes(orderSearchQuery.toLowerCase());
    });
  }, [sampleOrders, orderSearchQuery]);

  const paymentStats = useMemo(() => {
    const paidPayments = payments.filter(p => p.payment_status === "Paid" || p.payment_status === "Partially Refunded");
    const failedPayments = payments.filter(p => p.payment_status === "Failed" || p.payment_status === "Cancelled");
    const pendingPayments = payments.filter(p => p.payment_status === "Pending");
    const refundedPayments = payments.filter(p => p.payment_status === "Refunded" || p.payment_status === "Partially Refunded");

    const totalRevenue = paidPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalRefunds = payments.reduce((acc, p) => acc + Number(p.refund_amount || 0), 0);
    const netRevenue = totalRevenue - totalRefunds;

    const todayStr = new Date().toISOString().split("T")[0];
    const todayRevenue = paidPayments
      .filter(p => p.created_at?.startsWith(todayStr))
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const aov = paidPayments.length > 0 ? totalRevenue / paidPayments.length : 0;

    const totalTxns = payments.length;
    const successRate = totalTxns > 0 ? (paidPayments.length / totalTxns) * 100 : 100;

    // Daily revenue for last 7 days
    const dailyRev: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyRev[key] = 0;
    }

    paidPayments.forEach(p => {
      const dateKey = p.created_at?.split("T")[0];
      if (dateKey in dailyRev) {
        dailyRev[dateKey] += Number(p.amount);
      }
    });

    // Gateway split
    const gateways: Record<string, number> = { PayPal: 0, Razorpay: 0, Other: 0 };
    paidPayments.forEach(p => {
      const gw = p.payment_gateway || "Other";
      if (gw in gateways) {
        gateways[gw] += Number(p.amount);
      } else {
        gateways.Other += Number(p.amount);
      }
    });

    return {
      totalRevenue,
      netRevenue,
      totalRefunds,
      todayRevenue,
      paidCount: paidPayments.length,
      failedCount: failedPayments.length,
      pendingCount: pendingPayments.length,
      refundCount: refundedPayments.length,
      aov,
      successRate,
      dailyRev: Object.entries(dailyRev).map(([date, val]) => ({ date, val })),
      gateways,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => {
        const matchSearch =
          (p.customer_name || "").toLowerCase().includes(paymentSearch.toLowerCase()) ||
          (p.customer_email || "").toLowerCase().includes(paymentSearch.toLowerCase()) ||
          (p.transaction_id || "").toLowerCase().includes(paymentSearch.toLowerCase()) ||
          (p.order_number || "").toLowerCase().includes(paymentSearch.toLowerCase());
        
        const matchGateway = paymentGatewayFilter === "all" || p.payment_gateway?.toLowerCase() === paymentGatewayFilter.toLowerCase();
        const matchStatus = paymentStatusFilter === "all" || p.payment_status?.toLowerCase() === paymentStatusFilter.toLowerCase();

        return matchSearch && matchGateway && matchStatus;
      })
      .sort((a, b) => {
        let valA = a[paymentSortKey];
        let valB = b[paymentSortKey];
        
        if (paymentSortKey === "amount") {
          valA = Number(valA || 0);
          valB = Number(valB || 0);
        } else {
          valA = String(valA || "").toLowerCase();
          valB = String(valB || "").toLowerCase();
        }

        if (valA < valB) return paymentSortOrder === "asc" ? -1 : 1;
        if (valA > valB) return paymentSortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [payments, paymentSearch, paymentGatewayFilter, paymentStatusFilter, paymentSortKey, paymentSortOrder]);

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
            { id: "orders", label: "Sample Orders", icon: Truck },
            { id: "payments", label: "Payments", icon: FileText },
            { id: "payment-settings", label: "Payment Settings", icon: Settings },
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
                {tab.id === "orders" && sampleOrders.length > 0 && (
                  <span className="ml-auto text-[9px] bg-[#F7F7F8] border border-[#EAEAEA] rounded px-1.5 py-0.5 font-mono">{sampleOrders.length}</span>
                )}
                {tab.id === "payments" && payments.length > 0 && (
                  <span className="ml-auto text-[9px] bg-[#F7F7F8] border border-[#EAEAEA] rounded px-1.5 py-0.5 font-mono">{payments.length}</span>
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
                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href="/gsp_products_template.csv"
                      download="gsp_products_template.csv"
                      className="inline-flex items-center justify-center gap-2 border border-black hover:bg-slate-50 text-black px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Excel Template
                    </a>
                    <button onClick={() => { setEditingProd(null); setShowProdForm(true); }} className={btnPrimary}>
                      <Plus className="w-3.5 h-3.5" /> ADD PRODUCT
                    </button>
                  </div>
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
                                {prod.seo_meta?.hide_price && <span className="text-[8px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded uppercase">Price Hidden</span>}
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

          {/* ─── ORDERS TAB ───────────────────────────────────────────── */}
          {activeTab === "orders" && (
            <div className="bg-white border border-border-cool rounded-premium shadow-soft overflow-hidden animate-fade-in space-y-6 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-border-cool pb-5">
                <div>
                  <h3 className="font-display text-sm font-bold text-primary-midnight uppercase tracking-wider">Prepaid Sample Orders</h3>
                  <p className="text-[10px] text-slate-400 font-light">Monitor and track prepaid customer evaluations (DHL/FedEx).</p>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Search orders..." value={orderSearchQuery} onChange={(e) => setOrderSearchQuery(e.target.value)} className={`${inputClass} pl-8`} />
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-bg-snow text-primary-midnight font-bold border-b border-border-cool">
                    <tr>
                      <th className="px-4 py-3">Order Details</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Paid Total</th>
                      <th className="px-4 py-3">Payment Status</th>
                      <th className="px-4 py-3">Gateway</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-cool text-slate-700">
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No prepaid sample orders found.</td></tr>
                    ) : filteredOrders.map((order) => {
                      const matchedPayment = payments.find(p => p.order_number === order.orderId || p.order_id === order.id || p.transaction_id === order.payment?.transactionId);
                      const paymentStatus = matchedPayment?.payment_status || order.payment?.status || "Paid";
                      return (
                        <tr key={order.orderId} className="hover:bg-bg-snow/30">
                          <td className="px-4 py-4">
                            <strong className="text-primary-midnight font-bold block">{order.orderId}</strong>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">{order.productName} ({order.variantName})</span>
                            <span className="text-[9px] text-slate-400 block font-light">Qty: {order.quantity} units</span>
                          </td>
                          <td className="px-4 py-4">
                            <strong className="text-primary-midnight font-bold block">{order.customer?.company || "Individual"}</strong>
                            <span className="text-[10px] text-slate-500 block">{order.customer?.name} ({order.customer?.phone})</span>
                            <span className="text-[9px] text-slate-450 block truncate max-w-[160px] font-mono">{order.customer?.email}</span>
                            <span className="text-[9px] text-slate-400 block font-light truncate max-w-[160px]">{order.shipping?.address}, {order.shipping?.city}, {order.shipping?.country}</span>
                          </td>
                          <td className="px-4 py-4 font-mono font-bold text-black">${order.total?.toFixed(2)}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              paymentStatus === "Paid" ? "bg-green-50 text-green-700 border border-green-200" :
                              paymentStatus === "Refunded" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                              paymentStatus === "Failed" ? "bg-red-50 text-red-700 border border-red-200" :
                              paymentStatus === "Cancelled" ? "bg-slate-50 text-slate-500 border border-slate-200" :
                              "bg-yellow-50 text-yellow-750 border border-yellow-200"
                            }`}>
                              {paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">{order.payment?.gateway}</span>
                            <span className="text-[8px] font-mono text-slate-400 block truncate max-w-[100px]">{order.payment?.transactionId}</span>
                          </td>
                          <td className="px-4 py-4 text-slate-400">{order.date}</td>
                          <td className="px-4 py-4">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              order.status === "Payment Confirmed" ? "text-blue-600 bg-blue-50 border border-blue-200" :
                              order.status === "Processing" ? "text-amber-600 bg-amber-50 border border-amber-200" :
                              order.status === "Shipped" ? "text-green-600 bg-green-50 border border-green-250" :
                              "text-slate-600 bg-slate-50 border border-slate-200"
                            }`}>{order.status}</span>
                          </td>
                        <td className="px-4 py-4">
                          <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)} className="bg-white border border-border-cool rounded px-2 py-1 text-[10px] cursor-pointer">
                            <option value="Payment Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── SETTINGS TAB ─────────────────────────────────────────── */}
          {/* ─── SETTINGS TAB ─────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="bg-white border border-border-cool p-6 rounded-premium shadow-soft space-y-4 animate-fade-in font-sans">
              <h3 className="font-display text-sm font-bold text-primary-midnight uppercase tracking-wider border-b border-border-cool pb-3">B2B Channel Settings</h3>
              <FormField label="Global WhatsApp Contact Number">
                <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className={inputClass} placeholder="+91 9214361550" />
              </FormField>
              <button onClick={() => { localStorage.setItem("gsp_whatsapp_number", whatsappNumber); alert("Settings saved!"); }} className={btnPrimary}>
                <Save className="w-3.5 h-3.5" /> SAVE SETTINGS
              </button>
            </div>
          )}

          {/* ─── PAYMENTS TAB ─────────────────────────────────────────── */}
          {activeTab === "payments" && (
            <div className="space-y-8 animate-fade-in font-sans">
              {/* Payment Dashboard Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Total Revenue", value: `$${paymentStats.totalRevenue.toFixed(2)}`, change: `Net: $${paymentStats.netRevenue.toFixed(2)}`, icon: FileText },
                  { label: "Today's Volume", value: `$${paymentStats.todayRevenue.toFixed(2)}`, change: "Real-time volume", icon: Globe },
                  { label: "Successful Transactions", value: paymentStats.paidCount.toString(), change: `Rate: ${paymentStats.successRate.toFixed(1)}%`, icon: Star },
                  { label: "Refunds Issued", value: `$${paymentStats.totalRefunds.toFixed(2)}`, change: `${paymentStats.refundCount} transactions`, icon: ShieldAlert },
                ].map((card, i) => (
                  <div key={i} className="bg-white border border-border-cool p-5 rounded-premium shadow-soft flex items-center justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{card.label}</span>
                      <span className="font-display text-lg font-extrabold text-[#0f0f10]">{card.value}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">{card.change}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-bg-snow border border-border-cool flex items-center justify-center text-primary-midnight shrink-0">
                      <card.icon className="w-5 h-5 text-[#5c5c63]" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart 1: Daily Revenue */}
                <div className="lg:col-span-2 bg-white border border-border-cool p-6 rounded-premium shadow-soft space-y-4">
                  <h4 className="text-xs font-bold text-primary-midnight uppercase tracking-wider">7-Day Daily Revenue</h4>
                  <div className="h-48 flex items-end justify-between gap-2 pt-4">
                    {paymentStats.dailyRev.map((day, idx) => {
                      const maxVal = Math.max(...paymentStats.dailyRev.map(d => d.val), 1);
                      const heightPercent = (day.val / maxVal) * 80;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-[8px] font-bold text-slate-500 font-mono">${day.val.toFixed(0)}</span>
                          <div 
                            style={{ height: `${heightPercent}%` }} 
                            className="w-full bg-[#0F0F10] rounded-t-md hover:bg-slate-700 transition-all cursor-pointer relative group"
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap z-10 pointer-events-none font-mono">
                              {day.date}
                            </div>
                          </div>
                          <span className="text-[8px] text-slate-400 font-bold uppercase truncate max-w-full">
                            {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 2: Gateway Split & Performance */}
                <div className="bg-white border border-border-cool p-6 rounded-premium shadow-soft space-y-5">
                  <h4 className="text-xs font-bold text-primary-midnight uppercase tracking-wider">Gateway Metrics</h4>
                  <div className="space-y-4 pt-2">
                    {/* Average Order Value */}
                    <div className="flex justify-between items-center border-b border-border-cool pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Order Value (AOV)</span>
                      <span className="text-xs font-mono font-extrabold text-black">${paymentStats.aov.toFixed(2)}</span>
                    </div>

                    {/* Gateway split display */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Gateway Split</span>
                      </div>
                      <div className="h-3 w-full bg-bg-snow rounded-full overflow-hidden flex border border-border-cool">
                        {(() => {
                          const total = (paymentStats.gateways.PayPal || 0) + (paymentStats.gateways.Razorpay || 0) + (paymentStats.gateways.Other || 0) || 1;
                          const paypalPercent = ((paymentStats.gateways.PayPal || 0) / total) * 100;
                          const razorpayPercent = ((paymentStats.gateways.Razorpay || 0) / total) * 100;
                          const otherPercent = 100 - paypalPercent - razorpayPercent;
                          return (
                            <>
                              <div style={{ width: `${paypalPercent}%` }} className="bg-blue-600 h-full" title={`PayPal: $${paymentStats.gateways.PayPal.toFixed(2)}`} />
                              <div style={{ width: `${razorpayPercent}%` }} className="bg-[#118A8E] h-full" title={`Razorpay: $${paymentStats.gateways.Razorpay.toFixed(2)}`} />
                              <div style={{ width: `${otherPercent}%` }} className="bg-slate-400 h-full" title={`Other: $${paymentStats.gateways.Other.toFixed(2)}`} />
                            </>
                          );
                        })()}
                      </div>
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> PayPal (${paymentStats.gateways.PayPal.toFixed(0)})</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#118A8E] rounded-full" /> Razorpay (${paymentStats.gateways.Razorpay.toFixed(0)})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Sort Controls */}
              <div className="bg-white border border-border-cool p-4 rounded-premium shadow-soft flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center flex-1">
                  <div className="relative min-w-[200px] flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      value={paymentSearch} 
                      onChange={(e) => { setPaymentSearch(e.target.value); setPaymentPage(1); }} 
                      placeholder="Search payment ID, email, order..." 
                      className="pl-9 pr-4 py-2 border border-border-cool rounded-lg text-xs outline-none focus:border-[#0F0F10] w-full"
                    />
                  </div>

                  <select 
                    value={paymentGatewayFilter} 
                    onChange={(e) => { setPaymentGatewayFilter(e.target.value); setPaymentPage(1); }}
                    className="border border-border-cool rounded-lg px-3 py-2 text-xs text-black outline-none bg-slate-50 cursor-pointer"
                  >
                    <option value="all">All Gateways</option>
                    <option value="paypal">PayPal</option>
                    <option value="razorpay">Razorpay</option>
                  </select>

                  <select 
                    value={paymentStatusFilter} 
                    onChange={(e) => { setPaymentStatusFilter(e.target.value); setPaymentPage(1); }}
                    className="border border-border-cool rounded-lg px-3 py-2 text-xs text-black outline-none bg-slate-50 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                  <span>Sort by:</span>
                  <button 
                    onClick={() => {
                      if (paymentSortKey === "amount") {
                        setPaymentSortOrder(o => o === "asc" ? "desc" : "asc");
                      } else {
                        setPaymentSortKey("amount");
                        setPaymentSortOrder("desc");
                      }
                      setPaymentPage(1);
                    }}
                    className={`px-2 py-1 rounded hover:bg-slate-50 ${paymentSortKey === "amount" ? "text-black bg-slate-100" : ""}`}
                  >
                    Amount {paymentSortKey === "amount" && (paymentSortOrder === "asc" ? "↑" : "↓")}
                  </button>
                  <button 
                    onClick={() => {
                      if (paymentSortKey === "created_at") {
                        setPaymentSortOrder(o => o === "asc" ? "desc" : "asc");
                      } else {
                        setPaymentSortKey("created_at");
                        setPaymentSortOrder("desc");
                      }
                      setPaymentPage(1);
                    }}
                    className={`px-2 py-1 rounded hover:bg-slate-50 ${paymentSortKey === "created_at" ? "text-black bg-slate-100" : ""}`}
                  >
                    Date {paymentSortKey === "created_at" && (paymentSortOrder === "asc" ? "↑" : "↓")}
                  </button>
                </div>
              </div>

              {/* Payments List Table */}
              <div className="bg-white border border-border-cool rounded-premium shadow-soft overflow-hidden">
                {loadingPayments ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2 text-black" />
                    Fetching payment records from Supabase...
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No matching payment records found in transaction log.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border-cool text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                          <th className="px-6 py-4">Transaction ID</th>
                          <th className="px-6 py-4">Order Number</th>
                          <th className="px-6 py-4">Customer Name</th>
                          <th className="px-6 py-4">Gateway</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const itemsPerPage = 10;
                          const startIndex = (paymentPage - 1) * itemsPerPage;
                          const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);
                          return paginatedPayments.map((p) => (
                            <tr key={p.id} className="border-b border-border-cool hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-3.5 font-mono text-[10px] text-slate-600 max-w-[150px] truncate">{p.transaction_id || "N/A"}</td>
                              <td className="px-6 py-3.5 font-bold text-black">{p.order_number || "N/A"}</td>
                              <td className="px-6 py-3.5">
                                <div className="font-semibold text-black">{p.customer_name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{p.customer_email}</div>
                              </td>
                              <td className="px-6 py-3.5 font-bold uppercase tracking-wider text-[9px]">{p.payment_gateway}</td>
                              <td className="px-6 py-3.5 font-mono font-bold text-black">
                                {p.amount ? `$${Number(p.amount).toFixed(2)}` : "$0.00"}
                              </td>
                              <td className="px-6 py-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  p.payment_status === "Paid" ? "bg-green-50 text-green-700 border border-green-200" :
                                  p.payment_status === "Refunded" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                  p.payment_status === "Failed" ? "bg-red-50 text-red-700 border border-red-200" :
                                  p.payment_status === "Cancelled" ? "bg-slate-50 text-slate-500 border border-slate-200" :
                                  "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                }`}>
                                  {p.payment_status}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 text-slate-400 font-medium">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "N/A"}</td>
                              <td className="px-6 py-3.5 text-center">
                                <button 
                                  onClick={() => setSelectedPayment(p)}
                                  className="inline-flex items-center justify-center p-1.5 border border-border-cool hover:border-[#0f0f10] text-[#0f0f10] rounded hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {Math.ceil(filteredPayments.length / 10) > 1 && (
                      <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-border-cool">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Page {paymentPage} of {Math.ceil(filteredPayments.length / 10)}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            disabled={paymentPage === 1}
                            onClick={() => setPaymentPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1.5 border border-border-cool text-xs rounded hover:bg-slate-100 transition-colors disabled:opacity-40 font-bold uppercase tracking-wider"
                          >
                            Previous
                          </button>
                          <button 
                            disabled={paymentPage >= Math.ceil(filteredPayments.length / 10)}
                            onClick={() => setPaymentPage(p => p + 1)}
                            className="px-3 py-1.5 border border-border-cool text-xs rounded hover:bg-slate-100 transition-colors disabled:opacity-40 font-bold uppercase tracking-wider"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── PAYMENT SETTINGS TAB ──────────────────────────────────── */}
          {activeTab === "payment-settings" && (
            <form onSubmit={handleSavePaymentSettings} className="bg-white border border-border-cool p-6 rounded-premium shadow-soft space-y-6 animate-fade-in font-sans">
              <h3 className="font-display text-sm font-bold text-primary-midnight uppercase tracking-wider border-b border-border-cool pb-3">Payment Settings Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border-cool pb-6">
                {/* Razorpay Config */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#0F0F10] uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-slate-400" /> Razorpay Gateway
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={paymentSettings.enableRazorpay} 
                        onChange={(e) => setPaymentSettings(p => ({ ...p, enableRazorpay: e.target.checked }))} 
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  
                  <FormField label="Razorpay Key ID">
                    <input 
                      type="text" 
                      value={paymentSettings.razorpayKeyId} 
                      onChange={(e) => setPaymentSettings(p => ({ ...p, razorpayKeyId: e.target.value }))}
                      disabled={!paymentSettings.enableRazorpay}
                      className={inputClass} 
                      placeholder="rzp_test_..."
                    />
                  </FormField>

                  <FormField label="Razorpay Secret Key">
                    <input 
                      type="password" 
                      value={paymentSettings.razorpaySecret} 
                      onChange={(e) => setPaymentSettings(p => ({ ...p, razorpaySecret: e.target.value }))}
                      disabled={!paymentSettings.enableRazorpay}
                      className={inputClass} 
                      placeholder={paymentSettings.razorpaySecret ? "••••••••••••••••" : "Enter secret key"}
                    />
                  </FormField>
                </div>

                {/* PayPal Config */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#0F0F10] uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-slate-400" /> PayPal checkout
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={paymentSettings.enablePaypal} 
                        onChange={(e) => setPaymentSettings(p => ({ ...p, enablePaypal: e.target.checked }))} 
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  <FormField label="PayPal Client ID">
                    <input 
                      type="text" 
                      value={paymentSettings.paypalClientId} 
                      onChange={(e) => setPaymentSettings(p => ({ ...p, paypalClientId: e.target.value }))}
                      disabled={!paymentSettings.enablePaypal}
                      className={inputClass} 
                      placeholder="client_id_..."
                    />
                  </FormField>

                  <FormField label="PayPal Client Secret">
                    <input 
                      type="password" 
                      value={paymentSettings.paypalSecret} 
                      onChange={(e) => setPaymentSettings(p => ({ ...p, paypalSecret: e.target.value }))}
                      disabled={!paymentSettings.enablePaypal}
                      className={inputClass} 
                      placeholder={paymentSettings.paypalSecret ? "••••••••••••••••" : "Enter client secret"}
                    />
                  </FormField>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <FormField label="Gateway environment">
                  <select 
                    value={paymentSettings.environment} 
                    onChange={(e) => setPaymentSettings(p => ({ ...p, environment: e.target.value }))}
                    className="border border-border-cool rounded-lg px-3 py-2.5 text-xs text-black outline-none bg-slate-50 cursor-pointer focus:bg-white transition-all"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="live">Live (Production)</option>
                  </select>
                </FormField>

                <FormField label="Default Currency">
                  <select 
                    value={paymentSettings.defaultCurrency} 
                    onChange={(e) => setPaymentSettings(p => ({ ...p, defaultCurrency: e.target.value }))}
                    className="border border-border-cool rounded-lg px-3 py-2.5 text-xs text-black outline-none bg-slate-50 cursor-pointer focus:bg-white transition-all"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </FormField>
              </div>

              <button type="submit" disabled={savingSettings} className={btnPrimary}>
                {savingSettings ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> SAVING...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> SAVE PAYMENT SETTINGS
                  </>
                )}
              </button>
            </form>
          )}

          {/* Payment Detail Modal Drawer */}
          {selectedPayment && (
            <div className="fixed inset-0 bg-black/40 z-50 flex justify-end font-sans transition-opacity animate-fade-in">
              <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-slide-in relative border-l border-border-cool">
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-black cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <h3 className="font-display text-sm font-extrabold text-[#0f0f10] uppercase tracking-wider border-b border-border-cool pb-3.5 mb-5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" /> Transaction Detail
                </h3>

                <div className="space-y-6">
                  {/* Status Indicator */}
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-border-cool">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      selectedPayment.payment_status === "Paid" ? "bg-green-50 text-green-700 border border-green-200" :
                      selectedPayment.payment_status === "Refunded" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      selectedPayment.payment_status === "Failed" ? "bg-red-50 text-red-700 border border-red-200" :
                      "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    }`}>
                      {selectedPayment.payment_status}
                    </span>
                  </div>

                  {/* Customer details */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-[#0F0F10] uppercase tracking-wider border-l-2 border-black pl-2">Customer Profile</h4>
                    <div className="text-xs space-y-1.5 pl-2 font-medium">
                      <div className="flex justify-between"><span className="text-slate-400">Name:</span><span className="text-black font-semibold">{selectedPayment.customer_name}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Email:</span><span className="text-black font-semibold">{selectedPayment.customer_email}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Phone:</span><span className="text-black font-semibold">{selectedPayment.customer_phone || "N/A"}</span></div>
                    </div>
                  </div>

                  {/* Order Specifications */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-[#0F0F10] uppercase tracking-wider border-l-2 border-black pl-2">Specification Purchased</h4>
                    <div className="text-xs space-y-1.5 pl-2 font-medium">
                      <div className="flex justify-between"><span className="text-slate-400">Product Name:</span><span className="text-black font-semibold text-right max-w-[200px] truncate">{selectedPayment.product_name || "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Variant:</span><span className="text-black font-semibold">{selectedPayment.variant_name || "Standard"}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Transaction ID:</span><span className="font-mono font-bold text-black">{selectedPayment.transaction_id}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Order Number Reference:</span><span className="text-black font-semibold">#{selectedPayment.order_number || "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Amount Transacted:</span><span className="text-black font-extrabold font-mono">${Number(selectedPayment.amount).toFixed(2)}</span></div>
                      {selectedPayment.refund_amount > 0 && (
                        <div className="flex justify-between text-red-600"><span className="font-semibold">Refunded Amount:</span><span className="font-extrabold font-mono">-${Number(selectedPayment.refund_amount).toFixed(2)}</span></div>
                      )}
                    </div>
                  </div>

                  {/* Gateway details */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-[#0F0F10] uppercase tracking-wider border-l-2 border-black pl-2">Gateway details</h4>
                    <div className="text-xs space-y-1.5 pl-2 font-medium">
                      <div className="flex justify-between"><span className="text-slate-400">Payment Gateway:</span><span className="text-black font-bold uppercase text-[9px]">{selectedPayment.payment_gateway}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Gateway Order ID:</span><span className="font-mono text-black">{selectedPayment.gateway_order_id || "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Gateway Payment ID:</span><span className="font-mono text-black">{selectedPayment.gateway_payment_id || "N/A"}</span></div>
                    </div>
                  </div>

                  {/* Scrollable Gateway JSON raw response */}
                  {selectedPayment.gateway_response && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-[#0F0F10] uppercase tracking-wider border-l-2 border-black pl-2">Gateway Raw Payload</h4>
                      <pre className="p-3 bg-slate-50 border border-border-cool text-[9px] font-mono text-slate-500 overflow-auto max-h-36 rounded-lg leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(selectedPayment.gateway_response, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Actions (Refund & invoice) */}
                  <div className="flex gap-3 pt-3 border-t border-border-cool">
                    {(selectedPayment.payment_status === "Paid" || selectedPayment.payment_status === "Partially Refunded") && (
                      <button 
                        onClick={() => {
                          setRefundAmount((selectedPayment.amount - (selectedPayment.refund_amount || 0)).toFixed(2));
                          setShowRefundModal(true);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 border border-red-500 text-red-500 font-bold rounded-lg text-[10px] uppercase hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Refund Payment
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        window.print();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 border border-[#0f0f10] text-[#0f0f10] font-bold rounded-lg text-[10px] uppercase hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Refund Modal Popup */}
          {showRefundModal && selectedPayment && (
            <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center font-sans p-4 animate-fade-in">
              <div className="w-full max-w-sm bg-white border-2 border-black rounded-premium p-6 shadow-2xl relative space-y-4">
                <button 
                  onClick={() => setShowRefundModal(false)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <h4 className="text-xs font-bold text-[#0F0F10] uppercase tracking-wider flex items-center gap-1.5">
                  🛡️ Issue Transaction Refund
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  You are issuing a refund for order ref <code className="font-mono bg-slate-50 px-1 py-0.5 border border-border-cool rounded">#{selectedPayment.order_number}</code>. This transaction was processed using {selectedPayment.payment_gateway}.
                </p>

                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-black cursor-pointer font-bold">
                      <input 
                        type="radio" 
                        name="refund_type" 
                        checked={refundType === "full"} 
                        onChange={() => {
                          setRefundType("full");
                          setRefundAmount((selectedPayment.amount - (selectedPayment.refund_amount || 0)).toFixed(2));
                        }} 
                      /> Full Refund
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-black cursor-pointer font-bold">
                      <input 
                        type="radio" 
                        name="refund_type" 
                        checked={refundType === "partial"} 
                        onChange={() => setRefundType("partial")} 
                      /> Partial Refund
                    </label>
                  </div>

                  {refundType === "partial" && (
                    <FormField label={`Partial amount (Max $${(selectedPayment.amount - (selectedPayment.refund_amount || 0)).toFixed(2)})`}>
                      <input 
                        type="number" 
                        step="0.01"
                        value={refundAmount} 
                        onChange={(e) => setRefundAmount(e.target.value)} 
                        className={inputClass}
                        placeholder="0.00"
                      />
                    </FormField>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowRefundModal(false)}
                    className="flex-1 py-2.5 border border-border-cool text-[9px] font-bold uppercase rounded hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleProcessRefund}
                    disabled={processingRefund}
                    className="flex-1 py-2.5 bg-red-600 text-white text-[9px] font-bold uppercase rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                  >
                    {processingRefund ? "Processing..." : "Process Refund"}
                  </button>
                </div>
              </div>
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
      hide_price: product?.seo_meta?.hide_price === true,
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
      seo_meta: {
        title: form.seo_meta.title || "",
        description: form.seo_meta.description || "",
        hide_price: form.seo_meta.hide_price,
      },
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <FormField label="Price Display">
              <select
                value={form.seo_meta.hide_price ? "hidden" : "visible"}
                onChange={e => setForm({ ...form, seo_meta: { ...form.seo_meta, hide_price: e.target.value === "hidden" } })}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
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
