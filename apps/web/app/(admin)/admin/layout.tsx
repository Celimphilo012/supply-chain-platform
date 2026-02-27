'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { LayoutDashboard, Building2, Users, Package, Truck, ShoppingCart, LogOut, Menu, X, Shield } from 'lucide-react';

const NAV = [
  { href: '/admin',              label: 'Overview',       icon: LayoutDashboard },
  { href: '/admin/organizations', label: 'Organizations',  icon: Building2 },
  { href: '/admin/users',         label: 'Users',          icon: Users },
  { href: '/admin/inventory',     label: 'Inventory',      icon: Package },
  { href: '/admin/suppliers',     label: 'Suppliers',      icon: Truck },
  { href: '/admin/orders',        label: 'Orders',         icon: ShoppingCart },
];

const SIDEBAR = '#0f0f1a';
const ACCENT  = '#e11d48';   // red — visually distinct from the blue/purple dashboard

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, loadFromStorage } = useAuthStore();
  const [hydrated,    setHydrated]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { loadFromStorage(); setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== 'super_admin') router.push('/login');
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: SIDEBAR, fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${ACCENT}44`, borderTopColor: ACCENT, borderRadius: '50%', margin: '0 auto 14px', animation: 'spin .8s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>Loading admin portal…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!isAuthenticated || user?.role !== 'super_admin') return null;

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Outfit', sans-serif", background: '#f1f5f9' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(min-width:1024px){
          .admin-sidebar{ transform:translateX(0) !important; position:static !important; flex-shrink:0; }
        }
        @media(max-width:1023px){
          .admin-sidebar{ transform:translateX(${sidebarOpen ? '0' : '-100%'}); }
          .admin-hide{ display:flex !important; }
        }
        .admin-hide{ display:none; }
        .admin-nav-link:hover{ background:rgba(255,255,255,.06) !important; }
      `}</style>

      {/* overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 40 }} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, background: SIDEBAR, display: 'flex', flexDirection: 'column', zIndex: 50, transition: 'transform .2s' }}>

        {/* logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 14px ${ACCENT}44` }}>
              <Shield size={18} color="white" />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Super Admin</p>
              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>Platform Control</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="admin-hide" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.3)', display: 'none', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* user chip */}
        <div style={{ margin: '12px 12px 4px', padding: '10px 12px', background: 'rgba(255,255,255,.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${ACCENT},#be123c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</p>
            <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>Super Admin</p>
          </div>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }} />
        </div>

        {/* nav */}
        <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ color: 'rgba(255,255,255,.2)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 10px 6px' }}>Admin Menu</p>
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className="admin-nav-link"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 11, textDecoration: 'none', transition: 'background .15s', background: active ? 'rgba(225,29,72,.15)' : 'transparent', borderLeft: `3px solid ${active ? ACCENT : 'transparent'}` }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: active ? `${ACCENT}22` : 'rgba(255,255,255,.05)' }}>
                  <item.icon size={14} color={active ? ACCENT : 'rgba(255,255,255,.35)'} />
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,.45)' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* sign out */}
        <div style={{ padding: '10px 10px 16px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <button onClick={() => { logout(); router.push('/login'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.35)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#fca5a5'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.35)'; }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LogOut size={14} />
            </div>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* topbar */}
        <header style={{ height: 60, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(true)} className="admin-hide"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'none', padding: 4 }}>
              <Menu size={20} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 20, background: '#fff1f2', border: '1px solid #fecdd3', fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <Shield size={9} /> Super Admin
                </span>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  {NAV.find(n => n.href === pathname)?.label ?? 'Overview'}
                </p>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: '#fff1f2', border: `1px solid #fecdd3`, borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT }}>Admin Portal</span>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
