"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft, Plus, X, Star, Edit2 } from "lucide-react";

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
  supplierId: "",
  productId: "",
  unitCost: "",
  minimumOrderQuantity: "1",
  leadTimeDays: "",
  isPreferred: false,
};

export default function CataloguePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [orgProducts, setOrgProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("supplier_token");
    if (!token) {
      router.push("/supplier-portal/login");
      return;
    }
    setHydrated(true);
  }, []);

  const { data: catalogue = [], isLoading } = useQuery({
    queryKey: ["supplier-catalogue"],
    queryFn: () =>
      getApi()
        .get("/supplier-portal/catalogue")
        .then((r) => r.data),
    enabled: hydrated,
    onSuccess: (data: any[]) => {
      // extract unique suppliers from catalogue
      const uniqueSuppliers = Array.from(
        new Map(data.map((i: any) => [i.supplierId, i.supplier])).values(),
      );
      setSuppliers(uniqueSuppliers);
    },
  });

  // fetch org products when a supplier is selected
  useEffect(() => {
    if (!form.supplierId || !hydrated) return;
    const item = catalogue.find((c: any) => c.supplierId === form.supplierId);
    if (!item) return;
    getApi()
      .get(`/products`)
      .then((r) => {
        const data = Array.isArray(r.data)
          ? r.data
          : (r.data.data ?? r.data.items ?? []);
        setOrgProducts(data);
      })
      .catch(() => {});
  }, [form.supplierId, hydrated]);

  const upsertMutation = useMutation({
    mutationFn: (d: any) => getApi().post("/supplier-portal/catalogue", d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-catalogue"] });
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
  });

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const filtered = catalogue.filter(
    (item: any) =>
      item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const submit = () => {
    if (!form.supplierId || !form.productId || !form.unitCost) return;
    upsertMutation.mutate({
      supplierId: form.supplierId,
      productId: form.productId,
      unitCost: parseFloat(form.unitCost),
      minimumOrderQuantity: parseInt(form.minimumOrderQuantity) || 1,
      leadTimeDays: form.leadTimeDays ? parseInt(form.leadTimeDays) : undefined,
      isPreferred: form.isPreferred,
    });
  };

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
          onClick={() => setShowModal(true)}
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
            Product Catalogue
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Manage the products you supply and your pricing
          </p>
        </div>

        {/* search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name, SKU, or supplier…"
          style={{ ...INPUT, maxWidth: 400 }}
          className="cat-input"
        />

        {/* stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: 12,
          }}
        >
          {[
            {
              label: "Total Products",
              value: catalogue.length,
              color: ACCENT,
              bg: "#fff1f2",
            },
            {
              label: "Preferred Items",
              value: catalogue.filter((i: any) => i.isPreferred).length,
              color: "#f59e0b",
              bg: "#fffbeb",
            },
            {
              label: "Suppliers",
              value: suppliers.length,
              color: "#8b5cf6",
              bg: "#f5f3ff",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                ...CARD,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div>
                <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>{s.label}</p>
              </div>
            </div>
          ))}
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
                No products in catalogue
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                Add products you supply so organizations can browse your
                catalogue.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[
                      "Product",
                      "SKU",
                      "Supplier",
                      "Unit Cost",
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
                          {item.product?.name ?? "—"}
                        </p>
                      </td>
                      <td style={{ padding: "13px 20px" }}>
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
                          {item.product?.sku ?? "—"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 20px",
                          fontSize: 13,
                          color: "#475569",
                        }}
                      >
                        {item.supplier?.name ?? "—"}
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
                        {item.minimumOrderQuantity} units
                      </td>
                      <td
                        style={{
                          padding: "13px 20px",
                          fontSize: 13,
                          color: "#475569",
                        }}
                      >
                        {item.leadTimeDays ? `${item.leadTimeDays}d` : "—"}
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
                        <button
                          onClick={() => {
                            set("supplierId", item.supplierId);
                            set("productId", item.productId);
                            set("unitCost", item.unitCost.toString());
                            set(
                              "minimumOrderQuantity",
                              item.minimumOrderQuantity.toString(),
                            );
                            set(
                              "leadTimeDays",
                              item.leadTimeDays?.toString() ?? "",
                            );
                            set("isPreferred", item.isPreferred);
                            setShowModal(true);
                          }}
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
              maxWidth: 460,
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
                Add / Update Product
              </p>
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(EMPTY_FORM);
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
                  Supplier <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={form.supplierId}
                  onChange={(e) => set("supplierId", e.target.value)}
                  style={{ ...INPUT, cursor: "pointer" }}
                  className="cat-input"
                >
                  <option value="">Select supplier…</option>
                  {suppliers.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={LABEL}>
                  Product <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={form.productId}
                  onChange={(e) => set("productId", e.target.value)}
                  style={{ ...INPUT, cursor: "pointer" }}
                  className="cat-input"
                  disabled={!form.supplierId}
                >
                  <option value="">Select product…</option>
                  {orgProducts.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ""}
                    </option>
                  ))}
                </select>
                {!form.supplierId && (
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    Select a supplier first
                  </p>
                )}
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
                    Organizations will see this as your preferred product
                  </p>
                </div>
              </div>

              {upsertMutation.isError && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#e11d48",
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
                    !form.supplierId ||
                    !form.productId ||
                    !form.unitCost ||
                    upsertMutation.isPending
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
                      !form.supplierId ||
                      !form.productId ||
                      !form.unitCost ||
                      upsertMutation.isPending
                        ? 0.5
                        : 1,
                  }}
                >
                  {upsertMutation.isPending ? "Saving…" : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
