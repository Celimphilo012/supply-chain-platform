"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { Package, AlertTriangle, TrendingUp, Truck } from "lucide-react";

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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-6 mb-8 lg:grid-cols-4">
        <KPICard
          title="Total Products"
          value={totalProducts}
          icon={<Package className="text-blue-600" size={24} />}
          bg="bg-blue-50"
        />
        <KPICard
          title="Low Stock Alerts"
          value={lowStockCount}
          icon={<AlertTriangle className="text-yellow-600" size={24} />}
          bg="bg-yellow-50"
          alert={lowStockCount > 0}
        />
        <KPICard
          title="Pending Orders"
          value={pendingOrders}
          icon={<Truck className="text-purple-600" size={24} />}
          bg="bg-purple-50"
        />
        <KPICard
          title="Stock Value"
          value={`R${totalStockValue.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`}
          icon={<TrendingUp className="text-green-600" size={24} />}
          bg="bg-green-50"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Current Stock Levels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Product",
                  "SKU",
                  "Warehouse",
                  "On Hand",
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
              {invLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              )}
              {inventory?.map((inv: any) => {
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
                    <td className="px-6 py-4 font-semibold">
                      {inv.quantityOnHand}
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
              {!invLoading && (!inventory || inventory.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No inventory records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Orders */}
      {orders && orders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Recent Purchase Orders
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["PO Number", "Supplier", "Amount", "Status"].map((h) => (
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
                {orders.slice(0, 10).map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm font-medium">
                      {order.poNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.supplier?.name}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      R{Number(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <POStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, icon, bg, alert = false }: any) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border ${alert ? "border-yellow-200" : "border-gray-100"} p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`${bg} p-2 rounded-lg`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function POStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    pending_approval: "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    sent: "bg-purple-100 text-purple-700",
    partial: "bg-orange-100 text-orange-700",
    received: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
