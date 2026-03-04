"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Package, Mail, Lock, AlertCircle } from "lucide-react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
});
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
const ACCENT = "#e11d48";

export default function SupplierLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: (d: any) => api.post("/supplier-portal/login", d),
    onSuccess: (res) => {
      localStorage.setItem("supplier_token", res.data.accessToken);
      localStorage.setItem("supplier_user", JSON.stringify(res.data.user));
      router.push("/supplier-portal/dashboard");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Invalid email or password");
    },
  });

  const submit = () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    loginMutation.mutate(form);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`.sp-input:focus{border-color:${ACCENT} !important;background:#fff !important}`}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg,${ACCENT},#be123c)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: `0 8px 24px ${ACCENT}44`,
            }}
          >
            <Package size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
            Supplier Portal
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,.5)",
              marginTop: 6,
            }}
          >
            Sign in to manage your supply relationships
          </p>
        </div>

        {/* card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "32px 28px",
            boxShadow: "0 24px 64px rgba(0,0,0,.4)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
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
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="supplier@company.com"
                  style={{ ...INPUT, paddingLeft: 36 }}
                  className="sp-input"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </div>
            </div>
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
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
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
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Your password"
                  style={{ ...INPUT, paddingLeft: 36 }}
                  className="sp-input"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: 9,
                }}
              >
                <AlertCircle size={14} color={ACCENT} />
                <p style={{ fontSize: 12, color: "#be123c", fontWeight: 600 }}>
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={submit}
              disabled={loginMutation.isPending}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 11,
                background: `linear-gradient(135deg,${ACCENT},#be123c)`,
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                opacity: loginMutation.isPending ? 0.7 : 1,
                marginTop: 4,
                boxShadow: `0 4px 14px ${ACCENT}44`,
              }}
            >
              {loginMutation.isPending ? "Signing in…" : "Sign In"}
            </button>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#94a3b8",
              marginTop: 20,
            }}
          >
            Don't have access? Ask your organization to send you an invite.
          </p>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,.3)",
            marginTop: 24,
          }}
        >
          © {new Date().getFullYear()} Supply Chain Platform
        </p>
      </div>
    </div>
  );
}
