'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { Clock, History, Camera, X, CheckCircle, VideoOff, ScanFace, UserCheck, User, Briefcase, Hash, ScanLine, AlertCircle, Loader2 } from 'lucide-react';
import * as faceapi from 'face-api.js';

// Registration history type
type RegistrationHistory = {
  id: string;
  employerName: string;
  timestamp: Date;
  status: 'success' | 'failed';
  imageSrc?: string;
};

type EmployerForm = {
  employerId: string;
  employerName: string;
  employerPosition: string;
};

const EmployerRegistrationPage = () => {
  const [now, setNow] = useState<Date | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<number>(0);
  const [formData, setFormData] = useState<EmployerForm>({
    employerId: '',
    employerName: '',
    employerPosition: '',
  });

  // Mock registration history
  const [history, setHistory] = useState<RegistrationHistory[]>([
    { id: '1', employerName: 'Juan Dela Cruz', timestamp: new Date(new Date().setHours(8, 15, 0, 0)), status: 'success' },
    { id: '2', employerName: 'Maria Santos', timestamp: new Date(new Date().setHours(9, 30, 0, 0)), status: 'success' },
    { id: '3', employerName: 'Carlos Reyes', timestamp: new Date(new Date().setHours(10, 45, 0, 0)), status: 'success' },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        setModelError(null);

        const MODEL_URL = '/models';

        // Only load TinyFaceDetector for simplicity
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

        setIsModelLoading(false);
      } catch (error) {
        console.error('Failed to load face-api models:', error);
        setModelError('Using basic camera mode. Face detection unavailable.');
        setIsModelLoading(false);
      }
    };

    loadModels();

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (isModelLoading) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setTimeout(() => startDetection(), 500);
            }).catch(err => console.error("Video play error:", err));
          }
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setModelError('Camera access denied or unavailable');
      setIsCameraOpen(false);
    }
  }, [isModelLoading]);

  // Stop camera
  const stopCamera = useCallback(() => {
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
  }, []);

  // Start face detection
  const startDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    let warmUpCount = 0;
    const maxWarmUp = 5;

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      // Check if video has valid dimensions
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;

      if (!videoWidth || !videoHeight || videoRef.current.readyState < 2) {
        warmUpCount++;
        if (warmUpCount <= maxWarmUp) {
          console.log(`Warming up... ${warmUpCount}/${maxWarmUp}`);
        }
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5
          })
        );

        setDetectedFaces(detections.length);

        // Draw detections
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw face boxes
          detections.forEach((detection) => {
            const box = detection.box;

            // Draw face box with glow
            ctx.shadowColor = '#0089C0';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = '#0089C0';
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Draw corner accents
            const cornerSize = Math.max(15, Math.min(box.width, box.height) * 0.1);
            ctx.shadowBlur = 0;
            ctx.lineWidth = 4;

            // Top-left corner
            ctx.beginPath();
            ctx.moveTo(box.x, box.y + cornerSize);
            ctx.lineTo(box.x, box.y);
            ctx.lineTo(box.x + cornerSize, box.y);
            ctx.stroke();

            // Top-right corner
            ctx.beginPath();
            ctx.moveTo(box.x + box.width - cornerSize, box.y);
            ctx.lineTo(box.x + box.width, box.y);
            ctx.lineTo(box.x + box.width, box.y + cornerSize);
            ctx.stroke();

            // Bottom-left corner
            ctx.beginPath();
            ctx.moveTo(box.x, box.y + box.height - cornerSize);
            ctx.lineTo(box.x, box.y + box.height);
            ctx.lineTo(box.x + cornerSize, box.y + box.height);
            ctx.stroke();

            // Bottom-right corner
            ctx.beginPath();
            ctx.moveTo(box.x + box.width - cornerSize, box.y + box.height);
            ctx.lineTo(box.x + box.width, box.y + box.height);
            ctx.lineTo(box.x + box.width, box.y + box.height - cornerSize);
            ctx.stroke();
          });
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    }, 200);
  }, []);

  // Effect to handle camera lifecycle
  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOpen, startCamera, stopCamera]);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatted = useMemo(() => {
    if (!now) return { time: '--:--:--', date: 'Loading...' };

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
    if (!videoRef.current || detectedFaces === 0) return;

    const video = videoRef.current;

    // Create canvas from video
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageSrc = canvas.toDataURL('image/jpeg');

      setIsScanning(true);
      setScanResult(null);

      setTimeout(() => {
        setIsScanning(false);
        setScanResult('success');

        const newRecord: RegistrationHistory = {
          id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          employerName: formData.employerName,
          timestamp: new Date(),
          status: 'success',
          imageSrc: imageSrc,
        };

        const staticRegisterJson = {
          id: newRecord.id,
          employerName: newRecord.employerName,
          employerPosition: formData.employerPosition,
          timestamp: newRecord.timestamp.toISOString(),
          status: newRecord.status,
          faceDetected: true,
          image: imageSrc,
        };
        console.log('Static Register JSON:', JSON.stringify(staticRegisterJson, null, 2));

        setHistory(prev => [newRecord, ...prev]);

        setTimeout(() => setScanResult(null), 3000);
      }, 1500);
    }
  }, [detectedFaces, formData]);

  const toggleCamera = () => {
    if (isCameraOpen) {
      stopCamera();
    } else {
      startCamera();
    }
    setScanResult(null);
    setIsScanning(false);
  };

  const handleFormChange = (field: keyof EmployerForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartRegistration = () => {
    if (formData.employerId && formData.employerName && formData.employerPosition) {
      setIsModalOpen(false);
      setIsCameraOpen(true);
    }
  };

  const handleCancel = () => {
    setFormData({ employerId: '', employerName: '', employerPosition: '' });
    setIsModalOpen(false);
  };

  const handleNewRegistration = () => {
    setFormData({ employerId: '', employerName: '', employerPosition: '' });
    setIsModalOpen(true);
    setIsCameraOpen(false);
    setScanResult(null);
    setIsScanning(false);
  };

  return (
    <Layout>
      {/* Employer Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#0A0A0A] rounded-2xl sm:rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,_rgba(0,137,192,0.08)_0%,_transparent_50%)] pointer-events-none" />

            <div className="relative p-5 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#0089C0]/10 border border-[#0089C0]/20">
                  <ScanLine className="w-4 h-4 sm:w-5 sm:h-5 text-[#0089C0]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-foreground">New Registration</h2>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mt-0.5 sm:mt-1">
                    Enter employer details to begin
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                    {/* <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> */}
                    Employer ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.employerId}
                      onChange={(e) => handleFormChange('employerId', e.target.value)}
                      placeholder="Enter employer ID"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 pl-9 sm:pl-11 focus:outline-none focus:ring-2 focus:ring-[#0089C0]/20 focus:border-[#0089C0]/40 transition-all text-xs sm:text-sm font-bold text-primary dark:text-white placeholder:text-gray-700"
                    />
                    <Hash className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                    {/* <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> */}
                    Employer Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.employerName}
                      onChange={(e) => handleFormChange('employerName', e.target.value)}
                      placeholder="Enter full name"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 pl-9 sm:pl-11 focus:outline-none focus:ring-2 focus:ring-[#0089C0]/20 focus:border-[#0089C0]/40 transition-all text-xs sm:text-sm font-bold text-primary dark:text-white placeholder:text-gray-700"
                    />
                    <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                    {/* <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> */}
                    Position
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.employerPosition}
                      onChange={(e) => handleFormChange('employerPosition', e.target.value)}
                      placeholder="Enter position"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 pl-9 sm:pl-11 focus:outline-none focus:ring-2 focus:ring-[#0089C0]/20 focus:border-[#0089C0]/40 transition-all text-xs sm:text-sm font-bold text-primary dark:text-white placeholder:text-gray-700"
                    />
                    <Briefcase className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 mt-5 sm:mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-foreground text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartRegistration}
                  disabled={!formData.employerId || !formData.employerName || !formData.employerPosition}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#0089C0] hover:bg-[#007aaa] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#0089C0]/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                >
                  <ScanFace className="w-3 sm:w-4 h-3 sm:h-4" />
                  Start Scanner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl animate-in fade-in duration-500 ease-out pb-4 sm:pb-6 lg:pb-10">
        <header className="flex flex-wrap items-start sm:items-end justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-foreground">Employer Registration</h1>
              <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80">
                Facial recognition registration for employers
              </p>
            </div>
            {!isModalOpen && !isCameraOpen && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#0089C0] hover:bg-[#007aaa] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#0089C0]/30 active:scale-[0.98] transition-all flex items-center gap-1.5 sm:gap-2 w-fit cursor-pointer"
              >
                <UserCheck className="w-3 sm:w-4 h-3 sm:h-4" />
                New Registration
              </button>
            )}
          </div>

          <div className="px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm flex items-center justify-between min-w-[200px] sm:min-w-[240px] md:min-w-[280px]">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">
                <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="hidden sm:block">{formatted.date}</span>
                <span className="sm:hidden">{now ? now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-foreground tabular-nums mt-0.5">{formatted.time}</div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* LEFT COLUMN: FACIAL RECOGNITION CAPTURE */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
            <div className="relative w-full rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 shadow-xl flex-1 flex flex-col">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(0,137,192,0.06)_0%,_transparent_55%)] pointer-events-none" />

              <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col h-full relative z-10 w-full">
                <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8 w-full flex-shrink-0">
                  <div className="w-full sm:w-auto">
                    <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration Station</div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-foreground mt-1 sm:mt-2">Facial Recognition</h2>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mt-1 sm:mt-2">
                      Position the employer&apos;s face inside the frame
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-4 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#0089C0]/5 border border-[#0089C0]/20">
                      <User className="w-3 sm:w-4 h-3 sm:h-4 text-[#0089C0]" />
                      <span className="text-[10px] sm:text-xs font-bold text-foreground">{formData.employerName}</span>
                      <span className="hidden sm:block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">|</span>
                      <span className="hidden sm:block text-[10px] sm:text-xs font-bold text-muted-foreground">{formData.employerPosition}</span>
                    </div>
                  </div>

                  <button
                    onClick={toggleCamera}
                    className={cn(
                      "relative w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-all duration-300 cursor-pointer",
                      isCameraOpen
                        ? "bg-red-500"
                        : "bg-gray-200 dark:bg-white/10"
                    )}
                    aria-label={isCameraOpen ? "Close camera" : "Open camera"}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 sm:top-1 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300",
                        isCameraOpen ? "left-[calc(100%-1.25rem)] sm:left-7" : "left-0.5 sm:left-1"
                      )}
                    >
                      {isCameraOpen ? (
                        <VideoOff className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-red-500" />
                      ) : (
                        <Camera className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#0089C0]" />
                      )}
                    </span>
                  </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative w-full min-h-[250px] sm:min-h-[300px] md:min-h-[350px]">
                  {isCameraOpen ? (
                    <div className="relative w-full h-full max-w-xl sm:max-w-2xl bg-black rounded-xl sm:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group flex flex-col justify-center items-center">
                      {/* Video Element */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={cn(
                          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                          isScanning ? "opacity-50 blur-sm" : "opacity-100"
                        )}
                      />

                      {/* Canvas for face detection overlay */}
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      />

                      {/* Face Detection Status */}
                      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/60 to-transparent z-10">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className={cn(
                            "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
                            detectedFaces > 0
                              ? "bg-green-500/80 text-white"
                              : isModelLoading
                                ? "bg-yellow-500/80 text-white"
                                : "bg-[#0089C0]/60 text-white"
                          )}>
                            {isModelLoading ? (
                              <>
                                <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                                <span>Loading AI Model...</span>
                              </>
                            ) : detectedFaces > 0 ? (
                              <>
                                <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                                <span>{detectedFaces} Face{detectedFaces > 1 ? 's' : ''} Detected</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                                <span>Look at Camera</span>
                              </>
                            )}
                          </div>

                          {modelError && (
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-500/80 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest">
                              <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                              <span className="hidden sm:inline">{modelError}</span>
                              <span className="sm:hidden">Error</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Scanning Overlay Viewfinder */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className={cn(
                          "relative w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 border-y-2 border-[#0089C0]/50 bg-[#0089C0]/10",
                          detectedFaces === 0 && isCameraOpen && "animate-pulse-subtle"
                        )}>
                          <div className="absolute top-0 left-0 w-10 sm:w-12 h-10 sm:h-12 border-t-4 border-l-4 border-[#0089C0] rounded-tl-2xl sm:rounded-tl-3xl -mt-0.5 -ml-0.5" />
                          <div className="absolute top-0 right-0 w-10 sm:w-12 h-10 sm:h-12 border-t-4 border-r-4 border-[#0089C0] rounded-tr-2xl sm:rounded-tr-3xl -mt-0.5 -mr-0.5" />
                          <div className="absolute bottom-0 left-0 w-10 sm:w-12 h-10 sm:h-12 border-b-4 border-l-4 border-[#0089C0] rounded-bl-2xl sm:rounded-bl-3xl -mb-0.5 -ml-0.5" />
                          <div className="absolute bottom-0 right-0 w-10 sm:w-12 h-10 sm:h-12 border-b-4 border-r-4 border-[#0089C0] rounded-br-2xl sm:rounded-br-3xl -mb-0.5 -mr-0.5" />
                        </div>
                        {isScanning && (
                          <div className="absolute left-0 right-0 h-0.5 sm:h-1 bg-[#0089C0] shadow-[0_0_20px_4px_rgba(0,137,192,0.6)] animate-scan top-1/2" />
                        )}
                      </div>

                      {/* Register Button Overlay */}
                      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end z-20">
                        {scanResult === 'success' ? (
                          <div className="flex flex-col items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom">
                            <div className="bg-green-500/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2">
                              <UserCheck className="w-4 sm:w-5 h-4 sm:h-5" />
                              <span className="font-bold tracking-tight text-xs sm:text-sm">Employer Registered!</span>
                            </div>
                            <button
                              onClick={handleNewRegistration}
                              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                            >
                              <UserCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                              New Registration
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={isScanning || detectedFaces === 0}
                            onClick={captureAndRegister}
                            className="px-6 sm:px-10 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#0089C0] hover:bg-[#007aaa] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#0089C0]/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                          >
                            <ScanFace className="w-3 sm:w-4 h-3 sm:h-4" />
                            {isScanning ? 'Scanning...' : detectedFaces === 0 ? 'Position Face in Frame' : 'Register Face'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={toggleCamera}
                      disabled={isModelLoading}
                      className={cn(
                        "group relative w-full h-full max-w-xl sm:max-w-2xl",
                        "rounded-xl sm:rounded-[2rem] p-6 sm:p-10 md:p-14",
                        "bg-[#0089C0]/5 border-2 border-[#0089C0]/20 border-dashed",
                        "hover:bg-[#0089C0]/10 hover:border-[#0089C0]/40 hover:border-solid",
                        "active:scale-[0.99]",
                        "transition-all duration-300 overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                        isModelLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="absolute -top-16 sm:-top-24 -right-16 sm:-right-24 w-48 sm:w-72 h-48 sm:h-72 bg-[#0089C0]/10 rounded-full blur-[30px] sm:blur-[40px]" />
                      <div className="absolute -bottom-16 sm:-bottom-24 -left-16 sm:-left-24 w-48 sm:w-72 h-48 sm:h-72 bg-[#0089C0]/5 rounded-full blur-[30px] sm:blur-[40px]" />

                      <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-xl sm:rounded-[2rem] bg-white dark:bg-[#0089C0]/10 shadow-xl border border-white/20 dark:border-[#0089C0]/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 mb-4 sm:mb-6 relative z-10">
                        {isModelLoading ? (
                          <Loader2 className="w-8 sm:w-10 md:w-12 h-8 sm:w-10 md:h-12 text-[#0089C0]/60 dark:text-[#0089C0] animate-spin" />
                        ) : (
                          <VideoOff className="w-8 sm:w-10 md:w-12 h-8 sm:w-10 md:h-12 text-[#0089C0]/60 dark:text-[#0089C0]" />
                        )}
                      </div>

                      <div className="relative z-10 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter text-[#0089C0]/80 dark:text-white/90">
                          {isModelLoading ? "Loading AI Model..." : "Camera is Inactive"}
                        </div>
                        <div className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#0089C0]/60 dark:text-white/50">
                          {isModelLoading ? "Please wait..." : "Click to enable scanner"}
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 border-t border-gray-100 dark:border-white/10 w-full flex-shrink-0">
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center flex-wrap gap-2">
                    <span>Scanner Status</span>
                    {isModelLoading ? (
                      <span className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                        <Loader2 className="w-2 sm:w-2.5 h-2 sm:h-2.5 animate-spin" /> Loading AI
                      </span>
                    ) : isCameraOpen ? (
                      <span className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20">
                        <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-gray-500" /> Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 hidden sm:block">
                    {isModelLoading ? "Waiting for AI model..." : isCameraOpen ? (detectedFaces > 0 ? "Face detected - Ready to register" : "Position your face in the frame") : "Enable camera to scan"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REGISTRATION HISTORY */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 md:p-7 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm flex-1 flex flex-col min-h-[300px] sm:min-h-[400px] lg:min-h-[700px]">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-shrink-0">
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#0089C0]/10 border border-[#0089C0]/20">
                  <History className="w-4 sm:w-5 h-4 sm:h-5 text-[#0089C0]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-black tracking-tight text-foreground">Registration History</h3>
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mt-0.5 sm:mt-1">
                    Facial recognition logs
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 text-muted-foreground text-xs sm:text-sm font-medium">
                    No employers registered yet today.
                  </div>
                ) : (
                  history.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border bg-[#0089C0]/10 border-[#0089C0]/20 overflow-hidden flex items-center justify-center text-[#0089C0]">
                          {record.imageSrc ? (
                            <img src={record.imageSrc} alt="Captured" className="w-full h-full object-cover" />
                          ) : (
                            <ScanFace className="w-5 h-5 sm:w-6 sm:h-6" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                            Facial Recognition
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mt-0.5">
                            {record.employerName} &middot; {record.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 flex-shrink-0">
                        <CheckCircle className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest hidden sm:block">Registered</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { top: 0%; transform: translateY(0); }
          50% { top: 100%; transform: translateY(-100%); }
          100% { top: 0%; transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
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
