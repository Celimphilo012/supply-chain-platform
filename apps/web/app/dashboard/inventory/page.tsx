"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  X,
  SlidersHorizontal,
} from "lucide-react";

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustData, setAdjustData] = useState({
    productId: "",
    warehouseId: "",
    quantityDelta: 0,
    transactionType: "adjustment",
    notes: "",
  });

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.get("/inventory").then((r) => r.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: () => api.get("/inventory/low-stock").then((r) => r.data),
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/warehouses").then((r) => r.data),
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((r) => r.data),
  });

  const adjustMutation = useMutation({
    mutationFn: (data: any) => api.post("/inventory/adjust", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowAdjust(false);
      setAdjustData({
        productId: "",
        warehouseId: "",
        quantityDelta: 0,
        transactionType: "adjustment",
        notes: "",
      });
    },
  });

  const filtered = inventory?.filter(
    (inv: any) =>
      inv.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.product?.sku?.toLowerCase().includes(search.toLowerCase()),
  );

  const inStockCount =
    inventory?.filter(
      (inv: any) => !inv.reorderPoint || inv.quantityOnHand > inv.reorderPoint,
    ).length ?? 0;
  const lowStockCount = lowStock?.length ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Track and manage stock across all warehouses
          </p>
        </div>
        <button
          onClick={() => setShowAdjust(true)}
          className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #2563eb, #4f46e5)",
            boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
          }}
        >
          <Plus size={16} />
          Adjust Stock
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div
          className="bg-white rounded-2xl p-4 border border-gray-100"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Total SKUs
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {inventory?.length ?? 0}
          </p>
        </div>
        <div
          className="bg-white rounded-2xl p-4 border border-gray-100"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            In Stock
          </p>
          <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>
            {inStockCount}
          </p>
        </div>
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: lowStockCount > 0 ? "#fffbeb" : "#f0fdf4",
            borderColor: lowStockCount > 0 ? "#fde68a" : "#bbf7d0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-wider mb-1"
            style={{ color: lowStockCount > 0 ? "#b45309" : "#15803d" }}
          >
            Low Stock
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: lowStockCount > 0 ? "#d97706" : "#16a34a" }}
          >
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div
          className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
            border: "1px solid #fde68a",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#f59e0b" }}
          >
            <AlertTriangle size={16} className="text-white" />
          </div>
          <div>
            <p className="text-amber-800 font-bold text-sm">
              {lowStockCount} item{lowStockCount > 1 ? "s" : ""} need restocking
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              These products are at or below their reorder point
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid #e8edf2",
        }}
      >
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products, SKUs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
              style={{ background: "#f8fafc", border: "2px solid #f1f5f9" }}
            />
          </div>
          <button
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors"
            style={{ border: "2px solid #f1f5f9" }}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:block">Filter</span>
          </button>
        </div>

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
                  "Product",
                  "Warehouse",
                  "On Hand",
                  "Reserved",
                  "Reorder Point",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                [...Array(6)].map((_, i) => (
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
              {filtered?.map((inv: any) => {
                const isLow =
                  inv.reorderPoint && inv.quantityOnHand <= inv.reorderPoint;
                const pct = inv.reorderPoint
                  ? Math.min(
                      (inv.quantityOnHand / (inv.reorderPoint * 2)) * 100,
                      100,
                    )
                  : 80;
                return (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: "1px solid #f8f9fa" }}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        {inv.product?.name}
                      </p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5 bg-gray-50 inline-block px-1.5 py-0.5 rounded">
                        {inv.product?.sku}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {inv.warehouse?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-900">
                          {inv.quantityOnHand}
                        </span>
                        {inv.reorderPoint && (
                          <div
                            className="w-20 h-1.5 rounded-full"
                            style={{ background: "#f1f5f9" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: isLow
                                  ? "linear-gradient(90deg, #ef4444, #f97316)"
                                  : "linear-gradient(90deg, #10b981, #34d399)",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">
                      {inv.quantityReserved ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">
                      {inv.reorderPoint ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                        style={
                          isLow
                            ? { background: "#fef2f2", color: "#dc2626" }
                            : { background: "#f0fdf4", color: "#16a34a" }
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: isLow ? "#ef4444" : "#22c55e" }}
                        />
                        {isLow ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && (!filtered || filtered.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: "linear-gradient(135deg, #eff6ff, #f0fdf4)",
                      }}
                    >
                      <Package size={28} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-semibold mb-1">
                      No inventory found
                    </p>
                    <p className="text-gray-400 text-sm">
                      Try a different search term
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {showAdjust && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}
          >
            <div
              className="px-6 py-5 flex items-center justify-between"
              style={{ borderBottom: "1px solid #f1f5f9" }}
            >
              <div>
                <h2 className="font-bold text-gray-900">Adjust Stock</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Update inventory quantities
                </p>
              </div>
              <button
                onClick={() => setShowAdjust(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                {
                  label: "Product",
                  key: "productId",
                  options: products?.data?.map((p: any) => ({
                    value: p.id,
                    label: `${p.name} (${p.sku})`,
                  })),
                },
                {
                  label: "Warehouse",
                  key: "warehouseId",
                  options: warehouses?.map((w: any) => ({
                    value: w.id,
                    label: w.name,
                  })),
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <select
                    value={(adjustData as any)[field.key]}
                    onChange={(e) =>
                      setAdjustData((d) => ({
                        ...d,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none transition-all"
                    style={{
                      background: "#f8fafc",
                      border: "2px solid #f1f5f9",
                    }}
                  >
                    <option value="">
                      Select {field.label.toLowerCase()}...
                    </option>
                    {field.options?.map((o: any) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transaction Type
                </label>
                <select
                  value={adjustData.transactionType}
                  onChange={(e) =>
                    setAdjustData((d) => ({
                      ...d,
                      transactionType: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none"
                  style={{ background: "#f8fafc", border: "2px solid #f1f5f9" }}
                >
                  <option value="receipt">📥 Receipt — add stock</option>
                  <option value="sale">📤 Sale — remove stock</option>
                  <option value="adjustment">🔧 Manual adjustment</option>
                  <option value="write_off">❌ Write off</option>
                  <option value="return">↩️ Return</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={Math.abs(adjustData.quantityDelta)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const delta = ["sale", "write_off"].includes(
                      adjustData.transactionType,
                    )
                      ? -val
                      : val;
                    setAdjustData((d) => ({ ...d, quantityDelta: delta }));
                  }}
                  className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none"
                  style={{ background: "#f8fafc", border: "2px solid #f1f5f9" }}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={adjustData.notes}
                  onChange={(e) =>
                    setAdjustData((d) => ({ ...d, notes: e.target.value }))
                  }
                  placeholder="Reason for adjustment..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none placeholder-gray-300"
                  style={{ background: "#f8fafc", border: "2px solid #f1f5f9" }}
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowAdjust(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                style={{ border: "2px solid #f1f5f9" }}
              >
                Cancel
              </button>
              <button
                onClick={() => adjustMutation.mutate(adjustData)}
                disabled={
                  !adjustData.productId ||
                  !adjustData.warehouseId ||
                  adjustMutation.isPending
                }
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                }}
              >
                {adjustMutation.isPending ? "Saving..." : "Confirm Adjustment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
