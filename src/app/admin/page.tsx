"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  BarChart3, FileText, Cpu, Globe, Search, Truck, Box, Plus, Lock, ShieldAlert 
} from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "inquiries" | "products" | "logistics">("overview");
  const [inquiries, setInquiries] = useState<Record<string, string>[]>([]);
  const [productInventory, setProductInventory] = useState<Record<string, string>[]>([]);
  const [shippingLogs, setShippingLogs] = useState<Record<string, string>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Authentication states
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeTimers: NodeJS.Timeout[] = [];

      // 1. Session authentication
      if (sessionStorage.getItem("gsp_admin_authenticated") === "true") {
        const timer1 = setTimeout(() => {
          setIsAuthenticated(true);
        }, 0);
        activeTimers.push(timer1);
      }
      
      // 2. Load inquiries from localStorage
      const storedInq = localStorage.getItem("gsp_inquiries");
      if (storedInq) {
        try {
          const parsed = JSON.parse(storedInq);
          const timer2 = setTimeout(() => {
            setInquiries(parsed);
          }, 0);
          activeTimers.push(timer2);
        } catch (e) {
          console.error("Error loading inquiries", e);
        }
      }

      // 3. Load product inventories from localStorage
      const storedInv = localStorage.getItem("gsp_inventory");
      if (storedInv) {
        try {
          const parsed = JSON.parse(storedInv);
          const timer3 = setTimeout(() => {
            setProductInventory(parsed);
          }, 0);
          activeTimers.push(timer3);
        } catch (e) {
          console.error("Error loading inventory", e);
        }
      }

      // 4. Load shipping logs from localStorage
      const storedShip = localStorage.getItem("gsp_shipping_logs");
      if (storedShip) {
        try {
          const parsed = JSON.parse(storedShip);
          const timer4 = setTimeout(() => {
            setShippingLogs(parsed);
          }, 0);
          activeTimers.push(timer4);
        } catch (e) {
          console.error("Error loading shipping logs", e);
        }
      }

      return () => {
        activeTimers.forEach(t => clearTimeout(t));
      };
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

  // Handle status update
  const handleUpdateStatus = (id: string, newStatus: string) => {
    setInquiries(prev => {
      const updated = prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq);
      if (typeof window !== "undefined") {
        localStorage.setItem("gsp_inquiries", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Filtered inquiries logic
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const matchesSearch = 
        inq.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || inq.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchQuery, statusFilter]);

  // Statistics cards data
  const statsOverview = useMemo(() => {
    return [
      { label: "Active RFQ Inquiries", value: inquiries.length.toString(), icon: FileText, change: inquiries.length > 0 ? "+2 today" : "No active requests" },
      { label: "Avg Turnaround", value: inquiries.length > 0 ? "14.5 Hrs" : "0 Hrs", icon: BarChart3, change: inquiries.length > 0 ? "-1.2 hrs this week" : "No pending queue" },
      { label: "Tooling Under Design", value: productInventory.length > 0 ? `${productInventory.length} molds` : "0 molds", icon: Cpu, change: productInventory.length > 0 ? "Active production" : "No custom mold templates" },
      { label: "Active Export Cargo", value: shippingLogs.length.toString(), icon: Globe, change: shippingLogs.length > 0 ? "In ocean transit" : "No ocean container shipments" }
    ];
  }, [inquiries.length, productInventory.length, shippingLogs.length]);

  // Render Login Wall if not authenticated (evaluated after all React hooks are declared)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-premium-dusty flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans pt-24">
        <div className="w-full max-w-md relative z-10">
          <form 
            onSubmit={handleLogin}
            className="glass-panel p-8 rounded-premium shadow-2xl space-y-6 flex flex-col items-center border border-white/40"
          >
            {/* Logo Badge */}
            <div className="w-full flex justify-center mb-2">
              <Logo className="h-11" variant="primary" />
            </div>

            <div className="text-center space-y-1.5 w-full">
              <h2 className="font-display text-sm font-extrabold text-primary-midnight uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Lock className="w-4 h-4 text-accent-cyan" />
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
              <label htmlFor="passcode-input" className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block">
                Enter Security Passcode
              </label>
              <input
                type="password"
                id="passcode-input"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-bg-snow/60 border border-border-cool/80 rounded-premium px-4 py-3 text-xs text-primary-midnight outline-none focus:border-accent-cyan focus:bg-white transition-all font-light tracking-widest"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2"
            >
              <span>ACCESS CONSOLE</span>
            </button>

            <div className="w-full border-t border-border-cool/40 pt-4 text-center">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block leading-relaxed">
                SECURED SYSTEM • EST. 2001 • JAIPUR INDIA
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-snow text-body-slate font-sans pt-12 pb-20">
      
      {/* Top Header Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-cool pb-6 bg-white p-6 rounded-premium shadow-soft">
          <div>
            <div className="flex items-center gap-2 text-accent-cyan text-xs font-bold uppercase tracking-widest mb-1">
              <Box className="w-4.5 h-4.5" />
              <span>Back Office Console</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-primary-midnight tracking-tight">
              B2B Administration Hub
            </h1>
            <p className="text-slate-400 text-xs font-light">
              GLOBAL SPEAKER PARTS — Private management dashboard. Direct link access only.
            </p>
          </div>

          <div className="text-[10px] font-mono text-slate-500 bg-bg-snow border border-border-cool px-3 py-2 rounded-lg">
            🔐 session: secure_ssl • admin_level: 1
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar Tabs (Col 3) */}
        <div className="lg:col-span-3 bg-white border border-border-cool p-4 rounded-premium shadow-soft space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-3 mb-2.5">
            DASHBOARD INDEX
          </span>

          {[
            { id: "overview", label: "Overview Panel", icon: BarChart3 },
            { id: "inquiries", label: "RFQs & Inquiries", icon: FileText },
            { id: "products", label: "Tooling & Products", icon: Cpu },
            { id: "logistics", label: "Export Shipments", icon: Truck }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "overview" | "inquiries" | "products" | "logistics")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? "bg-bg-snow text-primary-midnight border-l-3 border-primary-midnight"
                    : "text-slate-400 hover:bg-bg-snow/50 hover:text-primary-midnight border-l-3 border-transparent"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isSelected ? "text-accent-cyan" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Section (Col 9) */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* TAB 1: OVERVIEW PANEL */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statsOverview.map((stat, idx) => (
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

              {/* Recent Inquiries Quick List */}
              <div className="bg-white border border-border-cool rounded-premium shadow-soft overflow-hidden">
                <div className="p-5 border-b border-border-cool bg-bg-snow flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-primary-midnight uppercase tracking-wider">
                    Recent OEM Specifications Incoming
                  </h3>
                  <button 
                    onClick={() => setActiveTab("inquiries")}
                    className="text-xs font-bold text-accent-cyan hover:text-accent-cyan-hover"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-border-cool">
                  {inquiries.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-light">
                      No inquiries logged. Submit a specification on the contact form to see it here. (Total: 0)
                    </div>
                  ) : (
                    inquiries.slice(0, 3).map((inq) => (
                      <div key={inq.id} className="p-5 flex justify-between items-start text-xs gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-primary-midnight font-bold text-sm">{inq.company}</strong>
                            <span className="text-[9px] bg-bg-snow border border-border-cool text-primary-midnight px-1.5 py-0.5 rounded font-mono font-bold">
                              {inq.id}
                            </span>
                          </div>
                          <p className="text-slate-500 font-light leading-relaxed max-w-xl">{inq.specs}</p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-3">
                            <span>Parts: <strong className="text-body-slate font-semibold">{inq.category}</strong></span>
                            <span>•</span>
                            <span>Volume: <strong className="text-body-slate font-semibold">{inq.quantity}</strong></span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block text-[10px] font-bold text-highlight-royal bg-bg-snow border border-border-cool px-2.5 py-1 rounded-premium uppercase mb-1.5">
                            {inq.status}
                          </span>
                          <span className="block text-[9px] text-slate-400 font-semibold">{inq.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RFQ INQUIRIES LOG */}
          {activeTab === "inquiries" && (
            <div className="bg-white border border-border-cool rounded-premium shadow-soft overflow-hidden animate-fade-in space-y-6 p-6">
              
              {/* Header Search & Filter */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-border-cool pb-5">
                <div>
                  <h3 className="font-display text-sm font-bold text-primary-midnight uppercase tracking-wider">
                    Wholesale Quote Request Inbox
                  </h3>
                  <p className="text-[10px] text-slate-400 font-light">Manage and review global manufacturer technical requests.</p>
                </div>

                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-bg-snow border border-border-cool rounded-premium px-3 py-2 pl-8 text-xs text-charcoal outline-none focus:border-accent-cyan transition-colors placeholder:text-slate-400 shadow-sm"
                    />
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-bg-snow border border-border-cool rounded-premium px-3 py-2 text-xs text-charcoal outline-none cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending Engineering Review">Pending Review</option>
                    <option value="Quota Transmitted">Quota Transmitted</option>
                    <option value="Samples Approved">Samples Approved</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Samples in Transit">Samples in Transit</option>
                  </select>
                </div>
              </div>

              {/* Inquiries Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-bg-snow text-primary-midnight font-bold border-b border-border-cool">
                    <tr>
                      <th className="px-4 py-3">Client (Company)</th>
                      <th className="px-4 py-3">Requested Parts</th>
                      <th className="px-4 py-3">Volume Quantity</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-cool text-slate-700">
                    {filteredInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          No inquiries match the search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-bg-snow/30">
                          <td className="px-4 py-4.5">
                            <strong className="text-primary-midnight text-sm font-bold block">{inq.company}</strong>
                            <span className="text-[10px] text-slate-500 font-light block">{inq.contact}</span>
                            <span className="text-[9px] text-slate-400 block">{inq.email}</span>
                          </td>
                          <td className="px-4 py-4.5">
                            <span className="font-semibold text-slate-700">{inq.category}</span>
                            <p className="text-[10px] text-slate-500 font-light mt-1 max-w-[200px] truncate">{inq.specs}</p>
                          </td>
                          <td className="px-4 py-4.5 font-light">{inq.quantity}</td>
                          <td className="px-4 py-4.5 text-slate-400">{inq.date}</td>
                          <td className="px-4 py-4.5">
                            <span className="inline-block text-[9px] font-bold text-highlight-royal bg-bg-snow border border-border-cool px-2 py-0.5 rounded uppercase">
                              {inq.status}
                            </span>
                          </td>
                          <td className="px-4 py-4.5">
                            <select
                              value={inq.status}
                              onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                              className="bg-white border border-border-cool rounded px-2 py-1 text-[10px] text-charcoal outline-none cursor-pointer"
                            >
                              <option value="Pending Engineering Review">Review</option>
                              <option value="Quota Transmitted">Quota</option>
                              <option value="Quoted">Quoted</option>
                              <option value="Samples in Transit">In Transit</option>
                              <option value="Samples Approved">Approved</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: PRODUCT INVENTORY MANAGER */}
          {activeTab === "products" && (
            <div className="bg-white border border-border-cool rounded-premium shadow-soft p-6 space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-border-cool pb-5">
                <div>
                  <h3 className="font-display text-sm font-bold text-primary-midnight uppercase tracking-wider">
                    Manufacturing Component Status
                  </h3>
                  <p className="text-[10px] text-slate-400 font-light">Inventory statistics and machining tolerances.</p>
                </div>
                <button className="btn-primary inline-flex items-center justify-center px-5 py-2 text-[10px] font-bold tracking-wider cursor-pointer">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>ADD NEW MOLD</span>
                </button>
              </div>

              {/* Product inventory table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-bg-snow text-primary-midnight font-bold border-b border-border-cool">
                    <tr>
                      <th className="px-4 py-3">Transducer Component Category</th>
                      <th className="px-4 py-3">Mold / Production Status</th>
                      <th className="px-4 py-3">Stored Inventory / Raw Weight</th>
                      <th className="px-4 py-3">Machined Tolerances</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-cool text-slate-700">
                    {productInventory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          No active manufacturing tooling molds logged. (Total: 0)
                        </td>
                      </tr>
                    ) : (
                      productInventory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-bg-snow/30">
                          <td className="px-4 py-3.5 font-bold text-slate-800">{item.category}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              item.moldStatus === "Active" 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.moldStatus === "Active" ? "bg-green-500" : "bg-amber-500"}`} />
                              {item.moldStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-light text-slate-500">{item.stockTons}</td>
                          <td className="px-4 py-3.5 text-accent-cyan font-mono font-semibold">{item.tolerance}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: LOGISTICS & SHIPMENTS */}
          {activeTab === "logistics" && (
            <div className="bg-white border border-border-cool rounded-premium shadow-soft p-6 space-y-6 animate-fade-in">
              <div className="border-b border-border-cool pb-5">
                <h3 className="font-display text-sm font-bold text-primary-midnight uppercase tracking-wider">
                  Active Ocean Shipping Logs
                </h3>
                <p className="text-[10px] text-slate-400 font-light">Monitor export container lines and customs release schedules.</p>
              </div>

              {shippingLogs.length === 0 ? (
                <div className="p-10 text-center text-slate-400 border border-dashed border-border-cool rounded-premium bg-bg-snow/30 text-xs font-light">
                  No active export cargo shipping container lines logged. (Total: 0)
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {shippingLogs.map((log, idx) => (
                    <div key={idx} className="bg-bg-snow border border-border-cool p-5 rounded-premium flex flex-col justify-between min-h-[170px] shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-white border border-border-cool text-primary-midnight px-2 py-0.5 rounded font-mono font-bold">
                          {log.containerId}
                        </span>
                        <Truck className="w-5 h-5 text-slate-400 shrink-0" />
                      </div>
                      
                      <div className="my-3 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Carrier</span>
                        <strong className="text-primary-midnight font-bold text-sm block">{log.carrier}</strong>
                        <span className="text-slate-500 font-light text-[10px] mt-1 block">{log.route}</span>
                      </div>

                      <div className="border-t border-border-cool pt-3 flex justify-between items-center text-[10px] font-semibold">
                        <span className="text-slate-500">ETA: {log.eta}</span>
                        <span className="text-highlight-royal font-bold uppercase">{log.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
