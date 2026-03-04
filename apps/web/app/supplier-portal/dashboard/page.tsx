"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Bell,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  X,
  AlertCircle,
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
  sent: { bg: "#fdf4ff", color: "#a21caf" },
  confirmed: { bg: "#f0fdf4", color: "#16a34a" },
  rejected: { bg: "#fff1f2", color: "#e11d48" },
  partial: { bg: "#fff7ed", color: "#ea580c" },
  received: { bg: "#f0fdf4", color: "#15803d" },
  cancelled: { bg: "#f8fafc", color: "#94a3b8" },
};

function getApi() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("supplier_token")
      : null;
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default function SupplierDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [hydrated, setHydrated] = useState(false);
  const [ackModal, setAckModal] = useState<{
    po: any;
    action: "confirm" | "reject";
  } | null>(null);
  const [ackNotes, setAckNotes] = useState("");

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

  const { data: notifications = [] } = useQuery({
    queryKey: ["supplier-notifications"],
    queryFn: () =>
      getApi()
        .get("/supplier-portal/notifications")
        .then((r) => r.data),
    enabled: hydrated,
  });

  const ackMutation = useMutation({
    mutationFn: ({ poId, action, notes }: any) =>
      getApi().post(`/supplier-portal/orders/${poId}/acknowledge`, {
        action,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-portal"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-notifications"] });
      setAckModal(null);
      setAckNotes("");
    },
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
  const pendingAck =
    portal?.reduce(
      (acc: number, p: any) =>
        acc +
        (p.recentOrders?.filter((o: any) => o.status === "sent").length ?? 0),
      0,
    ) ?? 0;
  const confirmed =
    portal?.reduce(
      (acc: number, p: any) =>
        acc +
        (p.recentOrders?.filter((o: any) => o.status === "confirmed").length ??
          0),
      0,
    ) ?? 0;
  const unreadNotifs = notifications.filter((n: any) => !n.isRead).length;

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
            borderTopColor: ACCENT,
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

        {/* nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            {
              label: "Dashboard",
              href: "/supplier-portal/dashboard",
              icon: TrendingUp,
            },
            {
              label: "Catalogue",
              href: "/supplier-portal/catalogue",
              icon: BookOpen,
            },
          ].map((nav) => (
            <button
              key={nav.href}
              onClick={() => router.push(nav.href)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.1)",
                color: "rgba(255,255,255,.7)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <nav.icon size={13} /> {nav.label}
            </button>
          ))}
          <button
            onClick={() => router.push("/supplier-portal/notifications")}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              color: "rgba(255,255,255,.7)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Bell size={13} /> Notifications
            {unreadNotifs > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: ACCENT,
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadNotifs}
              </span>
            )}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              {user?.firstName} {user?.lastName}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>
              {user?.email}
            </p>
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
            <LogOut size={13} />
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
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
            Welcome, {user?.firstName}
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Here's an overview of your supply relationships and orders
          </p>
        </div>

        {/* pending acknowledgement banner */}
        {pendingAck > 0 && (
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 14,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <AlertCircle size={18} color="#d97706" />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>
                Action required: {pendingAck} purchase order
                {pendingAck !== 1 ? "s" : ""} awaiting your confirmation
              </p>
              <p style={{ fontSize: 12, color: "#b45309" }}>
                Please confirm or reject orders below to notify the
                organization.
              </p>
            </div>
          </div>
        )}

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
              label: "Awaiting Confirmation",
              value: pendingAck,
              icon: Clock,
              color: "#d97706",
              bg: "#fffbeb",
            },
            {
              label: "Confirmed",
              value: confirmed,
              icon: CheckCircle,
              color: "#16a34a",
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

        {/* org + orders */}
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
          </div>
        ) : (
          portal.map((p: any) => (
            <div key={p.supplier.id} style={CARD}>
              <div
                style={{
                  padding: "18px 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
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
                    style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}
                  >
                    {p.organization.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    Supplier: {p.supplier.name}
                  </p>
                </div>
              </div>

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
                          "Action",
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
                        const canAck = order.status === "sent";
                        return (
                          <tr
                            key={order.id}
                            style={{
                              borderBottom: "1px solid #f8fafc",
                              background: canAck ? "#fffdf0" : "transparent",
                            }}
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
                            <td style={{ padding: "13px 20px" }}>
                              {canAck ? (
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button
                                    onClick={() => {
                                      setAckModal({
                                        po: order,
                                        action: "confirm",
                                      });
                                      setAckNotes("");
                                    }}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5,
                                      padding: "6px 12px",
                                      borderRadius: 8,
                                      background: "#f0fdf4",
                                      border: "1px solid #bbf7d0",
                                      color: "#16a34a",
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      fontFamily: "inherit",
                                    }}
                                  >
                                    <ThumbsUp size={12} /> Confirm
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAckModal({
                                        po: order,
                                        action: "reject",
                                      });
                                      setAckNotes("");
                                    }}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5,
                                      padding: "6px 12px",
                                      borderRadius: 8,
                                      background: "#fff1f2",
                                      border: "1px solid #fecdd3",
                                      color: ACCENT,
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      fontFamily: "inherit",
                                    }}
                                  >
                                    <ThumbsDown size={12} /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span
                                  style={{ fontSize: 12, color: "#94a3b8" }}
                                >
                                  —
                                </span>
                              )}
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

      {/* acknowledge modal */}
      {ackModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 420,
              padding: "28px",
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background:
                      ackModal.action === "confirm" ? "#f0fdf4" : "#fff1f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {ackModal.action === "confirm" ? (
                    <ThumbsUp size={16} color="#16a34a" />
                  ) : (
                    <ThumbsDown size={16} color={ACCENT} />
                  )}
                </div>
                <div>
                  <p
                    style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}
                  >
                    {ackModal.action === "confirm" ? "Confirm" : "Reject"}{" "}
                    Purchase Order
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    {ackModal.po.poNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAckModal(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={15} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              {ackModal.action === "confirm"
                ? "Confirming this order will notify the organization and update the PO status to confirmed."
                : "Rejecting this order will notify the organization. Please provide a reason below."}
            </p>

            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              {ackModal.action === "confirm"
                ? "Notes (optional)"
                : "Reason for rejection"}
            </label>
            <textarea
              value={ackNotes}
              onChange={(e) => setAckNotes(e.target.value)}
              placeholder={
                ackModal.action === "confirm"
                  ? "Any notes for the organization…"
                  : "Please explain why you are rejecting this order…"
              }
              rows={3}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10,
                fontSize: 13,
                color: "#0f172a",
                fontFamily: "inherit",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                marginBottom: 16,
              }}
            />

            {ackMutation.isError && (
              <p
                style={{
                  fontSize: 12,
                  color: ACCENT,
                  marginBottom: 12,
                  padding: "8px 12px",
                  background: "#fff1f2",
                  borderRadius: 8,
                }}
              >
                Failed to submit. Please try again.
              </p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setAckModal(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 11,
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  ackMutation.mutate({
                    poId: ackModal.po.id,
                    action: ackModal.action,
                    notes: ackNotes || undefined,
                  })
                }
                disabled={ackMutation.isPending}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 11,
                  background:
                    ackModal.action === "confirm"
                      ? "linear-gradient(135deg,#16a34a,#15803d)"
                      : `linear-gradient(135deg,${ACCENT},#be123c)`,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: ackMutation.isPending ? 0.6 : 1,
                }}
              >
                {ackMutation.isPending
                  ? "Submitting…"
                  : ackModal.action === "confirm"
                    ? "Confirm Order"
                    : "Reject Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
