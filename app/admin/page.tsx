"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: string;
  status: string;
  razorpayOrderId: string;
  createdAt: string;
  receiptUrl?: string;
  packagingSlipUrl?: string;
}

interface DocumentItem {
  type: string;
  url: string;
  orderId: string;
  date: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "documents">("orders");
  const router = useRouter();

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [ordersRes, docsRes] = await Promise.all([
          fetch("/api/admin/orders?limit=100"),
          fetch("/api/admin/documents")
        ]);

        if (ordersRes.status === 401 || ordersRes.status === 403) {
          router.push("/auth");
          return;
        }
        
        if (!ordersRes.ok || !docsRes.ok) {
          throw new Error("Failed to fetch admin data.");
        }

        const ordersData = await ordersRes.json();
        const docsData = await docsRes.json();

        setOrders(ordersData.orders || []);
        setDocuments(docsData.documents || []);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, [router]);

  if (loading) {
    return (
      <div className="velvet-bg min-h-screen flex items-center justify-center p-6 antialiased">
        <div className="glass-card rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
          <p className="text-on-surface-variant font-label-md">Authenticating Admin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="velvet-bg min-h-screen flex items-center justify-center p-6 antialiased">
        <div className="glass-card rounded-xl p-8 border border-error/50 max-w-md w-full text-center">
          <span className="material-symbols-outlined text-error text-[48px] mb-4">error</span>
          <h2 className="font-h3 text-h3 text-error mb-2">Access Denied</h2>
          <p className="text-on-surface-variant font-body-md mb-6">{error}</p>
          <button 
            onClick={() => router.push("/")}
            className="w-full bg-[#121a35] border border-outline-variant hover:border-primary-container py-3 rounded-lg text-on-surface font-label-sm transition-all"
          >
            RETURN HOME
          </button>
        </div>
      </div>
    );
  }

  // Note: Document array is now securely processed and served entirely by the backend API.

  return (
    <div className="velvet-bg min-h-screen p-6 md:p-12 text-on-surface font-body-md antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="font-h1 text-h2 md:text-h1 text-primary-container mb-2">Admin Console</h1>
            <p className="text-on-surface-variant">Manage global orders and fulfillment documents.</p>
          </div>
          <div className="flex bg-[#121a35] p-1 rounded-lg border border-outline-variant/50 w-fit">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-2 rounded-md font-label-sm tracking-wider transition-all ${
                activeTab === "orders" 
                  ? "gold-gradient text-on-primary-container shadow-md" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              ORDERS
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-6 py-2 rounded-md font-label-sm tracking-wider transition-all ${
                activeTab === "documents" 
                  ? "gold-gradient text-on-primary-container shadow-md" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              DOCUMENTS
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main>
          {activeTab === "orders" && (
            <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#121a35]/50 border-b border-outline-variant/50">
                      <th className="p-4 font-label-sm text-on-surface-variant tracking-wider">ORDER ID</th>
                      <th className="p-4 font-label-sm text-on-surface-variant tracking-wider">DATE</th>
                      <th className="p-4 font-label-sm text-on-surface-variant tracking-wider">AMOUNT</th>
                      <th className="p-4 font-label-sm text-on-surface-variant tracking-wider">STATUS</th>
                      <th className="p-4 font-label-sm text-on-surface-variant tracking-wider text-right">ITEMS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-outline-variant/20 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-body-sm text-on-surface">{order.id}</td>
                        <td className="p-4 font-body-sm text-on-surface-variant">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-label-md text-primary-container">
                          Rs. {parseFloat(order.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-widest ${
                            order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right text-on-surface-variant font-body-sm">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-on-surface-variant">No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {documents.map((doc, idx) => (
                <div key={idx} className="glass-card p-6 rounded-xl border border-outline-variant/30 flex flex-col group hover:border-primary-container/50 transition-all hover:shadow-lg hover:shadow-primary-container/5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary-container text-[28px] group-hover:scale-110 transition-transform">
                      {doc.type === 'Receipt' ? 'receipt_long' : 'local_shipping'}
                    </span>
                    <div>
                      <h3 className="font-label-md text-on-surface">{doc.type}</h3>
                      <p className="font-body-sm text-on-surface-variant text-[11px]">{new Date(doc.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-outline-variant/30">
                    <p className="font-body-sm text-on-surface-variant text-[12px] truncate mb-3">
                      Order: {doc.orderId}
                    </p>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#121a35] hover:bg-primary-container text-on-surface hover:text-[#0b0f19] border border-outline-variant hover:border-transparent py-2 rounded-lg font-label-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      DOWNLOAD
                    </a>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="col-span-full py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] opacity-50 mb-4 block">folder_open</span>
                  <p>No documents have been generated yet.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
