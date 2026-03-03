"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  TrendingUp,
  Warehouse,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
} from "lucide-react";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    accent: "#3b82f6",
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: Package,
    accent: "#10b981",
  },
  {
    href: "/dashboard/suppliers",
    label: "Suppliers",
    icon: Truck,
    accent: "#8b5cf6",
  },
  {
    href: "/dashboard/purchase-orders",
    label: "Purchase Orders",
    icon: ShoppingCart,
    accent: "#f59e0b",
  },
  {
    href: "/dashboard/forecasting",
    label: "Forecasting",
    icon: TrendingUp,
    accent: "#ec4899",
  },
  {
    href: "/dashboard/warehouses",
    label: "Warehouses",
    icon: Warehouse,
    accent: "a11d48",
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: Package,
    accent: "#10b981",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    accent: "#6366f1",
  },
];

const SIDEBAR_BG = "#0f172a";
const SIDEBAR_W = "240px";
const TOPBAR_H = "60px";
const PAGE_BG = "#f1f5f9";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, organization, logout, loadFromStorage } =
    useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push("/login");
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: SIDEBAR_BG,
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: "3px solid rgba(99,102,241,.3)",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              margin: "0 auto 14px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>
            Loading workspace…
          </p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (!isAuthenticated) return null;

  const current = NAV.find((n) => n.href === pathname) ?? NAV[0];
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Outfit', sans-serif",
        background: PAGE_BG,
      }}
    >
      {/* ── mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            zIndex: 40,
            backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* ════════════════════════════════
          SIDEBAR
      ════════════════════════════════ */}
      <aside
        style={{
          position: "fixed" as const,
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_W,
          background: SIDEBAR_BG,
          display: "flex",
          flexDirection: "column" as const,
          zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : undefined,
          transition: "transform .2s ease",
          // on desktop always visible via CSS below
        }}
        className="lg-sidebar"
      >
        <style>{`
          @media(min-width:1024px){
            .lg-sidebar{ transform:translateX(0) !important; position:static !important; flex-shrink:0; }
            .lg-push{ margin-left:0 !important; }
          }
          @media(max-width:1023px){
            .lg-sidebar{ transform:translateX(${sidebarOpen ? "0" : "-100%"}); }
          }
        `}</style>

        {/* logo */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 14px rgba(99,102,241,.4)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: 1.2,
                  maxWidth: 130,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {organization?.name ?? "Supply Chain"}
              </p>
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>
                Pro Workspace
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,.3)",
              padding: 4,
              display: "flex",
            }}
            className="lg-hide"
          >
            <X size={16} />
          </button>
          <style>{`.lg-hide{display:flex}@media(min-width:1024px){.lg-hide{display:none}}`}</style>
        </div>

        {/* user card */}
        <div
          style={{
            margin: "12px 12px 4px",
            padding: "10px 12px",
            background: "rgba(255,255,255,.05)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.firstName} {user?.lastName}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,.3)",
                fontSize: 11,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </p>
          </div>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 6px #10b981",
              flexShrink: 0,
            }}
          />
        </div>

        {/* nav */}
        <nav
          style={{
            flex: 1,
            padding: "8px 10px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,.2)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "8px 10px 6px",
            }}
          >
            Menu
          </p>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 11,
                  textDecoration: "none",
                  transition: "background .15s",
                  background: active ? "rgba(255,255,255,.08)" : "transparent",
                  borderLeft: active
                    ? `3px solid ${item.accent}`
                    : "3px solid transparent",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: active
                      ? `${item.accent}22`
                      : "rgba(255,255,255,.05)",
                  }}
                >
                  <item.icon
                    size={14}
                    color={active ? item.accent : "rgba(255,255,255,.35)"}
                  />
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#fff" : "rgba(255,255,255,.45)",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* sign out */}
        <div
          style={{
            padding: "10px 10px 16px",
            borderTop: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <div style={{ padding: "6px 12px 10px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(16,185,129,.12)",
                border: "1px solid rgba(16,185,129,.2)",
                borderRadius: 20,
                padding: "3px 10px",
                color: "#34d399",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#34d399",
                }}
              />
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 11,
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "background .15s",
              color: "rgba(255,255,255,.35)",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(239,68,68,.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,.35)";
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(255,255,255,.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LogOut size={14} />
            </div>
            Sign out
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════
          MAIN AREA
      ════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* topbar */}
        <header
          style={{
            height: TOPBAR_H,
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            flexShrink: 0,
            boxShadow: "0 1px 3px rgba(0,0,0,.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg-hide"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                padding: 4,
              }}
            >
              <Menu size={20} />
            </button>
            <div>
              <p
                style={{
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1.2,
                }}
              >
                {current.label}
              </p>
              <p style={{ color: "#94a3b8", fontSize: 12 }}>
                {new Date().toLocaleDateString("en-ZA", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* live badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 20,
                padding: "4px 12px",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 6px #22c55e",
                  animation: "pulse 2s infinite",
                }}
              />
              <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 600 }}>
                Live
              </span>
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

            {/* bell */}
            <button
              style={{
                position: "relative",
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Bell size={16} color="#64748b" />
              <span
                style={{
                  position: "absolute",
                  top: 7,
                  right: 7,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "2px solid #fff",
                }}
              />
            </button>

            {/* avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* page content */}
        <main style={{ flex: 1, overflowY: "auto", background: PAGE_BG }}>
          {children}
        </main>
      </div>
    </div>
  );
}
