"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

  const { data: history } = useQuery({
    queryKey: ["forecast-history", selectedProductId],
    queryFn: () =>
      api
        .get(`/forecasting/${selectedProductId}/history?days=90`)
        .then((r) => r.data),
    enabled: !!selectedProductId,
  });

  const chartData = forecast?.map((f: any) => ({
    date: f.date,
    predicted: f.predictedQuantity,
    lower: f.lowerBound,
    upper: f.upperBound,
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Demand Forecasting</h1>
        <p className="text-gray-500 mt-1">
          AI-powered demand predictions using historical sales data
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a product...</option>
              {products?.data?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forecast Period
            </label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      {!selectedProductId && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <TrendingUp className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-400">
            Select a product to see demand forecast
          </p>
        </div>
      )}

      {selectedProductId && isLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400">Generating forecast...</p>
        </div>
      )}

      {selectedProductId && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          Could not generate forecast. Make sure the AI service is running and
          there is enough sales history (minimum 7 days).
        </div>
      )}

      {forecast && chartData && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-6">
              {days}-Day Demand Forecast
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="#bfdbfe"
                  strokeWidth={1}
                  dot={false}
                  name="Upper bound"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="Predicted"
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="#bfdbfe"
                  strokeWidth={1}
                  dot={false}
                  name="Lower bound"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Daily Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Date",
                      "Predicted Demand",
                      "Lower Bound",
                      "Upper Bound",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {forecast.map((f: any) => (
                    <tr key={f.date} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">{f.date}</td>
                      <td className="px-6 py-3 font-semibold text-blue-600">
                        {f.predictedQuantity}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {f.lowerBound}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {f.upperBound}
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
