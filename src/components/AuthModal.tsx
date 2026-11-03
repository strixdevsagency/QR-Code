import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name || email.split('@')[0], email, password);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (role: 'admin' | 'user') => {
    loginAsDemo(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {mode === 'login' ? 'Sign in to Strix QR' : 'Create Strix QR Account'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Save your generated QR codes and re-download print formats anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer text-sm font-semibold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* 1-Click Evaluation Demo Logins */}
        <div className="mb-5 p-3 rounded-xl bg-[#090d16] border border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2 text-center">
            One-Click Test Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs hover:border-slate-500 transition text-center cursor-pointer"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemo('user')}
              className="py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs hover:border-slate-500 transition text-center cursor-pointer"
            >
              User Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Vance"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <Button type="submit" variant="primary" fullWidth size="md" disabled={loading}>
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Account' : 'Create Free Account'}
          </Button>

          <div className="pt-2 text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Create one free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
