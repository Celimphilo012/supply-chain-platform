'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Building2, Users, Package, ShoppingCart } from 'lucide-react';

const CARD: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' };
const ACCENT = '#e11d48';

function KPI({ label, value, icon, grad }: { label: string; value: string | number; icon: React.ReactNode; grad: string }) {
  return (
    <div style={{ borderRadius: 16, padding: '20px', background: grad, color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
      <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>{label}</p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
  });

  return (
    <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes skpulse{0%,100%{opacity:1}50%{opacity:.4}}
        .kpi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
        @media(min-width:900px){.kpi-grid{grid-template-columns:repeat(4,1fr)}}
      `}</style>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Platform Overview</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Real-time metrics across all organizations</p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        {isLoading ? [...Array(4)].map((_, i) => (
          <div key={i} style={{ borderRadius: 16, height: 120, background: '#f1f5f9', animation: 'skpulse 1.4s infinite' }} />
        )) : <>
          <KPI label="Organizations"  value={stats?.totalOrgs ?? 0}     grad="linear-gradient(135deg,#e11d48,#be123c)"   icon={<Building2 size={18} color="#fff"/>} />
          <KPI label="Total Users"    value={stats?.totalUsers ?? 0}    grad="linear-gradient(135deg,#7c3aed,#6d28d9)"   icon={<Users size={18} color="#fff"/>} />
          <KPI label="Inventory SKUs" value={stats?.totalProducts ?? 0} grad="linear-gradient(135deg,#0284c7,#0369a1)"   icon={<Package size={18} color="#fff"/>} />
          <KPI label="Total Orders"   value={stats?.totalOrders ?? 0}   grad="linear-gradient(135deg,#d97706,#b45309)"   icon={<ShoppingCart size={18} color="#fff"/>} />
        </>}
      </div>

      {/* secondary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
        {[
          { label: 'Active Users',    value: stats?.activeUsers ?? 0,                                    color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Stock Value',     value: `R${((stats?.totalStockValue ?? 0)/1000).toFixed(1)}K`,     color: '#0284c7', bg: '#eff6ff' },
        ].map(s => (
          <div key={s.label} style={{ ...CARD, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>#</span>
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{isLoading ? '…' : s.value}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* recent orgs */}
      <div style={CARD}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={15} color={ACCENT} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Recently Added Organizations</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Latest 5 signups</p>
          </div>
        </div>
        <div>
          {isLoading && [...Array(4)].map((_, i) => (
            <div key={i} style={{ padding: '13px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f1f5f9', animation: 'skpulse 1.4s infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 13, background: '#f1f5f9', borderRadius: 6, width: '40%', marginBottom: 6, animation: 'skpulse 1.4s infinite' }} />
                <div style={{ height: 11, background: '#f1f5f9', borderRadius: 6, width: '25%', animation: 'skpulse 1.4s infinite' }} />
              </div>
            </div>
          ))}
          {stats?.recentOrgs?.map((org: any, i: number) => (
            <div key={org.id} style={{ padding: '13px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#fff8f8'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                {org.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.name}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{org.slug}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: org.plan === 'free' ? '#f8fafc' : '#f0fdf4', color: org.plan === 'free' ? '#64748b' : '#16a34a', border: `1px solid ${org.plan === 'free' ? '#e2e8f0' : '#bbf7d0'}`, textTransform: 'capitalize' }}>
                {org.plan}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
