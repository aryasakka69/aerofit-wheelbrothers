'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Waves, 
  Wind, 
  Layers, 
  Gauge, 
  Sparkles, 
  Eye, 
  Zap, 
  Maximize2 
} from 'lucide-react';
import { PoseLandmarks } from '@/lib/fitting/angles';
import { BikeCategory } from '@/lib/types/bike';
import { 
  AirParticle, 
  buildCombinedGeometry, 
  sampleFlowField 
} from '@/lib/cfd/cfd-engine';

interface CfdCanvasProps {
  landmarks: PoseLandmarks;
  bikeCategory: BikeCategory;
  speedKmh?: number;
  label?: string;
  isComparisonSide?: boolean;
}

export default function CfdCanvas({
  landmarks,
  bikeCategory,
  speedKmh = 40,
  label,
  isComparisonSide = false
}: CfdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [simSpeedKmh, setSimSpeedKmh] = useState<number>(speedKmh);
  const [viewMode, setViewMode] = useState<'STREAMLINES' | 'PRESSURE_HEATMAP' | 'TURBULENCE_WAKE'>('STREAMLINES');
  const [particleDensity, setParticleDensity] = useState<number>(120);

  useEffect(() => {
    setSimSpeedKmh(speedKmh);
  }, [speedKmh]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Initialize particles: flowing from right (oncoming wind) to left (behind rider)
    // Rider is facing right (towards x = width)
    const particleCount = particleDensity;
    const particles: AirParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: -(simSpeedKmh / 10),
        vy: 0,
        speed: simSpeedKmh / 10,
        pressure: 0.5,
        age: Math.random() * 100,
        maxAge: 70 + Math.random() * 60,
        streamlineId: i
      });
    }

    let animationFrameId: number;

    const render = () => {
      // Background with slight motion trail
      ctx.fillStyle = 'rgba(8, 12, 20, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const geo = buildCombinedGeometry(landmarks, bikeCategory, width, height);

      // 1. Draw Bike Silhouette
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;

      // Wheels
      const fw = geo.bike.frontWheel;
      const rw = geo.bike.rearWheel;

      // Front wheel
      ctx.beginPath();
      ctx.arc(fw.cx, fw.cy, fw.r, 0, Math.PI * 2);
      ctx.fillStyle = fw.isDisc ? '#090d16' : 'rgba(15, 23, 42, 0.6)';
      ctx.fill();
      ctx.strokeStyle = fw.isDeepRim ? '#0284c7' : '#334155';
      ctx.lineWidth = fw.isDeepRim ? 8 : 4;
      ctx.stroke();

      // Rear wheel
      ctx.beginPath();
      ctx.arc(rw.cx, rw.cy, rw.r, 0, Math.PI * 2);
      ctx.fillStyle = rw.isDisc ? '#090d16' : 'rgba(15, 23, 42, 0.6)';
      ctx.fill();
      ctx.strokeStyle = rw.isDeepRim ? '#0284c7' : '#334155';
      ctx.lineWidth = rw.isDeepRim ? 8 : 4;
      ctx.stroke();

      // Bike Frame Tubes
      ctx.lineCap = 'round';
      geo.bike.frameLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.p1.x, line.p1.y);
        ctx.lineTo(line.p2.x, line.p2.y);
        ctx.lineWidth = line.thickness;
        ctx.strokeStyle = bikeCategory === 'TT_TRIATHLON' ? '#0ea5e9' : bikeCategory === 'AERO_ROAD' ? '#0284c7' : '#475569';
        ctx.stroke();
      });

      // Cockpit / Aerobars
      ctx.beginPath();
      ctx.moveTo(geo.bike.cockpit.p1.x, geo.bike.cockpit.p1.y);
      ctx.lineTo(geo.bike.cockpit.p2.x, geo.bike.cockpit.p2.y);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      // 2. Draw Cyclist Silhouette
      const b = geo.body;
      ctx.lineCap = 'round';

      // Head / Helmet (Teardrop shape for aero)
      ctx.beginPath();
      ctx.arc(b.head.cx, b.head.cy, b.head.r, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      // Helmet aero tail
      ctx.beginPath();
      ctx.moveTo(b.head.cx, b.head.cy - b.head.r);
      ctx.lineTo(b.head.cx - b.head.r * 1.5, b.head.cy);
      ctx.lineTo(b.head.cx, b.head.cy + b.head.r);
      ctx.closePath();
      ctx.fillStyle = '#0369a1';
      ctx.fill();

      // Torso
      ctx.beginPath();
      ctx.moveTo(b.torso.p1.x, b.torso.p1.y);
      ctx.lineTo(b.torso.p2.x, b.torso.p2.y);
      ctx.lineWidth = b.torso.thickness;
      ctx.strokeStyle = '#0284c7';
      ctx.stroke();

      // Arms
      ctx.beginPath();
      ctx.moveTo(b.arms.p1.x, b.arms.p1.y);
      ctx.lineTo(b.arms.p2.x, b.arms.p2.y);
      ctx.lineTo(b.arms.p3.x, b.arms.p3.y);
      ctx.lineWidth = b.arms.thickness;
      ctx.strokeStyle = '#0ea5e9';
      ctx.stroke();

      // Legs (Thigh + Shank)
      ctx.beginPath();
      ctx.moveTo(b.thigh.p1.x, b.thigh.p1.y);
      ctx.lineTo(b.thigh.p2.x, b.thigh.p2.y);
      ctx.lineTo(b.shank.p2.x, b.shank.p2.y);
      ctx.lineWidth = b.thigh.thickness;
      ctx.strokeStyle = '#0369a1';
      ctx.stroke();

      // 3. Render Mode Specific Airflow Effects

      // Mode: TURBULENCE_WAKE (Highlight the separation vortex bubble)
      if (viewMode === 'TURBULENCE_WAKE') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)'; // Red wake zone
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        const wakeStartX = b.torso.p1.x;
        const wakeEndX = rw.cx - 20;
        const wakeTopY = b.head.cy - 10;
        const wakeBottomY = rw.cy - 10;

        ctx.beginPath();
        ctx.ellipse(
          (wakeStartX + wakeEndX) / 2,
          (wakeTopY + wakeBottomY) / 2,
          Math.abs(wakeStartX - wakeEndX) / 2 + 20,
          Math.abs(wakeBottomY - wakeTopY) / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Wake label
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('Zona Separasi / Turbulensi', (wakeStartX + wakeEndX) / 2 - 60, (wakeTopY + wakeBottomY) / 2);
      }

      // Mode: PRESSURE_HEATMAP (Highlight stagnation high pressure at leading edge)
      if (viewMode === 'PRESSURE_HEATMAP') {
        const radGrad = ctx.createRadialGradient(fw.cx + 20, fw.cy, 5, fw.cx + 20, fw.cy, 60);
        radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.fillRect(fw.cx - 20, fw.cy - 60, 100, 120);

        const headGrad = ctx.createRadialGradient(b.head.cx + 20, b.head.cy, 5, b.head.cx + 20, b.head.cy, 50);
        headGrad.addColorStop(0, 'rgba(249, 115, 22, 0.5)');
        headGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = headGrad;
        ctx.fillRect(b.head.cx - 10, b.head.cy - 50, 90, 100);
      }

      // 4. Update & Draw Airflow Particles (Streamlines)
      const baseVelocity = -(simSpeedKmh / 12);

      particles.forEach(p => {
        const flow = sampleFlowField(p.x, p.y, baseVelocity, geo);

        // Update positions
        p.x += flow.vx;
        p.y += flow.vy;
        p.pressure = flow.pressure;
        p.age += 1;

        // Reset particle if exited canvas or aged out
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.age > p.maxAge) {
          p.x = width - Math.random() * 20;
          p.y = Math.random() * height;
          p.age = 0;
          p.maxAge = 60 + Math.random() * 60;
        }

        // Draw particle trail
        const speedMagnitude = Math.hypot(flow.vx, flow.vy);
        const trailLength = Math.max(8, speedMagnitude * 3.5);

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - flow.vx * 2, p.y - flow.vy * 2);

        if (viewMode === 'PRESSURE_HEATMAP') {
          // Color by pressure: 0 (deep blue/purple) -> 1 (bright orange/red)
          if (flow.pressure > 0.7) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)'; // Red high pressure
          } else if (flow.pressure > 0.45) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)'; // Cyan normal
          } else {
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)'; // Purple low pressure suction
          }
        } else if (flow.isTurbulentWake) {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)'; // Rose turbulent
        } else {
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.75)'; // Bright Cyan laminar
        }

        ctx.lineWidth = flow.isTurbulentWake ? 1.2 : 2.0;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [landmarks, bikeCategory, simSpeedKmh, viewMode, particleDensity]);

  return (
    <div className="glass-panel p-5 rounded-3xl space-y-4">
      
      {/* Top Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          {label && (
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block mb-0.5">
              {label}
            </span>
          )}
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400" />
            Simulasi CFD Aliran Udara 2D
          </h3>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('STREAMLINES')}
            className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold ${
              viewMode === 'STREAMLINES' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Streamlines
          </button>
          <button
            onClick={() => setViewMode('PRESSURE_HEATMAP')}
            className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold ${
              viewMode === 'PRESSURE_HEATMAP' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Heatmap Tekanan
          </button>
          <button
            onClick={() => setViewMode('TURBULENCE_WAKE')}
            className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold ${
              viewMode === 'TURBULENCE_WAKE' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Zona Turbulensi
          </button>
        </div>
      </div>

      {/* CFD Canvas Viewport */}
      <div className="relative w-full aspect-video max-h-[440px] bg-[#080c14] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={760}
          height={420}
          className="w-full h-full block"
        />

        {/* Wind Speed Overlay Badge */}
        <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kecepatan Udara:</span>
          <span className="font-mono font-bold text-cyan-300">{simSpeedKmh} km/h</span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            Laminar Flow
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Turbulent Wake
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Stagnation Point
          </span>
        </div>
      </div>

      {/* Speed & Density Adjuster */}
      {!isComparisonSide && (
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1 text-slate-400">
              <span>Kecepatan Angin Uji:</span>
              <span className="font-mono font-bold text-cyan-300">{simSpeedKmh} km/h</span>
            </div>
            <input
              type="range"
              min="25"
              max="65"
              step="1"
              value={simSpeedKmh}
              onChange={(e) => setSimSpeedKmh(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1 text-slate-400">
              <span>Kerapatan Partikel Fluida:</span>
              <span className="font-mono font-bold text-teal-300">{particleDensity}</span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              step="10"
              value={particleDensity}
              onChange={(e) => setParticleDensity(Number(e.target.value))}
              className="w-full accent-teal-400"
            />
          </div>
        </div>
      )}

    </div>
  );
}
