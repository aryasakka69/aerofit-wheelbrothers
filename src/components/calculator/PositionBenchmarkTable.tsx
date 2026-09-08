'use client';

import React from 'react';
import { POSITION_BENCHMARKS } from '@/lib/physics/cda-formulas';
import { Check, Target } from 'lucide-react';

interface BenchmarkProps {
  currentCda?: number;
}

export default function PositionBenchmarkTable({ currentCda }: BenchmarkProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-white">Tabel Benchmark Referensi CdA</h3>
        </div>
        <span className="text-[10px] text-slate-400">Rentang Tipikal Pesepeda Dunia</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Posisi Riding</th>
              <th className="py-2.5 px-3">Rentang CdA (m²)</th>
              <th className="py-2.5 px-3">Kategori Rider</th>
              <th className="py-2.5 px-3 text-center">Status Anda</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {POSITION_BENCHMARKS.map((item, idx) => {
              const isCurrentInRange = 
                currentCda !== undefined && 
                currentCda >= item.cdaRangeMin && 
                currentCda < item.cdaRangeMax;

              return (
                <tr 
                  key={idx}
                  className={`transition-colors ${
                    isCurrentInRange 
                      ? 'bg-cyan-500/15 border-l-2 border-cyan-400 font-medium text-white' 
                      : 'text-slate-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className="font-semibold block text-white">{item.positionName}</span>
                    <span className="text-[10px] text-slate-400">{item.description}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-cyan-300">
                      {item.cdaRangeMin.toFixed(2)} – {item.cdaRangeMax.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {item.typicalRider}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {isCurrentInRange ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/40 animate-pulse">
                        <Check className="w-3 h-3 text-cyan-400" /> Posisi Anda
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-500 italic pt-2 border-t border-white/5">
        * Catatan: Nilai CdA dipengaruhi oleh ukuran tubuh (tinggi/berat), kelenturan torso, posisi kepala, serta pakaian yang dikenakan.
      </p>
    </div>
  );
}
