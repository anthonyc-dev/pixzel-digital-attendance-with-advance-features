'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Square
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const attendanceLogs = [
  { id: 1, name: 'John Doe', time: '09:00 AM', status: 'present', method: 'Face Recognition', image: 'JD' },
  { id: 2, name: 'Sarah Smith', time: '09:05 AM', status: 'present', method: 'Face Recognition', image: 'SS' },
  { id: 3, name: 'Mike Johnson', time: '09:12 AM', status: 'present', method: 'Face Recognition', image: 'MJ' },
  { id: 4, name: 'Emily Brown', time: '09:30 AM', status: 'late', method: 'Face Recognition', image: 'EB' },
  { id: 5, name: 'David Wilson', time: '--:--', status: 'absent', method: '--', image: 'DW' },
];

const AttendancePage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | 'scanning' | null>(null);
  const [lastAttendance, setLastAttendance] = useState<{name: string, time: string} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const toggleScanning = () => {
    if (!isScanning) {
      startCamera();
      setScanResult('scanning');
    } else {
      stopCamera();
      setScanResult(null);
    }
    setIsScanning(!isScanning);
  };

  const simulateAttendance = () => {
    setScanResult('scanning');
    setTimeout(() => {
      setScanResult('success');
      setLastAttendance({ name: 'John Doe', time: new Date().toLocaleTimeString() });
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">Face Recognition Attendance System</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border border-border">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">System Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-md dark:shadow-none dark:bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Camera className="w-5 h-5 text-secondary" />
              Face Recognition Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video max-w-lg mx-auto rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border">
              {isScanning && videoRef.current ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="p-6 rounded-full bg-muted">
                    <User className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-muted-foreground font-medium">Camera not active</p>
                  <p className="text-sm text-muted-foreground/70">Click Start to begin scanning</p>
                </div>
              )}

              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-secondary/50 animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-transparent border-t-secondary" />
                </div>
              )}

              {scanResult === 'success' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <p className="mt-4 text-xl font-bold text-white">Attendance Recorded!</p>
                    <p className="text-white/80">John Doe</p>
                  </div>
                </div>
              )}

              {scanResult === 'scanning' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto animate-pulse">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-white">Scanning...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={toggleScanning}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all",
                  isScanning 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                )}
              >
                {isScanning ? (
                  <>
                    <Square className="w-5 h-5" />
                    Stop Scanning
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Scanning
                  </>
                )}
              </button>
              {isScanning && (
                <button
                  onClick={simulateAttendance}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                  Simulate
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-md dark:shadow-none dark:bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">Today&apos;s Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-emerald-500">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">Present</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">198</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-500">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">Late</span>
                  </div>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">12</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-red-500">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">Absent</span>
                  </div>
                  <span className="text-2xl font-black text-red-600 dark:text-red-400">38</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md dark:shadow-none dark:bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">Last Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {lastAttendance ? (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{lastAttendance.name}</p>
                    <p className="text-sm text-muted-foreground">{lastAttendance.time}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No recent attendance</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-md dark:shadow-none dark:bg-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-foreground">Attendance Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                          {log.image}
                        </div>
                        <span className="font-medium text-foreground">{log.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{log.time}</td>
                    <td className="py-4 px-4 text-muted-foreground">{log.method}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                        log.status === 'present' && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
                        log.status === 'late' && "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
                        log.status === 'absent' && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      )}>
                        {log.status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                        {log.status === 'late' && <Clock className="w-3 h-3" />}
                        {log.status === 'absent' && <XCircle className="w-3 h-3" />}
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
