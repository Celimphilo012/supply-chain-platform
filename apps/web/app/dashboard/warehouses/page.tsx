"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Plus,
  Warehouse,
  X,
  Pencil,
  MapPin,
  Search,
  Package,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const CARD: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,.04)",
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
const TH: React.CSSProperties = {
  padding: "9px 16px",
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
const ACCENT = "#e11d48";

const EMPTY_FORM = {
  name: "",
  address: { street: "", city: "", state: "", country: "", postalCode: "" },
};

export default function WarehousesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/warehouses").then((r) => r.data),
  });

  // fetch inventory for selected warehouse
  const {
    data: warehouseInventory = [],
    isLoading: invLoading,
    refetch: refetchInv,
  } = useQuery<any[]>({
    queryKey: ["inventory", selectedWarehouse?.id],
    queryFn: () =>
      api
        .get(`/inventory?warehouseId=${selectedWarehouse.id}`)
        .then((r) => r.data),
    enabled: !!selectedWarehouse,
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post("/warehouses", d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.patch(`/warehouses/${id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      closeForm();
    },
  });

  const closeForm = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (w: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setForm({
      name: w.name,
      address: w.address ?? {
        street: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
      },
    });
    setEditing(w);
    setShowModal(true);
  };

  const setAddr = (key: string, val: string) =>
    setForm((p: any) => ({ ...p, address: { ...p.address, [key]: val } }));

  const submit = () => {
    const payload = {
      name: form.name,
      address: Object.values(form.address).some(Boolean)
        ? form.address
        : undefined,
    };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const filtered = warehouses?.filter(
    (w: any) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.address?.city?.toLowerCase().includes(search.toLowerCase()) ||
      w.address?.country?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatAddress = (addr: any) => {
    if (!addr) return null;
    return (
      [addr.city, addr.state, addr.country].filter(Boolean).join(", ") || null
    );
  };

  const lowStockItems = warehouseInventory.filter(
    (i: any) => i.reorderPoint && i.quantityOnHand <= i.reorderPoint,
  );

  const goToInventory = () => {
    router.push(`/dashboard/inventory`);
  };

  return (
    <div
      style={{
        padding: "clamp(16px,3vw,28px)",
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
        .wh-input:focus{border-color:${ACCENT} !important;background:#fff !important}
        .wh-card{transition:all .15s ease;cursor:pointer;}
        .wh-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.1) !important;transform:translateY(-2px);}
        .inv-row:hover td{background:#f8faff !important}
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
            Warehouses
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Click any warehouse to view its inventory
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 12,
            background: `linear-gradient(135deg,${ACCENT},#be123c)`,
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: `0 4px 14px ${ACCENT}44`,
          }}
        >
          <Plus size={15} /> Add Warehouse
        </button>
      </div>

      {/* search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
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
            placeholder="Search warehouses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...INPUT, paddingLeft: 34 }}
            className="wh-input"
          />
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8" }}>
          {filtered?.length ?? 0} warehouse{filtered?.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* grid */}
      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 16,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ ...CARD, padding: 20 }}>
              <div
                style={{
                  height: 16,
                  borderRadius: 6,
                  background: "#f1f5f9",
                  width: "60%",
                  marginBottom: 12,
                  animation: "skpulse 1.4s infinite",
                }}
              />
              <div
                style={{
                  height: 12,
                  borderRadius: 6,
                  background: "#f1f5f9",
                  width: "80%",
                  animation: "skpulse 1.4s infinite",
                }}
              />
            </div>
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div style={{ ...CARD, padding: "60px 20px", textAlign: "center" }}>
          <Warehouse
            size={40}
            color="#e2e8f0"
            style={{ margin: "0 auto 12px" }}
          />
          <p style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>
            No warehouses yet
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 16,
          }}
        >
          {filtered?.map((w: any) => (
            <div
              key={w.id}
              className="wh-card"
              style={CARD}
              onClick={() => setSelectedWarehouse(w)}
            >
              <div
                style={{
                  height: 4,
                  background: `linear-gradient(135deg,${ACCENT},#be123c)`,
                }}
              />
              <div style={{ padding: "18px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: "#fff1f2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Warehouse size={18} color={ACCENT} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {w.name}
                      </p>
                      {formatAddress(w.address) && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 2,
                          }}
                        >
                          <MapPin size={11} color="#94a3b8" />
                          <p style={{ fontSize: 12, color: "#94a3b8" }}>
                            {formatAddress(w.address)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      background: w.isActive !== false ? "#f0fdf4" : "#f8fafc",
                      color: w.isActive !== false ? "#16a34a" : "#94a3b8",
                      border: `1px solid ${w.isActive !== false ? "#bbf7d0" : "#e2e8f0"}`,
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {w.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                {w.address?.street && (
                  <p
                    style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}
                  >
                    {w.address.street}
                    {w.address.postalCode ? `, ${w.address.postalCode}` : ""}
                  </p>
                )}

                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Package size={13} color="#94a3b8" />
                    <p style={{ fontSize: 12, color: "#64748b" }}>
                      {w.inventoryCount ?? 0} SKU
                      {w.inventoryCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      View
                    </p>
                    <ChevronRight size={12} color="#94a3b8" />
                  </div>
                </div>

                <button
                  onClick={(e) => openEdit(w, e)}
                  style={{
                    width: "100%",
                    padding: "9px 0",
                    borderRadius: 10,
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Pencil size={12} /> Edit Warehouse
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── WAREHOUSE INVENTORY POPUP ── */}
      {selectedWarehouse && (
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
            padding: "16px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 700,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {/* popup header */}
            <div
              style={{
                height: 4,
                background: `linear-gradient(135deg,${ACCENT},#be123c)`,
                borderRadius: "20px 20px 0 0",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "#fff1f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Warehouse size={18} color={ACCENT} />
                </div>
                <div>
                  <p
                    style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}
                  >
                    {selectedWarehouse.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    {formatAddress(selectedWarehouse.address) ??
                      "No address set"}{" "}
                    · {warehouseInventory.length} SKU
                    {warehouseInventory.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWarehouse(null)}
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

            {/* stats strip */}
            <div
              style={{
                padding: "14px 22px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                gap: 12,
                flexShrink: 0,
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  label: "Total SKUs",
                  value: warehouseInventory.length,
                  color: "#3b82f6",
                  bg: "#eff6ff",
                },
                {
                  label: "Total Units",
                  value: warehouseInventory.reduce(
                    (s: number, i: any) => s + (i.quantityOnHand || 0),
                    0,
                  ),
                  color: "#8b5cf6",
                  bg: "#f5f3ff",
                },
                {
                  label: "Low Stock",
                  value: lowStockItems.length,
                  color: lowStockItems.length > 0 ? "#d97706" : "#16a34a",
                  bg: lowStockItems.length > 0 ? "#fffbeb" : "#f0fdf4",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: "10px 14px",
                    background: s.bg,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: s.color,
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* low stock warning */}
            {lowStockItems.length > 0 && (
              <div
                style={{
                  margin: "12px 22px 0",
                  padding: "10px 14px",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={14} color="#d97706" />
                <p style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>
                  {lowStockItems.length} item
                  {lowStockItems.length !== 1 ? "s" : ""} below reorder point in
                  this warehouse
                </p>
              </div>
            )}

            {/* inventory table */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
              {invLoading ? (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>
                    Loading inventory…
                  </p>
                </div>
              ) : warehouseInventory.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <Package
                    size={32}
                    color="#e2e8f0"
                    style={{ margin: "0 auto 10px" }}
                  />
                  <p
                    style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}
                  >
                    No inventory in this warehouse yet
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                    Items will appear here when purchase orders are received.
                  </p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {[
                        "Product",
                        "SKU",
                        "On Hand",
                        "Reserved",
                        "Reorder Pt",
                        "Status",
                      ].map((h) => (
                        <th key={h} style={TH}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {warehouseInventory.map((inv: any) => {
                      const isLow =
                        inv.reorderPoint &&
                        inv.quantityOnHand <= inv.reorderPoint;
                      return (
                        <tr
                          key={inv.id}
                          className="inv-row"
                          style={{
                            borderBottom: "1px solid #f8fafc",
                            transition: "background .1s",
                          }}
                        >
                          <td style={{ padding: "11px 16px" }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {inv.product?.name}
                            </p>
                          </td>
                          <td style={{ padding: "11px 16px" }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontFamily: "monospace",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 4,
                                padding: "2px 6px",
                                color: "#475569",
                              }}
                            >
                              {inv.product?.sku ?? "—"}
                            </span>
                          </td>
                          <td style={{ padding: "11px 16px" }}>
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: isLow ? "#d97706" : "#0f172a",
                              }}
                            >
                              {inv.quantityOnHand}
                            </p>
                          </td>
                          <td
                            style={{
                              padding: "11px 16px",
                              fontSize: 13,
                              color: "#64748b",
                            }}
                          >
                            {inv.quantityReserved ?? 0}
                          </td>
                          <td
                            style={{
                              padding: "11px 16px",
                              fontSize: 13,
                              color: "#64748b",
                            }}
                          >
                            {inv.reorderPoint ?? "—"}
                          </td>
                          <td style={{ padding: "11px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 9px",
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
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: isLow ? "#e11d48" : "#22c55e",
                                }}
                              />
                              {isLow ? "Low" : "OK"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* popup footer */}
            <div
              style={{
                padding: "14px 22px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => refetchInv()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
              <button
                onClick={goToInventory}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 4px 14px rgba(99,102,241,.25)",
                }}
              >
                <Package size={14} /> Go to Full Inventory{" "}
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE/EDIT MODAL ── */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
            padding: 16,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 480,
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
                background: `linear-gradient(135deg,${ACCENT},#be123c)`,
              }}
            />
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
                    background: `linear-gradient(135deg,${ACCENT},#be123c)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Warehouse size={16} color="#fff" />
                </div>
                <div>
                  <p
                    style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}
                  >
                    {editing ? "Edit Warehouse" : "Add Warehouse"}
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    {editing
                      ? "Update warehouse details"
                      : "Create a new storage location"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeForm}
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
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Warehouse Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Main Warehouse, Cape Town Hub"
                  style={INPUT}
                  className="wh-input"
                />
              </div>

              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: 10,
                  }}
                >
                  Address{" "}
                  <span
                    style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}
                  >
                    (optional)
                  </span>
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <input
                    value={form.address.street}
                    onChange={(e) => setAddr("street", e.target.value)}
                    placeholder="Street"
                    style={INPUT}
                    className="wh-input"
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <input
                      value={form.address.city}
                      onChange={(e) => setAddr("city", e.target.value)}
                      placeholder="City"
                      style={INPUT}
                      className="wh-input"
                    />
                    <input
                      value={form.address.state}
                      onChange={(e) => setAddr("state", e.target.value)}
                      placeholder="State / Province"
                      style={INPUT}
                      className="wh-input"
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <input
                      value={form.address.country}
                      onChange={(e) => setAddr("country", e.target.value)}
                      placeholder="Country"
                      style={INPUT}
                      className="wh-input"
                    />
                    <input
                      value={form.address.postalCode}
                      onChange={(e) => setAddr("postalCode", e.target.value)}
                      placeholder="Postal Code"
                      style={INPUT}
                      className="wh-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "0 22px 22px", display: "flex", gap: 10 }}>
              <button
                onClick={closeForm}
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
                onClick={submit}
                disabled={!form.name || isPending}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 11,
                  background: `linear-gradient(135deg,${ACCENT},#be123c)`,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: !form.name || isPending ? 0.5 : 1,
                }}
              >
                {isPending
                  ? "Saving…"
                  : editing
                    ? "Save Changes"
                    : "Create Warehouse"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
