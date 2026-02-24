"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Plus, ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending_approval: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  sent: "bg-purple-100 text-purple-700",
  partial: "bg-orange-100 text-orange-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const NEXT_STATUS: Record<string, string> = {
  draft: "pending_approval",
  pending_approval: "approved",
  approved: "sent",
  sent: "received",
};

export default function PurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setSelectedPO(null);
    },
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 mt-1">Manage procurement workflow</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          New PO
        </button>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "PO Number",
                  "Supplier",
                  "Warehouse",
                  "Amount",
                  "Expected Delivery",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              )}
              {orders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm font-medium">
                    {order.poNumber}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {order.supplier?.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {order.warehouse?.name}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {order.currency}{" "}
                    {Number(order.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {order.expectedDeliveryDate
                      ? new Date(
                          order.expectedDeliveryDate,
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status]}`}
                    >
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
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Advance <ChevronRight size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && (!orders || orders.length === 0) && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No purchase orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Create Purchase Order
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier *
                </label>
                <select
                  value={form.supplierId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, supplierId: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse *
                </label>
                <select
                  value={form.warehouseId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, warehouseId: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currency: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ZAR">ZAR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Line Items</h3>
                <button
                  onClick={addItem}
                  className="text-blue-600 text-sm hover:text-blue-800"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-3">
                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3">
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        updateItem(index, "productId", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select product...</option>
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
                          index,
                          "quantityOrdered",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Unit cost"
                      value={item.unitCost}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unitCost",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Optional notes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
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
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create PO"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
