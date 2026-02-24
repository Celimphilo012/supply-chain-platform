"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Plus, Truck, Mail, Phone, X, Building2 } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
        <div className="w-14 h-5 bg-gray-100 rounded-full" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

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
          <h1 className="text-xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {activeCount} active supplier{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Supplier
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && [...Array(6)].map((_, i) => <SkeletonCard key={i} />)}

        {suppliers?.map((supplier: any) => (
          <div
            key={supplier.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Truck size={18} className="text-blue-600" />
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  supplier.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${supplier.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
                />
                {supplier.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-0.5">
              {supplier.name}
            </h3>
            {supplier.contactName && (
              <p className="text-sm text-gray-400 mb-4">
                {supplier.contactName}
              </p>
            )}

            <div className="space-y-2 mb-4">
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail size={13} className="text-gray-300 flex-shrink-0" />
                  <span className="truncate">{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={13} className="text-gray-300 flex-shrink-0" />
                  <span>{supplier.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Payment terms</p>
                <p className="text-sm font-semibold text-gray-900">
                  {supplier.paymentTerms} days
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Lead time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {supplier.leadTimeDays
                    ? `${supplier.leadTimeDays} days`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && (!suppliers || suppliers.length === 0) && (
          <div className="col-span-full bg-white border border-gray-200 border-dashed rounded-2xl p-16 text-center">
            <Building2 size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium text-sm">
              No suppliers yet
            </p>
            <p className="text-gray-300 text-xs mt-1">
              Add your first supplier to get started
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={14} />
              Add Supplier
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Add Supplier
              </h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
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
                  label: "Email",
                  key: "email",
                  type: "email",
                  placeholder: "jane@supplier.com",
                },
                {
                  label: "Phone",
                  key: "phone",
                  type: "text",
                  placeholder: "+27 11 555 0100",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type={field.type}
                    value={(form as any)[field.key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.name || createMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
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
