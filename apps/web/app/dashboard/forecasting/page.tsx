"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demand Forecasting</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          AI-powered predictions using historical sales data
        </p>
      </div>

      {/* Controls */}
      <div
        className="bg-white rounded-3xl p-6 mb-6"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid #e8edf2",
        }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none transition-all"
              style={{ background: "#f8fafc", border: "2px solid #f1f5f9" }}
            >
              <option value="">Choose a product to forecast...</option>
              {products?.data?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-52">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Forecast Period
            </label>
            <div
              className="grid grid-cols-5 gap-1 p-1 rounded-2xl"
              style={{ background: "#f8fafc", border: "2px solid #f1f5f9" }}
            >
              {[7, 14, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className="py-2 rounded-xl text-xs font-bold transition-all"
                  style={
                    days === d
                      ? {
                          background:
                            "linear-gradient(135deg, #ec4899, #db2777)",
                          color: "white",
                          boxShadow: "0 2px 8px rgba(236,72,153,0.3)",
                        }
                      : { color: "#94a3b8" }
                  }
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Empty */}
      {!selectedProductId && (
        <div
          className="rounded-3xl p-16 text-center"
          style={{
            background: "linear-gradient(135deg, #fdf4ff, #fce7f3)",
            border: "2px dashed #f9a8d4",
          }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: "linear-gradient(135deg, #ec4899, #db2777)",
              boxShadow: "0 8px 24px rgba(236,72,153,0.3)",
            }}
          >
            <TrendingUp size={32} className="text-white" />
          </div>
          <h3 className="text-gray-800 font-bold text-xl mb-2">
            AI Demand Forecasting
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Select a product above to generate intelligent demand predictions
            powered by machine learning
          </p>
        </div>
      )}

      {/* Loading */}
      {selectedProductId && isLoading && (
        <div
          className="bg-white rounded-3xl p-16 text-center"
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            border: "1px solid #e8edf2",
          }}
        >
          <div
            className="w-16 h-16 rounded-full border-4 border-pink-200 flex items-center justify-center mx-auto mb-4"
            style={{
              borderTopColor: "#ec4899",
              animation: "spin 1s linear infinite",
            }}
          >
            <div className="w-3 h-3 rounded-full bg-pink-500" />
          </div>
          <p className="text-gray-500 font-medium">
            Generating AI forecast for{" "}
            <span className="font-bold text-gray-900">
              {selectedProduct?.name}
            </span>
            ...
          </p>
        </div>
      )}

      {/* Error */}
      {selectedProductId && error && (
        <div
          className="rounded-3xl p-6 flex items-start gap-4"
          style={{
            background: "linear-gradient(135deg,#fef2f2,#fff1f2)",
            border: "1px solid #fecdd3",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#ef4444" }}
          >
            <span className="text-white font-bold">!</span>
          </div>
          <div>
            <p className="text-red-800 font-bold mb-1">Forecast unavailable</p>
            <p className="text-red-600 text-sm">
              Ensure the AI service is running and this product has at least 7
              days of sales history.
            </p>
          </div>
        </div>
      )}

      {forecast && chartData && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Avg Daily Demand",
                value: avgDemand,
                unit: "units/day",
                gradient: "linear-gradient(135deg,#ec4899,#db2777)",
                shadow: "rgba(236,72,153,0.25)",
              },
              {
                label: "Peak Demand",
                value: maxDemand,
                unit: "units",
                gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
                shadow: "rgba(139,92,246,0.25)",
              },
              {
                label: `${days}-Day Total`,
                value: totalDemand.toLocaleString(),
                unit: "units forecast",
                gradient: "linear-gradient(135deg,#3b82f6,#2563eb)",
                shadow: "rgba(59,130,246,0.25)",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-5 text-white relative overflow-hidden"
                style={{
                  background: s.gradient,
                  boxShadow: `0 4px 16px ${s.shadow}`,
                }}
              >
                <div
                  className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-20"
                  style={{ background: "white" }}
                />
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
                  {s.label}
                </p>
                <p className="text-3xl font-bold relative z-10">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.unit}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div
            className="bg-white rounded-3xl p-6 mb-6"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              border: "1px solid #e8edf2",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-gray-900">
                  {days}-Day Demand Forecast
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {selectedProduct?.name} · 95% confidence interval shaded
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span
                    className="w-4 h-0.5 rounded inline-block"
                    style={{ background: "#ec4899" }}
                  />{" "}
                  Predicted
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span
                    className="w-4 h-3 rounded inline-block opacity-40"
                    style={{ background: "#ec4899" }}
                  />{" "}
                  Confidence
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.15} />
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
                  fill="url(#confGrad)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="#f9a8d4"
                  strokeWidth={1}
                  fill="white"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#ec4899"
                  strokeWidth={3}
                  fill="none"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              border: "1px solid #e8edf2",
            }}
          >
            <div
              className="px-6 py-5"
              style={{ borderBottom: "1px solid #f1f5f9" }}
            >
              <h2 className="font-bold text-gray-900">Daily Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      background: "#fafbfc",
                      borderBottom: "2px solid #f1f5f9",
                    }}
                  >
                    {["Date", "Predicted", "Lower", "Upper", "Confidence"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((f: any) => (
                    <tr
                      key={f.date}
                      style={{ borderBottom: "1px solid #f8f9fa" }}
                      className="hover:bg-pink-50/20 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm font-mono text-gray-600">
                        {f.date}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="text-sm font-bold"
                          style={{ color: "#ec4899" }}
                        >
                          {f.predictedQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-400">
                        {f.lowerBound}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-400">
                        {f.upperBound}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-16 h-1.5 rounded-full"
                            style={{ background: "#f1f5f9" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: "95%",
                                background:
                                  "linear-gradient(90deg,#ec4899,#f9a8d4)",
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-medium"
                            style={{ color: "#ec4899" }}
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
