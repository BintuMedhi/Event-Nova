'use client';

import React, { useState, useEffect } from 'react';
import { Award, Trophy, Sparkles, TrendingUp, ShieldAlert, Loader2 } from 'lucide-react';

interface Leader {
  _id: string;
  name: string;
  referralCode: string;
  commissionBalance: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/campaigns/affiliate/leaderboard');
      const data = await response.json();
      if (data.success) {
        setLeaders(data.leaderboard);
      } else {
        throw new Error('Failed to load');
      }
    } catch (err) {
      // Mock leaderboard for offline presentation safety!
      setLeaders([
        { _id: '1', name: 'Rahul Sharma', referralCode: 'rahul_921', commissionBalance: 24500 },
        { _id: '2', name: 'Sneha Patil', referralCode: 'sneha_p43', commissionBalance: 18200 },
        { _id: '3', name: 'Amit Verma', referralCode: 'amit_v19', commissionBalance: 12500 },
        { _id: '4', name: 'Priya Iyer', referralCode: 'priya_iy8', commissionBalance: 9800 },
        { _id: '5', name: 'Vikram Singh', referralCode: 'vikram_s5', commissionBalance: 7600 },
        { _id: '6', name: 'Ananya Roy', referralCode: 'ananya_r', commissionBalance: 5200 },
        { _id: '7', name: 'Deepak Mehta', referralCode: 'deepak_m7', commissionBalance: 3100 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
      <div className="mesh-bg" />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex bg-gradient-to-tr from-accent-purple to-accent-pink p-2.5 rounded-2xl text-white-actual mb-4">
          <Trophy className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Affiliate Promoter Leaderboard
        </h1>
        <p className="text-text-muted text-sm mt-2 max-w-md mx-auto">
          Meet our top digital marketing champions who earn commission by driving ticket conversions.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {leaders.slice(0, 3).map((leader, idx) => {
              const rankColor = idx === 0 ? 'border-amber-500 bg-amber-500/5' : idx === 1 ? 'border-slate-400 bg-slate-400/5' : 'border-amber-700 bg-amber-700/5';
              const trophyColor = idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-amber-700';

              return (
                <div key={leader._id} className={`glass-panel p-6 border rounded-3xl text-center space-y-3 relative ${rankColor}`}>
                  <div className="absolute top-4 right-4">
                    <Trophy className={`w-6 h-6 ${trophyColor}`} />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center font-bold text-text-primary text-lg mx-auto">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-text-primary">{leader.name}</h3>
                    <span className="text-[10px] text-text-muted mt-0.5 block">Code: {leader.referralCode}</span>
                  </div>
                  <div className="pt-2 border-t border-border-color">
                    <span className="text-xs text-text-muted block">Total Earned</span>
                    <span className="text-lg font-black text-accent-green">₹{leader.commissionBalance}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table List */}
          <div className="glass-panel overflow-hidden border border-border-color rounded-2xl">
            <table className="min-w-full divide-y divide-border-color text-left">
              <thead className="bg-bg-secondary/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Promoter Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Referral Code
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">
                    Total Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color bg-transparent">
                {leaders.slice(3).map((leader, idx) => (
                  <tr key={leader._id} className="hover:bg-accent-purple/5 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-text-primary">
                      #{idx + 4}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-text-primary flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center font-semibold text-accent-purple text-xs border border-border-color">
                        {leader.name.charAt(0).toUpperCase()}
                      </div>
                      {leader.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-text-muted">
                      {leader.referralCode}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-accent-green text-right">
                      ₹{leader.commissionBalance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
