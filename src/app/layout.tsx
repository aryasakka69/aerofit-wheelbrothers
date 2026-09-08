import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'AeroFit — Platform Optimasi & Kalkulasi CdA Pesepeda',
  description: 'Ukur, pahami, dan optimalkan Coefficient of Aerodynamic Drag (CdA) pesepeda tanpa wind tunnel fisik melalui pemodelan fisika, Chung Virtual Elevation, dan rekomendasi AI.',
  keywords: ['CdA', 'Cycling Aerodynamics', 'Chung Method', 'Bike Fitting', 'Aero Bike', 'Virtual Elevation'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <footer className="mt-20 border-t border-white/5 py-8 text-center text-xs text-slate-500 bg-slate-950/60">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">AeroFit Platform</span>
              <span>— Analisis Aerodinamika Pesepeda Presisi</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Chung Method Physics</span>
              <span>•</span>
              <span>MediaPipe Pose Engine</span>
              <span>•</span>
              <span>Gemini AI Narrative</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
