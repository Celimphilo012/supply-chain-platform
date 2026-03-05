"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Plus, Truck, Mail, Phone, X, Building2 } from "lucide-react";

// ── colour palette cycling per card ───────────────────────────────────────
const ACCENTS = [
  {
    grad: "linear-gradient(135deg,#3b82f6,#2563eb)",
    light: "#eff6ff",
    text: "#2563eb",
  },
  {
    grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    light: "#f5f3ff",
    text: "#7c3aed",
  },
  {
    grad: "linear-gradient(135deg,#10b981,#059669)",
    light: "#f0fdf4",
    text: "#059669",
  },
  {
    grad: "linear-gradient(135deg,#f59e0b,#d97706)",
    light: "#fffbeb",
    text: "#d97706",
  },
  {
    grad: "linear-gradient(135deg,#ef4444,#dc2626)",
    light: "#fef2f2",
    text: "#dc2626",
  },
  {
    grad: "linear-gradient(135deg,#06b6d4,#0891b2)",
    light: "#ecfeff",
    text: "#0891b2",
  },
];

// ── shared tokens ─────────────────────────────────────────────────────────
const PAGE_PAD = "clamp(16px,3vw,28px)";
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
  boxSizing: "border-box",
};
const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

// ── skeleton card ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,.04)",
      }}
    >
      <div style={{ height: 4, background: "#f1f5f9" }} />
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: "#f1f5f9",
              animation: "skpulse 1.4s infinite",
            }}
          />
          <div
            style={{
              width: 60,
              height: 22,
              borderRadius: 20,
              background: "#f1f5f9",
              animation: "skpulse 1.4s infinite",
            }}
          />
        </div>
        <div
          style={{
            height: 16,
            background: "#f1f5f9",
            borderRadius: 6,
            width: "70%",
            marginBottom: 8,
            animation: "skpulse 1.4s infinite",
          }}
        />
        <div
          style={{
            height: 13,
            background: "#f1f5f9",
            borderRadius: 6,
            width: "45%",
            marginBottom: 16,
            animation: "skpulse 1.4s infinite",
          }}
        />
        <div
          style={{
            height: 12,
            background: "#f1f5f9",
            borderRadius: 6,
            width: "60%",
            marginBottom: 8,
            animation: "skpulse 1.4s infinite",
          }}
        />
        <div
          style={{
            height: 12,
            background: "#f1f5f9",
            borderRadius: 6,
            width: "50%",
            animation: "skpulse 1.4s infinite",
          }}
        />
      </div>
    </div>
  );
}

