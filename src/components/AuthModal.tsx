import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle, Key, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { playVictoryFanfare, playTactileClick } from '../utils/audioFeedback';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'key' | 'forgot' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, loginWithOAuth, activateLicenseKey, resetPassword, updatePassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'key' | 'forgot' | 'reset'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [keySuccess, setKeySuccess] = useState(false);
  const [keySuccessMsg, setKeySuccessMsg] = useState<string | null>(null);
  const [resetSentEmail, setResetSentEmail] = useState<string | null>(null);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setErrorMsg(null);
      setKeySuccess(false);
      setKeySuccessMsg(null);
      setResetSentEmail(null);
      setPasswordUpdated(false);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Mode: Key Activation
    if (mode === 'key') {
      if (!licenseKey.trim()) {
        setErrorMsg('Please enter your license key.');
        return;
      }
      const res = activateLicenseKey(licenseKey.trim());
      if (res.success) {
        playVictoryFanfare();
        const durationText = res.durationDays && res.durationDays > 0
          ? `${res.durationDays} Days Session Active (${res.tier?.toUpperCase()} Tier)`
          : 'Permanent Lifetime Access Active';
        setKeySuccessMsg(durationText);
        setKeySuccess(true);
        setTimeout(() => {
          onClose();
          setKeySuccess(false);
          setKeySuccessMsg(null);
          setLicenseKey('');
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Invalid license key.');
      }
      return;
    }

    // Mode: Forgot Password
    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      setLoading(true);
      try {
        const res = await resetPassword(email);
        if (res.success) {
          setResetSentEmail(email);
        } else {
          setErrorMsg(res.error || 'Failed to send recovery email. Please check the address.');
        }
      } catch {
        setErrorMsg('Unable to reach auth server. Please check your network.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mode: Reset New Password
    if (mode === 'reset') {
      if (!password || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      setLoading(true);
      try {
        const res = await updatePassword(password);
        if (res.success) {
          setPasswordUpdated(true);
          setTimeout(() => {
            setMode('login');
            setPasswordUpdated(false);
          }, 1500);
        } else {
          setErrorMsg(res.error || 'Failed to update password.');
        }
      } catch {
        setErrorMsg('Unable to update password. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mode: Login / Register
    if (!email) return;
    setLoading(true);

    try {
      const res = mode === 'login'
        ? await login(email, password)
        : await register(name || email.split('@')[0], email, password);

      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMsg('Unexpected network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' = 'google') => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await loginWithOAuth(provider);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border border-white/[0.1] rounded-2xl p-6 sm:p-7 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                {mode === 'key'
                  ? 'Activate Pro with License Key'
                  : mode === 'forgot'
                  ? 'Reset Your Password'
                  : mode === 'reset'
                  ? 'Set New Password'
                  : mode === 'login'
                  ? 'Sign in to Strix QR'
                  : 'Create Strix QR Account'}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 font-medium">
                {mode === 'key' ? <Key className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                {mode === 'key' ? 'Zero Login' : 'Secure ID'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {mode === 'key'
                ? 'Enter the license key received via invoice or email to unlock Pro.'
                : mode === 'forgot'
                ? 'Enter your registered email and we will send you a password recovery link.'
                : mode === 'reset'
                ? 'Choose a secure new password for your account.'
                : 'Save your generated QR codes and re-download print formats anytime.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer text-sm font-semibold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-pop-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert for Key */}
        {keySuccess && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-pop-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <div className="font-bold text-emerald-200">License Activated Successfully!</div>
              <div className="text-[11px] text-emerald-300/80">{keySuccessMsg || 'Pro Studio unlocked. Session active.'}</div>
            </div>
          </div>
        )}

        {/* Success Alert for Password Reset Email */}
        {resetSentEmail && (
          <div className="mb-4 p-4 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex flex-col gap-2 text-xs text-zinc-200 animate-pop-in">
            <div className="flex items-center gap-2 text-[#38bdf8] font-bold">
              <Mail className="w-4 h-4" />
              <span>Password Recovery Email Sent</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              We sent a password reset link to <strong className="text-white">{resetSentEmail}</strong>. Follow the link in your email to reset your credentials.
            </p>
            <button
              type="button"
              onClick={() => {
                setResetSentEmail(null);
                setMode('login');
              }}
              className="mt-1 text-left text-[11px] text-[#38bdf8] hover:underline cursor-pointer font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </button>
          </div>
        )}

        {/* Success Alert for Password Updated */}
        {passwordUpdated && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-pop-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>Password updated successfully! Redirecting to login...</span>
          </div>
        )}

        {/* Google OAuth (only for login & register) */}
        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="mb-4">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-white/[0.08] text-xs font-semibold text-white transition cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <span className="relative px-2 bg-zinc-900 text-[11px] text-zinc-500 uppercase tracking-wider">
                Or continue with email
              </span>
            </div>
          </>
        )}

        {!resetSentEmail && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'key' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Pro Activation Key / Voucher
                </label>
                <input
                  type="text"
                  required
                  placeholder="STRIX-PRO-VIP"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-white text-xs font-mono tracking-wider focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 transition uppercase"
                />
                <span className="text-[11px] text-zinc-500 block mt-1">
                  Enter key to immediately activate Pro studio on this device without account creation.
                </span>
              </div>
            ) : mode === 'forgot' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Account Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 transition"
                />
                <span className="text-[11px] text-zinc-500 block mt-1">
                  We will email you a secure link to reset your account password.
                </span>
              </div>
            ) : mode === 'reset' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 transition"
                />
              </div>
            ) : (
              <>
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-300">
                      Password <span className="text-zinc-500 text-[10px]">(Optional for local mode)</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setErrorMsg(null);
                          setMode('forgot');
                        }}
                        className="text-[11px] text-[#38bdf8] hover:underline cursor-pointer font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 transition"
                  />
                </div>
              </>
            )}

            <Button type="submit" variant="primary" fullWidth size="md" disabled={loading} className="font-bold">
              {loading
                ? 'Processing...'
                : mode === 'key'
                ? 'Activate Pro Studio'
                : mode === 'forgot'
                ? 'Send Password Reset Link'
                : mode === 'reset'
                ? 'Update Password'
                : mode === 'login'
                ? 'Sign In to Account'
                : 'Create Free Account'}
            </Button>

            <div className="pt-2 text-center text-xs text-zinc-400 space-y-1.5">
              {mode === 'forgot' || mode === 'reset' ? (
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setErrorMsg(null);
                    setMode('login');
                  }}
                  className="text-[#38bdf8] font-semibold hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </button>
              ) : mode === 'key' ? (
                <p>
                  Want to sign in with account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setErrorMsg(null);
                      setMode('login');
                    }}
                    className="text-[#38bdf8] font-semibold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              ) : mode === 'login' ? (
                <>
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setErrorMsg(null);
                        setMode('register');
                      }}
                      className="text-white font-medium hover:underline cursor-pointer"
                    >
                      Create one free
                    </button>
                  </p>
                  <p>
                    Have a Pro License Key?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setErrorMsg(null);
                        setMode('key');
                      }}
                      className="text-[#38bdf8] font-semibold hover:underline cursor-pointer"
                    >
                      Redeem Code
                    </button>
                  </p>
                </>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setErrorMsg(null);
                      setMode('login');
                    }}
                    className="text-white font-medium hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
