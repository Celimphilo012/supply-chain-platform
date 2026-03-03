'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { User, Lock, Shield, Building2, CheckCircle, AlertCircle } from 'lucide-react';

const CARD: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' };
const INPUT: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const };
const LABEL: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const ACCENT = '#6366f1';

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  super_admin: { bg: '#fff1f2', color: '#e11d48', label: 'Super Admin' },
  owner:       { bg: '#f5f3ff', color: '#7c3aed', label: 'Owner' },
  admin:       { bg: '#eff6ff', color: '#2563eb', label: 'Admin' },
  manager:     { bg: '#f0fdf4', color: '#16a34a', label: 'Manager' },
  viewer:      { bg: '#f8fafc', color: '#64748b', label: 'Viewer' },
};

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 12, background: type === 'success' ? '#f0fdf4' : '#fff1f2', border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecdd3'}`, boxShadow: '0 8px 24px rgba(0,0,0,.12)', fontFamily: "'Outfit', sans-serif" }}>
      {type === 'success' ? <CheckCircle size={16} color="#16a34a" /> : <AlertCircle size={16} color="#e11d48" />}
      <p style={{ fontSize: 13, fontWeight: 600, color: type === 'success' ? '#15803d' : '#be123c' }}>{message}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { user, organization, setAuth, accessToken } = useAuthStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [profile, setProfile] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const profileMutation = useMutation({
    mutationFn: (d: any) => api.patch('/auth/me', d),
    onSuccess: (res) => {
      // update auth store with new name
      if (user && accessToken) {
        setAuth(accessToken, { ...user, firstName: res.data.firstName, lastName: res.data.lastName }, organization);
      }
      showToast('Profile updated successfully', 'success');
    },
    onError: () => showToast('Failed to update profile', 'error'),
  });

  const passwordMutation = useMutation({
    mutationFn: (d: any) => api.patch('/auth/me/password', d),
    onSuccess: () => {
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwError('');
      showToast('Password changed successfully', 'success');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to change password';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
    },
  });

  const submitProfile = () => {
    profileMutation.mutate({ firstName: profile.firstName, lastName: profile.lastName });
  };

  const submitPassword = () => {
    setPwError('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    passwordMutation.mutate({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
  };

  const roleStyle = ROLE_STYLE[user?.role ?? 'viewer'] ?? ROLE_STYLE.viewer;
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`.st-input:focus{border-color:${ACCENT} !important;background:#fff !important}`}</style>

      {/* header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Manage your account and preferences</p>
      </div>

      {/* profile card */}
      <div style={CARD}>
        <div style={{ height: 4, background: `linear-gradient(135deg,${ACCENT},#8b5cf6)` }} />
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${ACCENT},#8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
            {initials || <User size={22} color="#fff" />}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{user?.firstName} {user?.lastName}</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>{user?.email}</p>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.color}33` }}>
            {roleStyle.label}
          </span>
        </div>

        {/* edit name */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <User size={15} color={ACCENT} />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Personal Information</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={LABEL}>First Name</label>
              <input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                placeholder="First name" style={INPUT} className="st-input" />
            </div>
            <div>
              <label style={LABEL}>Last Name</label>
              <input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                placeholder="Last name" style={INPUT} className="st-input" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={LABEL}>Email Address</label>
            <input value={user?.email ?? ''} disabled
              style={{ ...INPUT, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>Email cannot be changed. Contact a super admin if needed.</p>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={submitProfile} disabled={profileMutation.isPending}
              style={{ padding: '10px 24px', borderRadius: 11, background: `linear-gradient(135deg,${ACCENT},#8b5cf6)`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: profileMutation.isPending ? .6 : 1 }}>
              {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* change password */}
      <div style={CARD}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={15} color="#f59e0b" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Change Password</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Use a strong password at least 8 characters long</p>
          </div>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={LABEL}>Current Password</label>
            <input type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Enter current password" style={INPUT} className="st-input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={LABEL}>New Password</label>
              <input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min. 8 characters" style={INPUT} className="st-input" />
            </div>
            <div>
              <label style={LABEL}>Confirm New Password</label>
              <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password" style={INPUT} className="st-input" />
            </div>
          </div>
          {pwError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 9 }}>
              <AlertCircle size={14} color="#e11d48" />
              <p style={{ fontSize: 12, color: '#be123c', fontWeight: 600 }}>{pwError}</p>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={submitPassword} disabled={!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword || passwordMutation.isPending}
              style={{ padding: '10px 24px', borderRadius: 11, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword || passwordMutation.isPending) ? .5 : 1 }}>
              {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>

      {/* account info */}
      <div style={CARD}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={15} color="#16a34a" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Organization</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Your workspace details</p>
          </div>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Organization Name', value: organization?.name ?? '—' },
            { label: 'Plan', value: organization?.plan ?? '—' },
            { label: 'Slug', value: organization?.slug ?? '—' },
            { label: 'Your Role', value: roleStyle.label },
          ].map(f => (
            <div key={f.label}>
              <label style={{ ...LABEL, color: '#94a3b8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* security info */}
      <div style={CARD}>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={15} color="#2563eb" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Security</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Your session is secured with JWT authentication. Tokens expire every 15 minutes and are automatically refreshed.</p>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}