'use client';

import React from 'react';
import { PowerBreakdown } from '@/lib/types/cda';
import { Wind, CircleDot, Mountain, Cog } from 'lucide-react';

interface BreakdownProps {
  breakdown: PowerBreakdown;
  totalPower: number;
}

export default function PowerBreakdownChart({ breakdown, totalPower }: BreakdownProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="font-bold text-sm text-white">Breakdown Distribusi Daya (Watt)</h3>
          <p className="text-[11px] text-slate-400">Ke mana daya Anda dialirkan saat melaju di kecepatan ini?</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Total Daya:</span>
          <span className="font-mono font-extrabold text-sm text-cyan-300 ml-1.5">{totalPower} W</span>
        </div>
      </div>

      {/* Segmented Distribution Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-900 border border-white/10 p-0.5">
          {/* Drag */}
          <div 
            style={{ width: `${Math.max(5, breakdown.dragPercent)}%` }}
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-l-full transition-all duration-500 relative group"
            title={`Aerodynamic Drag: ${breakdown.dragPower} W (${breakdown.dragPercent}%)`}
          />
          {/* Rolling */}
          <div 
            style={{ width: `${Math.max(3, breakdown.rollingPercent)}%` }}
            className="h-full bg-emerald-500 transition-all duration-500 relative group"
            title={`Rolling Resistance: ${breakdown.rollingPower} W (${breakdown.rollingPercent}%)`}
          />
          {/* Gravity (if slope > 0) */}
          {breakdown.gravityPercent > 0 && (
            <div 
              style={{ width: `${Math.max(2, breakdown.gravityPercent)}%` }}
              className="h-full bg-amber-500 transition-all duration-500 relative group"
              title={`Gravity Resistance: ${breakdown.gravityPower} W (${breakdown.gravityPercent}%)`}
            />
          )}
          {/* Drivetrain Loss */}
          <div 
            style={{ width: `${Math.max(2, breakdown.drivetrainPercent)}%` }}
            className="h-full bg-indigo-500 rounded-r-full transition-all duration-500 relative group"
            title={`Drivetrain Loss: ${breakdown.drivetrainLoss} W (${breakdown.drivetrainPercent}%)`}
          />
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Drag */}
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
          <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
            <Wind className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Hambatan Udara</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-cyan-200">{breakdown.dragPower} W</span>
            <span className="text-xs font-bold text-cyan-400">{breakdown.dragPercent}%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Hambatan utama di kec. tinggi</span>
        </div>

        {/* Rolling */}
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
            <CircleDot className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Gesekan Ban (Crr)</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-emerald-200">{breakdown.rollingPower} W</span>
            <span className="text-xs font-bold text-emerald-400">{breakdown.rollingPercent}%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Resistensi kontak aspal</span>
        </div>

        {/* Gravity */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20">
          <div className="flex items-center gap-1.5 text-amber-400 mb-1">
            <Mountain className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Gravitasi / Slope</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-amber-200">{breakdown.gravityPower} W</span>
            <span className="text-xs font-bold text-amber-400">{breakdown.gravityPercent}%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Kemiringan jalan</span>
        </div>

        {/* Drivetrain Loss */}
        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
          <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
            <Cog className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Drivetrain Loss</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-indigo-200">{breakdown.drivetrainLoss} W</span>
            <span className="text-xs font-bold text-indigo-400">{breakdown.drivetrainPercent}%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Friksi rantai & pulley</span>
        </div>
      </div>
    </div>
  );
}
