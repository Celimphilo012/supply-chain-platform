"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { TrendingUp, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
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

  const chartData = forecast?.map((f: any) => ({
    date: f.date,
    predicted: f.predictedQuantity,
    lower: f.lowerBound,
    upper: f.upperBound,
  }));

  const selectedProduct = products?.data?.find(
    (p: any) => p.id === selectedProductId,
  );
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Demand Forecasting</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          AI-powered demand predictions using historical sales data
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            >
              <option value="">Choose a product to forecast...</option>
              {products?.data?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Period
            </label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            >
              <option value={7}>Next 7 days</option>
              <option value={14}>Next 14 days</option>
              <option value={30}>Next 30 days</option>
              <option value={60}>Next 60 days</option>
              <option value={90}>Next 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!selectedProductId && (
        <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={28} className="text-blue-600" />
          </div>
          <p className="text-gray-700 font-semibold mb-1">
            Select a product to generate forecast
          </p>
          <p className="text-gray-400 text-sm">
            AI will analyze historical sales data and predict future demand
          </p>
        </div>
      )}

      {/* Loading */}
      {selectedProductId && isLoading && (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Generating forecast for {selectedProduct?.name}...
          </p>
        </div>
      )}

      {/* Error */}
      {selectedProductId && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 size={16} className="text-red-600" />
          </div>
          <div>
            <p className="text-red-800 font-medium text-sm">
              Unable to generate forecast
            </p>
            <p className="text-red-600 text-sm mt-0.5">
              Make sure the AI service is running and there is at least 7 days
              of sales history for this product.
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
              },
              { label: "Peak Demand", value: maxDemand, unit: "units" },
              {
                label: "Total Forecast",
                value: totalDemand,
                unit: `units over ${days}d`,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-gray-200 rounded-2xl p-5"
              >
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.unit}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">
                  {days}-Day Demand Forecast
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {selectedProduct?.name} · 95% confidence interval
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-blue-600 inline-block rounded" />
                  Predicted
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-blue-200 inline-block rounded" />
                  Confidence range
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="upperGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#bfdbfe" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#bfdbfe" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickFormatter={(v: string) => v.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="#bfdbfe"
                  strokeWidth={1}
                  fill="url(#upperGrad)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="#bfdbfe"
                  strokeWidth={1}
                  fill="white"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">
                Daily Breakdown
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {[
                      "Date",
                      "Predicted",
                      "Lower Bound",
                      "Upper Bound",
                      "Confidence",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {forecast.map((f: any) => {
                    const range = f.upperBound - f.lowerBound;
                    const confidence =
                      range > 0
                        ? Math.round(
                            (1 - range / (f.predictedQuantity || 1)) * 100,
                          )
                        : 95;
                    return (
                      <tr
                        key={f.date}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                          {f.date}
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm font-bold text-blue-600">
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
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: "95%" }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">95%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
