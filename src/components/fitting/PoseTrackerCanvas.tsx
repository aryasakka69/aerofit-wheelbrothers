'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Video, 
  Sparkles, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Move,
  Maximize2
} from 'lucide-react';
import { PoseLandmarks, BiomechanicalAngles, extractBiomechanicalAngles, SAMPLE_POSES } from '@/lib/fitting/angles';
import { BikeCategory } from '@/lib/types/bike';

interface PoseTrackerCanvasProps {
  bikeCategory: BikeCategory;
  onPoseAnalyzed: (landmarks: PoseLandmarks, angles: BiomechanicalAngles) => void;
}

export default function PoseTrackerCanvas({ bikeCategory, onPoseAnalyzed }: PoseTrackerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [mode, setMode] = useState<'PRESET' | 'WEBCAM' | 'UPLOAD'>('PRESET');
  const [selectedPreset, setSelectedPreset] = useState<'ROAD_UPRIGHT' | 'ROAD_AGGRESSIVE' | 'TT_AERO'>('ROAD_AGGRESSIVE');
  const [landmarks, setLandmarks] = useState<PoseLandmarks>(SAMPLE_POSES.ROAD_AGGRESSIVE);
  const [activeJoint, setActiveJoint] = useState<keyof PoseLandmarks | null>(null);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Preset terkalibrasi aktif (Bisa digeser interaktif)');

  // Extract angles whenever landmarks change
  const currentAngles = useCallback(() => {
    return extractBiomechanicalAngles(landmarks);
  }, [landmarks]);

  useEffect(() => {
    const angles = currentAngles();
    onPoseAnalyzed(landmarks, angles);
  }, [landmarks, currentAngles, onPoseAnalyzed]);

  // Handle Preset change
  const handlePresetChange = (presetKey: 'ROAD_UPRIGHT' | 'ROAD_AGGRESSIVE' | 'TT_AERO') => {
    setSelectedPreset(presetKey);
    setLandmarks(SAMPLE_POSES[presetKey]);
    setStatusText(`Preset ${presetKey.replace('_', ' ')} dimuat.`);
  };

  // Start webcam
  const handleStartWebcam = async () => {
    try {
      setMode('WEBCAM');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setWebcamActive(true);
        setStatusText('Kamera aktif. Posisikan rider dari sudut samping (side-view).');
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      alert('Kamera tidak dapat diakses. Anda tetap dapat menggunakan Preset Uji atau Upload Video.');
      setMode('PRESET');
    }
  };

  const handleStopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  // Draw overlay skeleton on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark grid background if no video
    if (mode !== 'WEBCAM') {
      ctx.fillStyle = '#0b0f17';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw stylized bicycle outline
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 3;
      // Wheels
      ctx.beginPath();
      ctx.arc(width * 0.25, height * 0.85, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(width * 0.75, height * 0.85, 45, 0, Math.PI * 2);
      ctx.stroke();
      // Bottom bracket
      const bbX = width * 0.48;
      const bbY = height * 0.84;
      ctx.beginPath();
      ctx.arc(bbX, bbY, 8, 0, Math.PI * 2);
      ctx.stroke();
      // Frame lines
      ctx.beginPath();
      ctx.moveTo(width * 0.25, height * 0.85); // Rear axle
      ctx.lineTo(width * 0.40, height * 0.60); // Saddle clamp
      ctx.lineTo(width * 0.68, height * 0.55); // Head tube top
      ctx.lineTo(width * 0.75, height * 0.85); // Front axle
      ctx.moveTo(width * 0.40, height * 0.60);
      ctx.lineTo(bbX, bbY);
      ctx.lineTo(width * 0.25, height * 0.85);
      ctx.moveTo(bbX, bbY);
      ctx.lineTo(width * 0.68, height * 0.55);
      ctx.stroke();
    }

    // Coordinates mapping
    const pts = {
      hip: { x: landmarks.leftHip.x * width, y: landmarks.leftHip.y * height },
      knee: { x: landmarks.leftKnee.x * width, y: landmarks.leftKnee.y * height },
      ankle: { x: landmarks.leftAnkle.x * width, y: landmarks.leftAnkle.y * height },
      shoulder: { x: landmarks.leftShoulder.x * width, y: landmarks.leftShoulder.y * height },
      elbow: { x: landmarks.leftElbow.x * width, y: landmarks.leftElbow.y * height },
      wrist: { x: landmarks.leftWrist.x * width, y: landmarks.leftWrist.y * height },
      ear: landmarks.leftEar ? { x: landmarks.leftEar.x * width, y: landmarks.leftEar.y * height } : null,
      nose: landmarks.nose ? { x: landmarks.nose.x * width, y: landmarks.nose.y * height } : null
    };

    // 1. Draw Skeleton Bones
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Torso (Hip -> Shoulder)
    ctx.strokeStyle = '#38bdf8'; // Cyan
    ctx.beginPath();
    ctx.moveTo(pts.hip.x, pts.hip.y);
    ctx.lineTo(pts.shoulder.x, pts.shoulder.y);
    ctx.stroke();

    // Upper Arm & Forearm (Shoulder -> Elbow -> Wrist)
    ctx.strokeStyle = '#a855f7'; // Purple
    ctx.beginPath();
    ctx.moveTo(pts.shoulder.x, pts.shoulder.y);
    ctx.lineTo(pts.elbow.x, pts.elbow.y);
    ctx.lineTo(pts.wrist.x, pts.wrist.y);
    ctx.stroke();

    // Leg (Hip -> Knee -> Ankle)
    ctx.strokeStyle = '#10b981'; // Emerald
    ctx.beginPath();
    ctx.moveTo(pts.hip.x, pts.hip.y);
    ctx.lineTo(pts.knee.x, pts.knee.y);
    ctx.lineTo(pts.ankle.x, pts.ankle.y);
    ctx.stroke();

    // Head / Neck Line
    if (pts.ear) {
      ctx.strokeStyle = '#f59e0b'; // Amber
      ctx.beginPath();
      ctx.moveTo(pts.shoulder.x, pts.shoulder.y);
      ctx.lineTo(pts.ear.x, pts.ear.y);
      ctx.stroke();

      // Head circle
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.beginPath();
      ctx.arc(pts.ear.x, pts.ear.y, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw Horizontal Reference Line at Hip for Torso Angle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pts.hip.x - 30, pts.hip.y);
    ctx.lineTo(pts.hip.x + 80, pts.hip.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Angle Annotations & Badges
    const angles = extractBiomechanicalAngles(landmarks);

    // Torso Angle Badge
    drawAngleBadge(ctx, pts.hip.x + 35, pts.hip.y - 15, `${angles.torsoAngleDeg}°`, 'Torso');

    // Knee Angle Badge
    drawAngleBadge(ctx, pts.knee.x + 20, pts.knee.y, `${angles.kneeExtensionDeg}°`, 'Lutut');

    // Elbow Angle Badge
    drawAngleBadge(ctx, pts.elbow.x + 20, pts.elbow.y - 10, `${angles.elbowAngleDeg}°`, 'Siku');

    // 4. Draw Joint Handles
    const jointKeys: (keyof PoseLandmarks)[] = [
      'leftHip', 'leftKnee', 'leftAnkle', 'leftShoulder', 'leftElbow', 'leftWrist', 'leftEar'
    ];

    jointKeys.forEach(k => {
      const pt = landmarks[k];
      if (!pt) return;
      const px = pt.x * width;
      const py = pt.y * height;
      const isSelected = activeJoint === k;

      ctx.fillStyle = isSelected ? '#f43f5e' : '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(px, py, isSelected ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

  }, [landmarks, activeJoint, mode]);

  const drawAngleBadge = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    label: string
  ) => {
    ctx.font = 'bold 11px monospace';
    const textWidth = ctx.measureText(text).width;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - 4, y - 12, textWidth + 8, 22, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.fillText(text, x, y + 2);
  };

  // Canvas Mouse / Touch drag to adjust joints
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Find closest joint within threshold
    const jointKeys: (keyof PoseLandmarks)[] = [
      'leftHip', 'leftKnee', 'leftAnkle', 'leftShoulder', 'leftElbow', 'leftWrist', 'leftEar'
    ];

    for (const k of jointKeys) {
      const pt = landmarks[k];
      if (pt) {
        const dist = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));
        if (dist < 0.05) {
          setActiveJoint(k);
          return;
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeJoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));

    setLandmarks(prev => ({
      ...prev,
      [activeJoint]: { x, y }
    }));
  };

  const handleMouseUp = () => {
    setActiveJoint(null);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-5">
      
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-sm text-white">Interactive Pose Tracking Canvas</h3>
            <span className="text-[11px] text-slate-400">Pindai dari sisi samping (Side-View 90°)</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => {
              handleStopWebcam();
              setMode('PRESET');
            }}
            className={`py-1.5 px-3 rounded-lg font-semibold transition ${
              mode === 'PRESET' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Preset Uji
          </button>
          <button
            onClick={handleStartWebcam}
            className={`py-1.5 px-3 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              mode === 'WEBCAM' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Live Webcam
          </button>
        </div>
      </div>

      {/* Preset Buttons Bar (Visible if PRESET mode) */}
      {mode === 'PRESET' && (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-900/60 border border-white/5 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold px-2">Pilih Postur Contoh:</span>
          <button
            onClick={() => handlePresetChange('ROAD_UPRIGHT')}
            className={`px-3 py-1.5 rounded-xl transition ${
              selectedPreset === 'ROAD_UPRIGHT' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Road Tegak (Hoods Santai)
          </button>
          <button
            onClick={() => handlePresetChange('ROAD_AGGRESSIVE')}
            className={`px-3 py-1.5 rounded-xl transition ${
              selectedPreset === 'ROAD_AGGRESSIVE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Road Agresif (Drops / 90° Siku)
          </button>
          <button
            onClick={() => handlePresetChange('TT_AERO')}
            className={`px-3 py-1.5 rounded-xl transition ${
              selectedPreset === 'TT_AERO' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Time Trial / Aerobars TT
          </button>
        </div>
      )}

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-video max-h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
        {/* Hidden video stream for webcam */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${mode === 'WEBCAM' ? 'block' : 'hidden'}`}
        />

        {/* Tracking Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative z-10 w-full h-full cursor-crosshair touch-none"
        />

        {/* Interactive Helper Overlay Pill */}
        <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tip: Anda dapat <strong>menggeser titik sendi (lingkaran putih)</strong> untuk fine-tuning sudut secara manual.</span>
        </div>
      </div>

      {/* Bottom Status text */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          {statusText}
        </span>
        <span className="text-[11px] font-mono text-slate-500">Trigonometric Biomechanics v1.0</span>
      </div>

    </div>
  );
}
