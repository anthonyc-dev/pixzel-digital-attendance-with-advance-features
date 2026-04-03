'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CheckCircle2,
  LogIn,
  LogOut,
  RotateCcw,
  CameraIcon,
  AlarmClockCheck,
  AlarmClockOff,
  Undo2,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Header from '@/components/mainPage/Header';

interface AttendanceRecord {
  id: number;
  name: string;
  time: string;
  type: 'in' | 'out';
  photo?: string;
  employer_id?: string;
  match_percentage?: number;
}

// Type for faceapi module
type FaceAPI = typeof import('@vladmandic/face-api');

const AttendancePage = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<'in' | 'out'>('in');
  const [showSuccess, setShowSuccess] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recordSearch, setRecordSearch] = useState('');
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('Scanning...');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);
  const [faceapi, setFaceapi] = useState<FaceAPI | null>(null);
  const [currentMatchPercentage, setCurrentMatchPercentage] = useState<number | null>(null);

  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        const response = await fetch('/api/attendance');
        if (response.ok) {
          const data = await response.json();
          const mappedLogs: AttendanceRecord[] = data.map((log: any) => ({
            id: log.id,
            name: log.employer_registration?.employer_name || log.employer_name || 'Unknown',
            time: new Date(log.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            type: log.type === 'time_in' ? 'in' : 'out',
            photo: log.employer_registration?.image || undefined,
            employer_id: log.employer_registration?.employer_id || log.employer_id,
          }));
          setAttendanceLog(mappedLogs);
        }
      } catch (error) {
        console.error('Failed to fetch initial logs:', error);
      }
    };
    fetchInitialLogs();
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  // Load faceapi module dynamically
  useEffect(() => {
    const loadFaceAPI = async () => {
      try {
        const faceapiModule = await import('@vladmandic/face-api');
        setFaceapi(faceapiModule);
      } catch (error) {
        console.error('Failed to load face-api:', error);
        setModelError('Face detection unavailable');
        setIsModelLoading(false);
      }
    };

    loadFaceAPI();
  }, []);

  // Load models once faceapi is available
  useEffect(() => {
    const loadModels = async () => {
      if (!faceapi) return;

      try {
        setIsModelLoading(true);
        setModelError(null);

        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        setIsModelLoading(false);
      } catch (error) {
        console.error('Failed to load face-api models:', error);
        setModelError('Face detection unavailable');
        setIsModelLoading(false);
      }
    };

    loadModels();
  }, [faceapi]);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  useEffect(() => {
    // Start camera on mount if models are ready
    if (!isModelLoading && !modelError && faceapi) {
      startCamera();
    }
    return () => stopCamera();
  }, [isModelLoading, modelError, startCamera, stopCamera, faceapi]);

  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
    }
  }, []);

  const captureCurrentFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  const handleAttendance = useCallback(
    async (type: 'in' | 'out') => {
      setAttendanceType(type);
      setShowSuccess(false);
      setCapturedPhoto(null);
      setIsCaptured(false);
      setCameraError(null);
      setIsScanning(true);
      setScanStatus('Scanning...');
      // Camera is initiated on mount, but we ensure it's running
      if (!streamRef.current) {
        await startCamera();
      }
    },
    [startCamera],
  );

  const isProcessingRef = useRef(false);
  const lastScanTimeRef = useRef(0);

  const processAttendanceDescriptor = useCallback(async (descriptor: number[]) => {
    if (isProcessingRef.current || showSuccess) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    setScanStatus('Verifying face...');

    try {
      console.log('Sending descriptor to API...', { type: attendanceType });
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descriptor,
          type: attendanceType === 'in' ? 'time_in' : 'time_out'
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        const data = result.data;
        const currentPhoto = captureCurrentFrame();

        // Use fresh time for the records
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const newRecord: AttendanceRecord = {
          id: Date.now(),
          name: data.employer_name,
          time: timeStr,
          type: data.type === 'time_in' ? 'in' : 'out',
          photo: data.image || undefined,
          employer_id: data.employer_id,
          match_percentage: data.match_percentage,
        };

        setAttendanceLog((prev) => [newRecord, ...prev]);
        setCapturedPhoto(data.image || currentPhoto);
        setCurrentMatchPercentage(data.match_percentage);
        setIsCaptured(true);
        setShowSuccess(true);
        setIsProcessing(false);
        setIsScanning(false); // Stop scanning after success

        // Keep camera running and resume readiness after success
        setTimeout(() => {
          setShowSuccess(false);
          setIsCaptured(false);
          setCapturedPhoto(null);
          setCurrentMatchPercentage(null);
          isProcessingRef.current = false;
          setIsProcessing(false);
        }, 3000);
      } else {
        if (result.message === "Face not match") {
          setScanStatus('Face not recognized. Keep looking at the camera.');
          toast.error("Face not recognized. Please try again.");
          isProcessingRef.current = false;
          setIsProcessing(false);
        } else if (result.message && (result.message.includes("Already recorded") || result.message.includes("already complete"))) {
          const data = result.data;
          if (data && data.image) {
            setCapturedPhoto(data.image);
            setIsCaptured(true);
            setCurrentMatchPercentage(data.match_percentage);
          }
          toast.info(result.message);
          setIsProcessing(false);
          setIsScanning(false);

          setTimeout(() => {
            setIsCaptured(false);
            setCapturedPhoto(null);
            setCurrentMatchPercentage(null);
            isProcessingRef.current = false;
          }, 3000);
        } else {
          setCameraError(result.message || 'Attendance failed.');
          toast.error(result.message || 'Attendance failed.');
          setIsScanning(false);
          isProcessingRef.current = false;
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error('Attendance error:', error);
      setCameraError('An error occurred during verification.');
      toast.error('An error occurred during verification.');
      setIsScanning(false);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [attendanceType, showSuccess, stopCamera, captureCurrentFrame]);

  // Auto-scan logic
  useEffect(() => {
    let animationFrameId: number;
    let isMounted = true;

    const scanLoop = async () => {
      // Check if we should stop or skip this frame
      if (!faceapi || !isScanning || isProcessingRef.current || showSuccess || !videoRef.current || !isMounted || isModelLoading) {
        if (isScanning && isMounted) {
          animationFrameId = requestAnimationFrame(scanLoop);
        }
        return;
      }

      const video = videoRef.current;
      if (video.readyState === 4) {
        const now = Date.now();
        if (now - lastScanTimeRef.current > 600) {
          lastScanTimeRef.current = now;
          try {
            const detection = await faceapi
              .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detection && isMounted && !isProcessingRef.current) {
              setScanStatus('Face detected! Verifying...');
              await processAttendanceDescriptor(Array.from(detection.descriptor));
            } else if (!isProcessingRef.current) {
              setScanStatus('Scanning... Please align your face.');
            }
          } catch (err) {
            console.error("Face detection error:", err);
          }
        }
      }

      if (isScanning && isMounted) {
        animationFrameId = requestAnimationFrame(scanLoop);
      }
    };

    if (isScanning && !showSuccess) {
      scanLoop();
    }

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning, showSuccess, isModelLoading, processAttendanceDescriptor, faceapi]);

  const retakePhoto = useCallback(async () => {
    setIsCaptured(false);
    setCapturedPhoto(null);
    await startCamera();
  }, [startCamera]);

  const cancelAttendance = useCallback(() => {
    setIsScanning(false);
    setIsCaptured(false);
    setCapturedPhoto(null);
    setCurrentMatchPercentage(null);
    setCameraError(null);
  }, []);

  // Filter attendance records based on search
  const filteredAttendanceLog = attendanceLog.filter(log =>
    log.name.toLowerCase().includes(recordSearch.toLowerCase()) ||
    log.time.toLowerCase().includes(recordSearch.toLowerCase()) ||
    log.type.toLowerCase().includes(recordSearch.toLowerCase())
  );

  // Determine which records to display based on showAllRecords state
  const displayedRecords = showAllRecords
    ? filteredAttendanceLog
    : filteredAttendanceLog.slice(0, 7);

  const clearSearch = () => {
    setRecordSearch('');
  };

  const toggleShowRecords = () => {
    setShowAllRecords(!showAllRecords);
  };

  const handleRecordClick = (log: AttendanceRecord) => {
    // Store the selected record data in localStorage
    localStorage.setItem('selectedUser', JSON.stringify({
      name: log.name,
      employer_id: log.employer_id,
      photo: log.photo,
      // You can add more fields if available in the log object
    }));

    // Navigate to user record page
    router.push('/mainPage/userRecord');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Header ── */}
      <Header realTimeClock={formattedTime} currentDate={currentDate} />

      <main className="flex-1 p-6">
        <div className="space-y-6">

          <div className="w-full flex justify-center px-4">
            <div className="w-full max-w-7xl flex flex-col lg:flex-row items-start gap-10">

              {/* LEFT SECTION (Camera + Actions) */}
              <div className="flex flex-col gap-6 w-full lg:flex-1">

                {/* Camera / Preview Area */}
                <div className="relative w-full rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border min-h-[500px]">

                  <canvas ref={canvasRef} className="hidden" />

                  {/* Video / Photo Frame */}
                  <div className="relative w-full h-[500px] overflow-hidden rounded-xl">

                    {/* Live Camera Preview */}
                    {!isCaptured && !cameraError && (
                      <video
                        ref={videoRefCallback}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}

                    {/* Captured Photo */}
                    {isCaptured && capturedPhoto && (
                      <Image
                        src={capturedPhoto}
                        alt="Captured"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>

                  {/* Scanning Indicator Overlay */}
                  {isScanning && !isCaptured && !isProcessing && !showSuccess && (
                    <div className="absolute inset-x-0 top-0 p-4 z-10">
                      <div className="bg-background/60 backdrop-blur-md border border-border/50 rounded-lg px-4 py-2 flex items-center gap-3 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                        <span className="text-sm font-medium text-foreground">{scanStatus}</span>
                      </div>
                    </div>
                  )}

                  {/* Visual Guide Overlay */}
                  {isScanning && !isCaptured && !showSuccess && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-80 h-80 border-2 border-secondary/30 rounded-full flex items-center justify-center">
                        <div className="w-72 h-72 border border-secondary/20 rounded-full border-dashed animate-spin-slow" />
                      </div>
                    </div>
                  )}

                  {/* Camera Error */}
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center bg-muted">
                      <Camera className="w-12 h-12 text-destructive" />
                      <p className="text-sm font-medium text-destructive">
                        {cameraError}
                      </p>
                    </div>
                  )}

                  {/* Success Overlay */}
                  {showSuccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto shadow-lg animate-in zoom-in duration-300">
                          <CheckCircle2 className="w-12 h-12 text-secondary-foreground" />
                        </div>
                        <p className="mt-4 text-xl font-bold text-foreground">
                          {attendanceType === 'in'
                            ? 'Time In Recorded!'
                            : 'Time Out Recorded!'}
                        </p>
                        <p className="text-muted-foreground mt-1 tabular-nums">
                          {formattedTime}
                        </p>
                        {currentMatchPercentage !== null && (
                          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-secondary/20 rounded-full border border-secondary/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                            <span className="text-sm font-semibold text-secondary">
                              {currentMatchPercentage}% Recognition Match
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Already Recorded Feedback Overlay */}
                  {isCaptured && !showSuccess && !isProcessing && currentMatchPercentage !== null && (
                    <div className="absolute inset-x-0 bottom-10 flex justify-center z-20">
                      <div className="bg-background/80 backdrop-blur-md border border-border px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Identity Verified</span>
                          <span className="text-sm font-semibold text-foreground">{currentMatchPercentage}% Recognition Match</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-secondary mx-auto" />
                        <p className="mt-4 text-lg font-semibold text-foreground">
                          Processing...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Verifying face and recording attendance
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 flex-wrap">

                  {!isScanning && !isCaptured && !showSuccess && (
                    <>
                      <Button
                        onClick={() => handleAttendance('in')}
                        className="flex items-center gap-3 bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity h-10 px-5 font-bold"
                      >
                        <AlarmClockCheck className="w-6 h-6" />
                        Time In
                      </Button>

                      <Button
                        onClick={() => handleAttendance('out')}
                        className="flex items-center gap-3 bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity h-10 px-5 font-bold"
                      >
                        <AlarmClockOff className="w-6 h-6" />
                        Time Out
                      </Button>
                    </>
                  )}

                  {isScanning && !isCaptured && (
                    <Button
                      onClick={cancelAttendance}
                      className="flex items-center gap-3 bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity h-10 px-5 font-bold"
                    >
                      <Undo2 className="w-6 h-6" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* RIGHT SECTION (Activity Log) */}
              <div className="w-full lg:flex-1 mt-8 lg:mt-0">

                <div className='flex justify-between items-center mb-4 gap-3'>
                  <h2 className="text-md font-semibold text-foreground">
                    Recent Activity
                  </h2>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name, time, or type..."
                      value={recordSearch}
                      onChange={(e) => {
                        setRecordSearch(e.target.value);
                        setShowAllRecords(false); // Reset show all when searching
                      }}
                      className="w-full pl-9 pr-8 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                    />
                    {recordSearch && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Results Summary */}
                {recordSearch && (
                  <div className="mb-3 text-sm text-muted-foreground">
                    Found {filteredAttendanceLog.length} record(s) for &ldquo;{recordSearch}&rdquo;
                  </div>
                )}

                <div className="space-y-2">
                  {displayedRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl bg-muted/30">
                      <div className="p-4 rounded-full bg-muted border border-border mb-3">
                        <CameraIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="font-semibold text-foreground">
                        {recordSearch ? 'No matching records found' : 'No records yet'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {recordSearch
                          ? 'Try a different search term'
                          : 'The attendance activity will appear here'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className={`space-y-2 ${!showAllRecords && filteredAttendanceLog.length > 7 ? 'max-h-125 overflow-y-auto' : ''}`}>
                        {displayedRecords.map((log) => (
                          <div
                            key={log.id}
                            onClick={() => handleRecordClick(log)}
                            className="flex items-center justify-between p-2 rounded-xl bg-card border border-border hover:border-secondary/50 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {log.photo ? (
                                <Image
                                  src={log.photo}
                                  alt="Attendance photo"
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover w-10 h-10 border border-border"
                                  unoptimized
                                />
                              ) : (
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center border border-border shrink-0 ${log.type === 'in'
                                    ? 'bg-secondary/10'
                                    : 'bg-destructive/10'
                                    }`}
                                >
                                  {log.type === 'in' ? (
                                    <LogIn className="w-5 h-5 text-secondary" />
                                  ) : (
                                    <LogOut className="w-5 h-5 text-destructive" />
                                  )}
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground text-sm truncate">{log.name}</p>
                                <p className="text-muted-foreground text-xs">
                                  {log.type === 'in' ? 'Time In' : 'Time Out'}
                                </p>
                              </div>
                            </div>

                            <div className="text-right ml-4 shrink-0">
                              <p className="font-semibold text-foreground tabular-nums text-sm">
                                {log.time}
                              </p>
                              <p
                                className={`text-xs font-medium ${log.type === 'in'
                                  ? 'text-secondary'
                                  : 'text-destructive'
                                  }`}
                              >
                                Recorded {log.match_percentage ? `(${log.match_percentage}% match)` : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Show More / Show Less Button */}
                      {filteredAttendanceLog.length > 7 && (
                        <div className="flex justify-center">
                          <Button
                            onClick={toggleShowRecords}
                            className="flex items-center gap-2 px-6 py-2 hover:text-secondary/70 transition-all duration-200 text-secondary bg-transparent"
                          >
                            {showAllRecords ? 'Show Less' : 'Show More'}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AttendancePage;