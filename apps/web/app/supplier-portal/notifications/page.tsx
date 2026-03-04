"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Bell,
  Package,
  ArrowLeft,
  CheckCheck,
  ShoppingCart,
  X,
} from "lucide-react";

const ACCENT = "#e11d48";

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

const TYPE_STYLE: Record<string, { icon: any; bg: string; color: string }> = {
  new_po: { icon: ShoppingCart, bg: "#eff6ff", color: "#2563eb" },
  po_confirmed: { icon: CheckCheck, bg: "#f0fdf4", color: "#16a34a" },
  po_rejected: { icon: X, bg: "#fff1f2", color: "#e11d48" },
  default: { icon: Bell, bg: "#f8fafc", color: "#64748b" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("supplier_token");
    if (!token) {
      router.push("/supplier-portal/login");
      return;
    }
    setHydrated(true);
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["supplier-notifications"],
    queryFn: () =>
      getApi()
        .get("/supplier-portal/notifications")
        .then((r) => r.data),
    enabled: hydrated,
  });

  const markReadMutation = useMutation({
    mutationFn: () => getApi().patch("/supplier-portal/notifications/read"),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["supplier-notifications"] }),
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/supplier-portal/dashboard")}
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,.7)",
            }}
          >
            <ArrowLeft size={15} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              Notifications
            </span>
            {unreadCount > 0 && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: ACCENT,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markReadMutation.mutate()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
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
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      <div
        style={{
          padding: "clamp(16px,3vw,28px)",
          maxWidth: 700,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
            Notifications
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>

        {isLoading && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              padding: 40,
              textAlign: "center",
            }}
          >
            <p style={{ color: "#94a3b8" }}>Loading…</p>
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "2px dashed #e2e8f0",
              padding: "60px 20px",
              textAlign: "center",
            }}
          >
            <Bell size={36} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>
              No notifications yet
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              You'll be notified when organizations send you purchase orders.
            </p>
          </div>
        )}

        {notifications.map((n: any) => {
          const s = TYPE_STYLE[n.type] ?? TYPE_STYLE.default;
          const Icon = s.icon;
          return (
            <div
              key={n.id}
              style={{
                background: "#fff",
                borderRadius: 14,
                border: `1px solid ${n.isRead ? "#e2e8f0" : s.color + "33"}`,
                padding: "16px 20px",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                boxShadow: n.isRead ? "none" : `0 2px 8px ${s.color}15`,
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
                <Icon size={17} color={s.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: n.isRead ? 600 : 700,
                      color: "#0f172a",
                    }}
                  >
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: s.color,
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                  )}
                </div>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
                  {n.message}
                </p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                  {new Date(n.createdAt).toLocaleString("en-ZA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
