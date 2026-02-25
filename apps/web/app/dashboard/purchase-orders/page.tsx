"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Plus, X, ShoppingCart, ArrowRight, CheckCircle } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; dot: string; label: string }
> = {
  draft: { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8", label: "Draft" },
  pending_approval: {
    bg: "#fffbeb",
    color: "#b45309",
    dot: "#f59e0b",
    label: "Pending",
  },
  approved: {
    bg: "#eff6ff",
    color: "#1d4ed8",
    dot: "#3b82f6",
    label: "Approved",
  },
  sent: { bg: "#f5f3ff", color: "#6d28d9", dot: "#8b5cf6", label: "Sent" },
  partial: {
    bg: "#fff7ed",
    color: "#c2410c",
    dot: "#f97316",
    label: "Partial",
  },
  received: {
    bg: "#f0fdf4",
    color: "#15803d",
    dot: "#22c55e",
    label: "Received",
  },
  cancelled: {
    bg: "#fef2f2",
    color: "#dc2626",
    dot: "#ef4444",
    label: "Cancelled",
  },
};

const NEXT_STATUS: Record<
  string,
  { status: string; label: string; color: string }
> = {
  draft: { status: "pending_approval", label: "Submit", color: "#f59e0b" },
  pending_approval: { status: "approved", label: "Approve", color: "#3b82f6" },
  approved: { status: "sent", label: "Mark Sent", color: "#8b5cf6" },
  sent: { status: "received", label: "Received", color: "#22c55e" },
};

export default function PurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    supplierId: "",
    warehouseId: "",
    notes: "",
    expectedDeliveryDate: "",
    currency: "ZAR",
    items: [{ productId: "", quantityOrdered: 1, unitCost: 0 }],
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => api.get("/purchase-orders").then((r) => r.data),
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get("/suppliers").then((r) => r.data),
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/warehouses").then((r) => r.data),
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/purchase-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setShowCreate(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: any) =>
      api.patch(`/purchase-orders/${id}/status`, { status }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: "", quantityOrdered: 1, unitCost: 0 }],
    }));
  const updateItem = (i: number, field: string, value: any) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item,
      ),
    }));

  const totalValue =
    orders?.reduce((s: number, o: any) => s + Number(o.totalAmount), 0) ?? 0;
  const pendingCount =
    orders?.filter((o: any) =>
      ["pending_approval", "approved", "sent"].includes(o.status),
    ).length ?? 0;
  const receivedCount =
    orders?.filter((o: any) => o.status === "received").length ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage procurement and supplier orders
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm hover:opacity-90 active:scale-95 transition-all"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
          }}
        >
          <Plus size={16} /> New Purchase Order
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Value",
            value: `R${totalValue >= 1000 ? (totalValue / 1000).toFixed(0) + "k" : totalValue.toLocaleString()}`,
            gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
            shadow: "rgba(245,158,11,0.25)",
          },
          {
            label: "Active Orders",
            value: pendingCount,
            gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
            shadow: "rgba(139,92,246,0.25)",
          },
          {
            label: "Completed",
            value: receivedCount,
            gradient: "linear-gradient(135deg,#10b981,#059669)",
            shadow: "rgba(16,185,129,0.25)",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{
              background: s.gradient,
              boxShadow: `0 4px 16px ${s.shadow}`,
            }}
          >
            <div
              className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-20"
              style={{ background: "white" }}
            />
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
              {s.label}
            </p>
            <p className="text-2xl font-bold relative z-10">{s.value}</p>
          </div>
        ))}
      </div>

      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid #e8edf2",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  background: "#fafbfc",
                  borderBottom: "2px solid #f1f5f9",
                }}
              >
                {[
                  "PO Number",
                  "Supplier",
                  "Warehouse",
                  "Amount",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f8f9fa" }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div
                          className="h-4 rounded-lg animate-pulse"
                          style={{
                            background: "#f1f5f9",
                            width: `${40 + j * 10}%`,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              {orders?.map((order: any) => {
                const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.draft;
                const next = NEXT_STATUS[order.status];
                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid #f8f9fa" }}
                    className="hover:bg-amber-50/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold font-mono text-gray-900">
                        {order.poNumber}
                      </p>
                      {order.expectedDeliveryDate && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Due{" "}
                          {new Date(
                            order.expectedDeliveryDate,
                          ).toLocaleDateString("en-ZA")}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {order.supplier?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.warehouse?.name}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        {order.currency}{" "}
                        {Number(order.totalAmount).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: s.bg, color: s.color }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: s.dot }}
                        />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {next ? (
                        <button
                          onClick={() =>
                            statusMutation.mutate({
                              id: order.id,
                              status: next.status,
                            })
                          }
                          disabled={statusMutation.isPending}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity disabled:opacity-50 text-white"
                          style={{ background: next.color }}
                        >
                          {next.label} <ArrowRight size={11} />
                        </button>
                      ) : order.status === "received" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle size={13} /> Complete
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && (!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: "linear-gradient(135deg,#fffbeb,#fff7ed)",
                      }}
                    >
                      <ShoppingCart size={28} className="text-amber-300" />
                    </div>
                    <p className="text-gray-500 font-bold mb-2">
                      No purchase orders yet
                    </p>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="inline-flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-xl text-sm"
                      style={{
                        background: "linear-gradient(135deg,#f59e0b,#d97706)",
                      }}
                    >
                      <Plus size={14} /> Create First PO
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
          style={{
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl my-8"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}
          >
            <div
              className="h-2 rounded-t-3xl"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}
            />
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid #f1f5f9" }}
            >
              <div>
                <h2 className="font-bold text-gray-900">
                  Create Purchase Order
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Fill in the procurement details
                </p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  {
                    label: "Supplier",
                    key: "supplierId",
                    opts: suppliers?.map((s: any) => ({ v: s.id, l: s.name })),
                  },
                  {
                    label: "Warehouse",
                    key: "warehouseId",
                    opts: warehouses?.map((w: any) => ({ v: w.id, l: w.name })),
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {f.label} <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={(form as any)[f.key]}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [f.key]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none"
                      style={{
                        background: "#f8fafc",
                        border: "2px solid #f1f5f9",
                      }}
                    >
                      <option value="">Select...</option>
                      {f.opts?.map((o: any) => (
                        <option key={o.v} value={o.v}>
                          {o.l}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    value={form.expectedDeliveryDate}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        expectedDeliveryDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none"
                    style={{
                      background: "#f8fafc",
                      border: "2px solid #f1f5f9",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, currency: e.target.value }))
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none"
                    style={{
                      background: "#f8fafc",
                      border: "2px solid #f1f5f9",
                    }}
                  >
                    <option value="ZAR">🇿🇦 ZAR</option>
                    <option value="USD">🇺🇸 USD</option>
                    <option value="EUR">🇪🇺 EUR</option>
                  </select>
                </div>
              </div>
              <div
                className="mb-5 rounded-2xl p-4"
                style={{ background: "#f8fafc", border: "2px solid #f1f5f9" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-700">Line Items</p>
                  <button
                    onClick={addItem}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2">
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(i, "productId", e.target.value)
                        }
                        className="rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none"
                        style={{
                          background: "white",
                          border: "2px solid #e8edf2",
                        }}
                      >
                        <option value="">Product...</option>
                        {products?.data?.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantityOrdered}
                        onChange={(e) =>
                          updateItem(
                            i,
                            "quantityOrdered",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none"
                        style={{
                          background: "white",
                          border: "2px solid #e8edf2",
                        }}
                        min="1"
                      />
                      <input
                        type="number"
                        placeholder="Cost (R)"
                        value={item.unitCost}
                        onChange={(e) =>
                          updateItem(
                            i,
                            "unitCost",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none"
                        style={{
                          background: "white",
                          border: "2px solid #e8edf2",
                        }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Optional notes..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none"
                  style={{ background: "#f8fafc", border: "2px solid #f1f5f9" }}
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                style={{ border: "2px solid #f1f5f9" }}
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={
                  !form.supplierId ||
                  !form.warehouseId ||
                  createMutation.isPending
                }
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                }}
              >
                {createMutation.isPending
                  ? "Creating..."
                  : "Create Purchase Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
