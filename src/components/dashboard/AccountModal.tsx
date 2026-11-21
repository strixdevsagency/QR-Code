import React, { useState } from 'react';
import {
  X,
  UserCheck,
  KeyRound,
  Mail,
  Shield,
  Sparkles,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Link as LinkIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../ui/UserAvatar';
import { playTactileClick } from '../../utils/audioFeedback';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onLogout }) => {
  const { user, isAdmin, updateProfile, updatePassword, resetPassword, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    playTactileClick();
    setStatusMsg(null);
    setLoading(true);
    try {
      const res = await updateProfile({ name: name.trim(), avatarUrl: avatarUrl.trim() });
      setStatusMsg(res.success ? { type: 'success', text: 'Account updated successfully.' } : { type: 'error', text: res.error || 'Failed to update.' });
    } catch {
      setStatusMsg({ type: 'error', text: 'Error saving profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    playTactileClick();
    setStatusMsg(null);
    if (newPassword.length < 6) return setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    if (newPassword !== confirmPassword) return setStatusMsg({ type: 'error', text: 'Passwords do not match.' });

    setLoading(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setNewPassword('');
        setConfirmPassword('');
        setStatusMsg({ type: 'success', text: 'Password updated successfully.' });
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to update password.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Authentication error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    playTactileClick();
    setStatusMsg(null);
    setLoading(true);
    try {
      const res = await resetPassword(user.email);
      setStatusMsg(res.success ? { type: 'success', text: `Reset email sent to ${user.email}.` } : { type: 'error', text: res.error || 'Failed to send.' });
    } catch {
      setStatusMsg({ type: 'error', text: 'Could not send reset email.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    playTactileClick();
    logout();
    onClose();
    onLogout?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-900 border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Account Settings & Security</h3>
              <p className="text-[11px] text-zinc-400">Manage identity, avatar, and credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.08] bg-zinc-950/40 px-5 pt-2 gap-4">
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setStatusMsg(null); }}
            className={`pb-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile' ? 'border-[#38bdf8] text-[#38bdf8]' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Profile Information
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('security'); setStatusMsg(null); }}
            className={`pb-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'security' ? 'border-[#38bdf8] text-[#38bdf8]' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Reset Password
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {statusMsg && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
              statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="p-3 rounded-xl bg-zinc-950 border border-white/[0.08] flex items-center gap-4">
                <UserAvatar avatarUrl={avatarUrl} name={name || user.name} size="xl" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3 text-[#38bdf8]" />
                    <span>Avatar Image URL</span>
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#38bdf8]"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1 truncate">Direct URL (.png, .jpg, .svg) or Google profile avatar</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/50 border border-white/[0.06] text-xs text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Authority Role</span>
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1 mt-0.5">
                    <Shield className="w-3 h-3 text-[#38bdf8]" />
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Subscription</span>
                  <span className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    {user.tier || 'Free'}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Set New Password</span>
                </h4>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#38bdf8] pr-9"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-zinc-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#38bdf8]"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>

              <div className="pt-2 border-t border-white/[0.08] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Reset via Email</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Send a password recovery link to <strong>{user.email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={loading}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-[#38bdf8] bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 transition cursor-pointer disabled:opacity-50"
                >
                  Send Reset Link to Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-zinc-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition cursor-pointer border border-white/[0.06]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
