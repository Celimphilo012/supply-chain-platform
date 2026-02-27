'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Building2, X, Pencil, Trash2 } from 'lucide-react';

const CARD: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' };
const TH: React.CSSProperties = { padding: '10px 20px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const };
const INPUT: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const };
const ACCENT = '#e11d48';

const PLANS = ['free', 'pro', 'enterprise'];
const PLAN_STYLE: Record<string, { bg: string; color: string }> = {
  free:       { bg: '#f8fafc', color: '#64748b' },
  pro:        { bg: '#eff6ff', color: '#2563eb' },
  enterprise: { bg: '#f5f3ff', color: '#7c3aed' },
};

export default function AdminOrganizationsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal]  = useState(false);
  const [editing,   setEditing]    = useState<any>(null);
  const [form,      setForm]       = useState({ name: '', plan: 'free' });
  const [confirmId, setConfirmId]  = useState<string | null>(null);

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: () => api.get('/admin/organizations').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/admin/organizations', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orgs'] }); close(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.patch(`/admin/organizations/${id}`, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orgs'] }); close(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/organizations/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orgs'] }); setConfirmId(null); },
  });

  const close = () => { setShowModal(false); setEditing(null); setForm({ name: '', plan: 'free' }); };
  const openCreate = () => { setForm({ name: '', plan: 'free' }); setEditing(null); setShowModal(true); };
  const openEdit   = (org: any) => { setForm({ name: org.name, plan: org.plan }); setEditing(org); setShowModal(true); };
  const submit     = () => editing ? updateMutation.mutate({ id: editing.id, ...form }) : createMutation.mutate(form);
  const isPending  = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@keyframes skpulse{0%,100%{opacity:1}50%{opacity:.4}} tr:hover td{background:#fff8f8 !important} .sa-input:focus{border-color:${ACCENT} !important;background:#fff !important}`}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Organizations</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>All tenants on the platform</p>
        </div>
        <button onClick={openCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: `linear-gradient(135deg,${ACCENT},#be123c)`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 14px ${ACCENT}44` }}>
          <Plus size={15} /> New Organization
        </button>
      </div>

      <div style={CARD}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Organization</th>
                <th style={TH}>Slug</th>
                <th style={TH}>Plan</th>
                <th style={TH}>Created</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && [...Array(5)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} style={{ padding: '14px 20px' }}>
                      <div style={{ height: 13, borderRadius: 6, background: '#f1f5f9', width: `${40 + j * 10}%`, animation: 'skpulse 1.4s infinite' }} />
                    </td>
                  ))}
                </tr>
              ))}
              {orgs?.map((org: any) => {
                const ps = PLAN_STYLE[org.plan] ?? PLAN_STYLE.free;
                return (
                  <tr key={org.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background .1s' }}>
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                          {org.name[0].toUpperCase()}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{org.name}</p>
                      </div>
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 7px' }}>{org.slug}</span>
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: ps.bg, color: ps.color, textTransform: 'capitalize', border: `1px solid ${ps.color}33` }}>{org.plan}</span>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 12, color: '#94a3b8' }}>
                      {new Date(org.createdAt).toLocaleDateString('en-ZA')}
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => openEdit(org)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Pencil size={11} /> Edit
                        </button>
                        <button onClick={() => setConfirmId(org.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, background: '#fff1f2', color: ACCENT, border: `1px solid #fecdd3`, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && (!orgs || orgs.length === 0) && (
                <tr><td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Building2 size={36} color="#e2e8f0" style={{ margin: '0 auto 10px' }} />
                  <p style={{ color: '#94a3b8', fontSize: 13 }}>No organizations yet</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* create/edit modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,.22)', overflow: 'hidden', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ height: 5, background: `linear-gradient(135deg,${ACCENT},#be123c)` }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{editing ? 'Edit Organization' : 'New Organization'}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>{editing ? 'Update details below' : 'Create a new tenant'}</p>
                </div>
              </div>
              <button onClick={close} style={{ width: 32, height: 32, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Organization Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Acme Corp" style={INPUT} className="sa-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Plan</label>
                <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} style={INPUT} className="sa-input">
                  {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: '0 22px 22px', display: 'flex', gap: 10 }}>
              <button onClick={close} style={{ flex: 1, padding: 12, borderRadius: 11, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={submit} disabled={!form.name || isPending}
                style={{ flex: 1, padding: 12, borderRadius: 11, background: `linear-gradient(135deg,${ACCENT},#be123c)`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: (!form.name || isPending) ? .5 : 1 }}>
                {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create Organization'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {confirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 380, padding: '28px 28px 24px', boxShadow: '0 24px 64px rgba(0,0,0,.22)', textAlign: 'center', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ width: 52, height: 52, borderRadius: 13, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={22} color={ACCENT} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Delete Organization?</p>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 22 }}>This will permanently delete the organization and all associated data. This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmId(null)} style={{ flex: 1, padding: 12, borderRadius: 11, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => deleteMutation.mutate(confirmId)} disabled={deleteMutation.isPending}
                style={{ flex: 1, padding: 12, borderRadius: 11, background: `linear-gradient(135deg,${ACCENT},#be123c)`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: deleteMutation.isPending ? .5 : 1 }}>
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
