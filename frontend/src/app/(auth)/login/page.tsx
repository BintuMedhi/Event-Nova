'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Mail, Lock, LogIn, ArrowLeft, Loader2, Calendar } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { login, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role: string) => {
    if (role === 'organizer') {
      router.push('/organizer/dashboard');
    } else if (role === 'affiliate') {
      router.push('/affiliate/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Auth context will update user and trigger the useEffect redirection
    } else {
      setErrorMsg(result.message || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent-purple/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent-pink/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-purple mb-6 transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Back to home
        </Link>

        <div className="glass-panel p-8 border border-border-color rounded-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex bg-gradient-to-tr from-accent-purple to-accent-pink p-2.5 rounded-2xl text-white-actual mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Welcome Back</h2>
            <p className="text-text-muted text-xs mt-1.5">Sign in to your EventNova dashboard</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-accent-pink/10 border border-accent-pink/20 text-xs text-accent-pink font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-bg-secondary border border-border-color focus-within:border-accent-purple/50 transition-colors">
                <Mail className="w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-text-muted/40 text-text-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-bg-secondary border border-border-color focus-within:border-accent-purple/50 transition-colors">
                <Lock className="w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-text-muted/40 text-text-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 disabled:opacity-50 text-white-actual py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" /> Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-text-muted">
            Don't have an account?{' '}
            <Link href="/register" className="text-accent-purple hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
