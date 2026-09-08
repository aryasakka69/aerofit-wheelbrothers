'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Bike, 
  Trash2, 
  Calendar, 
  Zap, 
  ArrowRight, 
  Clock, 
  Award, 
  Layers, 
  Activity,
  Plus
} from 'lucide-react';
import { getSavedCalculations, deleteCalculationRecord, SavedCalculationRecord, getUserBikes } from '@/lib/storage';
import { UserBikeProfile } from '@/lib/types/bike';

export default function DashboardPage() {
  const [history, setHistory] = useState<SavedCalculationRecord[]>([]);
  const [userBikes, setUserBikes] = useState<UserBikeProfile[]>([]);
  const [filterBike, setFilterBike] = useState<string>('ALL');

  const loadData = () => {
    setHistory(getSavedCalculations());
    setUserBikes(getUserBikes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Hapus riwayat kalkulasi ini?')) {
      deleteCalculationRecord(id);
      loadData();
    }
  };

  // Filter history
  const filteredHistory = useMemo(() => {
    if (filterBike === 'ALL') return history;
    return history.filter(h => h.bikeName === filterBike);
  }, [history, filterBike]);

  // Statistics
  const stats = useMemo(() => {
    if (filteredHistory.length === 0) {
      return { bestCda: 0, avgCda: 0, totalRides: 0, avgWatts: 0 };
    }
    const cdas = filteredHistory.map(h => h.result.cda);
    const powers = filteredHistory.map(h => h.result.powerWatts);
    const best = Math.min(...cdas);
    const avg = cdas.reduce((a, b) => a + b, 0) / cdas.length;
    const avgP = powers.reduce((a, b) => a + b, 0) / powers.length;

    return {
      bestCda: Number(best.toFixed(4)),
      avgCda: Number(avg.toFixed(4)),
      totalRides: filteredHistory.length,
      avgWatts: Math.round(avgP)
    };
  }, [filteredHistory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Dashboard & Analitik
            </span>
            <span className="text-xs text-slate-400">Riwayat CdA & Tren Progres Aerodinamika</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Dashboard Progres Rider
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Pantau evolusi hambatan aerodinamika dari waktu ke waktu dan bandingkan efisiensi antar sepeda di garasi Anda.
          </p>
        </div>

        <Link
          href="/calculator"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Kalkulasi Ride Baru
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-2">
            <Award className="w-4 h-4" />
            <span>CdA Terbaik (Paling Aero)</span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {stats.bestCda > 0 ? stats.bestCda.toFixed(4) : '—'} <span className="text-xs text-slate-400 font-sans">m²</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Hambatan terendah tercatat</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-2">
            <Activity className="w-4 h-4" />
            <span>Rata-rata CdA</span>
          </div>
          <div className="text-3xl font-black text-teal-300 font-mono">
            {stats.avgCda > 0 ? stats.avgCda.toFixed(4) : '—'} <span className="text-xs text-slate-400 font-sans">m²</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Rata-rata keseluruhan sesi</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
            <Zap className="w-4 h-4" />
            <span>Rata-rata Daya (Power)</span>
          </div>
          <div className="text-3xl font-black text-indigo-300 font-mono">
            {stats.avgWatts > 0 ? stats.avgWatts : '—'} <span className="text-xs text-slate-400 font-sans">Watt</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Output rider di segmen uji</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-2">
            <Bike className="w-4 h-4" />
            <span>Total Sesi Tersimpan</span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {stats.totalRides} <span className="text-xs text-slate-400 font-sans">sesi</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tercatat di garasi AeroFit</span>
        </div>
      </div>

      {/* History Table & Filter */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-base text-white">Log & Riwayat Kalkulasi</h3>
            <p className="text-xs text-slate-400">Seluruh data riwayat terhubung dengan sepeda yang dipakai.</p>
          </div>

          {/* Filter by Bike */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Sepeda:</span>
            <select
              value={filterBike}
              onChange={(e) => setFilterBike(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Semua Sepeda ({history.length})</option>
              {userBikes.map(b => (
                <option key={b.id} value={b.customName}>{b.customName}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-white">Belum Ada Riwayat Sesi</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Jalankan kalkulasi manual di Modul 2 atau import file ride untuk mulai melacak riwayat tren aerodinamika Anda.
            </p>
            <Link
              href="/calculator"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
            >
              Mulai Kalkulasi Sekarang &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Tanggal & Waktu</th>
                  <th className="py-2.5 px-3">Sepeda Digunakan</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Kecepatan</th>
                  <th className="py-2.5 px-3">Power</th>
                  <th className="py-2.5 px-3">Nilai CdA</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredHistory.map((item) => {
                  const dateStr = new Date(item.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] text-slate-300">
                      <td className="py-3 px-3 whitespace-nowrap text-slate-400">
                        {dateStr}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {item.bikeName}
                        <span className="block text-[10px] text-cyan-400 font-normal">
                          {item.bikeCategory.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.source === 'FILE_IMPORT'
                            ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}>
                          {item.source === 'FILE_IMPORT' ? 'File Import' : 'Manual'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {item.result.speedKmh} km/h
                      </td>
                      <td className="py-3 px-3 font-mono text-indigo-300">
                        {item.result.powerWatts} W
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-extrabold text-sm text-cyan-300">
                          {item.result.cda.toFixed(4)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">m²</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition rounded hover:bg-rose-500/10"
                          title="Hapus Riwayat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
