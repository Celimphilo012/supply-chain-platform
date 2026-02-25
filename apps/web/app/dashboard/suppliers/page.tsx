"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Plus, Truck, Mail, Phone, X, Building2 } from "lucide-react";

const SUPPLIER_COLORS = [
  { gradient: "linear-gradient(135deg, #3b82f6, #2563eb)", bg: "#eff6ff" },
  { gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)", bg: "#f5f3ff" },
  { gradient: "linear-gradient(135deg, #10b981, #059669)", bg: "#f0fdf4" },
  { gradient: "linear-gradient(135deg, #f59e0b, #d97706)", bg: "#fffbeb" },
  { gradient: "linear-gradient(135deg, #ef4444, #dc2626)", bg: "#fef2f2" },
  { gradient: "linear-gradient(135deg, #06b6d4, #0891b2)", bg: "#ecfeff" },
];

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {activeCount} active supplier partners
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            boxShadow: "0 4px 16px rgba(139,92,246,0.35)",
          }}
        >
          <Plus size={16} />
          Add Supplier
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading &&
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 animate-pulse"
              style={{ border: "1px solid #e8edf2" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100" />
                <div className="w-16 h-5 rounded-full bg-gray-100" />
              </div>
              <div className="h-5 bg-gray-100 rounded-xl w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded-xl w-1/2 mb-5" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded-xl w-2/3" />
                <div className="h-3 bg-gray-100 rounded-xl w-1/2" />
              </div>
            </div>
          ))}

        {suppliers?.map((supplier: any, idx: number) => {
          const color = SUPPLIER_COLORS[idx % SUPPLIER_COLORS.length];
          return (
            <div
              key={supplier.id}
              className="bg-white rounded-3xl overflow-hidden hover:shadow-lg transition-all group"
              style={{
                border: "1px solid #e8edf2",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              {/* Colored top strip */}
              <div className="h-2" style={{ background: color.gradient }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: color.bg }}
                  >
                    <Truck
                      size={20}
                      style={{
                        color: color.gradient.includes("#3b82f6")
                          ? "#2563eb"
                          : color.gradient.includes("#8b5cf6")
                            ? "#7c3aed"
                            : color.gradient.includes("#10b981")
                              ? "#059669"
                              : color.gradient.includes("#f59e0b")
                                ? "#d97706"
                                : color.gradient.includes("#ef4444")
                                  ? "#dc2626"
                                  : "#0891b2",
                      }}
                    />
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={
                      supplier.isActive
                        ? { background: "#f0fdf4", color: "#16a34a" }
                        : { background: "#f8fafc", color: "#94a3b8" }
                    }
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: supplier.isActive ? "#22c55e" : "#94a3b8",
                      }}
                    />
                    {supplier.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-0.5 group-hover:text-blue-600 transition-colors">
                  {supplier.name}
                </h3>
                {supplier.contactName && (
                  <p className="text-gray-400 text-sm mb-4">
                    {supplier.contactName}
                  </p>
                )}

                <div className="space-y-2 mb-5">
                  {supplier.email && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "#f8fafc" }}
                      >
                        <Mail size={12} className="text-gray-400" />
                      </div>
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "#f8fafc" }}
                      >
                        <Phone size={12} className="text-gray-400" />
                      </div>
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                </div>

                <div
                  className="pt-4 grid grid-cols-2 gap-3"
                  style={{ borderTop: "2px dashed #f1f5f9" }}
                >
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "#f8fafc" }}
                  >
                    <p className="text-xs text-gray-400 font-medium mb-1">
                      Payment
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {supplier.paymentTerms}d
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "#f8fafc" }}
                  >
                    <p className="text-xs text-gray-400 font-medium mb-1">
                      Lead Time
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {supplier.leadTimeDays
                        ? `${supplier.leadTimeDays}d`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {!isLoading && (!suppliers || suppliers.length === 0) && (
          <div
            className="col-span-full bg-white rounded-3xl p-16 text-center"
            style={{ border: "2px dashed #e8edf2" }}
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: "linear-gradient(135deg, #eff6ff, #f5f3ff)",
              }}
            >
              <Building2 size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-700 font-bold text-lg mb-2">
              No suppliers yet
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Add your supplier partners to start creating purchase orders
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              }}
            >
              <Plus size={16} />
              Add First Supplier
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}
          >
            <div
              className="h-2 rounded-t-3xl"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              }}
            />
            <div
              className="px-6 py-5 flex items-center justify-between"
              style={{ borderBottom: "1px solid #f1f5f9" }}
            >
              <div>
                <h2 className="font-bold text-gray-900">Add Supplier</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Create a new supplier partner
                </p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                {
                  label: "Company Name",
                  key: "name",
                  type: "text",
                  placeholder: "Tech Distributors SA",
                  required: true,
                },
                {
                  label: "Contact Name",
                  key: "contactName",
                  type: "text",
                  placeholder: "Jane Smith",
                },
                {
                  label: "Email Address",
                  key: "email",
                  type: "email",
                  placeholder: "jane@supplier.com",
                },
                {
                  label: "Phone Number",
                  key: "phone",
                  type: "text",
                  placeholder: "+27 11 555 0100",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}{" "}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={(form as any)[field.key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none transition-all"
                    style={{
                      background: "#f8fafc",
                      border: "2px solid #f1f5f9",
                    }}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Terms (days)
                  </label>
                  <input
                    type="number"
                    value={form.paymentTerms}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        paymentTerms: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none"
                    style={{
                      background: "#f8fafc",
                      border: "2px solid #f1f5f9",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lead Time (days)
                  </label>
                  <input
                    type="number"
                    value={form.leadTimeDays}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        leadTimeDays: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none"
                    style={{
                      background: "#f8fafc",
                      border: "2px solid #f1f5f9",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                style={{ border: "2px solid #f1f5f9" }}
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.name || createMutation.isPending}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                }}
              >
                {createMutation.isPending ? "Adding..." : "Add Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
