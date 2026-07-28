"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, HelpCircle, Package, ArrowRight, Loader2, Clock, Mail } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import { useCurrency } from "@/context/CurrencyContext";

interface Variant {
  id: string;
  name: string;
  price: number | null;
  specs: Record<string, string>;
}

interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  category: { name: string; slug: string } | null;
  featured_image: string | null;
  variants: Variant[];
}

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { convertPrice } = useCurrency();
  const slug = searchParams.get("slug");

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [paymentGateway, setPaymentGateway] = useState<"paypal" | "razorpay" | "payu" | "cashfree">("paypal");

  // Pricing calculations
  const activeVariant = product && Array.isArray(product.variants) ? (product.variants[selectedVariantIdx] || null) : null;
  const unitPrice = activeVariant?.price !== null && activeVariant?.price !== undefined ? Number(activeVariant.price) : 1.80;
  const subtotal = unitPrice * quantity;
  const shippingFee = 15.00; // Flat Express Air Shipping
  const grandTotal = subtotal + shippingFee;
  
  // Billing/Shipping state
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    taxId: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "modal" | "success">("idle");
  const [txnId, setTxnId] = useState("");
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [paymentSettings, setPaymentSettings] = useState<any>({
    enableRazorpay: false,
    enablePaypal: false,
    paypalClientId: "",
    razorpayKeyId: "",
    paypalEnvironment: "sandbox",
  });

  const paymentStateRef = useRef({
    formData,
    quantity,
    activeVariant,
    unitPrice,
    subtotal,
    grandTotal,
    product,
  });

  useEffect(() => {
    paymentStateRef.current = {
      formData,
      quantity,
      activeVariant,
      unitPrice,
      subtotal,
      grandTotal,
      product,
    };
  }, [formData, quantity, activeVariant, unitPrice, subtotal, grandTotal, product]);

  // Dynamic configuration flags loaded from DB/config settings
  const isRazorpayConfigured = paymentSettings.enableRazorpay && !!paymentSettings.razorpayKeyId;
  const isPaypalConfigured = paymentSettings.enablePaypal && !!paymentSettings.paypalClientId;
  const isCashfreeConfigured = paymentSettings.enableCashfree && !!paymentSettings.cashfreeAppId;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/payment-settings");
        if (res.ok) {
          const data = await res.json();
          setPaymentSettings(data);
        }
      } catch (err) {
        console.error("Failed to load checkout settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const validateForm = () => {
    if (!formData.name.trim()) return "Contact Name is required";
    if (!formData.email.trim()) return "Business Email is required";
    if (!formData.phone.trim()) return "Phone Number is required";
    if (!formData.address.trim()) return "Shipping Address is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State/Province is required";
    if (!formData.zip.trim()) return "ZIP/Postal Code is required";
    return null;
  };

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 1. Success confirmation order handler
  const saveOrderSuccess = (gateway: string, transactionId: string) => {
    if (!product) return;
    const orderData = {
      orderId: `SMP-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split("T")[0],
      productId: product.id,
      productName: product.name,
      variantName: activeVariant?.name || "Standard",
      quantity: quantity,
      unitPrice: unitPrice,
      subtotal: subtotal,
      shippingFee: shippingFee,
      total: grandTotal,
      customer: {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        taxId: formData.taxId,
      },
      shipping: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
      },
      payment: {
        gateway,
        transactionId,
        status: "Paid"
      },
      status: "Payment Confirmed"
    };

    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem("gsp_sample_orders");
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem("gsp_sample_orders", JSON.stringify([orderData, ...existing]));
    }

    setTxnId(transactionId);
    setPaymentStatus("success");
    setPaymentError(null);
    setValidationError(null);
  };

  // 2. Fetch product info
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error("Failed to fetch product details for checkout:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);


  // 3. Listen to PayU success/failure redirect params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam === "success") {
      const txnid = searchParams.get("txnid") || "";
      const gateway = searchParams.get("gateway") || "PayU";
      
      const email = searchParams.get("email") || "";
      const name = searchParams.get("name") || "";
      const company = searchParams.get("company") || "";
      const phone = searchParams.get("phone") || "";
      const address = searchParams.get("address") || "";
      const city = searchParams.get("city") || "";
      const state = searchParams.get("state") || "";
      const zip = searchParams.get("zip") || "";
      const country = searchParams.get("country") || "";
      
      const productId = searchParams.get("product_id") || "";
      const productName = searchParams.get("product_name") || "";
      const variantName = searchParams.get("variant") || "Standard";
      const qty = Number(searchParams.get("qty") || "1");
      const price = Number(searchParams.get("price") || "1.80");
      const calculatedSubtotal = price * qty;
      const calculatedShipping = 15.00;
      const calculatedTotal = calculatedSubtotal + calculatedShipping;

      const orderData = {
        orderId: `SMP-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split("T")[0],
        productId,
        productName,
        variantName,
        quantity: qty,
        unitPrice: price,
        subtotal: calculatedSubtotal,
        shippingFee: calculatedShipping,
        total: calculatedTotal,
        customer: { name, email, company, phone, taxId: "" },
        shipping: { address, city, state, zip, country },
        payment: { gateway, transactionId: txnid, status: "Paid" },
        status: "Payment Confirmed"
      };

      if (typeof window !== "undefined") {
        const existingStr = localStorage.getItem("gsp_sample_orders");
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const isDuplicate = existing.some((o: any) => o.payment.transactionId === txnid);
        if (!isDuplicate) {
          localStorage.setItem("gsp_sample_orders", JSON.stringify([orderData, ...existing]));
        }
      }

      setTxnId(txnid);
      setPaymentStatus("success");
    } else if (statusParam === "failed") {
      alert("Transaction failed or was canceled by user.");
      router.replace("/checkout?slug=" + slug);
    }
  }, [searchParams, slug, router]);

  // 3b. Listen to Cashfree callback params
  useEffect(() => {
    const gateway = searchParams.get("gateway");
    const cfOrderId = searchParams.get("cf_order_id");

    if (gateway === "cashfree" && cfOrderId) {
      const verifyCashfree = async () => {
        setLoading(true);
        try {
          const pendingPayloadStr = localStorage.getItem("cf_pending_order_payload");
          if (!pendingPayloadStr) {
            throw new Error("No pending order payload found in local storage.");
          }
          const pendingPayload = JSON.parse(pendingPayloadStr);

          // Call backend verification
          const res = await fetch("/api/cashfree/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cf_order_id: cfOrderId,
              order: pendingPayload,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // Clear temporary local storage
            localStorage.removeItem("cf_pending_order_payload");
            localStorage.removeItem("cf_pending_order_id");

            saveOrderSuccess("Cashfree", data.transaction_id);
          } else {
            const errData = await res.json();
            alert(errData.error || "Payment verification failed.");
            router.replace("/checkout?slug=" + slug);
          }
        } catch (err) {
          console.error("Cashfree verification error:", err);
          alert("Error verifying payment with Cashfree. Please contact support.");
          router.replace("/checkout?slug=" + slug);
        } finally {
          setLoading(false);
        }
      };

      verifyCashfree();
    }
  }, [searchParams, slug, router]);

  // 4. Mount PayPal Smart Buttons if live mode is active
  useEffect(() => {
    if (paymentGateway !== "paypal" || !isPaypalConfigured) {
      return;
    }

    let isMounted = true;
    const initPaypal = async () => {
      const src = `https://www.paypal.com/sdk/js?client-id=${paymentSettings.paypalClientId}&currency=USD`;
      const loaded = await loadScript(src);
      if (loaded && isMounted) {
        setPaypalLoaded(true);
        const container = document.getElementById("paypal-button-container");
        if (container) {
          container.innerHTML = ""; // Clear
          try {
            (window as any).paypal.Buttons({
              onClick: (data: any, actions: any) => {
                const err = validateForm();
                if (err) {
                  setValidationError(err);
                  alert(err);
                  return actions.reject();
                }
                setValidationError(null);
                return actions.resolve();
              },
              createOrder: async () => {
                const res = await fetch("/api/paypal/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amount: paymentStateRef.current.grandTotal }),
                });
                if (!res.ok) {
                  const err = await res.json();
                  alert(err.error || "Failed to create PayPal order.");
                  throw new Error("Failed to create order");
                }
                const order = await res.json();
                return order.id;
              },
              onApprove: async (data: any) => {
                setIsProcessingPayment(true);
                const currentState = paymentStateRef.current;
                if (!currentState.product) return;

                const orderPayload = {
                  customer_name: currentState.formData.name,
                  customer_email: currentState.formData.email,
                  customer_phone: currentState.formData.phone,
                  shipping_address: currentState.formData.address,
                  shipping_city: currentState.formData.city,
                  shipping_state: currentState.formData.state,
                  shipping_zip: currentState.formData.zip,
                  shipping_country: currentState.formData.country,
                  product_id: currentState.product.id,
                  product_name: currentState.product.name,
                  variant_name: currentState.activeVariant?.name || "Standard",
                  quantity: currentState.quantity,
                  unit_price: currentState.unitPrice,
                  subtotal: currentState.subtotal,
                  shipping_fee: 15.00,
                  total: currentState.grandTotal,
                };

                const res = await fetch("/api/paypal/capture-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderID: data.orderID, order: orderPayload }),
                });
                if (res.ok) {
                  const captureData = await res.json();
                  saveOrderSuccess("PayPal", captureData.transaction_id);
                } else {
                  setPaymentError("Payment Failed");
                  alert("Failed to capture PayPal transaction.");
                  setIsProcessingPayment(false);
                }
              },
              onCancel: () => {
                setPaymentError("Payment Cancelled");
              },
              onError: (err: any) => {
                console.error("PayPal Error:", err);
                setPaymentError("Payment Failed");
              }
            }).render("#paypal-button-container");
          } catch (paypalError) {
            console.error("PayPal buttons render failed:", paypalError);
          }
        }
      }
    };

    initPaypal();
    return () => {
      isMounted = false;
    };
  }, [paymentGateway, isPaypalConfigured, paymentSettings.paypalClientId]);

  // 5. Razorpay Real Checkout Flow
  const handleRazorpayCheckout = async () => {
    const err = validateForm();
    if (err) {
      setValidationError(err);
      alert(err);
      return;
    }
    setValidationError(null);

    if (!product) return;
    setIsProcessingPayment(true);
    try {
      const scriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsProcessingPayment(false);
        return;
      }

      // Convert USD to INR (Razorpay domestic transactions require INR/paise)
      const amountInINR = grandTotal * 83.5;
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInINR }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to initiate Razorpay transaction.");
      }

      const rzpOrder = await res.json();

      const orderPayload = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_zip: formData.zip,
        shipping_country: formData.country,
        product_id: product.id,
        product_name: product.name,
        variant_name: activeVariant?.name || "Standard",
        quantity: quantity,
        unit_price: unitPrice,
        subtotal: subtotal,
        shipping_fee: shippingFee,
        total: grandTotal,
      };

      const options = {
        key: paymentSettings.razorpayKeyId,
        amount: rzpOrder.amount,
        currency: "INR",
        name: "Global Speaker Parts",
        description: `B2B Sample - ${product.name}`,
        order_id: rzpOrder.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#000000"
        },
        handler: async function (response: any) {
          setIsProcessingPayment(true);
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              order: orderPayload,
            }),
          });

          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            saveOrderSuccess("Razorpay", verifyData.transaction_id);
          } else {
            setPaymentError("Payment Failed");
            alert("Razorpay payment verification failed.");
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentError("Payment Cancelled");
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "An error occurred during Razorpay checkout.");
      setIsProcessingPayment(false);
    }
  };

  // 6. PayU Real Redirect Flow
  const handlePayuCheckout = async () => {
    const err = validateForm();
    if (err) {
      setValidationError(err);
      alert(err);
      return;
    }
    setValidationError(null);

    if (!product) return;
    setIsProcessingPayment(true);
    try {
      const txnid = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const res = await fetch("/api/payu/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnid,
          amount: grandTotal,
          productinfo: product.name,
          firstname: formData.name,
          email: formData.email,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate PayU hash.");
      }

      const { hash, key } = await res.json();

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://test.payu.in/_payment"; // Sandbox URL

      const params: Record<string, string> = {
        key,
        txnid,
        amount: grandTotal.toFixed(2),
        productinfo: product.name,
        firstname: formData.name,
        email: formData.email,
        phone: formData.phone,
        hash,
        surl: `${window.location.origin}/checkout?status=success&gateway=PayU&txnid=${txnid}&email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.name)}&company=${encodeURIComponent(formData.company)}&phone=${encodeURIComponent(formData.phone)}&address=${encodeURIComponent(formData.address)}&city=${encodeURIComponent(formData.city)}&state=${encodeURIComponent(formData.state)}&zip=${encodeURIComponent(formData.zip)}&country=${encodeURIComponent(formData.country)}&product_id=${product.id}&product_name=${encodeURIComponent(product.name)}&variant=${encodeURIComponent(activeVariant?.name || "Standard")}&qty=${quantity}&price=${unitPrice}`,
        furl: `${window.location.origin}/checkout?status=failed`,
      };

      Object.entries(params).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      alert(err.message || "PayU redirect failed.");
      setIsProcessingPayment(false);
    }
  };

  // 7. General Submit Form router
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const err = validateForm();
    if (err) {
      setValidationError(err);
      alert(err);
      return;
    }
    setValidationError(null);

    if (paymentGateway === "cashfree") {
      handleCashfreeCheckout();
    } else if (paymentGateway === "razorpay" && isRazorpayConfigured) {
      handleRazorpayCheckout();
    } else if (paymentGateway === "payu") {
      handlePayuCheckout();
    } else {
      // Show local mock gateway selection modal
      setPaymentStatus("modal");
    }
  };

  const handleCashfreeCheckout = async () => {
    if (!product) return;

    // Validate form fields first
    const validationErr = validateForm();
    if (validationErr) {
      setValidationError(validationErr);
      alert(validationErr);
      return;
    }

    setIsProcessingPayment(true);
    setValidationError(null);

    try {
      const scriptLoaded = await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");
      if (!scriptLoaded) {
        alert("Failed to load Cashfree checkout SDK. Please check your internet connection.");
        setIsProcessingPayment(false);
        return;
      }

      // Convert USD to INR (Cashfree domestic transactions require INR)
      const amountInINR = grandTotal * 83.5;
      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInINR,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to initiate Cashfree transaction.");
      }

      const cfOrder = await res.json();

      // Store order payload in localStorage to insert upon success callback verification
      const orderPayload = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone || "",
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state || "",
        shipping_zip: formData.zip || "",
        shipping_country: formData.country,
        product_id: product.id,
        product_name: product.name,
        variant_name: activeVariant?.name || "Standard",
        quantity: quantity,
        unit_price: unitPrice,
        subtotal: subtotal,
        shipping_fee: shippingFee,
        total: grandTotal,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("cf_pending_order_payload", JSON.stringify(orderPayload));
        localStorage.setItem("cf_pending_order_id", cfOrder.order_id);
      }

      // Initialize Cashfree
      const cashfree = (window as any).Cashfree({
        mode: (paymentSettings.environment === "production" || paymentSettings.environment === "live") ? "production" : "sandbox",
      });

      // Redirect checkout
      await cashfree.checkout({
        paymentSessionId: cfOrder.payment_session_id,
        returnUrl: `${window.location.origin}/checkout?gateway=cashfree&cf_order_id=${cfOrder.order_id}&slug=${slug}`,
      });

    } catch (err) {
      console.error("[Cashfree Checkout Error]:", err);
      setPaymentError(err instanceof Error ? err.message : "Failed to place order.");
      alert(err instanceof Error ? err.message : "Error placing Cashfree order. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSimulateSuccess = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const generatedTxn = `${paymentGateway.toUpperCase()}-PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      saveOrderSuccess(paymentGateway.toUpperCase(), generatedTxn);
    }, 1200);
  };

  if (loading) {
    return <PageLoader size="lg" />;
  }

  if (!product || !Array.isArray(product.variants)) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <Package className="w-16 h-16 text-slate-350 mb-4" />
        <h2 className="text-xl font-bold text-black uppercase tracking-wider">No Product Selected</h2>
        <p className="text-slate-500 text-xs mt-2 max-w-sm">Please select a product from the catalog to order sample evaluations.</p>
        <Link href="/products" className="mt-6 inline-flex items-center justify-center px-5 py-2.5 bg-black text-white border border-black hover:bg-white hover:text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  if (paymentStatus === "success") {
    const isWire = txnId.startsWith("WIRE-");
    return (
      <div className="min-h-screen bg-bg-snow py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white border-2 border-black rounded-xl p-8 shadow-sm text-center">
          {isWire ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border border-amber-500 text-amber-500 mb-5">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>
              <h2 className="text-xl font-extrabold text-black uppercase tracking-wider">Awaiting Wire Transfer</h2>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Thank you for placing your sample order. To complete the transaction, please transfer the total of <span className="font-bold text-black">{convertPrice(`$${grandTotal.toFixed(2)}`)}</span> using the corporate bank credentials below.
              </p>

              {/* B2B Bank Details Card */}
              <div className="mt-6 border-2 border-black rounded-lg bg-slate-50 p-4 text-left space-y-2 text-xs">
                <div className="font-black text-black border-b border-black/10 pb-2 mb-2 uppercase tracking-wider text-[10px] text-center">
                  Corporate Bank Details
                </div>
                <div className="flex justify-between"><span className="text-slate-400">Bank Name:</span><span className="font-bold text-black">HDFC Bank Ltd</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Account Name:</span><span className="font-bold text-black">GLOBAL SPEAKER PARTS PVT. LTD.</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Account Number:</span><span className="font-mono font-bold text-black">50200084362194</span></div>
                <div className="flex justify-between"><span className="text-slate-400">IFSC Code:</span><span className="font-mono text-black font-semibold">HDFC0001429</span></div>
                <div className="flex justify-between"><span className="text-slate-400">SWIFT Code:</span><span className="font-mono text-black font-semibold">HDFCCINB</span></div>
                <div className="flex justify-between items-center border-t border-black/10 pt-2 mt-2">
                  <span className="text-slate-400 font-bold">Transfer Ref:</span>
                  <span className="font-mono font-black text-white px-2 py-0.5 bg-black rounded text-[9px] uppercase tracking-wide select-all">
                    {txnId.replace("WIRE-", "")}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-light mt-3 leading-relaxed">
                * Please include the Transfer Ref in the payment description. We will process and ship your components as soon as the bank wire clears.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-500 text-green-500 mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-extrabold text-black uppercase tracking-wider">Sample Order Placed!</h2>
              <p className="text-slate-500 text-xs mt-2">Thank you for your sample order. Your payment of {convertPrice(`$${grandTotal.toFixed(2)}`)} was completed successfully.</p>
            </>
          )}
          
          <div className="mt-6 border-t border-b border-black/10 py-4 text-left space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Order ID:</span><span className="font-bold text-black">#{txnId.split("-")[2] || "1028"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Transaction ID:</span><span className="font-mono text-black">{txnId}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Component:</span><span className="font-bold text-black text-right truncate max-w-[200px]">{product.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Specification:</span><span className="text-black font-semibold">{activeVariant?.name || "Standard"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Quantity:</span><span className="font-bold text-black">{quantity} units</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Shipping:</span><span className="text-black">{formData.city}, {formData.country}</span></div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/products" className="w-full inline-flex items-center justify-center py-3 bg-black border border-black hover:bg-white hover:text-black text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors">
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-snow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href={`/products`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-black uppercase tracking-wider font-bold mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Products
        </Link>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-black tracking-tight uppercase mb-2">B2B Sample Order Checkout</h1>
        <p className="text-slate-500 text-xs sm:text-sm font-light mb-8 max-w-xl">Evaluate our precise speaker components before placing a high-volume contract run. Samples are dispatched via DHL/FedEx B2B Express air cargo.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
          
          {/* LEFT COLUMN: Shipping & Billing Form */}
          <form onSubmit={handlePlaceOrder} className="bg-white border-2 border-black rounded-xl p-5 sm:p-8 space-y-6 shadow-sm">
            {paymentError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-800 text-xs font-semibold mb-6">
                <span className="text-sm shrink-0">❌</span>
                <div>
                  <strong className="font-bold block uppercase tracking-wider">{paymentError}</strong>
                  Your payment transaction was not completed. Please try again or choose another payment method.
                </div>
              </div>
            )}

            {validationError && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-800 text-xs font-semibold mb-6">
                <span className="text-sm shrink-0">⚠️</span>
                <div>
                  <strong className="font-bold block uppercase tracking-wider">Validation Error</strong>
                  {validationError}
                </div>
              </div>
            )}

            <h2 className="font-display text-sm font-extrabold uppercase text-black border-b border-black pb-3">1. Business Shipping Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Business Email *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="buyer@company.com" className="border border-black/25 rounded-lg px-3 py-2 text-xs text-black focus:border-black outline-none bg-slate-50 focus:bg-white transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Contact Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className="border border-black/25 rounded-lg px-3 py-2 text-xs text-black focus:border-black outline-none bg-slate-50 focus:bg-white transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Company Name *</label>
                <input required type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Acoustics Corp Ltd" className="border border-black/25 rounded-lg px-3 py-2 text-xs text-black focus:border-black outline-none bg-slate-50 focus:bg-white transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Phone Number *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" className="border border-black/25 rounded-lg px-3 py-2 text-xs text-black focus:border-black outline-none bg-slate-50 focus:bg-white transition-all" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Street Address *</label>
              <input required type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Suite 400, 100 Main St" className="border border-black/25 rounded-lg px-3 py-2 text-xs text-black focus:border-black outline-none bg-slate-50 focus:bg-white transition-all" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1 col-span-2 sm:col-span-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">City *</label>
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Austin" className="border border-black/25 rounded-lg px-3 py-2 text-xs text-black focus:border-black outline-none bg-slate-50 focus:bg-white transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">State *</label>
                <input required type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="TX" className="border border-black/25 rounded-lg px-3 py-2 text-xs text-black focus:border-black outline-none bg-slate-50 focus:bg-white transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ZIP Code *</label>
                <input required type="text" name="zip" value={formData.zip} onChange={handleInputChange} placeholder="78701" className="border border-black/25 rounded-lg px-3 py-2 text-xs text-black focus:border-black outline-none bg-slate-50 focus:bg-white transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Country *</label>
                <select name="country" value={formData.country} onChange={handleInputChange} className="border border-black/25 rounded-lg px-3 py-2 text-xs text-black focus:border-black outline-none bg-slate-50 focus:bg-white transition-all cursor-pointer">
                  <option value="United States">United States</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                  <option value="India">India</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="France">France</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tax ID / VAT / GST (Optional)</label>
                <input type="text" name="taxId" value={formData.taxId} onChange={handleInputChange} placeholder="Tax registration number" className="border border-black/25 rounded-lg px-3 py-2 text-xs text-black focus:border-black outline-none bg-slate-50 focus:bg-white transition-all" />
              </div>
            </div>

            <h2 className="font-display text-sm font-extrabold uppercase text-black border-b border-black pb-3 pt-4">2. Select Payment Gateway</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PayPal */}
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentGateway === "paypal" ? "border-black bg-slate-50 font-bold" : "border-black/10 hover:border-black/30"}`}>
                <input type="radio" name="gateway" checked={paymentGateway === "paypal"} onChange={() => setPaymentGateway("paypal")} className="accent-black" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-black font-semibold">PayPal</span>
                    <span className={`text-[7px] px-1 py-0.5 rounded font-mono font-bold uppercase ${isPaypalConfigured ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                      {isPaypalConfigured 
                        ? ((paymentSettings.environment === "live" || paymentSettings.environment === "production") ? "Live" : "Sandbox") 
                        : "Simulation"}
                    </span>
                  </div>
                  <span className="text-[8px] text-slate-400 font-normal">International Cards</span>
                </div>
              </label>

              {/* Razorpay */}
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentGateway === "razorpay" ? "border-black bg-slate-50 font-bold" : "border-black/10 hover:border-black/30"}`}>
                <input type="radio" name="gateway" checked={paymentGateway === "razorpay"} onChange={() => setPaymentGateway("razorpay")} className="accent-black" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-black font-semibold">Razorpay</span>
                    <span className={`text-[7px] px-1 py-0.5 rounded font-mono font-bold uppercase ${isRazorpayConfigured ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                      {isRazorpayConfigured 
                        ? ((paymentSettings.environment === "live" || paymentSettings.environment === "production") ? "Live" : "Sandbox") 
                        : "Simulation"}
                    </span>
                  </div>
                  <span className="text-[8px] text-slate-400 font-normal">UPI, Cards, NetBanking</span>
                </div>
              </label>

              {/* PayU */}
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentGateway === "payu" ? "border-black bg-slate-50 font-bold" : "border-black/10 hover:border-black/30"}`}>
                <input type="radio" name="gateway" checked={paymentGateway === "payu"} onChange={() => setPaymentGateway("payu")} className="accent-black" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-black font-semibold">PayU India</span>
                    <span className="text-[7px] px-1 py-0.5 rounded font-mono font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      Simulation
                    </span>
                  </div>
                  <span className="text-[8px] text-slate-400 font-normal">Secure B2B Redirect</span>
                </div>
              </label>

              {/* Cashfree */}
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentGateway === "cashfree" ? "border-black bg-slate-50 font-bold" : "border-black/10 hover:border-black/30"}`}>
                <input type="radio" name="gateway" checked={paymentGateway === "cashfree"} onChange={() => setPaymentGateway("cashfree")} className="accent-black" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-black font-semibold">Cashfree</span>
                    <span className={`text-[7px] px-1 py-0.5 rounded font-mono font-bold uppercase ${isCashfreeConfigured ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                      {isCashfreeConfigured 
                        ? ((paymentSettings.environment === "live" || paymentSettings.environment === "production") ? "Live" : "Sandbox") 
                        : "Simulation"}
                    </span>
                  </div>
                  <span className="text-[8px] text-slate-400 font-normal">UPI, Cards, NetBanking</span>
                </div>
              </label>
            </div>

            {/* Sandbox notice banner if gateway is in simulation mode */}
            {((paymentGateway === "paypal" && !isPaypalConfigured) || 
              (paymentGateway === "razorpay" && !isRazorpayConfigured) || 
              (paymentGateway === "cashfree" && !isCashfreeConfigured) ||
              (paymentGateway === "payu")) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-800 text-[10px] leading-relaxed">
                <span className="text-xs shrink-0 mt-0.5">⚠️</span>
                <div>
                  <strong className="font-bold block">Gateway running in Sandbox Simulation</strong>
                  This gateway is operating in simulation mode. To process real money B2B card/UPI payments, add your merchant client keys to your <code className="font-mono bg-white/60 px-1 py-0.5 rounded border border-amber-200/55 text-amber-950 font-semibold">.env.local</code> file.
                </div>
              </div>
            )}

            {/* PayPal dynamic buttons mount point */}
            {paymentGateway === "paypal" && isPaypalConfigured && (
              <div className="mt-4 space-y-2">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Express Checkout with PayPal:</div>
                <div id="paypal-button-container" className="w-full relative z-10 min-h-[50px]"></div>
              </div>
            )}

            {/* Default submit button for simulated gateways & non-paypal live gateways */}
            {(!isPaypalConfigured || paymentGateway !== "paypal") && (
              <button 
                type="submit" 
                disabled={isProcessingPayment}
                className="w-full inline-flex items-center justify-center gap-1.5 py-4 bg-black border border-black hover:bg-white hover:text-black text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer disabled:bg-slate-400 disabled:border-slate-400 disabled:text-slate-200"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Order...
                  </>
                ) : (
                  <>
                    {paymentGateway === "cashfree" 
                      ? "Pay via Cashfree" 
                      : paymentError 
                      ? "Retry Payment" 
                      : "Place Order & Pay"
                    }
                    {" "}
                    {convertPrice(`$${grandTotal.toFixed(2)}`)}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </form>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-black rounded-xl p-5 sm:p-8 shadow-sm">
              <h2 className="font-display text-sm font-extrabold uppercase text-black border-b border-black pb-3 mb-5">Order Summary</h2>
              
              <div className="flex gap-4">
                <div className="w-20 h-20 border border-black/10 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                  {product.featured_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.featured_image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="text-slate-300 w-8 h-8" /></div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{product.category?.name || "Component"}</span>
                    <h3 className="text-xs font-bold text-black uppercase leading-tight">{product.name}</h3>
                  </div>

                  {/* Quantity selector & Variant select */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[7.5px] font-bold text-slate-400 uppercase">Specification</span>
                      <select value={selectedVariantIdx} onChange={(e) => setSelectedVariantIdx(Number(e.target.value))} className="border border-black/10 bg-[#F7F7F8] rounded px-1.5 py-1 text-[10px] text-black font-semibold outline-none cursor-pointer">
                        {product.variants.map((v, idx) => (
                          <option key={v.id} value={idx}>{v.name}</option>
                        ))}
                        {product.variants.length === 0 && <option value={0}>Standard OEM</option>}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[7.5px] font-bold text-slate-400 uppercase">Quantity</span>
                      <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="border border-black/10 bg-[#F7F7F8] rounded px-1.5 py-1 text-[10px] text-black font-bold outline-none cursor-pointer">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                          <option key={q} value={q}>{q} {q === 1 ? "unit" : "units"}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specs listing */}
              {activeVariant && activeVariant.specs && (
                <div className="mt-4 p-3 bg-slate-50 border border-black/5 rounded-lg">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Variant Specifications:</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9.5px] font-light text-slate-500">
                    {Object.entries(activeVariant.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-0.5 border-b border-black/5"><span className="font-medium text-slate-400">{key}:</span><span className="text-black font-semibold">{val}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="mt-6 border-t border-black pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Sample Subtotal:</span>
                  <span className="font-mono text-black font-medium">{convertPrice(`$${subtotal.toFixed(2)}`)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>DHL Express Shipping:</span>
                  <span className="font-mono text-black font-medium">{convertPrice(`$${shippingFee.toFixed(2)}`)}</span>
                </div>
                <div className="flex justify-between text-black font-extrabold text-sm border-t border-black/10 pt-3">
                  <span className="uppercase tracking-wider">Total Amount:</span>
                  <span className="font-mono">{convertPrice(`$${grandTotal.toFixed(2)}`)}</span>
                </div>
              </div>
            </div>

            {/* Quality badge */}
            <div className="border border-black/10 rounded-xl p-5 bg-white flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-black shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-black uppercase tracking-wider">100% Quality Guaranteed</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-light">All evaluation samples are fully certified, dimensional-checked, and shipped directly from our QA laboratory in original vacuum-sealed packaging.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* PAYMENT MODAL OVERLAY */}
      {paymentStatus === "modal" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white border-2 border-black rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Header */}
            <div className="bg-slate-50 border-b border-black p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-black" />
                <span className="text-xs font-bold uppercase tracking-wider text-black">Secure Checkout Portal</span>
              </div>
              <button onClick={() => setPaymentStatus("idle")} className="text-slate-400 hover:text-black text-xs font-bold uppercase tracking-wider">Cancel</button>
            </div>

            {/* Content body */}
            <div className="p-6 text-center space-y-4">
              {isProcessingPayment ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-black" />
                  <p className="text-xs font-bold text-black uppercase tracking-widest">Processing Transaction...</p>
                  <p className="text-[10px] text-slate-400">Verifying secure B2B gateway tokens...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Paying To Global Speaker Parts</span>
                    <h3 className="text-2xl font-black text-black font-mono">{convertPrice(`$${grandTotal.toFixed(2)}`)}</h3>
                  </div>

                  {paymentGateway === "paypal" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-3">
                      <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                        <span className="text-xs font-extrabold text-blue-900">PayPal Express Sandbox</span>
                        <span className="text-[8px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold uppercase">Authorized</span>
                      </div>
                      <p className="text-[10px] text-blue-700 font-light leading-relaxed">This simulates a PayPal login. Click "Authorize PayPal Sandbox" below to finalize your prepaid sample transaction.</p>
                      <button onClick={handleSimulateSuccess} className="w-full py-2.5 bg-[#FFC439] hover:bg-[#F2BA30] text-[#003087] font-bold text-xs rounded-lg transition-colors shadow-xs">
                        Authorize PayPal Sandbox
                      </button>
                    </div>
                  )}

                  {paymentGateway === "razorpay" && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-left space-y-3">
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                        <span className="text-xs font-extrabold text-indigo-900">Razorpay Payment Link</span>
                        <span className="text-[8px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold uppercase">Standard UPI</span>
                      </div>
                      <p className="text-[10px] text-indigo-700 font-light leading-relaxed">Simulating Razorpay Payment Gateway modal (cards, UPI QR Code, net banking). Click below to authorize transaction.</p>
                      <button onClick={handleSimulateSuccess} className="w-full py-2.5 bg-[#3399FF] hover:bg-[#2288EE] text-white font-bold text-xs rounded-lg transition-colors shadow-xs">
                        Complete Razorpay Checkout
                      </button>
                    </div>
                  )}

                  {paymentGateway === "payu" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left space-y-3">
                      <div className="flex justify-between items-center border-b border-green-100 pb-2">
                        <span className="text-xs font-extrabold text-green-900">PayU Merchant API</span>
                        <span className="text-[8px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold uppercase">Secure B2B</span>
                      </div>
                      <p className="text-[10px] text-green-700 font-light leading-relaxed">Simulating PayU merchant gateway card authentication protocol. Click below to verify and complete.</p>
                      <button onClick={handleSimulateSuccess} className="w-full py-2.5 bg-[#A0C516] hover:bg-[#90B510] text-white font-bold text-xs rounded-lg transition-colors shadow-xs">
                        Authorize PayU Transaction
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
