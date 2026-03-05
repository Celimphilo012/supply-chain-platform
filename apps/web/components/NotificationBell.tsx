"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Bell,
  CheckCheck,
  ShoppingCart,
  Package,
  X,
  AlertCircle,
} from "lucide-react";

const TYPE_STYLE: Record<string, { icon: any; bg: string; color: string }> = {
  po_confirmed: { icon: CheckCheck, bg: "#f0fdf4", color: "#16a34a" },
  po_rejected: { icon: X, bg: "#fff1f2", color: "#e11d48" },
  new_po: { icon: ShoppingCart, bg: "#eff6ff", color: "#2563eb" },
  default: { icon: AlertCircle, bg: "#f8fafc", color: "#64748b" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["org-notifications"],
    queryFn: () => api.get("/notifications").then((r) => r.data),
    refetchInterval: 30000, // poll every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.patch("/notifications/read"),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["org-notifications"] }),
  });

  const unread = notifications.filter((n) => !n.isRead).length;

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open && unread > 0) {
      setTimeout(() => markReadMutation.mutate(), 1500);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        style={{
          position: "relative",
          width: 38,
          height: 38,
          borderRadius: 10,
          background: open ? "#f1f5f9" : "transparent",
          border: "1px solid transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#64748b",
          transition: "all .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "transparent";
        }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#e11d48",
              color: "#fff",
              fontSize: 9,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            width: 360,
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 16px 48px rgba(0,0,0,.12)",
            zIndex: 100,
            overflow: "hidden",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {/* header */}
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                Notifications
              </p>
              {unread > 0 && (
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "#e11d48",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={() => markReadMutation.mutate()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#64748b",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* list */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <Bell
                  size={28}
                  color="#e2e8f0"
                  style={{ margin: "0 auto 8px" }}
                />
                <p style={{ fontSize: 13, color: "#94a3b8" }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n: any) => {
                const s = TYPE_STYLE[n.type] ?? TYPE_STYLE.default;
                const Icon = s.icon;
                return (
                  <div
                    key={n.id}
                    style={{
                      padding: "12px 18px",
                      borderBottom: "1px solid #f8fafc",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      background: n.isRead ? "#fff" : "#fafbff",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: s.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} color={s.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 6,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: n.isRead ? 500 : 700,
                            color: "#0f172a",
                            lineHeight: 1.3,
                          }}
                        >
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: "#e11d48",
                              flexShrink: 0,
                              marginTop: 4,
                            }}
                          />
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          marginTop: 2,
                          lineHeight: 1.4,
                        }}
                      >
                        {n.message}
                      </p>
                      <p
                        style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}
                      >
                        {new Date(n.createdAt).toLocaleString("en-ZA", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
