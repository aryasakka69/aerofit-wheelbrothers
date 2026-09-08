'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Wind, 
  Bike, 
  Calculator, 
  TrendingUp, 
  Lightbulb, 
  Camera, 
  Waves, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Gauge,
  Activity,
  Layers,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const modules = [
    {
      num: '01',
      title: 'Pemilihan Sepeda & Database',
      subtitle: 'Cascading Selector & Fallback Geometry',
      desc: 'Pilih brand, model, dan rentang tahun (20 tahun terakhir) atau gunakan fallback generic road/aero/TT bike dengan estimasi frontal area & Crr presisi.',
      icon: Bike,
      href: '/bikes',
      tag: 'Fase 1 (Aktif)',
      color: 'from-cyan-500 to-teal-500',
      borderColor: 'border-cyan-500/30'
    },
    {
      num: '02',
      title: 'Kalkulator CdA (Drag Force)',
      subtitle: 'Power-Based Physics & Chung Method',
      desc: 'Estimasi CdA dari kecepatan, watt power meter, suhu, dan ketinggian, atau impor file .FIT/.TCX/.GPX menggunakan Virtual Elevation method.',
      icon: Calculator,
      href: '/calculator',
      tag: 'Fase 1 & 2 (Aktif)',
      color: 'from-teal-500 to-emerald-500',
      borderColor: 'border-teal-500/30'
    },
    {
      num: '03',
      title: 'Rekomendasi & Narasi AI',
      subtitle: 'Quick Wins & Gemini Performance Coach',
      desc: 'Saran optimasi postur, gear, dan pakaian diurutkan berdasarkan matriks dampak vs biaya, dirangkai menjadi narasi komunikatif oleh Gemini AI.',
      icon: Lightbulb,
      href: '/recommendations',
      tag: 'Fase 1 (Aktif)',
      color: 'from-emerald-500 to-cyan-500',
      borderColor: 'border-emerald-500/30'
    },
    {
      num: '04',
      title: 'Bike Fitting via Kamera',
      subtitle: 'MediaPipe Pose Biomechanical Tracking',
      desc: 'Pindai sudut lutut, torso, siku, dan drop saddle-to-handlebar secara real-time via webcam laptop/HP tanpa sensor mahal.',
      icon: Camera,
      href: '/bike-fit',
      tag: 'Fase 3 (Aktif)',
      color: 'from-indigo-500 to-violet-500',
      borderColor: 'border-indigo-500/30'
    },
    {
      num: '05',
      title: 'Simulasi CFD Aliran Udara',
      subtitle: 'WebGL Streamline & Turbulence Heatmap',
      desc: 'Visualisasi garis aliran udara interaktif terhadap siluet pesepeda dan geometri sepeda dengan komparasi sebelum vs sesudah fitting.',
      icon: Waves,
      href: '/simulation',
      tag: 'Fase 4 (Aktif)',
      color: 'from-violet-500 to-fuchsia-500',
      borderColor: 'border-violet-500/30'
    }
  ];

  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <div className="relative pt-6 pb-12 text-center space-y-8">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner shadow-cyan-500/10 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Platform Analisis Aerodinamika Pesepeda Virtual</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-slate-400">Zero Wind Tunnel Required</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Optimalkan <span className="aero-gradient-text">CdA</span> Anda.<br />
            Lebih Cepat di Setiap Watt.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Kalkulasi hambatan aerodinamika (*Coefficient of Drag x Frontal Area*), kalibrasi kurva *Virtual Elevation*, dan dapatkan strategi perbaikan posisi berkendara yang terbukti secara ilmiah.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/calculator"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition duration-200 transform hover:-translate-y-0.5"
          >
            <Calculator className="w-4 h-4" />
            Mulai Kalkulasi CdA Instan
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/bikes"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel hover:bg-white/10 text-white font-bold text-sm tracking-wide border border-white/15 flex items-center justify-center gap-2.5 transition"
          >
            <Bike className="w-4 h-4 text-cyan-400" />
            Pilih / Konfigurasi Sepeda
          </Link>
        </div>

        {/* Live Quick Metrics Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div className="glass-panel p-4 rounded-2xl border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Metode Fisika</span>
            <span className="text-lg font-black text-white">Chung Method</span>
            <span className="text-[10px] text-cyan-400 mt-0.5 block">Virtual Elevation & Rho</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Katalog Sepeda</span>
            <span className="text-lg font-black text-white">20 Tahun Terakhir</span>
            <span className="text-[10px] text-teal-400 mt-0.5 block">Road, Aero, TT & Gravel</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">AI Narrative</span>
            <span className="text-lg font-black text-white">Gemini 1.5 Flash</span>
            <span className="text-[10px] text-indigo-400 mt-0.5 block">Rule-Based Prompting</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Potensi Hemat</span>
            <span className="text-lg font-black text-emerald-400">Hingga -45 Watt</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Pada kecepatan 40 km/h</span>
          </div>
        </div>
      </div>

      {/* 5 Modules Workflow Architecture Showcase */}
      <div className="space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
            Arsitektur Terintegrasi
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            5 Modul End-to-End AeroFit
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Setiap modul dirancang saling meneruskan data secara berurutan, mulai dari geometri sepeda, kalkulasi hambatan, tips AI, fitting pose, hingga simulasi CFD.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div 
                key={idx}
                className="glass-panel p-7 rounded-3xl relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-600 font-mono group-hover:text-cyan-400 transition-colors">
                      {m.num}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-300">
                      {m.tag}
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${m.color} flex items-center justify-center text-slate-950 mb-4 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{m.title}</h3>
                  <h4 className="text-xs font-semibold text-cyan-400 mb-2.5">{m.subtitle}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5">
                  <Link
                    href={m.href}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 group-hover:text-cyan-300 transition"
                  >
                    Buka Modul
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Physics Formula Showcase Banner */}
      <div className="glass-panel-glow p-8 sm:p-12 rounded-3xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Prinsip Fisika Dasar
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kekuatan Hambatan Udara Meningkat Secara Kubik (v³)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pada kecepatan di atas 30 km/jam, lebih dari <strong>75% hingga 85%</strong> daya kayuhan pesepeda habis hanya untuk membelah udara. Memangkas CdA Anda sebesar <strong>0.02 m²</strong> memberikan efek kecepatan lebih besar daripada menghemat bobot sepeda 2 kg!
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Gaya Hambat (Drag Force)</span>
                <span className="font-mono text-xs font-bold text-cyan-300">F_drag = ½ &rho; v² CdA</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Daya Drag (Drag Power)</span>
                <span className="font-mono text-xs font-bold text-teal-300">P_drag = ½ &rho; v³ CdA</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Tiga Langkah Mudah Menggunakan AeroFit:
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                <div>
                  <strong className="text-white block">Pilih Sepeda Anda</strong>
                  <span className="text-slate-400 text-[11px]">Ambil referensi geometri & frontal area default dari katalog.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                <div>
                  <strong className="text-white block">Hitung CdA di Segmen Uji</strong>
                  <span className="text-slate-400 text-[11px]">Masukkan kecepatan & power meter atau import file ride (.GPX/.TCX).</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                <div>
                  <strong className="text-white block">Eksekusi Rekomendasi Quick Wins</strong>
                  <span className="text-slate-400 text-[11px]">Ikuti arahan postur siku & kepala dari Coach AI untuk hemat puluhan Watt.</span>
                </div>
              </div>
            </div>

            <Link
              href="/calculator"
              className="mt-2 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-cyan-500/20"
            >
              Mulai Uji Sekarang &rarr;
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
