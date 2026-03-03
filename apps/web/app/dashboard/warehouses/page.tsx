'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Warehouse, X, Pencil, MapPin, Search, Package } from 'lucide-react';

const CARD: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' };
const INPUT: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const };
const ACCENT = '#e11d48';

const EMPTY_FORM = {
  name: '',
  address: { street: '', city: '', state: '', country: '', postalCode: '' },
};

export default function WarehousesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [search, setSearch] = useState('');

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.get('/warehouses').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/warehouses', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['warehouses'] }); close(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.patch(`/warehouses/${id}`, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['warehouses'] }); close(); },
  });

  const close = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM); };

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setShowModal(true); };

  const openEdit = (w: any) => {
    setForm({
      name: w.name,
      address: w.address ?? { street: '', city: '', state: '', country: '', postalCode: '' },
    });
    setEditing(w);
    setShowModal(true);
  };

  const setAddr = (key: string, val: string) =>
    setForm((p: any) => ({ ...p, address: { ...p.address, [key]: val } }));

  const submit = () => {
    const payload = {
      name: form.name,
      address: Object.values(form.address).some(Boolean) ? form.address : undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const filtered = warehouses?.filter((w: any) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.address?.city?.toLowerCase().includes(search.toLowerCase()) ||
    w.address?.country?.toLowerCase().includes(search.toLowerCase())
  );

  const formatAddress = (addr: any) => {
    if (!addr) return null;
    const parts = [addr.city, addr.state, addr.country].filter(Boolean);
    return parts.join(', ') || null;
  };

  return (
    <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@keyframes skpulse{0%,100%{opacity:1}50%{opacity:.4}} .wh-input:focus{border-color:${ACCENT} !important;background:#fff !important} .wh-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08) !important; transform:translateY(-1px);} .wh-card{transition:all .15s ease;}`}</style>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Warehouses</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Manage your storage locations</p>
        </div>
        <button onClick={openCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: `linear-gradient(135deg,${ACCENT},#be123c)`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 14px ${ACCENT}44` }}>
          <Plus size={15} /> Add Warehouse
        </button>
      </div>

      {/* search + count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search warehouses…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...INPUT, paddingLeft: 34 }} className="wh-input" />
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8' }}>{filtered?.length ?? 0} warehouse{filtered?.length !== 1 ? 's' : ''}</p>
      </div>

      {/* grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ ...CARD, padding: 20 }}>
              <div style={{ height: 16, borderRadius: 6, background: '#f1f5f9', width: '60%', marginBottom: 12, animation: 'skpulse 1.4s infinite' }} />
              <div style={{ height: 12, borderRadius: 6, background: '#f1f5f9', width: '80%', animation: 'skpulse 1.4s infinite' }} />
            </div>
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div style={{ ...CARD, padding: '60px 20px', textAlign: 'center' }}>
          <Warehouse size={40} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>No warehouses yet</p>
          <p style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4 }}>Add your first warehouse to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {filtered?.map((w: any) => (
            <div key={w.id} className="wh-card" style={CARD}>
              {/* top accent */}
              <div style={{ height: 4, background: `linear-gradient(135deg,${ACCENT},#be123c)` }} />
              <div style={{ padding: '18px 20px' }}>
                {/* icon + name */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Warehouse size={18} color={ACCENT} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{w.name}</p>
                      {formatAddress(w.address) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MapPin size={11} color="#94a3b8" />
                          <p style={{ fontSize: 12, color: '#94a3b8' }}>{formatAddress(w.address)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: w.isActive !== false ? '#f0fdf4' : '#f8fafc', color: w.isActive !== false ? '#16a34a' : '#94a3b8', border: `1px solid ${w.isActive !== false ? '#bbf7d0' : '#e2e8f0'}`, whiteSpace: 'nowrap' as const }}>
                    {w.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* address detail */}
                {w.address?.street && (
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14, paddingLeft: 2 }}>{w.address.street}{w.address.postalCode ? `, ${w.address.postalCode}` : ''}</p>
                )}

                {/* stats row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f8fafc', borderRadius: 10, marginBottom: 14 }}>
                  <Package size={13} color="#94a3b8" />
                  <p style={{ fontSize: 12, color: '#64748b' }}>
                    {w.inventoryCount ?? 0} product{w.inventoryCount !== 1 ? 's' : ''} stored
                  </p>
                </div>

                {/* actions */}
                <button onClick={() => openEdit(w)}
                  style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Pencil size={12} /> Edit Warehouse
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 16, overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,.22)', overflow: 'hidden', fontFamily: "'Outfit', sans-serif", margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ height: 5, background: `linear-gradient(135deg,${ACCENT},#be123c)` }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Warehouse size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{editing ? 'Edit Warehouse' : 'Add Warehouse'}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>{editing ? 'Update warehouse details' : 'Create a new storage location'}</p>
                </div>
              </div>
              <button onClick={close} style={{ width: 32, height: 32, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Warehouse Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Main Warehouse, Cape Town Hub" style={INPUT} className="wh-input" />
              </div>

              {/* address section */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Address <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>(optional)</span></p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Street</label>
                    <input value={form.address.street} onChange={e => setAddr('street', e.target.value)}
                      placeholder="123 Main St" style={INPUT} className="wh-input" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>City</label>
                      <input value={form.address.city} onChange={e => setAddr('city', e.target.value)}
                        placeholder="Cape Town" style={INPUT} className="wh-input" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>State / Province</label>
                      <input value={form.address.state} onChange={e => setAddr('state', e.target.value)}
                        placeholder="Western Cape" style={INPUT} className="wh-input" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Country</label>
                      <input value={form.address.country} onChange={e => setAddr('country', e.target.value)}
                        placeholder="South Africa" style={INPUT} className="wh-input" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Postal Code</label>
                      <input value={form.address.postalCode} onChange={e => setAddr('postalCode', e.target.value)}
                        placeholder="8001" style={INPUT} className="wh-input" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '0 22px 22px', display: 'flex', gap: 10 }}>
              <button onClick={close} style={{ flex: 1, padding: 12, borderRadius: 11, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={submit} disabled={!form.name || isPending}
                style={{ flex: 1, padding: 12, borderRadius: 11, background: `linear-gradient(135deg,${ACCENT},#be123c)`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: (!form.name || isPending) ? .5 : 1 }}>
                {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create Warehouse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}