'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Users, X, Pencil, Trash2, Search } from 'lucide-react';

const CARD: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' };
const TH: React.CSSProperties = { padding: '10px 20px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const };
const INPUT: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const };
const ACCENT = '#e11d48';

const ROLES = ['super_admin', 'owner', 'admin', 'manager', 'viewer'];
const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  super_admin: { bg: '#fff1f2', color: '#e11d48' },
  owner:       { bg: '#f5f3ff', color: '#7c3aed' },
  admin:       { bg: '#eff6ff', color: '#2563eb' },
  manager:     { bg: '#f0fdf4', color: '#16a34a' },
  viewer:      { bg: '#f8fafc', color: '#64748b' },
};

const EMPTY_FORM = { email: '', password: '', firstName: '', lastName: '', role: 'viewer', organizationId: '', isActive: true };

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<any>(null);
  const [form,      setForm]      = useState<any>(EMPTY_FORM);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search,    setSearch]    = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  });
  const { data: orgs } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: () => api.get('/admin/organizations').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/admin/users', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); close(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.patch(`/admin/users/${id}`, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); close(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmId(null); },
  });

  const close = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM); };
  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setShowModal(true); };
  const openEdit = (u: any) => {
    setForm({ email: u.email, password: '', firstName: u.firstName ?? '', lastName: u.lastName ?? '', role: u.role, organizationId: u.organizationId ?? '', isActive: u.isActive });
    setEditing(u);
    setShowModal(true);
  };
  const submit = () => {
    if (editing) {
      // don't send password if empty on edit
      const { password, email, ...rest } = form;
      updateMutation.mutate({ id: editing.id, ...rest });
    } else {
      createMutation.mutate(form);
    }
  };
  const isPending = createMutation.isPending || updateMutation.isPending;

  const filtered = users?.filter((u: any) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@keyframes skpulse{0%,100%{opacity:1}50%{opacity:.4}} tr:hover td{background:#fff8f8 !important} .sa-input:focus{border-color:${ACCENT} !important;background:#fff !important}`}</style>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Users</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>All users across all organizations</p>
        </div>
        <button onClick={openCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: `linear-gradient(135deg,${ACCENT},#be123c)`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 14px ${ACCENT}44` }}>
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* table */}
      <div style={CARD}>
        {/* search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...INPUT, paddingLeft: 34, fontSize: 13 }} className="sa-input" />
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{filtered?.length ?? 0} users</p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>User</th>
                <th style={TH}>Organization</th>
                <th style={TH}>Role</th>
                <th style={TH}>Status</th>
                <th style={TH}>Last Login</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} style={{ padding: '14px 20px' }}>
                      <div style={{ height: 13, borderRadius: 6, background: '#f1f5f9', width: `${40 + j * 9}%`, animation: 'skpulse 1.4s infinite' }} />
                    </td>
                  ))}
                </tr>
              ))}
              {filtered?.map((u: any) => {
                const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.viewer;
                const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background .1s' }}>
                    {/* user */}
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: u.role === 'super_admin' ? `linear-gradient(135deg,${ACCENT},#be123c)` : 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                          {initials || '?'}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{u.firstName} {u.lastName}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* org */}
                    <td style={{ padding: '13px 20px' }}>
                      {u.organization
                        ? <span style={{ fontSize: 12, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 9px' }}>{u.organization.name}</span>
                        : <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No org</span>}
                    </td>
                    {/* role */}
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: rs.bg, color: rs.color, border: `1px solid ${rs.color}33`, textTransform: 'capitalize' }}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    {/* status */}
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.isActive ? '#f0fdf4' : '#f8fafc', color: u.isActive ? '#16a34a' : '#94a3b8', border: `1px solid ${u.isActive ? '#bbf7d0' : '#e2e8f0'}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.isActive ? '#22c55e' : '#94a3b8' }} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* last login */}
                    <td style={{ padding: '13px 20px', fontSize: 12, color: '#94a3b8' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-ZA') : '—'}
                    </td>
                    {/* actions */}
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => openEdit(u)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Pencil size={11} /> Edit
                        </button>
                        {u.role !== 'super_admin' && (
                          <button onClick={() => setConfirmId(u.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, background: '#fff1f2', color: ACCENT, border: `1px solid #fecdd3`, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                            <Trash2 size={11} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && (!filtered || filtered.length === 0) && (
                <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Users size={36} color="#e2e8f0" style={{ margin: '0 auto 10px' }} />
                  <p style={{ color: '#94a3b8', fontSize: 13 }}>No users found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* create/edit modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 16, overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,.22)', overflow: 'hidden', fontFamily: "'Outfit', sans-serif", margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ height: 5, background: `linear-gradient(135deg,${ACCENT},#be123c)` }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{editing ? 'Edit User' : 'Add User'}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>{editing ? 'Update user details' : 'Create a new user account'}</p>
                </div>
              </div>
              <button onClick={close} style={{ width: 32, height: 32, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ k: 'firstName', l: 'First Name' }, { k: 'lastName', l: 'Last Name' }].map(f => (
                  <div key={f.k}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{f.l}</label>
                    <input value={form[f.k]} onChange={e => setForm((p: any) => ({ ...p, [f.k]: e.target.value }))} style={INPUT} className="sa-input" />
                  </div>
                ))}
              </div>

              {!editing && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="email" value={form.email} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))} style={INPUT} className="sa-input" />
                </div>
              )}

              {!editing && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="password" value={form.password} onChange={e => setForm((p: any) => ({ ...p, password: e.target.value }))} style={INPUT} className="sa-input" />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Role</label>
                <select value={form.role} onChange={e => setForm((p: any) => ({ ...p, role: e.target.value }))} style={INPUT} className="sa-input">
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Organization</label>
                <select value={form.organizationId} onChange={e => setForm((p: any) => ({ ...p, organizationId: e.target.value }))} style={INPUT} className="sa-input">
                  <option value="">None (Super Admin)</option>
                  {orgs?.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>

              {editing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm((p: any) => ({ ...p, isActive: e.target.checked }))} style={{ width: 16, height: 16, accentColor: ACCENT }} />
                  <label htmlFor="isActive" style={{ fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Account Active</label>
                </div>
              )}
            </div>

            <div style={{ padding: '0 22px 22px', display: 'flex', gap: 10 }}>
              <button onClick={close} style={{ flex: 1, padding: 12, borderRadius: 11, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={submit} disabled={(!editing && (!form.email || !form.password)) || isPending}
                style={{ flex: 1, padding: 12, borderRadius: 11, background: `linear-gradient(135deg,${ACCENT},#be123c)`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: ((!editing && (!form.email || !form.password)) || isPending) ? .5 : 1 }}>
                {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create User'}
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
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Delete User?</p>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 22 }}>This will permanently delete the user account. This action cannot be undone.</p>
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
