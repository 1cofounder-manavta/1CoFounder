'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, AlertTriangle, FolderKanban, ShieldCheck,
  Flag, Search, ChevronLeft, ChevronRight, LogOut, Eye, Trash2,
  Ban, CheckCircle, XCircle, Activity, Clock, UserPlus, FileText,
  Briefcase, Filter, RefreshCw, Menu, X, Heart, MessageCircle
} from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || '';

const api = {
  get: async (path, token, params = {}) => {
    const url = new URL(`${BASE}/api/${path}`);
    Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  put: async (path, token) => {
    const res = await fetch(`${BASE}/api/${path}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    return res.json();
  },
  del: async (path, token) => {
    const res = await fetch(`${BASE}/api/${path}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  post: async (path, body, token) => {
    const res = await fetch(`${BASE}/api/${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  },
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ==========================================
// ADMIN LOGIN
// ==========================================
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('auth/login', { email, password });
      if (res.error) { setError(res.error); return; }
      if (!res.user?.is_admin) { setError('Access denied. Admin privileges required.'); return; }
      onLogin(res.token, res.user);
    } catch { setError('Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" data-testid="admin-login">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">1CoFounder.com</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          {error && <div data-testid="admin-login-error" className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">{error}</div>}
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Email</label>
            <input data-testid="admin-email-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="admin@1cofounder.com" />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Password</label>
            <input data-testid="admin-password-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="••••••••" />
          </div>
          <button data-testid="admin-login-btn" type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// SIDEBAR
// ==========================================
function Sidebar({ active, setActive, user, onLogout, mobileOpen, setMobileOpen }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'problems', label: 'Problems', icon: FileText },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { id: 'reports', label: 'Reports', icon: Flag },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
  ];

  const sidebar = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
            <ShieldCheck className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Admin Panel</p>
            <p className="text-xs text-slate-500">1CoFounder.com</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" data-testid="admin-sidebar-nav">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              data-testid={`admin-nav-${item.id}`}
              onClick={() => { setActive(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-teal-600/15 text-teal-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600/20 flex items-center justify-center text-xs font-bold text-teal-400">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button data-testid="admin-logout-btn" onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block h-screen sticky top-0">{sidebar}</div>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64">{sidebar}</div>
        </div>
      )}
    </>
  );
}

// ==========================================
// STAT CARD
// ==========================================
function StatCard({ label, value, icon: Icon, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-600/10 text-teal-400 border-teal-600/20',
    blue: 'bg-blue-600/10 text-blue-400 border-blue-600/20',
    amber: 'bg-amber-600/10 text-amber-400 border-amber-600/20',
    red: 'bg-red-600/10 text-red-400 border-red-600/20',
    purple: 'bg-purple-600/10 text-purple-400 border-purple-600/20',
    emerald: 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20',
  };
  return (
    <div data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} border flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

// ==========================================
// PAGINATION
// ==========================================
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700" data-testid="pagination">
      <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

// ==========================================
// CONFIRM MODAL
// ==========================================
function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="confirm-modal">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl border border-slate-600 hover:bg-slate-700 transition-colors">Cancel</button>
          <button data-testid="confirm-action-btn" onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// DASHBOARD VIEW
// ==========================================
function DashboardView({ token }) {
  const [stats, setStats] = useState(null);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, q] = await Promise.all([
      api.get('admin/dashboard', token),
      api.get('admin/moderation-queue', token),
    ]);
    setStats(s.stats);
    setQueue(q);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-6 w-6 text-slate-500 animate-spin" /></div>;

  return (
    <div data-testid="admin-dashboard">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <button onClick={load} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><RefreshCw className="h-4 w-4" /></button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="teal" />
        <StatCard label="New Today" value={stats?.newUsersToday} icon={UserPlus} color="blue" />
        <StatCard label="Total Problems" value={stats?.totalProblems} icon={FileText} color="emerald" />
        <StatCard label="Total Projects" value={stats?.totalProjects} icon={FolderKanban} color="purple" />
        <StatCard label="Flagged Content" value={stats?.flaggedContent} icon={AlertTriangle} color="red" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total Matches" value={stats?.totalMatches} icon={Heart} color="teal" />
        <StatCard label="Messages Sent" value={stats?.totalMessages} icon={MessageCircle} color="blue" />
        <StatCard label="Active Projects" value={stats?.activeProjects} icon={Activity} color="emerald" />
        <StatCard label="Pending Verify" value={stats?.pendingVerifications} icon={ShieldCheck} color="amber" />
      </div>

      <h2 className="text-lg font-bold text-white mb-4">Moderation Queue</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><Flag className="h-4 w-4 text-red-400" /><span className="text-sm font-semibold text-white">Flagged Users</span><span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{queue?.flaggedUsers?.length || 0}</span></div>
          {queue?.flaggedUsers?.length === 0 && <p className="text-xs text-slate-500">No flagged users</p>}
          <div className="space-y-2">
            {queue?.flaggedUsers?.slice(0, 5).map(u => (
              <div key={u.id} className="flex items-center justify-between p-2.5 bg-slate-700/50 rounded-xl">
                <div><p className="text-sm font-medium text-white">{u.name}</p><p className="text-xs text-slate-500">{u.report_count} reports</p></div>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-lg">Review</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4 text-amber-400" /><span className="text-sm font-semibold text-white">Flagged Problems</span><span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{queue?.flaggedProblems?.length || 0}</span></div>
          {queue?.flaggedProblems?.length === 0 && <p className="text-xs text-slate-500">No flagged problems</p>}
          <div className="space-y-2">
            {queue?.flaggedProblems?.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-700/50 rounded-xl">
                <div><p className="text-sm font-medium text-white truncate max-w-[180px]">{p.title}</p><p className="text-xs text-slate-500">{p.report_count} reports</p></div>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-lg">Review</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 text-teal-400" /><span className="text-sm font-semibold text-white">Pending Verifications</span><span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">{queue?.pendingVerifications?.length || 0}</span></div>
          {queue?.pendingVerifications?.length === 0 && <p className="text-xs text-slate-500">No pending verifications</p>}
          <div className="space-y-2">
            {queue?.pendingVerifications?.slice(0, 5).map(u => (
              <div key={u.id} className="flex items-center justify-between p-2.5 bg-slate-700/50 rounded-xl">
                <div><p className="text-sm font-medium text-white">{u.name}</p><p className="text-xs text-slate-500">{u.role}</p></div>
                <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-lg">Verify</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// USERS VIEW
// ==========================================
function UsersView({ token }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('admin/users', token, { page, limit: 50, search, role: roleFilter, verified: verifiedFilter, status: statusFilter });
    setUsers(res.users || []);
    setTotal(res.total || 0);
    setTotalPages(res.totalPages || 1);
    setLoading(false);
  }, [token, page, search, roleFilter, verifiedFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (action, userId, userName) => {
    if (action === 'verify') {
      await api.put(`admin/users/${userId}/verify`, token);
    } else if (action === 'suspend') {
      await api.put(`admin/users/${userId}/suspend`, token);
    } else if (action === 'delete') {
      await api.del(`admin/users/${userId}`, token);
    }
    setConfirm(null);
    load();
  };

  return (
    <div data-testid="admin-users">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white">Users</h1><p className="text-sm text-slate-500">{total} total users</p></div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl">
        <div className="p-4 border-b border-slate-700 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input data-testid="users-search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email, location..." className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <select data-testid="users-role-filter" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="bg-slate-700 border border-slate-600 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">All Roles</option>
            {['Doctor','Engineer','Researcher','Business Operator','Investor','Student'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select data-testid="users-verified-filter" value={verifiedFilter} onChange={e => { setVerifiedFilter(e.target.value); setPage(1); }} className="bg-slate-700 border border-slate-600 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <select data-testid="users-status-filter" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-slate-700 border border-slate-600 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">All Accounts</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><RefreshCw className="h-5 w-5 text-slate-500 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="users-table">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Location</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Joined</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-600/20 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0">{u.name?.[0] || '?'}</div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-slate-300 bg-slate-700 px-2 py-1 rounded-lg">{u.role || '—'}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-slate-400">{[u.city, u.country].filter(Boolean).join(', ') || '—'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {u.verified_status && <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">Verified</span>}
                        {u.is_suspended && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Suspended</span>}
                        {!u.verified_status && !u.is_suspended && <span className="text-xs bg-slate-600/50 text-slate-400 px-2 py-0.5 rounded-full">Unverified</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-slate-500">{formatDate(u.created_at)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button data-testid={`view-user-${u.id}`} onClick={() => setSelectedUser(u)} title="View" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-700 hover:text-blue-400 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                        {!u.verified_status && <button data-testid={`verify-user-${u.id}`} onClick={() => handleAction('verify', u.id, u.name)} title="Verify" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-700 hover:text-teal-400 transition-colors"><CheckCircle className="h-3.5 w-3.5" /></button>}
                        <button data-testid={`suspend-user-${u.id}`} onClick={() => handleAction('suspend', u.id, u.name)} title={u.is_suspended ? 'Unsuspend' : 'Suspend'} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-700 hover:text-amber-400 transition-colors"><Ban className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setConfirm({ action: 'delete', id: u.id, name: u.name })} title="Delete" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-700 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-sm text-slate-500">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 pb-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
      </div>

      <ConfirmModal open={!!confirm} title="Delete User" message={`Are you sure you want to permanently delete ${confirm?.name}? This cannot be undone.`} onConfirm={() => handleAction('delete', confirm.id, confirm.name)} onCancel={() => setConfirm(null)} />

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" data-testid="user-detail-modal">
            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            <h3 className="text-lg font-bold text-white mb-4">{selectedUser.name}</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-slate-500 block text-xs">Email</span><span className="text-white">{selectedUser.email}</span></div>
                <div><span className="text-slate-500 block text-xs">Role</span><span className="text-white">{selectedUser.role || '—'}</span></div>
                <div><span className="text-slate-500 block text-xs">Location</span><span className="text-white">{[selectedUser.city, selectedUser.country].filter(Boolean).join(', ') || '—'}</span></div>
                <div><span className="text-slate-500 block text-xs">Stage</span><span className="text-white">{selectedUser.startup_stage || '—'}</span></div>
                <div><span className="text-slate-500 block text-xs">Commitment</span><span className="text-white">{selectedUser.commitment_level || '—'}</span></div>
                <div><span className="text-slate-500 block text-xs">Joined</span><span className="text-white">{formatDate(selectedUser.created_at)}</span></div>
              </div>
              {selectedUser.bio && <div><span className="text-slate-500 block text-xs mb-1">Bio</span><p className="text-white text-sm">{selectedUser.bio}</p></div>}
              {selectedUser.skills?.length > 0 && <div><span className="text-slate-500 block text-xs mb-1">Skills</span><div className="flex flex-wrap gap-1">{selectedUser.skills.map(s => <span key={s} className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-lg">{s}</span>)}</div></div>}
              {selectedUser.interests?.length > 0 && <div><span className="text-slate-500 block text-xs mb-1">Interests</span><div className="flex flex-wrap gap-1">{selectedUser.interests.map(i => <span key={i} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-lg">{i}</span>)}</div></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// PROBLEMS VIEW
// ==========================================
function ProblemsView({ token }) {
  const [problems, setProblems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('admin/problems', token, { page, limit: 50, search });
    setProblems(res.problems || []);
    setTotal(res.total || 0);
    setTotalPages(res.totalPages || 1);
    setLoading(false);
  }, [token, page, search]);

  useEffect(() => { load(); }, [load]);

  const handleHide = async (id) => { await api.put(`admin/problems/${id}/hide`, token); load(); };
  const handleDelete = async (id) => { await api.del(`admin/problems/${id}`, token); setConfirm(null); load(); };

  return (
    <div data-testid="admin-problems">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white">Problems</h1><p className="text-sm text-slate-500">{total} total problems</p></div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl">
        <div className="p-4 border-b border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input data-testid="problems-search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search problems..." className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><RefreshCw className="h-5 w-5 text-slate-500 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="problems-table">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Creator</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Reports</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Created</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map(p => (
                  <tr key={p.id} className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${p.is_hidden ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{p.title}</p>
                      {p.is_hidden && <span className="text-xs text-amber-400">Hidden</span>}
                      {(p.report_count || 0) >= 3 && <span className="text-xs text-red-400 ml-2">Flagged</span>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-slate-400">{p.creator?.name || '—'}</span></td>
                    <td className="px-4 py-3"><span className={`text-sm font-medium ${(p.report_count || 0) >= 3 ? 'text-red-400' : 'text-slate-400'}`}>{p.report_count || 0}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-slate-500">{formatDate(p.created_at)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleHide(p.id)} title={p.is_hidden ? 'Unhide' : 'Hide'} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-700 hover:text-amber-400 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setConfirm(p)} title="Delete" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-700 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {problems.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-sm text-slate-500">No problems found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 pb-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
      </div>

      <ConfirmModal open={!!confirm} title="Delete Problem" message={`Are you sure you want to delete "${confirm?.title}"?`} onConfirm={() => handleDelete(confirm.id)} onCancel={() => setConfirm(null)} />
    </div>
  );
}

// ==========================================
// PROJECTS VIEW
// ==========================================
function ProjectsView({ token }) {
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('admin/projects', token, { page, limit: 50, search });
    setProjects(res.projects || []);
    setTotal(res.total || 0);
    setTotalPages(res.totalPages || 1);
    setLoading(false);
  }, [token, page, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => { await api.del(`admin/projects/${id}`, token); setConfirm(null); load(); };

  return (
    <div data-testid="admin-projects">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white">Projects</h1><p className="text-sm text-slate-500">{total} total projects</p></div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl">
        <div className="p-4 border-b border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input data-testid="projects-search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search projects..." className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><RefreshCw className="h-5 w-5 text-slate-500 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="projects-table">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Creator</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Team</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Stage</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Created</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3"><p className="text-sm font-medium text-white">{p.name}</p></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-slate-400">{p.creator?.name || '—'}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-slate-400">{p.team_size}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs font-medium text-slate-300 bg-slate-700 px-2 py-1 rounded-lg">{p.stage || '—'}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-slate-500">{formatDate(p.created_at)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setConfirm(p)} title="Delete" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-700 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-sm text-slate-500">No projects found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 pb-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
      </div>

      <ConfirmModal open={!!confirm} title="Delete Project" message={`Are you sure you want to delete "${confirm?.name}"?`} onConfirm={() => handleDelete(confirm.id)} onCancel={() => setConfirm(null)} />
    </div>
  );
}

// ==========================================
// VERIFICATIONS VIEW
// ==========================================
function VerificationsView({ token }) {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('admin/verifications', token);
    setVerifications(res.verifications || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => { await api.put(`admin/verifications/${id}/approve`, token); load(); };
  const handleReject = async (id) => { await api.put(`admin/verifications/${id}/reject`, token); load(); };

  return (
    <div data-testid="admin-verifications">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white">Verification Requests</h1><p className="text-sm text-slate-500">{verifications.length} pending</p></div>
        <button onClick={load} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><RefreshCw className="h-4 w-4" /></button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><RefreshCw className="h-5 w-5 text-slate-500 animate-spin" /></div>
      ) : verifications.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
          <ShieldCheck className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">No pending verification requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {verifications.map(u => (
            <div key={u.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between" data-testid={`verification-${u.id}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">{u.name?.[0]}</div>
                <div>
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.role} &middot; {u.verification_type || 'Identity'} &middot; Submitted {formatDate(u.verification_requested_at)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button data-testid={`approve-verification-${u.id}`} onClick={() => handleApprove(u.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-xl transition-colors"><CheckCircle className="h-3.5 w-3.5" />Approve</button>
                <button data-testid={`reject-verification-${u.id}`} onClick={() => handleReject(u.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors"><XCircle className="h-3.5 w-3.5" />Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// REPORTS VIEW
// ==========================================
function ReportsView({ token }) {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('admin/reports', token, { page, limit: 50 });
    setReports(res.reports || []);
    setTotal(res.total || 0);
    setTotalPages(res.totalPages || 1);
    setLoading(false);
  }, [token, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div data-testid="admin-reports">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white">Reports</h1><p className="text-sm text-slate-500">{total} total reports</p></div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-16"><RefreshCw className="h-5 w-5 text-slate-500 animate-spin" /></div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center"><Flag className="h-10 w-10 text-slate-600 mx-auto mb-3" /><p className="text-slate-500">No reports yet</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="reports-table">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Reporter</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Target</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Reason</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3"><span className="text-sm text-white">{r.reporter?.name || '—'}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-lg ${r.target_type === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{r.target_type}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-slate-400 font-mono">{r.target_id?.slice(0, 8)}...</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-slate-400 max-w-[200px] truncate block">{r.reason}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-slate-500">{formatDate(r.created_at)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 pb-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
      </div>
    </div>
  );
}

// ==========================================
// ACTIVITY LOGS VIEW
// ==========================================
function ActivityLogsView({ token }) {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('admin/activity-logs', token, { page, limit: 50 });
    setLogs(res.logs || []);
    setTotal(res.total || 0);
    setTotalPages(res.totalPages || 1);
    setLoading(false);
  }, [token, page]);

  useEffect(() => { load(); }, [load]);

  const getActionIcon = (action) => {
    if (action?.includes('verified') || action?.includes('approved')) return <CheckCircle className="h-4 w-4 text-teal-400" />;
    if (action?.includes('suspended')) return <Ban className="h-4 w-4 text-amber-400" />;
    if (action?.includes('deleted')) return <Trash2 className="h-4 w-4 text-red-400" />;
    if (action?.includes('rejected')) return <XCircle className="h-4 w-4 text-red-400" />;
    if (action?.includes('hid')) return <Eye className="h-4 w-4 text-amber-400" />;
    return <Activity className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div data-testid="admin-activity-logs">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white">Activity Logs</h1><p className="text-sm text-slate-500">{total} total actions</p></div>
        <button onClick={load} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><RefreshCw className="h-4 w-4" /></button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-16"><RefreshCw className="h-5 w-5 text-slate-500 animate-spin" /></div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center"><Activity className="h-10 w-10 text-slate-600 mx-auto mb-3" /><p className="text-slate-500">No activity yet</p></div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {logs.map(l => (
              <div key={l.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-700/20 transition-colors" data-testid={`activity-log-${l.id}`}>
                <div className="mt-0.5">{getActionIcon(l.action)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{l.details}</p>
                  <p className="text-xs text-slate-500 mt-0.5">by {l.admin?.name || 'Unknown'} &middot; {formatDate(l.created_at)} {formatTime(l.created_at)}</p>
                </div>
                <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded-lg shrink-0">{l.action?.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        )}
        <div className="px-4 pb-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN ADMIN APP
// ==========================================
export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (savedToken) {
      api.get('auth/me', savedToken).then(res => {
        if (res.user?.is_admin) { setToken(savedToken); setUser(res.user); }
        else localStorage.removeItem('admin_token');
      }).catch(() => localStorage.removeItem('admin_token'));
    }
  }, []);

  const handleLogin = (t, u) => {
    setToken(t); setUser(u);
    localStorage.setItem('admin_token', t);
  };

  const handleLogout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('admin_token');
  };

  if (!token) return <AdminLogin onLogin={handleLogin} />;

  const views = {
    dashboard: <DashboardView token={token} />,
    users: <UsersView token={token} />,
    problems: <ProblemsView token={token} />,
    projects: <ProjectsView token={token} />,
    verifications: <VerificationsView token={token} />,
    reports: <ReportsView token={token} />,
    activity: <ActivityLogsView token={token} />,
  };

  return (
    <div className="flex min-h-screen bg-slate-950" data-testid="admin-panel">
      <Sidebar active={activeView} setActive={setActiveView} user={user} onLogout={handleLogout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 p-3 flex items-center gap-3">
          <button data-testid="admin-mobile-menu" onClick={() => setMobileOpen(true)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800"><Menu className="h-5 w-5" /></button>
          <span className="text-sm font-semibold text-white">Admin Panel</span>
        </div>
        <div className="p-4 lg:p-8">
          {views[activeView]}
        </div>
      </main>
    </div>
  );
}
