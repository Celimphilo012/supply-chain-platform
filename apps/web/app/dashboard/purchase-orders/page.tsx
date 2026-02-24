"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Plus, ChevronRight, X, ShoppingCart, ArrowRight } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_approval: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  sent: "bg-purple-50 text-purple-700",
  partial: "bg-orange-50 text-orange-700",
  received: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

const STATUS_DOT: Record<string, string> = {
  draft: "bg-gray-400",
  pending_approval: "bg-amber-500",
  approved: "bg-blue-500",
  sent: "bg-purple-500",
  partial: "bg-orange-500",
  received: "bg-emerald-500",
  cancelled: "bg-red-500",
};

const NEXT_STATUS: Record<string, string> = {
  draft: "pending_approval",
  pending_approval: "approved",
  approved: "sent",
  sent: "received",
};

const NEXT_LABEL: Record<string, string> = {
  draft: "Submit for Approval",
  pending_approval: "Approve",
  approved: "Mark Sent",
  sent: "Mark Received",
};

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 bg-gray-100 rounded animate-pulse"
            style={{ width: `${50 + i * 8}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

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

  const updateItem = (index: number, field: string, value: any) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const totalValue =
    orders?.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0) ??
    0;
  const pendingCount =
    orders?.filter((o: any) =>
      ["pending_approval", "approved", "sent"].includes(o.status),
    ).length ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {pendingCount} pending · R{totalValue.toLocaleString()} total value
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New PO
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  PO Number
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Warehouse
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading &&
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
              {orders?.map((order: any) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono font-medium text-gray-900">
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
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.supplier?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.warehouse?.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {order.currency}{" "}
                      {Number(order.totalAmount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[order.status]}`}
                      />
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() =>
                          statusMutation.mutate({
                            id: order.id,
                            status: NEXT_STATUS[order.status],
                          })
                        }
                        disabled={statusMutation.isPending}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-50 transition-colors"
                      >
                        {NEXT_LABEL[order.status]}
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && (!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <ShoppingCart
                      size={40}
                      className="mx-auto text-gray-200 mb-3"
                    />
                    <p className="text-gray-400 font-medium text-sm">
                      No purchase orders yet
                    </p>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Plus size={14} /> Create your first PO
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Create Purchase Order
              </h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Supplier <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.supplierId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, supplierId: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Select supplier...</option>
                    {suppliers?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Warehouse <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.warehouseId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, warehouseId: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Select warehouse...</option>
                    {warehouses?.map((w: any) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, currency: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
                  >
                    <option value="ZAR">ZAR — South African Rand</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Line Items
                  </h3>
                  <button
                    onClick={addItem}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-xs text-gray-400 font-medium">
                      Product
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Qty
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Unit Cost (R)
                    </span>
                  </div>
                  {form.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(index, "productId", e.target.value)
                        }
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
                      >
                        <option value="">Select...</option>
                        {products?.data?.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="1"
                        value={item.quantityOrdered}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantityOrdered",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
                        min="1"
                      />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.unitCost}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unitCost",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Optional notes..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
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
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
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
