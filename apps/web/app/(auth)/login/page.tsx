"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth.store";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      const res = await api.post("/auth/login", data);
      const { user, organization, accessToken } = res.data;
      setAuth(accessToken, user, organization ?? null); // ← correct order: token, user, org
      connectSocket();

      // Role-based redirect
      if (user.role === "super_admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ?? "Invalid email or password",
      );
    }
  };

  // Styles (identical to current login design)
  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "13px 14px 13px 44px",
    background: "rgba(255,255,255,.06)",
    border: "1.5px solid rgba(255,255,255,.12)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color .15s, background .15s",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: 20,
          padding: "clamp(2rem,5vw,2.75rem)",
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 24px 64px rgba(0,0,0,.25)",
        }}
      >
        {/* icon */}
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 8px 24px rgba(99,102,241,.4)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        </div>

        <h1
          style={{
            textAlign: "center",
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          Supply Chain Pro
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,.4)",
            fontSize: 14,
            marginBottom: 28,
          }}
        >
          Sign in to your workspace
        </p>

        {/* server error */}
        {serverError && (
          <div
            style={{
              background: "rgba(239,68,68,.12)",
              border: "1px solid rgba(239,68,68,.3)",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 18,
              color: "#fca5a5",
              fontSize: 13,
            }}
          >
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* email */}
          <div style={{ position: "relative" }}>
            <svg
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,.35)"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              {...register("email")}
              type="email"
              placeholder="Email address"
              style={{
                ...inputBase,
                ...(errors.email ? { borderColor: "#f87171" } : {}),
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#818cf8";
                e.currentTarget.style.background = "rgba(255,255,255,.09)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.email
                  ? "#f87171"
                  : "rgba(255,255,255,.12)";
                e.currentTarget.style.background = "rgba(255,255,255,.06)";
              }}
            />
            {errors.email && (
              <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* password */}
          <div style={{ position: "relative" }}>
            <svg
              style={{
                position: "absolute",
                left: 14,
                top: errors.password ? "38%" : "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,.35)"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <input
              {...register("password")}
              type={showPass ? "text" : "password"}
              placeholder="Password"
              style={{
                ...inputBase,
                paddingRight: 44,
                ...(errors.password ? { borderColor: "#f87171" } : {}),
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#818cf8";
                e.currentTarget.style.background = "rgba(255,255,255,.09)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.password
                  ? "#f87171"
                  : "rgba(255,255,255,.12)";
                e.currentTarget.style.background = "rgba(255,255,255,.06)";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              style={{
                position: "absolute",
                right: 14,
                top: errors.password ? "38%" : "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,.35)",
                padding: 0,
                display: "flex",
              }}
            >
              {showPass ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            {errors.password && (
              <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 12,
              background: "#fff",
              color: "#1a1a2e",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              fontFamily: "inherit",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity .15s",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.opacity = ".92";
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.currentTarget.style.opacity = "1";
            }}
          >
            {isSubmitting ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(26,26,46,.2)",
                    borderTopColor: "#1a1a2e",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                  }}
                />{" "}
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,.2)",
            fontSize: 12,
            marginTop: 28,
          }}
        >
          © {new Date().getFullYear()} Supply Chain Pro
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
