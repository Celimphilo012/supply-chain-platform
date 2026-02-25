"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  X,
  TrendingDown,
} from "lucide-react";

// ── shared style tokens ───────────────────────────────────────────────────
const PAGE_PAD = "clamp(16px,3vw,28px)";
const CARD: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,.04)",
};
const TH: React.CSSProperties = {
  padding: "10px 20px",
  textAlign: "left" as const,
  fontSize: 11,
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  background: "#f8fafc",
  borderBottom: "1px solid #f1f5f9",
  whiteSpace: "nowrap" as const,
};
const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "#f8fafc",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  fontSize: 13,
  color: "#0f172a",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color .15s",
};
const SELECT: React.CSSProperties = { ...INPUT };
const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

// ── stat mini-card ─────────────────────────────────────────────────────────
function Stat({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        ...CARD,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Package size={18} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>
          {value}
        </p>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{label}</p>
      </div>
    </div>
  );
}

// ── skeleton rows ──────────────────────────────────────────────────────────
function Skeletons() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
          {[...Array(6)].map((_, j) => (
            <td key={j} style={{ padding: "14px 20px" }}>
              <div
                style={{
                  height: 13,
                  borderRadius: 6,
                  background: "#f1f5f9",
                  width: `${45 + j * 9}%`,
                  animation: "skpulse 1.4s ease-in-out infinite",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── modal field wrapper ────────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustData, setAdjustData] = useState({
    productId: "",
    warehouseId: "",
    quantityDelta: 0,
    transactionType: "adjustment",
    notes: "",
  });

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.get("/inventory").then((r) => r.data),
  });
  const { data: lowStock } = useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: () => api.get("/inventory/low-stock").then((r) => r.data),
  });
  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/warehouses").then((r) => r.data),
  });
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((r) => r.data),
  });

  const adjustMutation = useMutation({
    mutationFn: (data: any) => api.post("/inventory/adjust", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowAdjust(false);
      setAdjustData({
        productId: "",
        warehouseId: "",
        quantityDelta: 0,
        transactionType: "adjustment",
        notes: "",
      });
    },
  });

  const filtered = inventory?.filter(
    (inv: any) =>
      inv.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.product?.sku?.toLowerCase().includes(search.toLowerCase()),
  );
  const totalCount = inventory?.length ?? 0;
  const lowStockCount = lowStock?.length ?? 0;
  const inStockCount = totalCount - lowStockCount;

  const set = (k: string, v: any) => setAdjustData((d) => ({ ...d, [k]: v }));

  return (
    <div
      style={{
        padding: PAGE_PAD,
        maxWidth: 1280,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`
        @keyframes skpulse{0%,100%{opacity:1}50%{opacity:.4}}
        .inv-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        @media(max-width:600px){.inv-stats{grid-template-columns:1fr 1fr}}
        tr:hover td{background:#f8faff !important}
        .adj-input:focus{border-color:#6366f1 !important;background:#fff !important}
      `}</style>

      {/* ── page header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.2,
            }}
          >
            Inventory
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Track and manage stock across all warehouses
          </p>
        </div>
        <button
          onClick={() => setShowAdjust(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(99,102,241,.35)",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = ".88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={15} />
          Adjust Stock
        </button>
      </div>

      {/* ── stat row ── */}
      <div className="inv-stats">
        <Stat
          label="Total SKUs"
          value={totalCount}
          color="#3b82f6"
          bg="#eff6ff"
        />
        <Stat
          label="In Stock"
          value={inStockCount}
          color="#16a34a"
          bg="#f0fdf4"
        />
        <Stat
          label="Low Stock"
          value={lowStockCount}
          color={lowStockCount > 0 ? "#d97706" : "#16a34a"}
          bg={lowStockCount > 0 ? "#fffbeb" : "#f0fdf4"}
        />
      </div>

      {/* ── alert banner ── */}
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
            <p style={{ fontSize: 14, fontWeight: 600, color: "#92400e" }}>
              {lowStockCount} item{lowStockCount > 1 ? "s" : ""} below reorder
              point
            </p>
            <p style={{ fontSize: 12, color: "#b45309", marginTop: 2 }}>
              Review and restock to avoid disruptions
            </p>
          </div>
        </div>
      )}

      {/* ── table card ── */}
      <div style={CARD}>
        {/* search bar */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fafbfc",
          }}
        >
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <Search
              size={14}
              color="#94a3b8"
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search products or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...INPUT, paddingLeft: 34, fontSize: 13 }}
              className="adj-input"
            />
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>
            {filtered?.length ?? 0} result
            {(filtered?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>

        {/* table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Product</th>
                <th style={TH}>Warehouse</th>
                <th style={{ ...TH, textAlign: "right" }}>On Hand</th>
                <th style={{ ...TH, textAlign: "right" }}>Reserved</th>
                <th style={{ ...TH, textAlign: "right" }}>Reorder Pt</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <Skeletons />}

              {filtered?.map((inv: any) => {
                const isLow =
                  inv.reorderPoint && inv.quantityOnHand <= inv.reorderPoint;
                const pct = inv.reorderPoint
                  ? Math.min(
                      (inv.quantityOnHand / (inv.reorderPoint * 2)) * 100,
                      100,
                    )
                  : 80;
                return (
                  <tr
                    key={inv.id}
                    style={{
                      borderBottom: "1px solid #f8fafc",
                      transition: "background .1s",
                    }}
                  >
                    {/* product */}
                    <td style={{ padding: "13px 20px" }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {inv.product?.name}
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          fontFamily: "monospace",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          padding: "1px 6px",
                          display: "inline-block",
                          marginTop: 3,
                        }}
                      >
                        {inv.product?.sku}
                      </span>
                    </td>

                    {/* warehouse */}
                    <td style={{ padding: "13px 20px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#475569",
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                          padding: "3px 9px",
                        }}
                      >
                        {inv.warehouse?.name}
                      </span>
                    </td>

                    {/* on hand + mini bar */}
                    <td style={{ padding: "13px 20px", textAlign: "right" }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "#0f172a",
                          lineHeight: 1,
                        }}
                      >
                        {inv.quantityOnHand}
                      </p>
                      {inv.reorderPoint && (
                        <div
                          style={{
                            width: 56,
                            height: 4,
                            borderRadius: 99,
                            background: "#f1f5f9",
                            marginTop: 5,
                            marginLeft: "auto",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 99,
                              width: `${pct}%`,
                              background: isLow
                                ? "linear-gradient(90deg,#ef4444,#f97316)"
                                : "linear-gradient(90deg,#10b981,#34d399)",
                            }}
                          />
                        </div>
                      )}
                    </td>

                    {/* reserved */}
                    <td
                      style={{
                        padding: "13px 20px",
                        textAlign: "right",
                        fontSize: 13,
                        color: "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      {inv.quantityReserved ?? 0}
                    </td>

                    {/* reorder */}
                    <td
                      style={{
                        padding: "13px 20px",
                        textAlign: "right",
                        fontSize: 13,
                        color: "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      {inv.reorderPoint ?? "—"}
                    </td>

                    {/* status badge */}
                    <td style={{ padding: "13px 20px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "4px 10px",
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

              {/* empty state */}
              {!isLoading && (!filtered || filtered.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "60px 20px", textAlign: "center" }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        background: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <TrendingDown size={26} color="#cbd5e1" />
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      No inventory found
                    </p>
                    <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                      Try a different search term
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════
          ADJUST STOCK MODAL
      ════════════════════════════════ */}
      {showAdjust && (
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
              maxWidth: 460,
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              overflow: "hidden",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {/* modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Package size={16} color="#fff" />
                </div>
                <div>
                  <p
                    style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}
                  >
                    Adjust Stock
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    Update inventory quantities
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdjust(false)}
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

            {/* modal body */}
            <div
              style={{
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <Field label="Product">
                <select
                  value={adjustData.productId}
                  onChange={(e) => set("productId", e.target.value)}
                  style={SELECT}
                  className="adj-input"
                >
                  <option value="">Select product…</option>
                  {products?.data?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Warehouse">
                <select
                  value={adjustData.warehouseId}
                  onChange={(e) => set("warehouseId", e.target.value)}
                  style={SELECT}
                  className="adj-input"
                >
                  <option value="">Select warehouse…</option>
                  {warehouses?.map((w: any) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Transaction Type">
                <select
                  value={adjustData.transactionType}
                  onChange={(e) => set("transactionType", e.target.value)}
                  style={SELECT}
                  className="adj-input"
                >
                  <option value="receipt">Receipt — add stock</option>
                  <option value="sale">Sale — remove stock</option>
                  <option value="adjustment">Manual adjustment</option>
                  <option value="write_off">Write off</option>
                  <option value="return">Return</option>
                </select>
              </Field>

              <Field label="Quantity">
                <input
                  type="number"
                  min="0"
                  value={Math.abs(adjustData.quantityDelta)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const delta = ["sale", "write_off"].includes(
                      adjustData.transactionType,
                    )
                      ? -val
                      : val;
                    set("quantityDelta", delta);
                  }}
                  style={INPUT}
                  className="adj-input"
                />
              </Field>

              <Field label="Notes">
                <input
                  type="text"
                  value={adjustData.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Reason for adjustment…"
                  style={INPUT}
                  className="adj-input"
                />
              </Field>
            </div>

            {/* modal footer */}
            <div style={{ padding: "0 22px 20px", display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowAdjust(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 11,
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f1f5f9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
              >
                Cancel
              </button>
              <button
                onClick={() => adjustMutation.mutate(adjustData)}
                disabled={
                  !adjustData.productId ||
                  !adjustData.warehouseId ||
                  adjustMutation.isPending
                }
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 11,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity:
                    !adjustData.productId ||
                    !adjustData.warehouseId ||
                    adjustMutation.isPending
                      ? 0.5
                      : 1,
                  boxShadow: "0 4px 14px rgba(99,102,241,.3)",
                }}
              >
                {adjustMutation.isPending ? "Saving…" : "Confirm Adjustment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
