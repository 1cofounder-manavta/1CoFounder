'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Lock, Bell, Shield, ChevronLeft, Check, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || '';
const api = {
  get: async (path, token) => { const res = await fetch(`${BASE}/api/${path}`, { headers: { Authorization: `Bearer ${token}` } }); return res.json(); },
  put: async (path, body, token) => { const res = await fetch(`${BASE}/api/${path}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return res.json(); },
  post: async (path, body, token) => { const res = await fetch(`${BASE}/api/${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return res.json(); },
};

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
      {type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      {message}
    </div>
  );
}

export default function SettingsPage() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('account');
  const [toast, setToast] = useState(null);

  // Account
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState({ matches: true, messages: true, problems: true, projects: true });

  // Blocked
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('1cf_token') : null;
    if (!t) { window.location.href = '/'; return; }
    setToken(t);
    api.get('auth/me', t).then(res => {
      if (res.user) {
        setUser(res.user);
        setName(res.user.name || '');
        setBio(res.user.bio || '');
        setNotifPrefs(res.user.notification_preferences || { matches: true, messages: true, problems: true, projects: true });
      } else { window.location.href = '/'; }
      setLoading(false);
    });
  }, []);

  const loadBlocked = useCallback(async () => {
    if (!token) return;
    const res = await api.get('users/blocked', token);
    setBlockedUsers(res.blocked_users || []);
  }, [token]);

  useEffect(() => { if (tab === 'privacy') loadBlocked(); }, [tab, loadBlocked]);

  const saveProfile = async () => {
    setSaving(true);
    const res = await api.put('users/profile', { name, bio }, token);
    if (res.user) { setUser(res.user); setToast({ message: 'Profile updated', type: 'success' }); }
    else setToast({ message: res.error || 'Failed to save', type: 'error' });
    setSaving(false);
  };

  const changePassword = async () => {
    if (newPw !== confirmPw) { setToast({ message: 'Passwords do not match', type: 'error' }); return; }
    setPwSaving(true);
    const res = await api.put('users/password', { current_password: currentPw, new_password: newPw }, token);
    if (res.success) { setToast({ message: 'Password updated', type: 'success' }); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
    else setToast({ message: res.error || 'Failed to update', type: 'error' });
    setPwSaving(false);
  };

  const saveNotifPrefs = async () => {
    const res = await api.put('users/notification-preferences', notifPrefs, token);
    if (res.success) setToast({ message: 'Notification preferences saved', type: 'success' });
  };

  const unblock = async (id) => {
    await api.post('users/unblock', { blocked_id: id }, token);
    loadBlocked();
    setToast({ message: 'User unblocked', type: 'success' });
  };

  const resendVerification = async () => {
    const res = await api.post('auth/resend-verification', {}, token);
    if (res.success) setToast({ message: 'Verification email sent!', type: 'success' });
    else setToast({ message: res.error || 'Failed', type: 'error' });
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-6 w-6 text-teal-600 animate-spin" /></div>;

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50" data-testid="settings-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto h-16 flex items-center gap-4">
          <a href="/" data-testid="settings-back" className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><ChevronLeft className="h-5 w-5" /></a>
          <h1 className="text-lg font-bold text-slate-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-48 flex md:flex-col gap-1">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} data-testid={`settings-tab-${t.id}`} onClick={() => setTab(t.id)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${tab === t.id ? 'bg-teal-700 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                  <Icon className="h-4 w-4" />{t.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Account */}
            {tab === 'account' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5" data-testid="settings-account">
                <div><h2 className="text-lg font-bold text-slate-900">Account</h2><p className="text-sm text-slate-500">Update your personal information</p></div>

                {!user?.email_verified && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between" data-testid="email-verification-banner">
                    <div><p className="text-sm font-medium text-amber-800">Email not verified</p><p className="text-xs text-amber-600">Check your inbox or request a new link</p></div>
                    <button onClick={resendVerification} className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">Resend</button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input disabled value={user?.email || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <input data-testid="settings-name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Bio</label>
                  <textarea data-testid="settings-bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>

                {/* Profile Completeness */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4" data-testid="profile-completeness">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Profile Completeness</span>
                    <span className="text-sm font-bold text-teal-700">{user?.profile_completeness || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${user?.profile_completeness || 0}%`, background: 'linear-gradient(90deg, #0f766e, #14b8a6)' }} />
                  </div>
                  {(user?.profile_completeness || 0) < 100 && <p className="text-xs text-slate-500 mt-2">Complete your profile to rank higher in co-founder discovery.</p>}
                </div>

                <button data-testid="settings-save-profile" onClick={saveProfile} disabled={saving} className="bg-teal-700 hover:bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Security */}
            {tab === 'security' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5" data-testid="settings-security">
                <div><h2 className="text-lg font-bold text-slate-900">Change Password</h2><p className="text-sm text-slate-500">Update your account password</p></div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Current Password</label>
                  <div className="relative">
                    <input data-testid="settings-current-pw" type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">New Password</label>
                  <input data-testid="settings-new-pw" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Min 6 characters" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input data-testid="settings-confirm-pw" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <button data-testid="settings-change-pw" onClick={changePassword} disabled={pwSaving || !currentPw || !newPw} className="bg-teal-700 hover:bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                  {pwSaving ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            )}

            {/* Notifications */}
            {tab === 'notifications' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5" data-testid="settings-notifications">
                <div><h2 className="text-lg font-bold text-slate-900">Notifications</h2><p className="text-sm text-slate-500">Choose which email notifications you receive</p></div>
                {[
                  { key: 'matches', label: 'Match Notifications', desc: 'When someone matches with you' },
                  { key: 'messages', label: 'Message Notifications', desc: 'When you receive a new message' },
                  { key: 'problems', label: 'Problem Updates', desc: 'When someone joins your problem' },
                  { key: 'projects', label: 'Project Updates', desc: 'When there are project updates' },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors" data-testid={`notif-toggle-${item.key}`}>
                    <div><p className="text-sm font-medium text-slate-700">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
                    <div className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${notifPrefs[item.key] ? 'bg-teal-600' : 'bg-slate-300'}`} onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPrefs[item.key] ? 'translate-x-5' : ''}`} />
                    </div>
                  </label>
                ))}
                <button data-testid="settings-save-notif" onClick={saveNotifPrefs} className="bg-teal-700 hover:bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Save Preferences</button>
              </div>
            )}

            {/* Privacy */}
            {tab === 'privacy' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5" data-testid="settings-privacy">
                <div><h2 className="text-lg font-bold text-slate-900">Privacy & Blocked Users</h2><p className="text-sm text-slate-500">Manage your blocked users</p></div>
                {blockedUsers.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4">You haven't blocked anyone.</p>
                ) : (
                  <div className="space-y-2">
                    {blockedUsers.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div><p className="text-sm font-medium text-slate-700">{u.name}</p><p className="text-xs text-slate-400">{u.role}</p></div>
                        <button onClick={() => unblock(u.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">Unblock</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
