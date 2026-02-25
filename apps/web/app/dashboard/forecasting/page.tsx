"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ── tokens ────────────────────────────────────────────────────────────────
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
const SELECT: React.CSSProperties = {
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
  boxSizing: "border-box" as const,
};

// ── stat card ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  unit,
  grad,
  shadow,
}: {
  label: string;
  value: string | number;
  unit: string;
  grad: string;
  shadow: string;
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: "18px 20px",
        background: grad,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 4px 16px ${shadow}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -16,
          right: -16,
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(255,255,255,.1)",
        }}
      />
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          opacity: 0.7,
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{unit}</p>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────
export default function ForecastingPage() {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [days, setDays] = useState(30);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((r) => r.data),
  });

  const {
    data: forecast,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["forecast", selectedProductId, days],
    queryFn: () =>
      api
        .get(`/forecasting/${selectedProductId}?days=${days}`)
        .then((r) => r.data),
    enabled: !!selectedProductId,
  });

  const selectedProduct = products?.data?.find(
    (p: any) => p.id === selectedProductId,
  );

  const chartData = forecast?.map((f: any) => ({
    date: f.date,
    predicted: f.predictedQuantity,
    lower: f.lowerBound,
    upper: f.upperBound,
  }));

  const avgDemand = forecast
    ? Math.round(
        forecast.reduce((s: number, f: any) => s + f.predictedQuantity, 0) /
          forecast.length,
      )
    : 0;
  const maxDemand = forecast
    ? Math.max(...forecast.map((f: any) => f.predictedQuantity))
    : 0;
  const totalDemand = forecast
    ? forecast.reduce((s: number, f: any) => s + f.predictedQuantity, 0)
    : 0;
  const trend =
    forecast && forecast.length > 1
      ? forecast[forecast.length - 1].predictedQuantity -
        forecast[0].predictedQuantity
      : 0;

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
        @keyframes spin{to{transform:rotate(360deg)}}
        .fc-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
        @media(min-width:700px){.fc-stats{grid-template-columns:repeat(4,1fr)}}
        tr:hover td{background:#fdf4ff !important}
        .fc-select:focus{border-color:#ec4899 !important;background:#fff !important}
        .day-btn{padding:8px 0;border-radius:8px;border:none;cursor:pointer;font-weight:700;font-size:12px;font-family:inherit;transition:all .15s}
      `}</style>

      {/* ── page header ── */}
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
            Demand Forecasting
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            AI-powered predictions using historical sales data
          </p>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 20,
            background: "linear-gradient(135deg,#ec4899,#db2777)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(236,72,153,.3)",
          }}
        >
          <TrendingUp size={13} />
          AI Powered
        </div>
      </div>

      {/* ── controls card ── */}
      <div style={CARD}>
        <div
          style={{
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* product select */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              style={SELECT}
              className="fc-select"
            >
              <option value="">Choose a product to forecast…</option>
              {products?.data?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* period buttons */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              Forecast Period
            </label>
            <div
              style={{
                display: "inline-grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: 6,
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                padding: 6,
                width: "100%",
                maxWidth: 300,
              }}
            >
              {[7, 14, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className="day-btn"
                  style={{
                    background:
                      days === d
                        ? "linear-gradient(135deg,#ec4899,#db2777)"
                        : "transparent",
                    color: days === d ? "#fff" : "#94a3b8",
                    boxShadow:
                      days === d ? "0 2px 8px rgba(236,72,153,.3)" : "none",
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── empty state ── */}
      {!selectedProductId && (
        <div
          style={{
            background: "#fdf4ff",
            border: "2px dashed #f0abfc",
            borderRadius: 16,
            padding: "64px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg,#ec4899,#db2777)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(236,72,153,.3)",
            }}
          >
            <TrendingUp size={28} color="#fff" />
          </div>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#374151",
              marginBottom: 6,
            }}
          >
            AI Demand Forecasting
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#94a3b8",
              maxWidth: 360,
              margin: "0 auto",
            }}
          >
            Select a product above to generate intelligent demand predictions
            powered by machine learning
          </p>
        </div>
      )}

      {/* ── loading ── */}
      {selectedProductId && isLoading && (
        <div style={{ ...CARD, padding: "64px 24px", textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid #fce7f3",
              borderTopColor: "#ec4899",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin .8s linear infinite",
            }}
          />
          <p style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
            Generating forecast for{" "}
            <span style={{ color: "#ec4899" }}>{selectedProduct?.name}</span>…
          </p>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            Analysing historical sales data
          </p>
        </div>
      )}

      {/* ── error ── */}
      {selectedProductId && error && (
        <div
          style={{
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            borderRadius: 14,
            padding: "16px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#ef4444", fontWeight: 800, fontSize: 16 }}>
              !
            </span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#be123c" }}>
              Forecast unavailable
            </p>
            <p style={{ fontSize: 12, color: "#e11d48", marginTop: 3 }}>
              Ensure the AI service is running and this product has at least 7
              days of sales history.
            </p>
          </div>
        </div>
      )}

      {/* ── results ── */}
      {forecast && chartData && (
        <>
          {/* stat cards */}
          <div className="fc-stats">
            <StatCard
              label="Avg Daily Demand"
              value={avgDemand}
              unit="units per day"
              grad="linear-gradient(135deg,#ec4899,#db2777)"
              shadow="rgba(236,72,153,.25)"
            />
            <StatCard
              label="Peak Demand"
              value={maxDemand}
              unit="maximum units"
              grad="linear-gradient(135deg,#8b5cf6,#7c3aed)"
              shadow="rgba(139,92,246,.25)"
            />
            <StatCard
              label={`${days}-Day Total`}
              value={totalDemand.toLocaleString()}
              unit="units forecast"
              grad="linear-gradient(135deg,#3b82f6,#2563eb)"
              shadow="rgba(59,130,246,.25)"
            />
            <div style={{ ...CARD, padding: "18px 20px" }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#94a3b8",
                  marginBottom: 8,
                }}
              >
                Trend
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#0f172a",
                    lineHeight: 1,
                  }}
                >
                  {Math.abs(trend)}
                </p>
                {trend > 0 ? (
                  <TrendingUp size={20} color="#16a34a" />
                ) : trend < 0 ? (
                  <TrendingDown size={20} color="#e11d48" />
                ) : (
                  <Minus size={20} color="#94a3b8" />
                )}
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                {trend > 0 ? "increasing" : trend < 0 ? "decreasing" : "stable"}
              </p>
            </div>
          </div>

          {/* chart */}
          <div style={CARD}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#fafbfc",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#fdf4ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp size={15} color="#ec4899" />
                </div>
                <div>
                  <p
                    style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}
                  >
                    {days}-Day Demand Forecast
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>
                    {selectedProduct?.name} · 95% confidence interval shaded
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  fontSize: 12,
                  color: "#94a3b8",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 20,
                      height: 3,
                      borderRadius: 2,
                      background: "#ec4899",
                    }}
                  />
                  Predicted
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 20,
                      height: 10,
                      borderRadius: 4,
                      background: "#fce7f3",
                    }}
                  />
                  95% Range
                </span>
              </div>
            </div>
            <div style={{ padding: "20px 20px 12px" }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#ec4899"
                        stopOpacity={0.12}
                      />
                      <stop
                        offset="100%"
                        stopColor="#ec4899"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v: string) => v.slice(5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="#f9a8d4"
                    strokeWidth={1}
                    fill="url(#confBand)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="#f9a8d4"
                    strokeWidth={1}
                    fill="#fff"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#ec4899"
                    strokeWidth={2.5}
                    fill="none"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* daily breakdown table */}
          <div style={CARD}>
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #f1f5f9",
                background: "#fafbfc",
              }}
            >
              <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                Daily Breakdown
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                {forecast.length} day forecast
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={TH}>Date</th>
                    <th style={TH}>Predicted</th>
                    <th style={TH}>Lower Bound</th>
                    <th style={TH}>Upper Bound</th>
                    <th style={TH}>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((f: any) => (
                    <tr
                      key={f.date}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        transition: "background .1s",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 20px",
                          fontSize: 13,
                          color: "#475569",
                          fontFamily: "monospace",
                          fontWeight: 500,
                        }}
                      >
                        {f.date}
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            background: "#fdf4ff",
                            color: "#be185d",
                            border: "1px solid #fbcfe8",
                          }}
                        >
                          {f.predictedQuantity}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 20px",
                          fontSize: 13,
                          color: "#94a3b8",
                          fontWeight: 500,
                        }}
                      >
                        {f.lowerBound}
                      </td>
                      <td
                        style={{
                          padding: "12px 20px",
                          fontSize: 13,
                          color: "#94a3b8",
                          fontWeight: 500,
                        }}
                      >
                        {f.upperBound}
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 60,
                              height: 5,
                              borderRadius: 99,
                              background: "#f1f5f9",
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                width: "95%",
                                height: "100%",
                                borderRadius: 99,
                                background:
                                  "linear-gradient(90deg,#ec4899,#f9a8d4)",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#ec4899",
                            }}
                          >
                            95%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
