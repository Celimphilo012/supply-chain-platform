"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Package,
  Building2,
  ShoppingCart,
  LogOut,
  Clock,
  CheckCircle,
  TrendingUp,
  Truck,
} from "lucide-react";

const ACCENT = "#e11d48";
const CARD: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,.04)",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#f8fafc", color: "#64748b" },
  pending_approval: { bg: "#fffbeb", color: "#d97706" },
  approved: { bg: "#eff6ff", color: "#2563eb" },
  sent: { bg: "#f5f3ff", color: "#7c3aed" },
  partial: { bg: "#fff7ed", color: "#ea580c" },
  received: { bg: "#f0fdf4", color: "#16a34a" },
  cancelled: { bg: "#fff1f2", color: "#e11d48" },
};

function getApi() {
  const token = localStorage.getItem("supplier_token");
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default function SupplierDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("supplier_token");
    const userData = localStorage.getItem("supplier_user");
    if (!token || !userData) {
      router.push("/supplier-portal/login");
      return;
    }
    setUser(JSON.parse(userData));
    setHydrated(true);
  }, []);

  const { data: portal, isLoading } = useQuery({
    queryKey: ["supplier-portal"],
    queryFn: () =>
      getApi()
        .get("/supplier-portal/portal")
        .then((r) => r.data),
    enabled: hydrated,
  });

  const logout = () => {
    localStorage.removeItem("supplier_token");
    localStorage.removeItem("supplier_user");
    router.push("/supplier-portal/login");
  };

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();
  const totalOrders =
    portal?.reduce(
      (acc: number, p: any) => acc + (p.recentOrders?.length ?? 0),
      0,
    ) ?? 0;
  const pendingOrders =
    portal?.reduce(
      (acc: number, p: any) =>
        acc +
        (p.recentOrders?.filter((o: any) =>
          ["approved", "sent", "pending_approval"].includes(o.status),
        ).length ?? 0),
      0,
    ) ?? 0;

  if (!hydrated)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(255,255,255,.2)",
            borderTopColor: "#e11d48",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* topbar */}
      <div
        style={{
          background: "#0f172a",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: `linear-gradient(135deg,${ACCENT},#be123c)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
            Supplier Portal
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg,${ACCENT},#be123c)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {initials || "?"}
            </div>
            <div style={{ display: "none" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>
                {user?.email}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.7)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "clamp(16px,3vw,28px)",
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* welcome */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
            Welcome back, {user?.firstName}
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Here's an overview of your supply relationships and orders
          </p>
        </div>

        {/* stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 14,
          }}
        >
          {[
            {
              label: "Organizations",
              value: portal?.length ?? 0,
              icon: Building2,
              color: "#3b82f6",
              bg: "#eff6ff",
            },
            {
              label: "Total Orders",
              value: totalOrders,
              icon: ShoppingCart,
              color: "#8b5cf6",
              bg: "#f5f3ff",
            },
            {
              label: "Pending Orders",
              value: pendingOrders,
              icon: Clock,
              color: "#f59e0b",
              bg: "#fffbeb",
            },
            {
              label: "Completed",
              value: totalOrders - pendingOrders,
              icon: CheckCircle,
              color: "#10b981",
              bg: "#f0fdf4",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                ...CARD,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <s.icon size={17} color={s.color} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: s.color,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* org cards */}
        {isLoading ? (
          <div style={{ ...CARD, padding: 40, textAlign: "center" }}>
            <p style={{ color: "#94a3b8" }}>Loading your portal…</p>
          </div>
        ) : !portal?.length ? (
          <div style={{ ...CARD, padding: "60px 20px", textAlign: "center" }}>
            <Truck
              size={40}
              color="#e2e8f0"
              style={{ margin: "0 auto 12px" }}
            />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>
              No organizations yet
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              You'll appear here once an organization accepts your invite
            </p>
          </div>
        ) : (
          portal.map((p: any) => (
            <div key={p.supplier.id} style={CARD}>
              {/* org header */}
              <div
                style={{
                  padding: "18px 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      background: "#f5f3ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Building2 size={20} color="#7c3aed" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {p.organization.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>
                      Supplier: {p.supplier.name}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "6px 14px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {p.recentOrders?.length ?? 0}
                    </p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>Orders</p>
                  </div>
                </div>
              </div>

              {/* orders table */}
              {p.recentOrders?.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {[
                          "PO Number",
                          "Status",
                          "Items",
                          "Total",
                          "Expected Delivery",
                          "Notes",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 20px",
                              textAlign: "left",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              background: "#f8fafc",
                              borderBottom: "1px solid #f1f5f9",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {p.recentOrders.map((order: any) => {
                        const ss =
                          STATUS_STYLE[order.status] ?? STATUS_STYLE.draft;
                        return (
                          <tr
                            key={order.id}
                            style={{ borderBottom: "1px solid #f8fafc" }}
                          >
                            <td style={{ padding: "13px 20px" }}>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontFamily: "monospace",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 4,
                                  padding: "2px 7px",
                                  color: "#475569",
                                }}
                              >
                                {order.poNumber}
                              </span>
                            </td>
                            <td style={{ padding: "13px 20px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 10px",
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: ss.bg,
                                  color: ss.color,
                                  border: `1px solid ${ss.color}33`,
                                  textTransform: "capitalize",
                                }}
                              >
                                {order.status.replace("_", " ")}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "13px 20px",
                                fontSize: 13,
                                color: "#475569",
                              }}
                            >
                              {order.items?.length ?? 0} item
                              {order.items?.length !== 1 ? "s" : ""}
                            </td>
                            <td
                              style={{
                                padding: "13px 20px",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {order.totalAmount
                                ? `${order.currency} ${parseFloat(order.totalAmount).toLocaleString()}`
                                : "—"}
                            </td>
                            <td
                              style={{
                                padding: "13px 20px",
                                fontSize: 12,
                                color: "#64748b",
                              }}
                            >
                              {order.expectedDeliveryDate
                                ? new Date(
                                    order.expectedDeliveryDate,
                                  ).toLocaleDateString("en-ZA")
                                : "—"}
                            </td>
                            <td
                              style={{
                                padding: "13px 20px",
                                fontSize: 12,
                                color: "#94a3b8",
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {order.notes || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <TrendingUp
                    size={28}
                    color="#e2e8f0"
                    style={{ margin: "0 auto 8px" }}
                  />
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>
                    No purchase orders yet
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
