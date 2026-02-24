"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Plus, Truck, Mail, Phone } from "lucide-react";

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500 mt-1">
            Manage your supplier relationships
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {/* Supplier Cards */}
      {isLoading && <p className="text-gray-400">Loading...</p>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers?.map((supplier: any) => (
          <div
            key={supplier.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Truck className="text-blue-600" size={20} />
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  supplier.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {supplier.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {supplier.name}
            </h3>
            {supplier.contactName && (
              <p className="text-sm text-gray-500 mb-3">
                {supplier.contactName}
              </p>
            )}
            <div className="space-y-1">
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail size={14} />
                  {supplier.email}
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={14} />
                  {supplier.phone}
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm">
              <div>
                <span className="text-gray-400">Payment terms</span>
                <p className="font-medium text-gray-900">
                  {supplier.paymentTerms} days
                </p>
              </div>
              <div>
                <span className="text-gray-400">Lead time</span>
                <p className="font-medium text-gray-900">
                  {supplier.leadTimeDays ?? "—"} days
                </p>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && (!suppliers || suppliers.length === 0) && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            No suppliers yet — add your first supplier
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Add Supplier
            </h2>
            <div className="space-y-4">
              {[
                {
                  label: "Company Name *",
                  key: "name",
                  type: "text",
                  placeholder: "Tech Distributors SA",
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
                {
                  label: "Payment Terms (days)",
                  key: "paymentTerms",
                  type: "number",
                  placeholder: "30",
                },
                {
                  label: "Lead Time (days)",
                  key: "leadTimeDays",
                  type: "number",
                  placeholder: "7",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={(form as any)[field.key]}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        [field.key]:
                          field.type === "number"
                            ? parseInt(e.target.value) || 0
                            : e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.name || createMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? "Saving..." : "Add Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
