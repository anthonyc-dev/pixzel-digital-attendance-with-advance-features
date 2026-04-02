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
import * as faceapi from 'face-api.js';

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
}

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
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([
    { id: 1, name: 'John Doe', time: '09:00 AM', type: 'in' },
    { id: 2, name: 'Jane Smith', time: '09:05 AM', type: 'in' },
    { id: 3, name: 'Mike Johnson', time: '06:00 PM', type: 'out' },
    { id: 4, name: 'Sarah Williams', time: '06:00 PM', type: 'out' },
    { id: 5, name: 'Robert Brown', time: '06:00 PM', type: 'out' },
    { id: 6, name: 'Emily Davis', time: '06:00 PM', type: 'out' },
    { id: 7, name: 'David Miller', time: '06:00 PM', type: 'out' },
    { id: 8, name: 'Lisa Anderson', time: '09:15 AM', type: 'in' },
    { id: 9, name: 'James Wilson', time: '09:20 AM', type: 'in' },
    { id: 10, name: 'Maria Garcia', time: '06:15 PM', type: 'out' },
  ]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        setModelError(null);

        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

        setIsModelLoading(false);
      } catch (error) {
        console.error('Failed to load face-api models:', error);
        setModelError('Face detection unavailable');
        setIsModelLoading(false);
      }
    };

    loadModels();
  }, []);

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

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

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

  //Time in and time out face detection api call
  const confirmAttendance = useCallback(async () => {
    if (!capturedPhoto || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const img = await faceapi.bufferToImage(
        await (await fetch(capturedPhoto)).blob()
      );

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setCameraError('No face detected. Please try again.');
        setIsProcessing(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor }),
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        const newRecord: AttendanceRecord = {
          id: Date.now(),
          name: data.employer_name,
          time: formattedTime,
          type: data.type === 'time_in' ? 'in' : 'out',
          photo: capturedPhoto,
          employer_id: data.employer_id,
        };
        setAttendanceLog((prev) => [newRecord, ...prev]);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          setIsScanning(false);
          setIsCaptured(false);
          setCapturedPhoto(null);
        }, 1500);
      } else {
        setCameraError(result.message || 'Attendance failed. Please try again.');
      }
    } catch (error) {
      console.error('Attendance error:', error);
      setCameraError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [capturedPhoto, formattedTime]);

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


  // ... existing state variables

  const handleRecordClick = (log: AttendanceRecord) => {
    // Store the selected record data in localStorage or state management
    console.log("User info", log)
    // Navigate to user record page
    router.push('/mainPage/userRecord');
  };


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Header ── */}
      <Header realTimeClock={formattedTime} />

      <main className="flex-1 p-6">
        <div className="space-y-6">

          {/* ── Title ── */}
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-muted-foreground">{currentDate}</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              Take Photo for Attendance
            </h1>
          </div>

          <div className="w-full flex justify-center px-4">
            <div className="w-full max-w-5xl flex flex-col justify-center lg:flex-row gap-7 space-x-10">

              {/* LEFT SECTION (Camera + Actions) */}
              <div className="flex flex-col gap-5 w-full lg:w-150 lg:shrink-0">

                {/* Camera / Preview Area */}
                <div className="relative w-full rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border min-h-105">

                  <canvas ref={canvasRef} className="hidden" />

                  {/* Video / Photo Frame */}
                  <div className="relative w-full h-105 overflow-hidden rounded-xl">

                    {/* Live Camera */}
                    {isScanning && !isCaptured && !cameraError && (
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

                  {/* Idle Placeholder */}
                  {!isScanning && !showSuccess && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 backdrop-blur-sm">
                      <div className="p-8 rounded-full bg-muted/60 border border-border">
                        <CameraIcon className="w-20 h-20 text-muted-foreground" />
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        Ready to Take Photo
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tap Time In or Time Out to start
                      </p>
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
                        className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                      >
                        <AlarmClockCheck className="w-5 h-5" />
                        Time In
                      </Button>

                      <Button
                        onClick={() => handleAttendance('out')}
                        className="flex items-center gap-2 bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                      >
                        <AlarmClockOff className="w-5 h-5" />
                        Time Out
                      </Button>
                    </>
                  )}

                  {isScanning && !isCaptured && (
                    <>
                      <Button
                        onClick={capturePhoto}
                        className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                      >
                        <Camera className="w-5 h-5" />
                        Take Photo
                      </Button>

                      <Button
                        onClick={cancelAttendance}
                        className="flex items-center gap-2 bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                      >
                        <Undo2 className="w-5 h-5" />
                        Cancel
                      </Button>
                    </>
                  )}

                  {isCaptured && !showSuccess && (
                    <>
                      <Button
                        onClick={confirmAttendance}
                        className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Confirm
                      </Button>

                      <Button
                        onClick={retakePhoto}
                        variant={'outline'}
                        className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm bg-muted text-foreground border border-border hover:bg-card transition-colors"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Retake
                      </Button>

                      <Button
                        onClick={cancelAttendance}
                        className="flex items-center gap-2 bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                      >
                        <Undo2 className="w-5 h-5" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT SECTION (Activity Log) */}
              <div className="w-full lg:w-150 lg:shrink-0 mt-8 lg:mt-0">

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
                            className="flex items-center justify-between p-2 rounded-xl bg-card border border-border hover:border-secondary/50 transition-all duration-200"
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
                                Recorded
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
                            Show More

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