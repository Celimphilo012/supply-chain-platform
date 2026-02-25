"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { connectSocket } from "@/lib/socket";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      setServerError("");
      const res = await api.post("/auth/login", data);
      setAuth(res.data.accessToken, res.data.user, res.data.organization);
      connectSocket();
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || "Invalid email or password",
      );
    }
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px 14px 46px",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color .2s, background .2s",
  };

  return (
    /* ── full-page centering ── */
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#e5e7eb" /* light gray page bg */,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* ── card ── */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#1a1a2e" /* deep dark card */,
          borderRadius: "20px",
          padding: "clamp(2rem, 5vw, 2.75rem)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
        }}
      >
        {/* ── icon ── */}
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.45)",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        </div>

        {/* ── title ── */}
        <h1
          style={{
            color: "#ffffff",
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "-0.3px",
            marginBottom: "6px",
            textAlign: "center",
          }}
        >
          Supply Chain Pro
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "14px",
            marginBottom: "32px",
            textAlign: "center",
          }}
        >
          Sign in to your workspace
        </p>

        {/* ── form ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Email */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                pointerEvents: "none",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
            </span>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="Email Address"
              style={{
                ...inputBase,
                borderColor: errors.email
                  ? "#f87171"
                  : "rgba(255,255,255,0.12)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#818cf8";
                e.currentTarget.style.background = "rgba(255,255,255,0.09)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.email
                  ? "#f87171"
                  : "rgba(255,255,255,0.12)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            />
            {errors.email && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "12px",
                  marginTop: "5px",
                  paddingLeft: "4px",
                }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: errors.password ? "calc(50% - 10px)" : "50%",
                transform: "translateY(-50%)",
                display: "flex",
                pointerEvents: "none",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
            <input
              {...register("password")}
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              style={{
                ...inputBase,
                paddingRight: "48px",
                borderColor: errors.password
                  ? "#f87171"
                  : "rgba(255,255,255,0.12)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#818cf8";
                e.currentTarget.style.background = "rgba(255,255,255,0.09)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.password
                  ? "#f87171"
                  : "rgba(255,255,255,0.12)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.35)",
                display: "flex",
                padding: "4px",
              }}
            >
              {showPass ? (
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            {errors.password && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "12px",
                  marginTop: "5px",
                  paddingLeft: "4px",
                }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "10px",
                padding: "11px 14px",
                color: "#fca5a5",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "15px",
              marginTop: "4px",
              background: isSubmitting ? "rgba(255,255,255,0.7)" : "#ffffff",
              border: "none",
              borderRadius: "12px",
              color: isSubmitting ? "#666" : "#1a1a2e",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity .2s, transform .1s",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.opacity = "0.92";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            marginTop: "24px",
            color: "rgba(255,255,255,0.2)",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} Supply Chain Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
