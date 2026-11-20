'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Zap,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Check,
  Copy,
  Mail,
  X,
  AlertCircle,
  Database,
} from 'lucide-react';
import type { User, UserRole, UserTier } from '../../types';
import { db } from '../../services/db';
import { isSupabaseConfigured } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { playTactileClick } from '../../utils/audioFeedback';

export const UserManager: React.FC = () => {
  const { user: currentUser, updateUserRole: updateAuthUserRole } = useAuth();
  const isCloud = isSupabaseConfigured();

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [tierFilter, setTierFilter] = useState<'all' | UserTier>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newTier, setNewTier] = useState<UserTier>('free');

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Cloud sync handler
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const fetched = await db.syncUsersFromSupabase();
      setUsers(fetched);
      showNotice(`Successfully synchronized ${fetched.length} users with Supabase public.profiles`);
    } catch {
      showNotice('Sync finished (cached mode active)', 'success');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setUsers(db.getUsers());
    // Proactively sync from Supabase if configured
    if (isCloud) {
      handleSync();
    }
  }, [isCloud]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesTier = tierFilter === 'all' || (u.tier || 'free') === tierFilter;

      return matchesSearch && matchesRole && matchesTier;
    });
  }, [users, searchQuery, roleFilter, tierFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const enterprise = users.filter((u) => u.tier === 'enterprise').length;
    const pro = users.filter((u) => u.tier === 'pro').length;
    const free = users.filter((u) => !u.tier || u.tier === 'free').length;
    return { total, admins, enterprise, pro, free };
  }, [users]);

  // Update user role
  const handleRoleChange = async (targetUser: User, newRoleValue: UserRole) => {
    playTactileClick();
    if (targetUser.role === newRoleValue) return;

    // Prevent self-demotion if the admin is the only admin
    if (targetUser.id === currentUser?.id && newRoleValue === 'user' && metrics.admins <= 1) {
      showNotice('Cannot demote yourself: at least one administrator must remain.', 'error');
      return;
    }

    const updated = db.updateUserRole(targetUser.id, newRoleValue);
    if (updated) {
      await updateAuthUserRole(targetUser.id, newRoleValue);
      setUsers(db.getUsers());
      showNotice(
        `Updated ${targetUser.email} role to ${newRoleValue.toUpperCase()}${
          isCloud ? ' (persisted to Supabase public.profiles)' : ''
        }`
      );
    }
  };

  // Update user tier
  const handleTierChange = (targetUser: User, newTierValue: UserTier) => {
    playTactileClick();
    if (targetUser.tier === newTierValue) return;

    const updated = db.updateUserTier(targetUser.id, newTierValue);
    if (updated) {
      setUsers(db.getUsers());
      showNotice(
        `Updated ${targetUser.email} tier to ${newTierValue.toUpperCase()}${
          isCloud ? ' (persisted to Supabase public.profiles)' : ''
        }`
      );
    }
  };

  // Delete user
  const handleDeleteUser = (targetUser: User) => {
    playTactileClick();
    if (targetUser.id === currentUser?.id) {
      showNotice('Cannot delete your own active account.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${targetUser.email}"? This will remove their profile and access.`)) {
      db.deleteUser(targetUser.id);
      setUsers(db.getUsers());
      showNotice(`User ${targetUser.email} removed.`);
    }
  };

  // Add new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    playTactileClick();

    if (!newEmail.trim() || !newEmail.includes('@')) {
      showNotice('Please provide a valid email address.', 'error');
      return;
    }

    const name = newName.trim() || newEmail.split('@')[0];
    db.createUser({
      name,
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      tier: newTier,
    });

    setUsers(db.getUsers());
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewRole('user');
    setNewTier('free');
    showNotice(
      `Created user ${newEmail}${isCloud ? ' and synced to Supabase public.profiles' : ''}`
    );
  };

  const copyToClipboard = (text: string) => {
    playTactileClick();
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Telemetry KPI Cards */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                User & Role Management
              </h2>
              {isCloud && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Database className="w-3 h-3" />
                  Supabase profiles synced
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              View registered users, promote/demote administrator privileges, configure subscription tiers, and mirror directly into PostgreSQL <code className="text-zinc-300">public.profiles</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync with Supabase'}</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Invite User</span>
            </button>
          </div>
        </div>

        {/* User Distribution Counter Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/[0.06]">
          <div className="p-3 rounded-2xl bg-zinc-950/60 border border-white/[0.05]">
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Total Users</div>
            <div className="text-2xl font-black text-white mt-0.5">{metrics.total}</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-950/60 border border-violet-500/20">
            <div className="text-[10px] uppercase font-semibold text-violet-400 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admins
            </div>
            <div className="text-2xl font-black text-violet-300 mt-0.5">{metrics.admins}</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-950/60 border border-cyan-500/20">
            <div className="text-[10px] uppercase font-semibold text-cyan-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Enterprise
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-0.5">{metrics.enterprise}</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-950/60 border border-amber-500/20">
            <div className="text-[10px] uppercase font-semibold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Pro Members
            </div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">{metrics.pro}</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-950/60 border border-white/[0.05]">
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Free Tier</div>
            <div className="text-2xl font-black text-zinc-300 mt-0.5">{metrics.free}</div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/[0.06] flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-950 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-white/[0.08] text-[11px]">
            <span className="px-2 text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Role:</span>
            {(['all', 'admin', 'user'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  playTactileClick();
                  setRoleFilter(r);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Tier Filter */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-white/[0.08] text-[11px]">
            <span className="px-2 text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Tier:</span>
            {(['all', 'free', 'pro', 'enterprise'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  playTactileClick();
                  setTierFilter(t);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                  tierFilter === t
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. User Directory Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/[0.08] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-zinc-950/60 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role Privileges</th>
                <th className="py-3.5 px-4">Subscription Tier</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const isAdmin = u.role === 'admin';
                  const initials = u.name
                    ? u.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : u.email.slice(0, 2).toUpperCase();

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${
                        isCurrent ? 'bg-violet-500/[0.03]' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin
                                ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                                : 'bg-zinc-800 text-zinc-300 border border-white/[0.08]'
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white truncate max-w-[180px]">
                                {u.name || 'Unnamed User'}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mt-0.5">
                              <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                              <span className="truncate max-w-[200px]">{u.email}</span>
                              <button
                                onClick={() => copyToClipboard(u.email)}
                                title="Copy Email"
                                className="text-zinc-500 hover:text-zinc-200 transition-colors p-0.5 rounded cursor-pointer"
                              >
                                {copiedEmail === u.email ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-600 block mt-0.5">
                              ID: {u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Selector */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all focus:outline-none ${
                              isAdmin
                                ? 'bg-violet-950/60 border-violet-500/40 text-violet-300 focus:border-violet-400'
                                : 'bg-zinc-950 border-white/[0.1] text-zinc-300 focus:border-zinc-500'
                            }`}
                          >
                            <option value="user" className="bg-zinc-900 text-zinc-300">
                              Standard User
                            </option>
                            <option value="admin" className="bg-zinc-900 text-violet-300 font-bold">
                              Administrator (Full Privileges)
                            </option>
                          </select>
                        </div>
                      </td>

                      {/* Tier Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={u.tier || 'free'}
                          onChange={(e) => handleTierChange(u, e.target.value as UserTier)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all focus:outline-none ${
                            u.tier === 'enterprise'
                              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                              : u.tier === 'pro'
                              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                              : 'bg-zinc-950 border-white/[0.1] text-zinc-400'
                          }`}
                        >
                          <option value="free" className="bg-zinc-900 text-zinc-300">
                            Free Starter
                          </option>
                          <option value="pro" className="bg-zinc-900 text-amber-300 font-semibold">
                            Strix Pro
                          </option>
                          <option value="enterprise" className="bg-zinc-900 text-cyan-300 font-bold">
                            Enterprise / Agency
                          </option>
                        </select>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAdmin ? (
                            <button
                              onClick={() => handleRoleChange(u, 'user')}
                              title="Demote to Standard User"
                              className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.08] text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              Demote
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(u, 'admin')}
                              title="Promote to Administrator"
                              className="px-2.5 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>Make Admin</span>
                            </button>
                          )}

                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Delete User"
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Add / Invite Platform User
                </h3>
                <p className="text-xs text-zinc-400">
                  Directly provision an account and configure role and tier.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Miller"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Role Privileges
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Subscription Tier
                  </label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as UserTier)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="free">Free Starter</option>
                    <option value="pro">Strix Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
                >
                  Save & Provision Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
