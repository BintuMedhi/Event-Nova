'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Mail, Lock, User as UserIcon, LogIn, ArrowLeft, Loader2, Calendar, Award, ShieldAlert } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'organizer' | 'affiliate'>('user');
  const [referredByCode, setReferredByCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill referral code from URL search param if present! (e.g. ?ref=rahul123)
  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) {
      setReferredByCode(ref);
    }
  }, [searchParams]);

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

    const result = await register(name, email, password, role, referredByCode);
    setLoading(false);

    if (result.success) {
      // Auth context will update user and trigger the useEffect redirection
    } else {
      setErrorMsg(result.message || 'Registration failed. Try again.');
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
          <div className="text-center mb-6">
            <div className="inline-flex bg-gradient-to-tr from-accent-purple to-accent-pink p-2.5 rounded-2xl text-white-actual mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Create Account</h2>
            <p className="text-text-muted text-xs mt-1.5">Join EventNova platform today</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-accent-pink/10 border border-accent-pink/20 text-xs text-accent-pink font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
                I want to join as a
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'user'
                      ? 'bg-accent-purple/10 border-accent-purple text-accent-purple shadow-[0_0_12px_rgba(108,99,255,0.2)] font-bold'
                      : 'bg-bg-secondary border-border-color text-text-muted hover:text-accent-purple'
                  }`}
                >
                  Normal User
                </button>
                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'organizer'
                      ? 'bg-accent-purple/10 border-accent-purple text-accent-purple shadow-[0_0_12px_rgba(108,99,255,0.2)] font-bold'
                      : 'bg-bg-secondary border-border-color text-text-muted hover:text-accent-purple'
                  }`}
                >
                  Organizer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('affiliate')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'affiliate'
                      ? 'bg-accent-purple/10 border-accent-purple text-accent-purple shadow-[0_0_12px_rgba(108,99,255,0.2)] font-bold'
                      : 'bg-bg-secondary border-border-color text-text-muted hover:text-accent-purple'
                  }`}
                >
                  Promoter
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-border-color focus-within:border-accent-purple/50 transition-colors">
                <UserIcon className="w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-text-muted/40 text-text-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-border-color focus-within:border-accent-purple/50 transition-colors">
                <Mail className="w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@gmail.com"
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-text-muted/40 text-text-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-border-color focus-within:border-accent-purple/50 transition-colors">
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

            <div>
              <label htmlFor="referral" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide flex items-center gap-1">
                Referral Code <span className="text-[10px] text-text-muted font-normal lowercase">(optional)</span>
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-border-color focus-within:border-accent-purple/50 transition-colors">
                <Award className="w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  id="referral"
                  value={referredByCode}
                  onChange={(e) => setReferredByCode(e.target.value)}
                  placeholder="Enter promoter code"
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
                  <Loader2 className="w-4.5 h-4.5 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" /> Sign Up
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-purple hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent-purple w-8 h-8" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
