"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Truck,
} from "lucide-react";

// ── reusable styles ───────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,.04)",
};

const sectionHead: React.CSSProperties = {
  padding: "14px 20px",
  borderBottom: "1px solid #f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#fafbfc",
};

const th: React.CSSProperties = {
  padding: "10px 20px",
  textAlign: "left" as const,
  fontSize: 11,
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  background: "#f8fafc",
  borderBottom: "1px solid #f1f5f9",
};

// ── status badge colours ──────────────────────────────────────────────────
const STATUS: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#f1f5f9", color: "#64748b" },
  pending_approval: { bg: "#fffbeb", color: "#d97706" },
  approved: { bg: "#eff6ff", color: "#2563eb" },
  sent: { bg: "#f5f3ff", color: "#7c3aed" },
  received: { bg: "#f0fdf4", color: "#16a34a" },
  cancelled: { bg: "#fff1f2", color: "#e11d48" },
};

// ── skeleton row ──────────────────────────────────────────────────────────
function Skel({ cols }: { cols: number }) {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <tr key={i}>
          {[...Array(cols)].map((_, j) => (
            <td key={j} style={{ padding: "12px 20px" }}>
              <div
                style={{
                  height: 14,
                  borderRadius: 6,
                  background: "#f1f5f9",
                  width: `${50 + j * 12}%`,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────
function KPI({
  label,
  value,
  icon,
  grad,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  grad: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: 20,
        background: grad,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,.1)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "rgba(255,255,255,.08)",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "rgba(255,255,255,.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{label}</p>
      {sub && (
        <p style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>{sub}</p>
      )}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────
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
    socket.on("inventory:updated", () =>
      queryClient.invalidateQueries({ queryKey: ["inventory"] }),
    );
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
  const stockValue =
    inventory?.reduce(
      (s: number, i: any) => s + (i.product?.unitCost ?? 0) * i.quantityOnHand,
      0,
    ) ?? 0;

  return (
    <div
      style={{
        padding: "clamp(16px,3vw,28px)",
        maxWidth: 1280,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 22,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .kpi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
        @media(min-width:900px){.kpi-grid{grid-template-columns:repeat(4,1fr)}}
        .main-grid{display:grid;grid-template-columns:1fr;gap:20px}
        @media(min-width:1024px){.main-grid{grid-template-columns:1fr 340px}}
        tr:hover td{background:#fafbff}
      `}</style>

      {/* ── KPI row ── */}
      <div className="kpi-grid">
        <KPI
          label="Total Products"
          value={totalProducts}
          grad="linear-gradient(135deg,#3b82f6,#2563eb)"
          icon={<Package size={18} color="#fff" />}
          sub="across all warehouses"
        />
        <KPI
          label="Low Stock Alerts"
          value={lowStockCount}
          grad={
            lowStockCount > 0
              ? "linear-gradient(135deg,#f59e0b,#d97706)"
              : "linear-gradient(135deg,#10b981,#059669)"
          }
          icon={<AlertTriangle size={18} color="#fff" />}
          sub={lowStockCount > 0 ? "Needs attention" : "All good"}
        />
        <KPI
          label="Pending Orders"
          value={pendingOrders}
          grad="linear-gradient(135deg,#8b5cf6,#7c3aed)"
          icon={<ShoppingCart size={18} color="#fff" />}
          sub="awaiting action"
        />
        <KPI
          label="Stock Value"
          value={`R${(stockValue / 1000).toFixed(1)}K`}
          grad="linear-gradient(135deg,#0ea5e9,#0284c7)"
          icon={<TrendingUp size={18} color="#fff" />}
          sub="total inventory"
        />
      </div>

      {/* ── low stock banner ── */}
      {lowStockCount > 0 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 14,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={16} color="#d97706" />
          </div>
          <div>
            <p style={{ color: "#92400e", fontWeight: 600, fontSize: 14 }}>
              {lowStockCount} item{lowStockCount > 1 ? "s" : ""} below reorder
              point
            </p>
            <p style={{ color: "#b45309", fontSize: 12, marginTop: 2 }}>
              Review inventory levels to avoid stockouts
            </p>
          </div>
        </div>
      )}

      {/* ── main 2-col grid ── */}
      <div className="main-grid">
        {/* Inventory table */}
        <div style={card}>
          <div style={sectionHead}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Package size={15} color="#3b82f6" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                  Stock Levels
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>
                  {totalProducts} products
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 20,
                padding: "4px 10px",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "pulse 2s infinite",
                }}
              />
              <span style={{ color: "#16a34a", fontSize: 11, fontWeight: 600 }}>
                Live
              </span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Product</th>
                  <th style={th}>Warehouse</th>
                  <th style={{ ...th, textAlign: "right" }}>Qty</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invLoading && <Skel cols={4} />}
                {inventory?.slice(0, 8).map((inv: any) => {
                  const isLow =
                    inv.reorderPoint && inv.quantityOnHand <= inv.reorderPoint;
                  return (
                    <tr
                      key={inv.id}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        transition: "background .1s",
                      }}
                    >
                      <td style={{ padding: "12px 20px" }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {inv.product?.name}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            fontFamily: "monospace",
                          }}
                        >
                          {inv.product?.sku}
                        </p>
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#475569",
                            background: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            borderRadius: 6,
                            padding: "3px 8px",
                          }}
                        >
                          {inv.warehouse?.name}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 20px",
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#0f172a",
                        }}
                      >
                        {inv.quantityOnHand}
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: isLow ? "#fff1f2" : "#f0fdf4",
                            color: isLow ? "#e11d48" : "#16a34a",
                            border: `1px solid ${isLow ? "#fecdd3" : "#bbf7d0"}`,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: isLow ? "#e11d48" : "#22c55e",
                            }}
                          />
                          {isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!invLoading && (!inventory || inventory.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ padding: "48px 20px", textAlign: "center" }}
                    >
                      <Package
                        size={36}
                        color="#e2e8f0"
                        style={{ margin: "0 auto 10px" }}
                      />
                      <p style={{ color: "#94a3b8", fontSize: 13 }}>
                        No inventory records yet
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent orders */}
        <div style={card}>
          <div style={sectionHead}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#f5f3ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingCart size={15} color="#8b5cf6" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                  Recent Orders
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>
                  {orders?.length ?? 0} total
                </p>
              </div>
            </div>
          </div>
          <div>
            {orders?.slice(0, 8).map((order: any) => {
              const s = STATUS[order.status] ?? STATUS.draft;
              return (
                <div
                  key={order.id}
                  style={{
                    padding: "13px 18px",
                    borderBottom: "1px solid #f8fafc",
                    transition: "background .1s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      "#fafbff")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 5,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0f172a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {order.supplier?.name}
                    </p>
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: s.bg,
                        color: s.color,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        textTransform: "capitalize",
                      }}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        fontFamily: "monospace",
                      }}
                    >
                      {order.poNumber}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      R{Number(order.totalAmount).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {(!orders || orders.length === 0) && (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <Truck
                  size={36}
                  color="#e2e8f0"
                  style={{ margin: "0 auto 10px" }}
                />
                <p style={{ color: "#94a3b8", fontSize: 13 }}>No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* status bar */}
      <div
        style={{
          background: "#0f172a",
          borderRadius: 14,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "rgba(255,255,255,.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 8px #22c55e",
              animation: "pulse 2s infinite",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
            All systems operational
          </p>
          <p
            style={{
              color: "rgba(255,255,255,.3)",
              fontSize: 12,
              marginTop: 1,
            }}
          >
            WebSocket connected · Real-time updates active
          </p>
        </div>
        <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 700 }}>
          ● Live
        </span>
      </div>
    </div>
  );
}
