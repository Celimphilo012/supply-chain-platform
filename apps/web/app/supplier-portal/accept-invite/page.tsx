"use client";
import { useState, useEffect, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, User, Lock, AlertCircle, CheckCircle } from "lucide-react";

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

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid invite link — no token found.");
  }, [token]);

  const acceptMutation = useMutation({
    mutationFn: (d: any) => api.post("/supplier-portal/accept-invite", d),
    onSuccess: (res) => {
      localStorage.setItem("supplier_token", res.data.accessToken);
      localStorage.setItem("supplier_user", JSON.stringify(res.data.user));
      setSuccess(true);
      setTimeout(() => router.push("/supplier-portal/dashboard"), 2000);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg[0] : (msg ?? "Failed to accept invite"),
      );
    },
  });

  const submit = () => {
    setError("");
    if (!form.firstName || !form.lastName || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    acceptMutation.mutate({
      token,
      firstName: form.firstName,
      lastName: form.lastName,
      password: form.password,
    });
  };

  if (success)
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckCircle size={28} color="#16a34a" />
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
          Account created!
        </p>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
          Redirecting to your portal…
        </p>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { k: "firstName", l: "First Name", ph: "John" },
          { k: "lastName", l: "Last Name", ph: "Smith" },
        ].map((f) => (
          <div key={f.k}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              {f.l}
            </label>
            <input
              value={(form as any)[f.k]}
              onChange={(e) =>
                setForm((p) => ({ ...p, [f.k]: e.target.value }))
              }
              placeholder={f.ph}
              style={INPUT}
              className="sp-input"
            />
          </div>
        ))}
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
            placeholder="Min. 8 characters"
            style={{ ...INPUT, paddingLeft: 36 }}
            className="sp-input"
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
          Confirm Password
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
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((p) => ({ ...p, confirmPassword: e.target.value }))
            }
            placeholder="Repeat password"
            style={{ ...INPUT, paddingLeft: 36 }}
            className="sp-input"
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
        disabled={acceptMutation.isPending || !token}
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
          opacity: acceptMutation.isPending || !token ? 0.7 : 1,
          marginTop: 4,
          boxShadow: `0 4px 14px ${ACCENT}44`,
        }}
      >
        {acceptMutation.isPending
          ? "Setting up account…"
          : "Create Account & Continue"}
      </button>

      <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
        Already have an account?{" "}
        <a
          href="/supplier-portal/login"
          style={{ color: ACCENT, fontWeight: 600, textDecoration: "none" }}
        >
          Sign in
        </a>
      </p>
    </div>
  );
}

export default function AcceptInvitePage() {
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
      <style>{`.sp-input:focus{border-color:#e11d48 !important;background:#fff !important}`}</style>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg,#e11d48,#be123c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px #e11d4844",
            }}
          >
            <Package size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
            Accept Invitation
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,.5)",
              marginTop: 6,
            }}
          >
            Set up your supplier portal account
          </p>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "32px 28px",
            boxShadow: "0 24px 64px rgba(0,0,0,.4)",
          }}
        >
          <Suspense
            fallback={
              <p style={{ textAlign: "center", color: "#94a3b8" }}>Loading…</p>
            }
          >
            <AcceptInviteForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
