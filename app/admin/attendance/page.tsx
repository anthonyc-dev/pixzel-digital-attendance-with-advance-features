'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Shield,
  AlertCircle,
  Play,
  Square,
  Loader2,
  ScanFace,
  LogIn,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as faceapi from '@vladmandic/face-api';
import { toast } from 'sonner';

type AttendanceLog = {
  id: string;
  employer_name: string;
  timestamp: string;
  status: 'present' | 'late' | 'absent' | 'on_time';
  type: 'time_in' | 'time_out';
  image?: string;
};

const AttendancePage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [scanResult, setScanResult] = useState<'success' | 'error' | 'scanning' | null>(null);
  const [lastAttendance, setLastAttendance] = useState<{ name: string, time: string, type: string } | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [detectedFaces, setDetectedFaces] = useState(0);
  const [attendanceType, setAttendanceType] = useState<'time_in' | 'time_out' | null>(null);
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Failed to load face-api models:', error);
        toast.error('Face detection models failed to load. Basic camera will be used.');
        setIsModelLoading(false);
      }
    };
    loadModels();
    fetchLogs();

    return () => {
      stopCamera();
    };
  }, []);

  const fetchLogs = async () => {
    try {
      // 1. Fetch Logs
      const logResponse = await fetch('/api/attendance');
      const data = await logResponse.json();

      // 2. Fetch Total Employees for accurate stats
      const empResponse = await fetch('/api/registration');
      const empData = await empResponse.json();
      const totalEmployees = Array.isArray(empData.data) ? empData.data.length : 0;

      if (logResponse.ok) {
        setLogs(data);

        // Basic stats calculation for today
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = data.filter((l: any) => (l.created_at || l.timestamp)?.startsWith(today));

        // Count unique present employees today
        const presentIds = new Set(todayLogs.map((l: any) => l.employer_registration_id));
        const present = presentIds.size;

        const late = todayLogs.filter((l: any) => l.status === 'late').length;

        setStats({
          present,
          late,
          absent: Math.max(0, totalEmployees - present)
        });
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startDetection();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setDetectedFaces(0);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startDetection = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState < 2) return;

      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 })
        );

        setDetectedFaces(detections.length);

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          detections.forEach((detection) => {
            const { x, y, width, height } = detection.box;
            ctx.shadowColor = '#0089C0';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#0089C0';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
          });
        }

        // If a face is detected and scanning, trigger the recognition logic
        if (detections.length === 1 && isScanning && scanResult !== 'success') {
          // Add a small delay to ensure stable detection before capturing
          handleFaceMatch();
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    }, 500);
  };

  // Prevent multiple simultaneous API calls
  const isMatchingRef = useRef(false);

  const handleFaceMatch = async () => {
    if (isMatchingRef.current || !videoRef.current || !isScanning) return;

    isMatchingRef.current = true;
    setScanResult('scanning');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            descriptor: Array.from(detection.descriptor),
            type: attendanceType
          }),
        });

        const result = await response.json();

        if (result.success) {
          setScanResult('success');
          setLastAttendance({
            name: result.data.employer_name,
            time: new Date().toLocaleTimeString(),
            type: result.data.type
          });
          toast.success(`${result.data.employer_name} - ${result.data.type.replace('_', ' ')} recorded!`);
          fetchLogs();

          // Stop scanning after success
          setTimeout(() => {
            toggleScanning(null);
            setScanResult(null);
          }, 3000);
        } else {
          setScanResult('error');
          toast.error(result.message || 'Face not recognized');
          setTimeout(() => setScanResult('scanning'), 2000); // Back to scanning after error message
        }
      }
    } catch (error) {
      console.error('Match error:', error);
      setScanResult('error');
    } finally {
      isMatchingRef.current = false;
    }
  };

  const toggleScanning = (type: 'time_in' | 'time_out' | null) => {
    if (type) {
      setAttendanceType(type);
      setIsScanning(true);
      startCamera();
    } else {
      setIsScanning(false);
      setAttendanceType(null);
      stopCamera();
      setScanResult(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Terminal</h1>
          <p className="text-muted-foreground mt-1">Real-time Facial Recognition Scanning</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border border-border transition-colors",
            isScanning ? "border-emerald-500/50 bg-emerald-500/5" : ""
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isScanning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
            )} />
            <span className="text-sm font-medium text-foreground">
              {isScanning ? `${attendanceType?.replace('_', ' ').toUpperCase()} ACTIVE` : 'SYSTEM STANDBY'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-md dark:shadow-none dark:bg-card/50 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="p-2 rounded-lg bg-secondary/10">
                <ScanFace className="w-5 h-5 text-secondary" />
              </div>
              Scanning Area
              {isScanning && (
                <span className="ml-2 text-xs font-normal text-muted-foreground animate-pulse">
                  (Point face at camera)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video max-w-2xl mx-auto rounded-2xl overflow-hidden bg-[#0A0A0A] border border-border shadow-2xl">
              {isScanning ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                      "w-full h-full object-cover transition-opacity duration-500",
                      scanResult === 'success' ? "opacity-50 blur-sm" : "opacity-100"
                    )}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />

                  {/* Viewfinder Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className={cn(
                      "relative w-48 h-48 sm:w-64 sm:h-64 border border-secondary/20 bg-secondary/5 rounded-3xl transition-all duration-500",
                      detectedFaces > 0 ? "scale-110 border-emerald-500/40 bg-emerald-500/5" : "scale-100"
                    )}>
                      {/* Corners */}
                      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-secondary rounded-tl-xl" />
                      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-secondary rounded-tr-xl" />
                      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-secondary rounded-bl-xl" />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-secondary rounded-br-xl" />

                      {/* Scan Line */}
                      {isScanning && !scanResult && (
                        <div className="absolute w-full h-0.5 bg-secondary/50 shadow-[0_0_15px_rgba(0,137,192,0.8)] animate-scan top-0" />
                      )}
                    </div>
                  </div>

                  {/* Status Overlay */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                      detectedFaces > 0 ? "bg-emerald-500 text-white" : "bg-black/60 text-white/70 backdrop-blur-md border border-white/10"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full bg-white", detectedFaces > 0 ? "animate-pulse" : "opacity-50")} />
                      {detectedFaces > 0 ? 'Face Locked' : 'Searching for Face'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-secondary/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative p-8 rounded-full bg-muted border border-border">
                      <User className="w-16 h-16 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="text-center px-6">
                    <p className="text-xl font-bold text-foreground">Terminal Ready</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                      Please select the attendance type below to activate the facial recognition scanner.
                    </p>
                  </div>
                </div>
              )}

              {/* Success Notification */}
              {scanResult === 'success' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in zoom-in duration-300">
                  <div className="text-center px-8 py-10 rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                    <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="mt-6 text-2xl font-black text-white tracking-tight">Success!</h3>
                    <p className="text-lg font-bold text-white/90 mt-1">{lastAttendance?.name}</p>
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mt-2">{lastAttendance?.type.replace('_', ' ')} Recorded</p>
                  </div>
                </div>
              )}

              {/* Matching Status */}
              {scanResult === 'scanning' && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
                  <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-secondary text-white font-black uppercase tracking-widest text-xs shadow-xl animate-bounce">
                    <Shield className="w-4 h-4" />
                    Analyzing Bio-Data...
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6 mt-8">
              {!isScanning ? (
                <div className="flex flex-wrap justify-center gap-4 w-full max-w-md">
                  <button
                    onClick={() => toggleScanning('time_in')}
                    disabled={isModelLoading}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-bold transition-all shadow-lg shadow-secondary/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isModelLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                    Time In
                  </button>
                  <button
                    onClick={() => toggleScanning('time_out')}
                    disabled={isModelLoading}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold border border-border transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isModelLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                    Time Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toggleScanning(null)}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
                >
                  <Square className="w-5 h-5" />
                  Cancel Scanning
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-md dark:shadow-none dark:bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">Terminal Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group hover:bg-emerald-500/15 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-foreground text-sm">Present</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.present}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 group hover:bg-amber-500/15 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-foreground text-sm">Late</span>
                  </div>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.late}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/20 group hover:bg-red-500/15 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-foreground text-sm">Absent</span>
                  </div>
                  <span className="text-2xl font-black text-red-600 dark:text-red-400 text-muted-foreground/30">{stats.absent}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md dark:shadow-none dark:bg-card/50 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">Last Verified</CardTitle>
            </CardHeader>
            <CardContent>
              {lastAttendance ? (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/5 border border-secondary/10 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-secondary/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                    <div className="relative w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/20">
                      <User className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <p className="font-black text-foreground">{lastAttendance.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{lastAttendance.time}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{lastAttendance.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-muted/30 border border-dashed border-border opacity-60">
                  <AlertCircle className="w-8 h-8 text-muted-foreground/40" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No recent Activity</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-md dark:shadow-none dark:bg-card/50 overflow-hidden">
        <CardHeader className="pb-0 pt-6 px-6">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-secondary" />
            Recent Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Employee</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {logs.length > 0 ? logs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center font-black text-secondary text-xs border border-secondary/5">
                          {log.employer_registration?.image ? (
                            <img src={log.employer_registration.image} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            log.employer_name?.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-secondary transition-colors">{log.employer_name || log.employer_registration?.employer_name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{log.employer_position || log.employer_registration?.employer_position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-foreground">
                        {new Date(log.created_at || log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        log.type === 'time_in' ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                      )}>
                        {log.type === 'time_in' ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                        {log.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        (log.status === 'present' || log.status === 'on_time') && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        log.status === 'late' && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        log.status === 'absent' && "bg-red-500/10 text-red-600 dark:text-red-400"
                      )}>
                        {(log.status === 'present' || log.status === 'on_time') && <CheckCircle2 className="w-3 h-3" />}
                        {log.status === 'late' && <Clock className="w-3 h-3" />}
                        {log.status === 'absent' && <XCircle className="w-3 h-3" />}
                        {log.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">No attendance logs found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;