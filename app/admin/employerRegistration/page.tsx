'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { Clock, History, Camera, X, CheckCircle, VideoOff, ScanFace, UserCheck } from 'lucide-react';
import Webcam from 'react-webcam';

// Registration history type
type RegistrationHistory = {
  id: string;
  employerName: string;
  timestamp: Date;
  status: 'success' | 'failed';
};

const EmployerRegistrationPage = () => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [isCameraOpen, setIsCameraOpen] = useState(true); // Camera is ON by default
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);

  // Mock registration history
  const [history, setHistory] = useState<RegistrationHistory[]>([
    { id: '1', employerName: 'Juan Dela Cruz', timestamp: new Date(new Date().setHours(8, 15, 0, 0)), status: 'success' },
    { id: '2', employerName: 'Maria Santos', timestamp: new Date(new Date().setHours(9, 30, 0, 0)), status: 'success' },
    { id: '3', employerName: 'Carlos Reyes', timestamp: new Date(new Date().setHours(10, 45, 0, 0)), status: 'success' },
  ]);

  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatted = useMemo(() => {
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const date = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return { time, date };
  }, [now]);

  const captureAndRegister = useCallback(() => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setIsScanning(true);
      setScanResult(null);

      // Simulate API call
      setTimeout(() => {
        setIsScanning(false);
        setScanResult('success');

        const newRecord: RegistrationHistory = {
          id: Date.now().toString(),
          employerName: 'New Employer',
          timestamp: new Date(),
          status: 'success',
        };

        setHistory(prev => [newRecord, ...prev]);

        setTimeout(() => setScanResult(null), 3000);
      }, 1500);
    }
  }, [webcamRef]);

  const toggleCamera = () => {
    setIsCameraOpen(!isCameraOpen);
    setScanResult(null);
    setIsScanning(false);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full max-w-7xl animate-in fade-in duration-500 ease-out pb-10">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Employer Registration</h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80">
              Facial recognition registration for employers
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm flex items-center justify-between min-w-[280px]">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">
                  <Clock className="w-3.5 h-3.5" />
                  {formatted.date}
                </div>
                <div className="text-2xl font-black tracking-tight text-foreground tabular-nums mt-1">{formatted.time}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: FACIAL RECOGNITION CAPTURE */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[700px]">
            <div className="relative w-full rounded-[3rem] overflow-hidden bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 shadow-xl flex-1 flex flex-col">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(0,137,192,0.06)_0%,_transparent_55%)] pointer-events-none" />

              <div className="p-8 md:p-10 flex flex-col h-full relative z-10 w-full">
                <div className="flex flex-wrap items-start justify-between gap-6 mb-8 w-full flex-shrink-0">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration Station</div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground mt-2">Facial Recognition</h2>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mt-2">
                      Position the employer's face inside the frame
                    </p>
                  </div>

                  <button
                    onClick={toggleCamera}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all",
                      isCameraOpen
                        ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                        : "bg-blue-50 dark:bg-white/5 border-blue-100 dark:border-white/10 text-[#0089C0] dark:text-white hover:bg-blue-100 dark:hover:bg-white/10"
                    )}
                  >
                    {isCameraOpen ? <X className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {isCameraOpen ? 'Close Camera' : 'Turn On Camera'}
                    </span>
                  </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full min-h-[350px]">
                  {isCameraOpen ? (
                    <div className="relative w-full h-full max-w-2xl bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group flex flex-col justify-center items-center">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                          isScanning ? "opacity-50 blur-sm" : "opacity-100"
                        )}
                      />

                      {/* Scanning Overlay Viewfinder */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="relative w-64 h-64 sm:w-80 sm:h-80 border-y-2 border-[#0089C0]/50 bg-[#0089C0]/10">
                          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#0089C0] rounded-tl-3xl -mt-0.5 -ml-0.5" />
                          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#0089C0] rounded-tr-3xl -mt-0.5 -mr-0.5" />
                          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#0089C0] rounded-bl-3xl -mb-0.5 -ml-0.5" />
                          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#0089C0] rounded-br-3xl -mb-0.5 -mr-0.5" />
                        </div>
                        {isScanning && (
                          <div className="absolute left-0 right-0 h-1 bg-[#0089C0] shadow-[0_0_20px_4px_rgba(0,137,192,0.6)] animate-scan top-1/2" />
                        )}
                      </div>

                      {/* Register Button Overlay */}
                      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end z-20">
                        {scanResult === 'success' ? (
                          <div className="bg-green-500/90 text-white px-6 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom flex-shrink-0">
                            <UserCheck className="w-5 h-5" />
                            <span className="font-bold tracking-tight text-sm">Employer Registered Successfully!</span>
                          </div>
                        ) : (
                          <button
                            disabled={isScanning}
                            onClick={captureAndRegister}
                            className="px-10 py-3.5 rounded-2xl bg-[#0089C0] hover:bg-[#007aaa] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#0089C0]/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            <ScanFace className="w-4 h-4" />
                            {isScanning ? 'Scanning Face...' : 'Register Face'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={toggleCamera}
                      className={cn(
                        "group relative w-full h-full max-w-2xl",
                        "rounded-[2rem] p-10 md:p-14",
                        "bg-[#0089C0]/5 border-2 border-[#0089C0]/20 border-dashed",
                        "hover:bg-[#0089C0]/10 hover:border-[#0089C0]/40 hover:border-solid",
                        "active:scale-[0.99]",
                        "transition-all duration-300 overflow-hidden flex flex-col items-center justify-center cursor-pointer"
                      )}
                    >
                      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#0089C0]/10 rounded-full blur-[40px]" />
                      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#0089C0]/5 rounded-full blur-[40px]" />

                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-white dark:bg-[#0089C0]/10 shadow-xl border border-white/20 dark:border-[#0089C0]/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 mb-6 relative z-10">
                        <VideoOff className="w-10 h-10 md:w-12 md:h-12 text-[#0089C0]/60 dark:text-[#0089C0]" />
                      </div>

                      <div className="relative z-10 text-center">
                        <div className="text-xl md:text-2xl font-black tracking-tighter text-[#0089C0]/80 dark:text-white/90">Camera is Inactive</div>
                        <div className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#0089C0]/60 dark:text-white/50">
                          Click to enable facial recognition scanner
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-white/10 w-full flex-shrink-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                    Scanner Status
                    {isCameraOpen ? (
                      <span className="ml-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
                      </span>
                    ) : (
                      <span className="ml-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500" /> Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 hidden sm:block">
                    Press Register Face to capture &amp; enroll employer
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REGISTRATION HISTORY */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            <div className="p-7 rounded-[2.5rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm flex-1 flex flex-col h-[700px]">
              <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <div className="p-3 rounded-2xl bg-[#0089C0]/10 border border-[#0089C0]/20">
                  <History className="w-5 h-5 text-[#0089C0]" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-foreground">Registration History</h3>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mt-1">
                    Facial recognition registration logs
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm font-medium">
                    No employers registered yet today.
                  </div>
                ) : (
                  history.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl border bg-[#0089C0]/10 border-[#0089C0]/20 text-[#0089C0]">
                          <ScanFace className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">
                            Facial Recognition Registration
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mt-0.5">
                            {record.employerName} &middot; {record.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Registered</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; transform: translateY(0); }
          50% { top: 100%; transform: translateY(-100%); }
          100% { top: 0%; transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 137, 192, 0.2);
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </Layout>
  );
};

export default EmployerRegistrationPage;
