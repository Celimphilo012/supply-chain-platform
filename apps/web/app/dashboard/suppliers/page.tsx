"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Plus,
  X,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Package,
  Star,
  Trash2,
} from "lucide-react";

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
  confirmed: {
    bg: "#f0fdf4",
    color: "#15803d",
    dot: "#22c55e",
    label: "Confirmed",
  },
  rejected: {
    bg: "#fff1f2",
    color: "#dc2626",
    dot: "#ef4444",
    label: "Rejected",
  },
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
  confirmed: {
    status: "received",
    label: "Received",
    bg: "#f0fdf4",
    color: "#15803d",
  },
};

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
  boxSizing: "border-box" as const,
};
const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

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
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [form, setForm] = useState({
    supplierId: "",
    warehouseId: "",
    notes: "",
    expectedDeliveryDate: "",
    currency: "ZAR",
  });
  const [selectedItems, setSelectedItems] = useState<
    {
      id: string;
      name: string;
      sku?: string;
      unitCost: number;
      quantity: number;
      isPreferred: boolean;
    }[]
  >([]);

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
    queryFn: () =>
      api
        .get("/warehouses")
        .then((r) => (Array.isArray(r.data) ? r.data : (r.data.data ?? []))),
  });

  // fetch supplier catalogue when supplier is selected
  const { data: supplierCatalogue = [], isLoading: catalogueLoading } =
    useQuery<any[]>({
      queryKey: ["supplier-catalogue-org", selectedSupplier],
      queryFn: () =>
        api
          .get(`/supplier-portal/supplier-catalogue/${selectedSupplier}`)
          .then((r) => r.data),
      enabled: !!selectedSupplier,
    });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/purchase-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      resetForm();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: any) =>
      api.patch(`/purchase-orders/${id}/status`, { status }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });

  const resetForm = () => {
    setShowCreate(false);
    setSelectedSupplier("");
    setForm({
      supplierId: "",
      warehouseId: "",
      notes: "",
      expectedDeliveryDate: "",
      currency: "ZAR",
    });
    setSelectedItems([]);
  };

  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplier(supplierId);
    setForm((f) => ({ ...f, supplierId }));
    setSelectedItems([]); // reset items when supplier changes
  };

  const toggleItem = (item: any) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          sku: item.sku,
          unitCost: parseFloat(item.unitCost),
          quantity: item.minimumOrderQuantity || 1,
          isPreferred: item.isPreferred,
        },
      ];
    });
  };

  const updateQty = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  };

  const updatePrice = (id: string, unitCost: number) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, unitCost } : i)),
    );
  };

  const orderTotal = selectedItems.reduce(
    (s, i) => s + i.unitCost * i.quantity,
    0,
  );

  const submitPO = () => {
    if (!form.supplierId || !form.warehouseId || selectedItems.length === 0)
      return;
    createMutation.mutate({
      supplierId: form.supplierId,
      warehouseId: form.warehouseId,
      notes: form.notes || undefined,
      expectedDeliveryDate: form.expectedDeliveryDate || undefined,
      currency: form.currency,
      items: selectedItems.map((i) => ({
        // we use item name as a reference — map to productId if available
        productName: i.name, // catalogue item id used as reference
        quantityOrdered: i.quantity,
        unitCost: i.unitCost,
      })),
    });
  };

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
        .cat-item{cursor:pointer;border-radius:12px;border:1.5px solid #e2e8f0;padding:12px 14px;transition:all .15s;background:#fff}
        .cat-item:hover{border-color:#f59e0b;background:#fffdf5}
        .cat-item.selected{border-color:#f59e0b;background:#fffbeb}
      `}</style>

      {/* header */}
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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
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
          }}
        >
          <Plus size={15} /> New Purchase Order
        </button>
      </div>

      {/* stats */}
      <div className="po-stats">
        {[
          {
            label: "Total Value",
            value: `R${totalValue >= 1000 ? (totalValue / 1000).toFixed(1) + "K" : totalValue.toLocaleString()}`,
            color: "#d97706",
            grad: "linear-gradient(135deg,#f59e0b,#d97706)",
          },
          {
            label: "Active Orders",
            value: pendingCount,
            color: "#7c3aed",
            grad: null,
          },
          {
            label: "Completed",
            value: receivedCount,
            color: "#16a34a",
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
                background: s.grad ? "rgba(255,255,255,.2)" : "#fffbeb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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

      {/* table */}
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
                          }}
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
                        marginBottom: 12,
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

      {/* create modal */}
      {showCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 60,
            padding: "24px 16px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 760,
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              fontFamily: "'Outfit', sans-serif",
              marginBottom: 24,
            }}
          >
            {/* modal header */}
            <div
              style={{
                padding: "22px 28px",
                borderBottom: "1px solid #f1f5f9",
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
                    borderRadius: 9,
                    background: "#fffbeb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShoppingCart size={17} color="#d97706" />
                </div>
                <p style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                  New Purchase Order
                </p>
              </div>
              <button
                onClick={resetForm}
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

            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* step 1 - order details */}
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 14,
                  }}
                >
                  1 — Order Details
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div>
                    <label style={LABEL}>
                      Supplier <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      value={form.supplierId}
                      onChange={(e) => handleSupplierChange(e.target.value)}
                      style={{ ...INPUT, cursor: "pointer" }}
                      className="po-input"
                    >
                      <option value="">Select supplier…</option>
                      {suppliers?.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={LABEL}>
                      Warehouse <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      value={form.warehouseId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, warehouseId: e.target.value }))
                      }
                      style={{ ...INPUT, cursor: "pointer" }}
                      className="po-input"
                    >
                      <option value="">Select warehouse…</option>
                      {warehouses?.map((w: any) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={LABEL}>Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, currency: e.target.value }))
                      }
                      style={{ ...INPUT, cursor: "pointer" }}
                      className="po-input"
                    >
                      {["ZAR", "USD", "EUR", "GBP"].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={LABEL}>Expected Delivery</label>
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
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={LABEL}>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      placeholder="Any special instructions…"
                      rows={2}
                      style={{ ...INPUT, resize: "vertical" }}
                      className="po-input"
                    />
                  </div>
                </div>
              </div>

              {/* step 2 - supplier catalogue */}
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 14,
                  }}
                >
                  2 — Select Products from Supplier Catalogue
                </p>

                {!form.supplierId ? (
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 12,
                      border: "2px dashed #e2e8f0",
                      padding: "32px 20px",
                      textAlign: "center",
                    }}
                  >
                    <Package
                      size={28}
                      color="#cbd5e1"
                      style={{ margin: "0 auto 8px" }}
                    />
                    <p style={{ fontSize: 13, color: "#94a3b8" }}>
                      Select a supplier above to browse their product catalogue
                    </p>
                  </div>
                ) : catalogueLoading ? (
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 12,
                      padding: "24px 20px",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: 13, color: "#94a3b8" }}>
                      Loading catalogue…
                    </p>
                  </div>
                ) : supplierCatalogue.length === 0 ? (
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 12,
                      border: "2px dashed #e2e8f0",
                      padding: "32px 20px",
                      textAlign: "center",
                    }}
                  >
                    <Package
                      size={28}
                      color="#cbd5e1"
                      style={{ margin: "0 auto 8px" }}
                    />
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      This supplier hasn't added any products yet
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                      Ask them to add products in their supplier portal.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill,minmax(220px,1fr))",
                      gap: 10,
                      maxHeight: 320,
                      overflowY: "auto",
                      paddingRight: 4,
                    }}
                  >
                    {supplierCatalogue.map((item: any) => {
                      const isSelected = selectedItems.some(
                        (i) => i.id === item.id,
                      );
                      return (
                        <div
                          key={item.id}
                          className={`cat-item${isSelected ? " selected" : ""}`}
                          onClick={() => toggleItem(item)}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 8,
                              marginBottom: 6,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#0f172a",
                                lineHeight: 1.3,
                              }}
                            >
                              {item.name}
                            </p>
                            <div
                              style={{ display: "flex", gap: 4, flexShrink: 0 }}
                            >
                              {item.isPreferred && (
                                <Star
                                  size={13}
                                  color="#d97706"
                                  fill="#d97706"
                                />
                              )}
                              <div
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  border: `2px solid ${isSelected ? "#d97706" : "#d1d5db"}`,
                                  background: isSelected ? "#d97706" : "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {isSelected && (
                                  <span
                                    style={{
                                      color: "#fff",
                                      fontSize: 9,
                                      fontWeight: 800,
                                    }}
                                  >
                                    ✓
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {item.sku && (
                            <p
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginBottom: 4,
                                fontFamily: "monospace",
                              }}
                            >
                              {item.sku}
                            </p>
                          )}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginTop: 8,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: "#d97706",
                              }}
                            >
                              ${parseFloat(item.unitCost).toFixed(2)}
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 500,
                                  color: "#94a3b8",
                                }}
                              >
                                /{item.unit || "unit"}
                              </span>
                            </p>
                            {item.leadTimeDays && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#64748b",
                                  background: "#f1f5f9",
                                  padding: "2px 7px",
                                  borderRadius: 6,
                                }}
                              >
                                {item.leadTimeDays}d lead
                              </span>
                            )}
                          </div>
                          {item.minimumOrderQuantity > 1 && (
                            <p
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 3,
                              }}
                            >
                              Min. {item.minimumOrderQuantity} units
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* step 3 - selected items */}
              {selectedItems.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 14,
                    }}
                  >
                    3 — Review & Adjust Order
                  </p>
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr>
                          {[
                            "Product",
                            "Unit Cost",
                            "Quantity",
                            "Subtotal",
                            "",
                          ].map((h) => (
                            <th key={h} style={{ ...TH, fontSize: 10 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((item) => (
                          <tr
                            key={item.id}
                            style={{ borderBottom: "1px solid #f8fafc" }}
                          >
                            <td style={{ padding: "10px 16px" }}>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#0f172a",
                                }}
                              >
                                {item.name}
                              </p>
                              {item.sku && (
                                <p
                                  style={{
                                    fontSize: 11,
                                    color: "#94a3b8",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {item.sku}
                                </p>
                              )}
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <span
                                  style={{ fontSize: 12, color: "#64748b" }}
                                >
                                  $
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitCost}
                                  onChange={(e) =>
                                    updatePrice(
                                      item.id,
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  style={{
                                    width: 80,
                                    padding: "6px 8px",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontFamily: "inherit",
                                    outline: "none",
                                    textAlign: "right",
                                  }}
                                  className="po-input"
                                />
                              </div>
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <button
                                  onClick={() =>
                                    updateQty(item.id, item.quantity - 1)
                                  }
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 6,
                                    background: "#f1f5f9",
                                    border: "1px solid #e2e8f0",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#475569",
                                  }}
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQty(
                                      item.id,
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                  style={{
                                    width: 52,
                                    padding: "5px 8px",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontFamily: "inherit",
                                    outline: "none",
                                    textAlign: "center",
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    updateQty(item.id, item.quantity + 1)
                                  }
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 6,
                                    background: "#f1f5f9",
                                    border: "1px solid #e2e8f0",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#475569",
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "10px 16px",
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#0f172a",
                              }}
                            >
                              $
                              {(item.unitCost * item.quantity).toLocaleString(
                                undefined,
                                { minimumFractionDigits: 2 },
                              )}
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <button
                                onClick={() =>
                                  setSelectedItems((p) =>
                                    p.filter((i) => i.id !== item.id),
                                  )
                                }
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 7,
                                  background: "#fff1f2",
                                  border: "1px solid #fecdd3",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  color: "#e11d48",
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              padding: "12px 16px",
                              textAlign: "right",
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#374151",
                            }}
                          >
                            Order Total:
                          </td>
                          <td
                            colSpan={2}
                            style={{
                              padding: "12px 16px",
                              fontSize: 16,
                              fontWeight: 800,
                              color: "#d97706",
                            }}
                          >
                            {form.currency}{" "}
                            {orderTotal.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* validation message */}
              {createMutation.isError && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#e11d48",
                    padding: "10px 14px",
                    background: "#fff1f2",
                    borderRadius: 9,
                  }}
                >
                  Failed to create PO. Please check all fields and try again.
                </p>
              )}

              {/* actions */}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button
                  onClick={resetForm}
                  style={{
                    flex: 1,
                    padding: 13,
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
                  onClick={submitPO}
                  disabled={
                    !form.supplierId ||
                    !form.warehouseId ||
                    selectedItems.length === 0 ||
                    createMutation.isPending
                  }
                  style={{
                    flex: 2,
                    padding: 13,
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
                      selectedItems.length === 0 ||
                      createMutation.isPending
                        ? 0.5
                        : 1,
                    boxShadow: "0 4px 14px rgba(245,158,11,.3)",
                  }}
                >
                  {createMutation.isPending
                    ? "Creating…"
                    : `Create PO${selectedItems.length > 0 ? ` (${selectedItems.length} item${selectedItems.length !== 1 ? "s" : ""})` : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
