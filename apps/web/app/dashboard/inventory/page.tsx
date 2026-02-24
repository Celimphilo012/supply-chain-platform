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

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 bg-gray-100 rounded animate-pulse"
            style={{ width: `${50 + ((i * 15) % 40)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {inventory?.length ?? 0} products across all warehouses
          </p>
        </div>
        <button
          onClick={() => setShowAdjust(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Adjust Stock
        </button>
      </div>

      {/* Low stock alert */}
      {lowStock && lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 text-sm font-medium">
            {lowStock.length} item{lowStock.length > 1 ? "s" : ""} below reorder
            point — review stock levels
          </p>
        </div>
      )}

      {/* Search & filters */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>
          <button className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 px-3 py-2 border border-gray-200 rounded-lg text-sm transition-colors">
            <SlidersHorizontal size={15} />
            <span className="hidden sm:block">Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Warehouse
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  On Hand
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Reserved
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Reorder Point
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading &&
                [...Array(6)].map((_, i) => <SkeletonRow key={i} cols={6} />)}
              {filtered?.map((inv: any) => {
                const isLow =
                  inv.reorderPoint && inv.quantityOnHand <= inv.reorderPoint;
                const pct = inv.reorderPoint
                  ? Math.min(
                      (inv.quantityOnHand / (inv.reorderPoint * 2)) * 100,
                      100,
                    )
                  : 100;
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {inv.product?.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {inv.product?.sku}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {inv.warehouse?.name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-gray-900">
                          {inv.quantityOnHand}
                        </span>
                        {inv.reorderPoint && (
                          <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isLow ? "bg-red-400" : "bg-emerald-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {inv.quantityReserved ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {inv.reorderPoint ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isLow
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isLow ? "bg-red-500" : "bg-emerald-500"}`}
                        />
                        {isLow ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && (!filtered || filtered.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Package size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm font-medium">
                      No inventory records found
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      Try adjusting your search
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Adjust Stock
              </h2>
              <button
                onClick={() => setShowAdjust(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product
                </label>
                <select
                  value={adjustData.productId}
                  onChange={(e) =>
                    setAdjustData((d) => ({ ...d, productId: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50"
                >
                  <option value="">Select product...</option>
                  {products?.data?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Warehouse
                </label>
                <select
                  value={adjustData.warehouseId}
                  onChange={(e) =>
                    setAdjustData((d) => ({
                      ...d,
                      warehouseId: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50"
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50"
                >
                  <option value="receipt">Receipt — add stock</option>
                  <option value="sale">Sale — remove stock</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="write_off">Write Off</option>
                  <option value="return">Return</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quantity
                  <span className="text-gray-400 font-normal ml-1">
                    (
                    {["sale", "write_off"].includes(adjustData.transactionType)
                      ? "will be deducted"
                      : "will be added"}
                    )
                  </span>
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={adjustData.notes}
                  onChange={(e) =>
                    setAdjustData((d) => ({ ...d, notes: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50"
                  placeholder="Reason for adjustment..."
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowAdjust(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
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
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
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
