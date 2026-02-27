'use client';
// Shared read-only view component — used by inventory, suppliers, and orders admin pages
// Each page imports this with its own config.

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Package, Truck, ShoppingCart } from 'lucide-react';

const CARD: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' };
const TH: React.CSSProperties = { padding: '10px 20px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const };
const ACCENT = '#e11d48';

// ── ADMIN INVENTORY ────────────────────────────────────────────────────────
export function AdminInventoryPage() {
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => api.get('/admin/inventory').then(r => r.data),
  });

  return (
    <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@keyframes skpulse{0%,100%{opacity:1}50%{opacity:.4}} tr:hover td{background:#fff8f8 !important}`}</style>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={16} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>All Inventory</h1>
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 46 }}>Read-only view across all organizations · {inventory?.length ?? 0} records</p>
      </div>

      <div style={CARD}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Product</th>
                <th style={TH}>Warehouse</th>
                <th style={{ ...TH, textAlign: 'right' }}>On Hand</th>
                <th style={{ ...TH, textAlign: 'right' }}>Reserved</th>
                <th style={{ ...TH, textAlign: 'right' }}>Reorder Pt</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && [...Array(8)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  {[...Array(6)].map((_, j) => <td key={j} style={{ padding: '13px 20px' }}><div style={{ height: 13, borderRadius: 6, background: '#f1f5f9', width: `${40 + j * 9}%`, animation: 'skpulse 1.4s infinite' }} /></td>)}
                </tr>
              ))}
              {inventory?.map((inv: any) => {
                const isLow = inv.reorderPoint && inv.quantityOnHand <= inv.reorderPoint;
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background .1s' }}>
                    <td style={{ padding: '13px 20px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{inv.product?.name}</p>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 6px', display: 'inline-block', marginTop: 3 }}>{inv.product?.sku}</span>
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ fontSize: 12, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 9px' }}>{inv.warehouse?.name}</span>
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{inv.quantityOnHand}</td>
                    <td style={{ padding: '13px 20px', textAlign: 'right', fontSize: 13, color: '#64748b' }}>{inv.quantityReserved ?? 0}</td>
                    <td style={{ padding: '13px 20px', textAlign: 'right', fontSize: 13, color: '#64748b' }}>{inv.reorderPoint ?? '—'}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: isLow ? '#fff1f2' : '#f0fdf4', color: isLow ? '#e11d48' : '#16a34a', border: `1px solid ${isLow ? '#fecdd3' : '#bbf7d0'}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLow ? '#e11d48' : '#22c55e' }} />
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && (!inventory || inventory.length === 0) && (
                <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No inventory records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN SUPPLIERS ────────────────────────────────────────────────────────
export function AdminSuppliersPage() {
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: () => api.get('/admin/suppliers').then(r => r.data),
  });

  return (
    <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@keyframes skpulse{0%,100%{opacity:1}50%{opacity:.4}} tr:hover td{background:#fff8f8 !important}`}</style>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={16} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>All Suppliers</h1>
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 46 }}>Read-only view across all organizations · {suppliers?.length ?? 0} records</p>
      </div>

      <div style={CARD}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Supplier</th>
                <th style={TH}>Contact</th>
                <th style={TH}>Email</th>
                <th style={TH}>Payment Terms</th>
                <th style={TH}>Lead Time</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  {[...Array(6)].map((_, j) => <td key={j} style={{ padding: '13px 20px' }}><div style={{ height: 13, borderRadius: 6, background: '#f1f5f9', width: `${40 + j * 9}%`, animation: 'skpulse 1.4s infinite' }} /></td>)}
                </tr>
              ))}
              {suppliers?.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background .1s' }}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                        {s.name[0].toUpperCase()}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.name}</p>
                    </div>
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: '#475569' }}>{s.contactName || '—'}</td>
                  <td style={{ padding: '13px 20px', fontSize: 12, color: '#64748b' }}>{s.email || '—'}</td>
                  <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.paymentTerms}d</td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: '#475569' }}>{s.leadTimeDays ? `${s.leadTimeDays}d` : '—'}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.isActive ? '#f0fdf4' : '#f8fafc', color: s.isActive ? '#16a34a' : '#94a3b8', border: `1px solid ${s.isActive ? '#bbf7d0' : '#e2e8f0'}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.isActive ? '#22c55e' : '#94a3b8' }} />
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && (!suppliers || suppliers.length === 0) && (
                <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No suppliers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN ORDERS ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  draft:            { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  pending_approval: { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
  approved:         { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  sent:             { bg: '#f5f3ff', color: '#6d28d9', dot: '#8b5cf6' },
  received:         { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  cancelled:        { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
};

export function AdminOrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/admin/orders').then(r => r.data),
  });

  return (
    <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@keyframes skpulse{0%,100%{opacity:1}50%{opacity:.4}} tr:hover td{background:#fff8f8 !important}`}</style>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={16} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>All Purchase Orders</h1>
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 46 }}>Read-only view across all organizations · {orders?.length ?? 0} records</p>
      </div>

      <div style={CARD}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>PO Number</th>
                <th style={TH}>Supplier</th>
                <th style={TH}>Warehouse</th>
                <th style={{ ...TH, textAlign: 'right' }}>Amount</th>
                <th style={TH}>Status</th>
                <th style={TH}>Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && [...Array(8)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  {[...Array(6)].map((_, j) => <td key={j} style={{ padding: '13px 20px' }}><div style={{ height: 13, borderRadius: 6, background: '#f1f5f9', width: `${40 + j * 9}%`, animation: 'skpulse 1.4s infinite' }} /></td>)}
                </tr>
              ))}
              {orders?.map((o: any) => {
                const s = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.draft;
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background .1s' }}>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{o.poNumber}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{o.supplier?.name}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ fontSize: 12, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 9px' }}>{o.warehouse?.name}</span>
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                      {o.currency} {Number(o.totalAmount).toLocaleString()}
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 12, color: '#94a3b8' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-ZA')}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && (!orders || orders.length === 0) && (
                <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No purchase orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
