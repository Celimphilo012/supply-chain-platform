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
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: Package,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
  {
    href: "/dashboard/suppliers",
    label: "Suppliers",
    icon: Truck,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  {
    href: "/dashboard/purchase-orders",
    label: "Purchase Orders",
    icon: ShoppingCart,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  {
    href: "/dashboard/forecasting",
    label: "Forecasting",
    icon: TrendingUp,
    color: "text-pink-400",
    bg: "bg-pink-500/20",
  },
];

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
    if (!hydrated) return;
    if (!isAuthenticated) router.push("/login");
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-200 text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const currentItem = navItems.find((item) => item.href === pathname);
  const currentPage = currentItem?.label ?? "Dashboard";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f0f4f8" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
        }}
      >
        {/* Logo area */}
        <div
          className="flex items-center justify-between px-5 h-16 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight truncate max-w-[120px]">
                {organization?.name ?? "Supply Chain"}
              </p>
              <p className="text-slate-500 text-xs">Pro workspace</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* User card */}
        <div
          className="mx-3 my-3 rounded-2xl p-3 flex items-center gap-3 flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white",
            }}
          >
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
          <div
            className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
            title="Online"
          />
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest px-3 mb-3 mt-1">
            Navigation
          </p>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${active ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))",
                        border: "1px solid rgba(99,102,241,0.4)",
                      }
                    : {}
                }
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-blue-400" />
                )}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? item.bg : "bg-white/5 group-hover:bg-white/10"}`}
                >
                  <item.icon
                    size={14}
                    className={
                      active
                        ? item.color
                        : "text-slate-400 group-hover:text-slate-200"
                    }
                  />
                </div>
                <span className="flex-1">{item.label}</span>
                {active && (
                  <ChevronRight size={12} className="text-slate-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div
          className="px-3 pb-4 space-y-1 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="px-3 py-2 mt-3">
            <span
              className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full capitalize"
              style={{
                background: "rgba(16,185,129,0.15)",
                color: "#34d399",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all w-full text-sm font-medium"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5">
              <LogOut size={14} />
            </div>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header
          className="h-16 flex items-center justify-between px-6 flex-shrink-0 bg-white"
          style={{
            borderBottom: "1px solid #e8edf2",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-700 p-1"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                {currentItem && (
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center ${currentItem.bg.replace("20", "10")}`}
                  >
                    <currentItem.icon size={12} className={currentItem.color} />
                  </div>
                )}
                <h1 className="text-gray-900 font-bold text-base">
                  {currentPage}
                </h1>
              </div>
              <p className="text-gray-400 text-xs">
                {new Date().toLocaleDateString("en-ZA", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
              <Bell size={16} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-white" />
            </button>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            >
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-auto"
          style={{ background: "#f0f4f8" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
