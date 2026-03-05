"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft, Plus, X, Star, Edit2, Search } from "lucide-react";

const ACCENT = "#e11d48";
const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
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
const CARD: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,.04)",
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

const EMPTY_FORM = {
  name: "",
  sku: "",
  description: "",
  unitCost: "",
  unit: "",
  minimumOrderQuantity: "1",
  leadTimeDays: "",
  isPreferred: false,
};

export default function CataloguePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("supplier_token");
    if (!token) {
      router.push("/supplier-portal/login");
      return;
    }
    setHydrated(true);
  }, []);

  const { data: catalogue = [], isLoading } = useQuery<any[]>({
    queryKey: ["supplier-catalogue"],
    queryFn: () =>
      getApi()
        .get("/supplier-portal/catalogue")
        .then((r) => r.data),
    enabled: hydrated,
  });

  const saveMutation = useMutation({
    mutationFn: (d: any) =>
      editingId
        ? getApi().patch(`/supplier-portal/catalogue/${editingId}`, d)
        : getApi().post("/supplier-portal/catalogue", d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-catalogue"] });
      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      getApi().delete(`/supplier-portal/catalogue/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["supplier-catalogue"] }),
  });

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const openEdit = (item: any) => {
    setForm({
      name: item.name,
      sku: item.sku ?? "",
      description: item.description ?? "",
      unitCost: item.unitCost.toString(),
      unit: item.unit ?? "",
      minimumOrderQuantity: item.minimumOrderQuantity.toString(),
      leadTimeDays: item.leadTimeDays?.toString() ?? "",
      isPreferred: item.isPreferred,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const submit = () => {
    if (!form.name || !form.unitCost) return;
    saveMutation.mutate({
      name: form.name,
      sku: form.sku || undefined,
      description: form.description || undefined,
      unitCost: parseFloat(form.unitCost),
      unit: form.unit || undefined,
      minimumOrderQuantity: parseInt(form.minimumOrderQuantity) || 1,
      leadTimeDays: form.leadTimeDays ? parseInt(form.leadTimeDays) : undefined,
      isPreferred: form.isPreferred,
    });
  };

  const filtered = catalogue.filter(
    (item: any) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`.cat-input:focus{border-color:${ACCENT} !important;background:#fff !important}`}</style>

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
              My Catalogue
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditingId(null);
            setShowModal(true);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 9,
            background: `linear-gradient(135deg,${ACCENT},#be123c)`,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div
        style={{
          padding: "clamp(16px,3vw,28px)",
          maxWidth: 1000,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
            My Product Catalogue
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Add and manage the products you supply with your pricing and terms
          </p>
        </div>

        {/* stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: 12,
          }}
        >
          {[
            { label: "Total Products", value: catalogue.length, color: ACCENT },
            {
              label: "Preferred Items",
              value: catalogue.filter((i: any) => i.isPreferred).length,
              color: "#f59e0b",
            },
            {
              label: "Avg. Lead Time",
              value: catalogue.length
                ? `${Math.round(catalogue.filter((i: any) => i.leadTimeDays).reduce((a: number, i: any) => a + i.leadTimeDays, 0) / (catalogue.filter((i: any) => i.leadTimeDays).length || 1))}d`
                : "—",
              color: "#8b5cf6",
            },
          ].map((s) => (
            <div key={s.label} style={{ ...CARD, padding: "14px 18px" }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* search */}
        <div style={{ position: "relative", maxWidth: 380 }}>
          <Search
            size={14}
            color="#94a3b8"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            style={{ ...INPUT, paddingLeft: 36 }}
            className="cat-input"
          />
        </div>

        {/* table */}
        <div style={CARD}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: "#94a3b8" }}>Loading catalogue…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <Package
                size={36}
                color="#e2e8f0"
                style={{ margin: "0 auto 12px" }}
              />
              <p style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>
                {search ? "No products match your search" : "No products yet"}
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                {!search &&
                  "Add the products you supply so organizations can browse your catalogue."}
              </p>
              {!search && (
                <button
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setEditingId(null);
                    setShowModal(true);
                  }}
                  style={{
                    marginTop: 16,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 20px",
                    borderRadius: 11,
                    background: `linear-gradient(135deg,${ACCENT},#be123c)`,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <Plus size={14} /> Add First Product
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[
                      "Product",
                      "SKU",
                      "Unit Cost",
                      "Unit",
                      "Min. Order",
                      "Lead Time",
                      "Preferred",
                      "",
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
                  {filtered.map((item: any) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid #f8fafc" }}
                    >
                      <td style={{ padding: "13px 20px" }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {item.name}
                        </p>
                        {item.description && (
                          <p
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              marginTop: 2,
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: "13px 20px" }}>
                        {item.sku ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: "monospace",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: 4,
                              padding: "2px 7px",
                              color: "#475569",
                            }}
                          >
                            {item.sku}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 12 }}>
                            —
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "13px 20px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        $
                        {parseFloat(item.unitCost).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        style={{
                          padding: "13px 20px",
                          fontSize: 13,
                          color: "#475569",
                        }}
                      >
                        {item.unit || "—"}
                      </td>
                      <td
                        style={{
                          padding: "13px 20px",
                          fontSize: 13,
                          color: "#475569",
                        }}
                      >
                        {item.minimumOrderQuantity} units
                      </td>
                      <td
                        style={{
                          padding: "13px 20px",
                          fontSize: 13,
                          color: "#475569",
                        }}
                      >
                        {item.leadTimeDays ? `${item.leadTimeDays} days` : "—"}
                      </td>
                      <td style={{ padding: "13px 20px" }}>
                        {item.isPreferred ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#d97706",
                              background: "#fffbeb",
                              padding: "3px 9px",
                              borderRadius: 20,
                              border: "1px solid #fde68a",
                            }}
                          >
                            <Star size={10} fill="#d97706" /> Preferred
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "13px 20px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => openEdit(item)}
                            style={{
                              width: 30,
                              height: 30,
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
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              background: "#fff1f2",
                              border: "1px solid #fecdd3",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: ACCENT,
                            }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* modal */}
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
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 480,
              padding: "28px",
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              fontFamily: "'Outfit', sans-serif",
              maxHeight: "90vh",
              overflowY: "auto",
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
              <p style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                {editingId ? "Edit Product" : "Add Product"}
              </p>
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(EMPTY_FORM);
                  setEditingId(null);
                }}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={LABEL}>
                  Product Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Industrial Steel Bolts M8"
                  style={INPUT}
                  className="cat-input"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={LABEL}>SKU / Part Number</label>
                  <input
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="e.g. STL-M8-100"
                    style={INPUT}
                    className="cat-input"
                  />
                </div>
                <div>
                  <label style={LABEL}>Unit of Measure</label>
                  <input
                    value={form.unit}
                    onChange={(e) => set("unit", e.target.value)}
                    placeholder="e.g. kg, pcs, box"
                    style={INPUT}
                    className="cat-input"
                  />
                </div>
              </div>

              <div>
                <label style={LABEL}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Brief product description…"
                  rows={2}
                  style={{ ...INPUT, resize: "vertical" }}
                  className="cat-input"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={LABEL}>
                    Unit Cost (USD) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitCost}
                    onChange={(e) => set("unitCost", e.target.value)}
                    placeholder="0.00"
                    style={INPUT}
                    className="cat-input"
                  />
                </div>
                <div>
                  <label style={LABEL}>Min. Order Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={form.minimumOrderQuantity}
                    onChange={(e) =>
                      set("minimumOrderQuantity", e.target.value)
                    }
                    placeholder="1"
                    style={INPUT}
                    className="cat-input"
                  />
                </div>
              </div>

              <div>
                <label style={LABEL}>Lead Time (days)</label>
                <input
                  type="number"
                  min="0"
                  value={form.leadTimeDays}
                  onChange={(e) => set("leadTimeDays", e.target.value)}
                  placeholder="e.g. 7"
                  style={INPUT}
                  className="cat-input"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  background: "#fffbeb",
                  borderRadius: 10,
                  border: "1px solid #fde68a",
                  cursor: "pointer",
                }}
                onClick={() => set("isPreferred", !form.isPreferred)}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    border: `2px solid ${form.isPreferred ? "#d97706" : "#d1d5db"}`,
                    background: form.isPreferred ? "#d97706" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {form.isPreferred && (
                    <span
                      style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <div>
                  <p
                    style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}
                  >
                    Mark as preferred item
                  </p>
                  <p style={{ fontSize: 12, color: "#b45309" }}>
                    Highlights this product when organizations browse your
                    catalogue
                  </p>
                </div>
              </div>

              {saveMutation.isError && (
                <p
                  style={{
                    fontSize: 12,
                    color: ACCENT,
                    padding: "8px 12px",
                    background: "#fff1f2",
                    borderRadius: 8,
                  }}
                >
                  Failed to save. Please try again.
                </p>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setForm(EMPTY_FORM);
                    setEditingId(null);
                  }}
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
                  disabled={
                    !form.name || !form.unitCost || saveMutation.isPending
                  }
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
                    opacity:
                      !form.name || !form.unitCost || saveMutation.isPending
                        ? 0.5
                        : 1,
                  }}
                >
                  {saveMutation.isPending
                    ? "Saving…"
                    : editingId
                      ? "Update Product"
                      : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