// ── supplier card ─────────────────────────────────────────────────────────
function SupplierCard({
  supplier,
  accent,
}: {
  supplier: any;
  accent: (typeof ACCENTS)[0];
}) {
  const initials = supplier.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,.04)",
        transition: "box-shadow .2s, transform .2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 28px rgba(0,0,0,.1)";
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 1px 3px rgba(0,0,0,.04)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* colour top bar */}
      <div style={{ height: 5, background: accent.grad }} />

      <div style={{ padding: 20 }}>
        {/* avatar + status */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: accent.grad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              background: supplier.isActive ? "#f0fdf4" : "#f8fafc",
              color: supplier.isActive ? "#16a34a" : "#94a3b8",
              border: `1px solid ${supplier.isActive ? "#bbf7d0" : "#e2e8f0"}`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: supplier.isActive ? "#22c55e" : "#94a3b8",
              }}
            />
            {supplier.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* name */}
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 3,
            lineHeight: 1.3,
          }}
        >
          {supplier.name}
        </p>
        {supplier.contactName && (
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
            {supplier.contactName}
          </p>
        )}

        {/* contact details */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            marginBottom: 16,
          }}
        >
          {supplier.email && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Mail size={11} color="#94a3b8" />
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {supplier.email}
              </span>
            </div>
          )}
          {supplier.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Phone size={11} color="#94a3b8" />
              </div>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {supplier.phone}
              </span>
            </div>
          )}
        </div>

        {/* payment + lead time */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            borderTop: "1px dashed #f1f5f9",
            paddingTop: 14,
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "#94a3b8",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 3,
              }}
            >
              Payment
            </p>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
              {supplier.paymentTerms}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#94a3b8",
                  marginLeft: 2,
                }}
              >
                days
              </span>
            </p>
          </div>
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "#94a3b8",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 3,
              }}
            >
              Lead Time
            </p>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
              {supplier.leadTimeDays ? (
                <>
                  {supplier.leadTimeDays}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#94a3b8",
                      marginLeft: 2,
                    }}
                  >
                    days
                  </span>
                </>
              ) : (
                "—"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── field wrapper ─────────────────────────────────────────────────────────
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
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    paymentTerms: 30,
    leadTimeDays: 7,
  });

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get("/suppliers").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/suppliers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setShowCreate(false);
      setForm({
        name: "",
        contactName: "",
        email: "",
        phone: "",
        paymentTerms: 30,
        leadTimeDays: 7,
      });
    },
  });

  const activeCount = suppliers?.filter((s: any) => s.isActive).length ?? 0;
  const totalCount = suppliers?.length ?? 0;
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

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
        .sup-grid{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:600px){.sup-grid{grid-template-columns:repeat(2,1fr)}}
        @media(min-width:1024px){.sup-grid{grid-template-columns:repeat(3,1fr)}}
        .sup-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        @media(max-width:500px){.sup-stats{grid-template-columns:1fr 1fr}}
        .modal-input:focus{border-color:#8b5cf6 !important;background:#fff !important}
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
            Suppliers
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Manage your supplier relationships and contracts
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
            background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(139,92,246,.35)",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = ".88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={15} />
          Add Supplier
        </button>
      </div>

      {/* ── stats strip ── */}
      <div className="sup-stats">
        {[
          {
            label: "Total Suppliers",
            value: totalCount,
            color: "#7c3aed",
            bg: "#f5f3ff",
          },
          {
            label: "Active",
            value: activeCount,
            color: "#16a34a",
            bg: "#f0fdf4",
          },
          {
            label: "Inactive",
            value: totalCount - activeCount,
            color: "#94a3b8",
            bg: "#f8fafc",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,.04)",
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
              <Building2 size={17} color={s.color} />
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
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── cards grid ── */}
      <div className="sup-grid">
        {isLoading && [...Array(6)].map((_, i) => <SkeletonCard key={i} />)}

        {suppliers?.map((supplier: any, idx: number) => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            accent={ACCENTS[idx % ACCENTS.length]}
          />
        ))}

        {/* empty state */}
        {!isLoading && (!suppliers || suppliers.length === 0) && (
          <div
            style={{
              gridColumn: "1 / -1",
              background: "#fff",
              borderRadius: 16,
              border: "2px dashed #e2e8f0",
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: "#f5f3ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Building2 size={28} color="#c4b5fd" />
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              No suppliers yet
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
              Add your supplier partners to start creating purchase orders
            </p>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Plus size={14} />
              Add First Supplier
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════
          CREATE SUPPLIER MODAL
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
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* top colour bar */}
            <div
              style={{
                height: 5,
                background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
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
                    background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Truck size={16} color="#fff" />
                </div>
                <div>
                  <p
                    style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}
                  >
                    Add Supplier
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    Create a new supplier partner
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
              <Field label="Company Name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Tech Distributors SA"
                  style={INPUT}
                  className="modal-input"
                />
              </Field>
              <Field label="Contact Name">
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  placeholder="Jane Smith"
                  style={INPUT}
                  className="modal-input"
                />
              </Field>
              <Field label="Email Address">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="jane@supplier.com"
                  style={INPUT}
                  className="modal-input"
                />
              </Field>
              <Field label="Phone Number">
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+27 11 555 0100"
                  style={INPUT}
                  className="modal-input"
                />
              </Field>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Payment Terms (days)">
                  <input
                    type="number"
                    value={form.paymentTerms}
                    onChange={(e) =>
                      set("paymentTerms", parseInt(e.target.value) || 0)
                    }
                    style={INPUT}
                    className="modal-input"
                  />
                </Field>
                <Field label="Lead Time (days)">
                  <input
                    type="number"
                    value={form.leadTimeDays}
                    onChange={(e) =>
                      set("leadTimeDays", parseInt(e.target.value) || 0)
                    }
                    style={INPUT}
                    className="modal-input"
                  />
                </Field>
              </div>
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
                disabled={!form.name || createMutation.isPending}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 11,
                  background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: !form.name || createMutation.isPending ? 0.5 : 1,
                  boxShadow: "0 4px 14px rgba(139,92,246,.3)",
                }}
              >
                {createMutation.isPending ? "Adding…" : "Add Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
