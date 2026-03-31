'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Shield,
  Square,
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
  ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
  id: number;
  name: string;
  time: string;
  type: 'in' | 'out';
  photo?: string;
}

const AttendancePage = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<'in' | 'out'>('in');
  const [showSuccess, setShowSuccess] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([
    { id: 1, name: 'Employee', time: '09:00 AM', type: 'in' },
    { id: 2, name: 'Employee', time: '09:05 AM', type: 'in' },
    { id: 3, name: 'Employee', time: '06:00 PM', type: 'out' },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const formattedTime = currentTime?.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) ?? '--:--:--';

  const currentDate = currentTime?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) ?? '';

  // Seed time on client + tick every second
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Could not access camera. Please allow camera permission and try again.');
      setIsScanning(false);
    }
  }, []);

  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(photo);
    setIsCaptured(true);
    stopCamera();
  }, [stopCamera]);

  const handleAttendance = useCallback(
    async (type: 'in' | 'out') => {
      setAttendanceType(type);
      setShowSuccess(false);
      setCapturedPhoto(null);
      setIsCaptured(false);
      setCameraError(null);
      setIsScanning(true);
      await startCamera();
    },
    [startCamera],
  );

  const confirmAttendance = useCallback(() => {
    const newRecord: AttendanceRecord = {
      id: Date.now(),
      name: 'Employee',
      time: formattedTime,
      type: attendanceType,
      photo: capturedPhoto ?? undefined,
    };
    setAttendanceLog((prev) => [newRecord, ...prev]);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setIsScanning(false);
      setIsCaptured(false);
      setCapturedPhoto(null);
    }, 2500);
  }, [attendanceType, capturedPhoto, formattedTime]);

  const retakePhoto = useCallback(async () => {
    setIsCaptured(false);
    setCapturedPhoto(null);
    await startCamera();
  }, [startCamera]);

  const cancelAttendance = useCallback(() => {
    stopCamera();
    setIsScanning(false);
    setIsCaptured(false);
    setCapturedPhoto(null);
    setCameraError(null);
  }, [stopCamera]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-6 border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-secondary to-pink-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground uppercase">Pixzel</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl border border-border">
            <Clock className="w-4 h-4 text-muted-foreground animate-pulse" />
            <span className="text-sm font-semibold text-foreground tabular-nums">{formattedTime}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">{currentDate}</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">Take Photo for Attendance</h1>
          </div>

          {/* Time In / Time Out buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleAttendance('in')}
              disabled={isScanning}
              className={cn(
                'flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all',
                attendanceType === 'in' && isScanning
                  ? 'bg-muted text-muted-foreground hover:bg-accent'
                  : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
                isScanning && 'opacity-50 cursor-not-allowed',
              )}
            >
              <LogIn className="w-5 h-5" />
              Time In
            </button>
            <button
              onClick={() => handleAttendance('out')}
              disabled={isScanning}
              className={cn(
                'flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all',
                attendanceType === 'out' && isScanning
                  ? 'bg-muted text-muted-foreground hover:bg-accent'
                  : 'bg-red-500 text-white shadow-lg shadow-red-500/25',
                isScanning && 'opacity-50 cursor-not-allowed',
              )}
            >
              <LogOut className="w-5 h-5" />
              Time Out
            </button>
          </div>

          {/* Camera / Preview area */}
          <div
            className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border"
            style={{ minHeight: '480px' }}
          >
            {/* Hidden canvas used for snapshot */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Live video */}
            {isScanning && !isCaptured && !cameraError && (
              <video
                ref={videoRefCallback}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Captured still */}
            {isCaptured && capturedPhoto && (
              <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
            )}

            {/* Idle state */}
            {!isScanning && !showSuccess && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="p-8 rounded-full bg-muted/80">
                  <ImageIcon className="w-20 h-20 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold text-muted-foreground">Ready to Take Photo</p>
                <p className="text-sm text-muted-foreground/70">Tap Time In or Time Out to start</p>
              </div>
            )}

            {/* Camera error */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center bg-muted">
                <Camera className="w-12 h-12 text-red-400" />
                <p className="text-sm font-medium text-red-500">{cameraError}</p>
              </div>
            )}

            {/* Success overlay */}
            {showSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <p className="mt-4 text-xl font-bold text-white">
                    {attendanceType === 'in' ? 'Time In Recorded!' : 'Time Out Recorded!'}
                  </p>
                  <p className="text-white/60 mt-1 tabular-nums">{formattedTime}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            {isScanning && !isCaptured && !cameraError && (
              <button
                onClick={capturePhoto}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/25"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
            )}

            {isCaptured && !showSuccess && (
              <>
                <button
                  onClick={confirmAttendance}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/25"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm
                </button>
                <button
                  onClick={retakePhoto}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-muted text-foreground hover:bg-accent transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake
                </button>
              </>
            )}

            {isScanning && !showSuccess && (
              <button
                onClick={cancelAttendance}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg"
              >
                <Square className="w-5 h-5" />
                Cancel
              </button>
            )}
          </div>

          {/* Recent activity log */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {attendanceLog.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-4">
                    {log.photo ? (
                      <img
                        src={log.photo}
                        alt="Attendance photo"
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          log.type === 'in'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : 'bg-red-100 dark:bg-red-900/30',
                        )}
                      >
                        {log.type === 'in' ? (
                          <LogIn className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{log.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.type === 'in' ? 'Time In' : 'Time Out'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground tabular-nums">{log.time}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Recorded</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendancePage;