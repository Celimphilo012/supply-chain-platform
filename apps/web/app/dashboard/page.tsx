"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Truck,
  ArrowUpRight,
  ShoppingCart,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.get("/inventory").then((r) => r.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: () => api.get("/inventory/low-stock").then((r) => r.data),
  });

  const { data: orders } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => api.get("/purchase-orders").then((r) => r.data),
  });

  useEffect(() => {
    const socket = getSocket();
    socket.on("inventory:updated", () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    });
    return () => {
      socket.off("inventory:updated");
    };
  }, [queryClient]);

  const totalProducts = inventory?.length ?? 0;
  const lowStockCount = lowStock?.length ?? 0;
  const pendingOrders =
    orders?.filter((o: any) =>
      ["pending_approval", "approved", "sent"].includes(o.status),
    ).length ?? 0;
  const totalStockValue =
    inventory?.reduce(
      (sum: number, inv: any) =>
        sum + (inv.product?.unitCost ?? 0) * inv.quantityOnHand,
      0,
    ) ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Package size={18} className="text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> 12%
              </span>
            </div>
            <p className="text-3xl font-bold">{totalProducts}</p>
            <p className="text-blue-200 text-sm mt-1">Total Products</p>
          </div>
        </div>

        <div
          className={`bg-gradient-to-br ${lowStockCount > 0 ? "from-amber-500 to-orange-600 shadow-amber-500/25" : "from-emerald-500 to-emerald-700 shadow-emerald-500/25"} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                {lowStockCount > 0 ? "⚠ Alert" : "✓ Good"}
              </span>
            </div>
            <p className="text-3xl font-bold">{lowStockCount}</p>
            <p className="text-white/80 text-sm mt-1">Low Stock Alerts</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart size={18} className="text-white" />
              </div>
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-3xl font-bold">{pendingOrders}</p>
            <p className="text-purple-200 text-sm mt-1">Pending Orders</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-500/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> 8.2%
              </span>
            </div>
            <p className="text-2xl font-bold">
              R
              {totalStockValue.toLocaleString("en-ZA", {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-teal-200 text-sm mt-1">Total Stock Value</p>
          </div>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-amber-800 font-semibold text-sm">
              {lowStockCount} item{lowStockCount > 1 ? "s" : ""} require
              attention
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              Stock levels are below reorder points
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={15} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">
                  Stock Levels
                </h2>
                <p className="text-gray-400 text-xs">
                  {totalProducts} products tracked
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invLoading &&
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(4)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))}
                {inventory?.slice(0, 8).map((inv: any) => {
                  const isLow =
                    inv.reorderPoint && inv.quantityOnHand <= inv.reorderPoint;
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-semibold text-gray-900">
                          {inv.product?.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {inv.product?.sku}
                        </p>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                          {inv.warehouse?.name}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-gray-900 text-sm">
                        {inv.quantityOnHand}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isLow
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isLow ? "bg-red-500" : "bg-emerald-500"}`}
                          />
                          {isLow ? "Low" : "OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={15} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Recent Orders</h2>
              <p className="text-gray-400 text-xs">
                {orders?.length ?? 0} total
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {orders?.slice(0, 8).map((order: any) => {
              const styles: Record<string, string> = {
                draft: "bg-gray-100 text-gray-600 border-gray-200",
                pending_approval:
                  "bg-amber-100 text-amber-700 border-amber-200",
                approved: "bg-blue-100 text-blue-700 border-blue-200",
                sent: "bg-purple-100 text-purple-700 border-purple-200",
                received: "bg-emerald-100 text-emerald-700 border-emerald-200",
                cancelled: "bg-red-100 text-red-700 border-red-200",
              };
              return (
                <div
                  key={order.id}
                  className="px-5 py-3.5 hover:bg-purple-50/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {order.supplier?.name}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold capitalize flex-shrink-0 border ${styles[order.status] ?? styles.draft}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-mono">
                      {order.poNumber}
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      R{Number(order.totalAmount).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {(!orders || orders.length === 0) && (
              <div className="px-6 py-12 text-center">
                <Truck size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Activity size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">System Status</p>
          <p className="text-slate-400 text-xs mt-0.5">
            All services operational · WebSocket connected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-semibold">Live</span>
        </div>
      </div>
    </div>
  );
}
