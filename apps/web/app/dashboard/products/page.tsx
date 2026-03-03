"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Plus, Package, X, Pencil, Trash2, Search, Tag } from "lucide-react";

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
const ACCENT = "#10b981";

const EMPTY_FORM = {
  sku: "",
  name: "",
  description: "",
  unitOfMeasure: "units",
  unitCost: "",
  sellingPrice: "",
  weightKg: "",
  tags: "",
  isActive: true,
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      api
        .get("/products")
        .then((r) =>
          Array.isArray(r.data) ? r.data : (r.data.data ?? r.data.items ?? []),
        ),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post("/products", d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      close();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.patch(`/products/${id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      close();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setConfirmId(null);
    },
  });

  const close = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setForm({
      sku: p.sku ?? "",
      name: p.name ?? "",
      description: p.description ?? "",
      unitOfMeasure: p.unitOfMeasure ?? "units",
      unitCost: p.unitCost ?? "",
      sellingPrice: p.sellingPrice ?? "",
      weightKg: p.weightKg ?? "",
      tags: (p.tags ?? []).join(", "),
      isActive: p.isActive ?? true,
    });
    setEditing(p);
    setShowModal(true);
  };

  const submit = () => {
    const payload: any = {
      sku: form.sku,
      name: form.name,
      unitOfMeasure: form.unitOfMeasure || "units",
    };
    if (form.description) payload.description = form.description;
    if (form.unitCost !== "") payload.unitCost = parseFloat(form.unitCost);
    if (form.sellingPrice !== "")
      payload.sellingPrice = parseFloat(form.sellingPrice);
    if (form.weightKg !== "") payload.weightKg = parseFloat(form.weightKg);
    if (form.tags)
      payload.tags = form.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    if (editing) {
      payload.isActive = form.isActive;
      updateMutation.mutate({ id: editing.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const filtered = products?.filter(
    (p: any) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount =
    products?.filter((p: any) => p.isActive !== false).length ?? 0;

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
      <style>{`@keyframes skpulse{0%,100%{opacity:1}50%{opacity:.4}} tr:hover td{background:#f0fdf4 !important} .pr-input:focus{border-color:${ACCENT} !important;background:#fff !important}`}</style>

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
            Products
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Manage your product catalogue
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
            background: `linear-gradient(135deg,${ACCENT},#059669)`,
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: `0 4px 14px ${ACCENT}44`,
          }}
        >
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 14,
        }}
      >
        {[
          {
            label: "Total Products",
            value: products?.length ?? 0,
            color: "#3b82f6",
            bg: "#eff6ff",
          },
          {
            label: "Active",
            value: activeCount,
            color: "#10b981",
            bg: "#f0fdf4",
          },
          {
            label: "Inactive",
            value: (products?.length ?? 0) - activeCount,
            color: "#94a3b8",
            bg: "#f8fafc",
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
              <Package size={17} color={s.color} />
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

      {/* table card */}
      <div style={CARD}>
        {/* search */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid #f1f5f9",
            background: "#fafbfc",
            display: "flex",
            alignItems: "center",
            gap: 10,
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
              className="pr-input"
            />
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>
            {filtered?.length ?? 0} products
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Product</th>
                <th style={TH}>SKU</th>
                <th style={TH}>Unit</th>
                <th style={{ ...TH, textAlign: "right" as const }}>Cost</th>
                <th style={{ ...TH, textAlign: "right" as const }}>Price</th>
                <th style={TH}>Tags</th>
                <th style={TH}>Status</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            height: 13,
                            borderRadius: 6,
                            background: "#f1f5f9",
                            width: `${40 + j * 7}%`,
                            animation: "skpulse 1.4s infinite",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              {filtered?.map((p: any) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: "1px solid #f8fafc",
                    transition: "background .1s",
                  }}
                >
                  <td style={{ padding: "13px 20px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: "#f0fdf4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Package size={15} color={ACCENT} />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {p.name}
                        </p>
                        {p.description && (
                          <p
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              marginTop: 1,
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 20px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#475569",
                        fontFamily: "monospace",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 4,
                        padding: "2px 7px",
                      }}
                    >
                      {p.sku}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "13px 20px",
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    {p.unitOfMeasure}
                  </td>
                  <td
                    style={{
                      padding: "13px 20px",
                      textAlign: "right",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {p.unitCost != null
                      ? `R ${parseFloat(p.unitCost).toFixed(2)}`
                      : "—"}
                  </td>
                  <td
                    style={{
                      padding: "13px 20px",
                      textAlign: "right",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {p.sellingPrice != null
                      ? `R ${parseFloat(p.sellingPrice).toFixed(2)}`
                      : "—"}
                  </td>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(p.tags ?? []).slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: 20,
                            background: "#f0fdf4",
                            color: ACCENT,
                            border: "1px solid #d1fae5",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                      {(p.tags ?? []).length > 3 && (
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>
                          +{p.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "13px 20px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          p.isActive !== false ? "#f0fdf4" : "#f8fafc",
                        color: p.isActive !== false ? "#16a34a" : "#94a3b8",
                        border: `1px solid ${p.isActive !== false ? "#bbf7d0" : "#e2e8f0"}`,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background:
                            p.isActive !== false ? "#22c55e" : "#94a3b8",
                        }}
                      />
                      {p.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openEdit(p)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "5px 10px",
                          borderRadius: 8,
                          background: "#eff6ff",
                          color: "#2563eb",
                          border: "1px solid #bfdbfe",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmId(p.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "5px 10px",
                          borderRadius: 8,
                          background: "#fff1f2",
                          color: "#e11d48",
                          border: "1px solid #fecdd3",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && (!filtered || filtered.length === 0) && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ padding: "60px 20px", textAlign: "center" }}
                  >
                    <Package
                      size={36}
                      color="#e2e8f0"
                      style={{ margin: "0 auto 10px" }}
                    />
                    <p style={{ color: "#94a3b8", fontSize: 13 }}>
                      No products found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* create/edit modal */}
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
              maxWidth: 540,
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
                background: `linear-gradient(135deg,${ACCENT},#059669)`,
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
                    background: `linear-gradient(135deg,${ACCENT},#059669)`,
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
                    {editing ? "Edit Product" : "Add Product"}
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    {editing
                      ? "Update product details"
                      : "Add a new product to your catalogue"}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
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
              {/* name + sku */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={LABEL}>
                    Product Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Steel Bolt M8"
                    style={INPUT}
                    className="pr-input"
                  />
                </div>
                <div>
                  <label style={LABEL}>
                    SKU <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="e.g. BOLT-M8-001"
                    style={INPUT}
                    className="pr-input"
                  />
                </div>
              </div>

              {/* description */}
              <div>
                <label style={LABEL}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Optional product description…"
                  rows={2}
                  style={{ ...INPUT, resize: "vertical" as const }}
                  className="pr-input"
                />
              </div>

              {/* cost + price + unit */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={LABEL}>Unit Cost (R)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitCost}
                    onChange={(e) => set("unitCost", e.target.value)}
                    placeholder="0.00"
                    style={INPUT}
                    className="pr-input"
                  />
                </div>
                <div>
                  <label style={LABEL}>Selling Price (R)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(e) => set("sellingPrice", e.target.value)}
                    placeholder="0.00"
                    style={INPUT}
                    className="pr-input"
                  />
                </div>
                <div>
                  <label style={LABEL}>Unit of Measure</label>
                  <select
                    value={form.unitOfMeasure}
                    onChange={(e) => set("unitOfMeasure", e.target.value)}
                    style={INPUT}
                    className="pr-input"
                  >
                    {[
                      "units",
                      "kg",
                      "g",
                      "l",
                      "ml",
                      "boxes",
                      "pallets",
                      "rolls",
                      "metres",
                      "pairs",
                    ].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* weight + tags */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={LABEL}>Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.weightKg}
                    onChange={(e) => set("weightKg", e.target.value)}
                    placeholder="0.000"
                    style={INPUT}
                    className="pr-input"
                  />
                </div>
                <div>
                  <label style={LABEL}>
                    Tags{" "}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        color: "#94a3b8",
                      }}
                    >
                      (comma separated)
                    </span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Tag
                      size={13}
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
                      value={form.tags}
                      onChange={(e) => set("tags", e.target.value)}
                      placeholder="e.g. fasteners, hardware, bulk"
                      style={{ ...INPUT, paddingLeft: 32 }}
                      className="pr-input"
                    />
                  </div>
                </div>
              </div>

              {/* active toggle — edit only */}
              {editing && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: ACCENT }}
                  />
                  <label
                    htmlFor="isActive"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      cursor: "pointer",
                    }}
                  >
                    Product Active
                  </label>
                </div>
              )}
            </div>

            <div style={{ padding: "0 22px 22px", display: "flex", gap: 10 }}>
              <button
                onClick={close}
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
                disabled={!form.name || !form.sku || isPending}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 11,
                  background: `linear-gradient(135deg,${ACCENT},#059669)`,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: !form.name || !form.sku || isPending ? 0.5 : 1,
                }}
              >
                {isPending
                  ? "Saving…"
                  : editing
                    ? "Save Changes"
                    : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {confirmId && (
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
              maxWidth: 380,
              padding: "28px 28px 24px",
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              textAlign: "center",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 13,
                background: "#fff1f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <Trash2 size={22} color="#e11d48" />
            </div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              Delete Product?
            </p>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 22 }}>
              This will permanently remove the product. Inventory records linked
              to it may be affected.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmId(null)}
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
                onClick={() => deleteMutation.mutate(confirmId!)}
                disabled={deleteMutation.isPending}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 11,
                  background: "linear-gradient(135deg,#e11d48,#be123c)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: deleteMutation.isPending ? 0.5 : 1,
                }}
              >
                {deleteMutation.isPending ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
