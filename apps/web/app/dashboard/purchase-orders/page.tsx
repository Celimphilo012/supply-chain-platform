"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Plus, X, ShoppingCart, ArrowRight, CheckCircle } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; dot: string; label: string }
> = {
  draft: { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8", label: "Draft" },
  pending_approval: {
    bg: "#fffbeb",
    color: "#b45309",
    dot: "#f59e0b",
    label: "Pending",
  },
  approved: {
    bg: "#eff6ff",
    color: "#1d4ed8",
    dot: "#3b82f6",
    label: "Approved",
  },
  sent: { bg: "#f5f3ff", color: "#6d28d9", dot: "#8b5cf6", label: "Sent" },
  partial: {
    bg: "#fff7ed",
    color: "#c2410c",
    dot: "#f97316",
    label: "Partial",
  },
  received: {
    bg: "#f0fdf4",
    color: "#15803d",
    dot: "#22c55e",
    label: "Received",
  },
  cancelled: {
    bg: "#fef2f2",
    color: "#dc2626",
    dot: "#ef4444",
    label: "Cancelled",
  },
};

const NEXT_STATUS: Record<
  string,
  { status: string; label: string; bg: string; color: string }
> = {
  draft: {
    status: "pending_approval",
    label: "Submit",
    bg: "#fffbeb",
    color: "#b45309",
  },
  pending_approval: {
    status: "approved",
    label: "Approve",
    bg: "#eff6ff",
    color: "#1d4ed8",
  },
  approved: {
    status: "sent",
    label: "Mark Sent",
    bg: "#f5f3ff",
    color: "#6d28d9",
  },
  sent: {
    status: "received",
    label: "Received",
    bg: "#f0fdf4",
    color: "#15803d",
  },
};

// ── shared tokens ─────────────────────────────────────────────────────────
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
  boxSizing: "border-box" as const,
};
const SELECT: React.CSSProperties = { ...INPUT };
const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={LABEL}>
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Skeletons({ cols }: { cols: number }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
          {[...Array(cols)].map((_, j) => (
            <td key={j} style={{ padding: "14px 20px" }}>
              <div
                style={{
                  height: 13,
                  borderRadius: 6,
                  background: "#f1f5f9",
                  width: `${40 + j * 9}%`,
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

export default function PurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    supplierId: "",
    warehouseId: "",
    notes: "",
    expectedDeliveryDate: "",
    currency: "ZAR",
    items: [{ productId: "", quantityOrdered: 1, unitCost: 0 }],
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => api.get("/purchase-orders").then((r) => r.data),
  });
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get("/suppliers").then((r) => r.data),
  });
  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/warehouses").then((r) => r.data),
  });
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/purchase-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setShowCreate(false);
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: any) =>
      api.patch(`/purchase-orders/${id}/status`, { status }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: "", quantityOrdered: 1, unitCost: 0 }],
    }));
  const updateItem = (i: number, field: string, value: any) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item,
      ),
    }));

  const totalValue =
    orders?.reduce((s: number, o: any) => s + Number(o.totalAmount), 0) ?? 0;
  const pendingCount =
    orders?.filter((o: any) =>
      ["pending_approval", "approved", "sent"].includes(o.status),
    ).length ?? 0;
  const receivedCount =
    orders?.filter((o: any) => o.status === "received").length ?? 0;

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
        .po-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        @media(max-width:500px){.po-stats{grid-template-columns:1fr 1fr}}
        tr:hover td{background:#fffdf5 !important}
        .po-input:focus{border-color:#f59e0b !important;background:#fff !important}
        .item-input:focus{border-color:#f59e0b !important}
      `}</style>

      {/* ── header ── */}
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
            Purchase Orders
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Manage procurement and supplier orders
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg,#f59e0b,#d97706)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(245,158,11,.35)",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = ".88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={15} />
          New Purchase Order
        </button>
      </div>

      {/* ── stat strip ── */}
      <div className="po-stats">
        {[
          {
            label: "Total Value",
            value: `R${totalValue >= 1000 ? (totalValue / 1000).toFixed(1) + "K" : totalValue.toLocaleString()}`,
            color: "#d97706",
            bg: "#fffbeb",
            grad: "linear-gradient(135deg,#f59e0b,#d97706)",
          },
          {
            label: "Active Orders",
            value: pendingCount,
            color: "#7c3aed",
            bg: "#f5f3ff",
            grad: null,
          },
          {
            label: "Completed",
            value: receivedCount,
            color: "#16a34a",
            bg: "#f0fdf4",
            grad: null,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              ...(s.grad
                ? {
                    background: s.grad,
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(245,158,11,.25)",
                  }
                : {
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    color: s.color,
                    boxShadow: "0 1px 3px rgba(0,0,0,.04)",
                  }),
              borderRadius: 14,
              padding: "16px 18px",
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
                background: s.grad ? "rgba(255,255,255,.2)" : s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShoppingCart size={17} color={s.grad ? "#fff" : s.color} />
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
                {s.value}
              </p>
              <p
                style={{
                  fontSize: 12,
                  marginTop: 3,
                  opacity: s.grad ? 0.75 : undefined,
                  color: s.grad ? undefined : "#94a3b8",
                }}
              >
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── table card ── */}
      <div style={CARD}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>PO Number</th>
                <th style={TH}>Supplier</th>
                <th style={TH}>Warehouse</th>
                <th style={{ ...TH, textAlign: "right" }}>Amount</th>
                <th style={TH}>Status</th>
                <th style={TH}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <Skeletons cols={6} />}

              {orders?.map((order: any) => {
                const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.draft;
                const next = NEXT_STATUS[order.status];
                return (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: "1px solid #f8fafc",
                      transition: "background .1s",
                    }}
                  >
                    {/* PO number */}
                    <td style={{ padding: "13px 20px" }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0f172a",
                          fontFamily: "monospace",
                        }}
                      >
                        {order.poNumber}
                      </p>
                      {order.expectedDeliveryDate && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginTop: 3,
                          }}
                        >
                          Due{" "}
                          {new Date(
                            order.expectedDeliveryDate,
                          ).toLocaleDateString("en-ZA")}
                        </p>
                      )}
                    </td>

                    {/* supplier */}
                    <td
                      style={{
                        padding: "13px 20px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {order.supplier?.name}
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
                        {order.warehouse?.name}
                      </span>
                    </td>

                    {/* amount */}
                    <td
                      style={{
                        padding: "13px 20px",
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {order.currency}{" "}
                      {Number(order.totalAmount).toLocaleString()}
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
                          background: s.bg,
                          color: s.color,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: s.dot,
                          }}
                        />
                        {s.label}
                      </span>
                    </td>

                    {/* action */}
                    <td style={{ padding: "13px 20px" }}>
                      {next ? (
                        <button
                          onClick={() =>
                            statusMutation.mutate({
                              id: order.id,
                              status: next.status,
                            })
                          }
                          disabled={statusMutation.isPending}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 12px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: next.bg,
                            color: next.color,
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            opacity: statusMutation.isPending ? 0.5 : 1,
                            transition: "opacity .15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = ".75")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity =
                              statusMutation.isPending ? ".5" : "1")
                          }
                        >
                          {next.label} <ArrowRight size={11} />
                        </button>
                      ) : order.status === "received" ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#16a34a",
                          }}
                        >
                          <CheckCircle size={13} /> Complete
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}

              {/* empty */}
              {!isLoading && (!orders || orders.length === 0) && (
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
                        background: "#fffbeb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <ShoppingCart size={26} color="#fcd34d" />
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#475569",
                        marginBottom: 6,
                      }}
                    >
                      No purchase orders yet
                    </p>
                    <button
                      onClick={() => setShowCreate(true)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 18px",
                        borderRadius: 10,
                        background: "linear-gradient(135deg,#f59e0b,#d97706)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 12,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <Plus size={13} /> Create First PO
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════
          CREATE PO MODAL
      ════════════════════════════════ */}
      {showCreate && (
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
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 580,
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              overflow: "hidden",
              fontFamily: "'Outfit', sans-serif",
              margin: "auto",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                height: 5,
                background: "linear-gradient(135deg,#f59e0b,#d97706)",
              }}
            />

            {/* header */}
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
                    background: "linear-gradient(135deg,#f59e0b,#d97706)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShoppingCart size={16} color="#fff" />
                </div>
                <div>
                  <p
                    style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}
                  >
                    Create Purchase Order
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    Fill in procurement details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreate(false)}
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

            {/* body */}
            <div
              style={{
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Supplier" required>
                  <select
                    value={form.supplierId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, supplierId: e.target.value }))
                    }
                    style={SELECT}
                    className="po-input"
                  >
                    <option value="">Select supplier…</option>
                    {suppliers?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Warehouse" required>
                  <select
                    value={form.warehouseId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, warehouseId: e.target.value }))
                    }
                    style={SELECT}
                    className="po-input"
                  >
                    <option value="">Select warehouse…</option>
                    {warehouses?.map((w: any) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Expected Delivery">
                  <input
                    type="date"
                    value={form.expectedDeliveryDate}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        expectedDeliveryDate: e.target.value,
                      }))
                    }
                    style={INPUT}
                    className="po-input"
                  />
                </Field>
                <Field label="Currency">
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, currency: e.target.value }))
                    }
                    style={SELECT}
                    className="po-input"
                  >
                    <option value="ZAR">ZAR — South African Rand</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                  </select>
                </Field>
              </div>

              {/* line items */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <p
                    style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}
                  >
                    Line Items
                  </p>
                  <button
                    onClick={addItem}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#d97706",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                {/* col headers */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 100px",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  {["Product", "Qty", "Cost (R)"].map((h) => (
                    <p
                      key={h}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {h}
                    </p>
                  ))}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {form.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 80px 100px",
                        gap: 8,
                      }}
                    >
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(i, "productId", e.target.value)
                        }
                        style={{
                          ...SELECT,
                          padding: "9px 10px",
                          fontSize: 12,
                          background: "#fff",
                        }}
                        className="item-input"
                      >
                        <option value="">Select…</option>
                        {products?.data?.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantityOrdered}
                        onChange={(e) =>
                          updateItem(
                            i,
                            "quantityOrdered",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        style={{
                          ...INPUT,
                          padding: "9px 10px",
                          fontSize: 12,
                          background: "#fff",
                        }}
                        className="item-input"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) =>
                          updateItem(
                            i,
                            "unitCost",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        style={{
                          ...INPUT,
                          padding: "9px 10px",
                          fontSize: 12,
                          background: "#fff",
                        }}
                        className="item-input"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Field label="Notes">
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Optional notes…"
                  style={INPUT}
                  className="po-input"
                />
              </Field>
            </div>

            {/* footer */}
            <div style={{ padding: "0 22px 22px", display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowCreate(false)}
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
                onClick={() => createMutation.mutate(form)}
                disabled={
                  !form.supplierId ||
                  !form.warehouseId ||
                  createMutation.isPending
                }
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 11,
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity:
                    !form.supplierId ||
                    !form.warehouseId ||
                    createMutation.isPending
                      ? 0.5
                      : 1,
                  boxShadow: "0 4px 14px rgba(245,158,11,.3)",
                }}
              >
                {createMutation.isPending
                  ? "Creating…"
                  : "Create Purchase Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
