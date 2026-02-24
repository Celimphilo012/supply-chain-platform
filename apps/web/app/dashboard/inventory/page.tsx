"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Package, Plus, Search, AlertTriangle } from "lucide-react";

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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">
            Manage stock levels across all warehouses
          </p>
        </div>
        <button
          onClick={() => setShowAdjust(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Adjust Stock
        </button>
      </div>

      {/* Low stock banner */}
      {lowStock && lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="text-yellow-600" size={20} />
          <span className="text-yellow-800 font-medium">
            {lowStock.length} item{lowStock.length > 1 ? "s" : ""} below reorder
            point
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Product",
                  "SKU",
                  "Warehouse",
                  "On Hand",
                  "Reserved",
                  "Incoming",
                  "Reorder Point",
                  "Status",
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
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              )}
              {filtered?.map((inv: any) => {
                const isLow =
                  inv.reorderPoint && inv.quantityOnHand <= inv.reorderPoint;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {inv.product?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                      {inv.product?.sku}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {inv.warehouse?.name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {inv.quantityOnHand}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {inv.quantityReserved ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {inv.quantityIncoming ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {inv.reorderPoint ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isLow
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isLow ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && (!filtered || filtered.length === 0) && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No inventory records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {showAdjust && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Adjust Stock
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  value={adjustData.productId}
                  onChange={(e) =>
                    setAdjustData((d) => ({ ...d, productId: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="receipt">Receipt (add stock)</option>
                  <option value="sale">Sale (remove stock)</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="write_off">Write Off</option>
                  <option value="return">Return</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity{" "}
                  {adjustData.transactionType === "sale" ||
                  adjustData.transactionType === "write_off"
                    ? "(will be deducted)"
                    : "(will be added)"}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={adjustData.notes}
                  onChange={(e) =>
                    setAdjustData((d) => ({ ...d, notes: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for adjustment..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdjust(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
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
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {adjustMutation.isPending ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
