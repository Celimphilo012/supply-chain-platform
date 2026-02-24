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
  ArrowDownRight,
} from "lucide-react";

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 bg-gray-100 rounded animate-pulse"
            style={{ width: `${60 + i * 10}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

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
    <div className="p-6 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Products"
          value={totalProducts}
          icon={<Package size={18} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend="+12%"
          trendUp={true}
        />
        <KPICard
          title="Low Stock Alerts"
          value={lowStockCount}
          icon={<AlertTriangle size={18} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          alert={lowStockCount > 0}
          trend={lowStockCount > 0 ? "Action needed" : "All good"}
          trendUp={lowStockCount === 0}
        />
        <KPICard
          title="Pending Orders"
          value={pendingOrders}
          icon={<Truck size={18} />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          trend={`${pendingOrders} active`}
          trendUp={true}
        />
        <KPICard
          title="Stock Value"
          value={`R${totalStockValue.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`}
          icon={<TrendingUp size={18} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend="+8.2%"
          trendUp={true}
        />
      </div>

      {/* Low stock banner */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-amber-800 font-medium text-sm">
              {lowStockCount} item{lowStockCount > 1 ? "s" : ""} below reorder
              point
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              Review inventory levels to avoid stockouts
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Inventory Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">
                Stock Levels
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {totalProducts} products tracked
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    On Hand
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invLoading &&
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                {inventory?.slice(0, 8).map((inv: any) => {
                  const isLow =
                    inv.reorderPoint && inv.quantityOnHand <= inv.reorderPoint;
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-medium text-gray-900">
                          {inv.product?.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {inv.product?.sku}
                        </p>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-500">
                        {inv.warehouse?.name}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {inv.quantityOnHand}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
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
                {!invLoading && (!inventory || inventory.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Package
                        size={32}
                        className="mx-auto text-gray-200 mb-3"
                      />
                      <p className="text-gray-400 text-sm">
                        No inventory records yet
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent POs */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">
              Recent Orders
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              {orders?.length ?? 0} total orders
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {orders?.slice(0, 8).map((order: any) => (
              <div
                key={order.id}
                className="px-6 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.supplier?.name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {order.poNumber}
                    </p>
                  </div>
                  <POStatusBadge status={order.status} />
                </div>
                <p className="text-sm font-semibold text-gray-700 mt-1.5">
                  R{Number(order.totalAmount).toLocaleString()}
                </p>
              </div>
            ))}
            {(!orders || orders.length === 0) && (
              <div className="px-6 py-12 text-center">
                <Truck size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">No purchase orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  trend,
  trendUp,
  alert = false,
}: any) {
  return (
    <div
      className={`bg-white rounded-2xl border ${alert ? "border-amber-200" : "border-gray-200"} p-5`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBg} ${iconColor} p-2 rounded-lg`}>{icon}</div>
        <span
          className={`flex items-center gap-1 text-xs font-medium ${trendUp ? "text-emerald-600" : "text-red-500"}`}
        >
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{title}</p>
    </div>
  );
}

function POStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    pending_approval: "bg-amber-50 text-amber-700",
    approved: "bg-blue-50 text-blue-700",
    sent: "bg-purple-50 text-purple-700",
    partial: "bg-orange-50 text-orange-700",
    received: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize flex-shrink-0 ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
