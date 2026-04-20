'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { History, Camera, X, CheckCircle, VideoOff, ScanFace, UserCheck, User, Briefcase, ScanLine, AlertCircle, Loader2, CheckCircle2, PhilippinePeso } from 'lucide-react';
import Image from 'next/image';
import { ENV } from '@/lib/api';

let faceapi: typeof import('@vladmandic/face-api') | null = null;

// Registration history type
type RegistrationHistory = {
  id: string;
  employerId: string;
  employerName: string;
  timestamp: Date;
  status: 'success' | 'failed';
  imageSrc?: string;
};

interface EmployerData {
  id: string;
  employer_id: string;
  employer_name: string;
  employer_position: string;
  image?: string;
  created_at?: string;
}

type EmployerForm = {
  employerId: string;
  employerName: string;
  employerPosition: string;
  contactNo: string;
  email: string;
  password: string;
  address: string;
  gender: string;
  birthDay: string;
  baseSalary: string;
};

const RegistrationContent = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'work'>('personal');
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<number>(0);
  const [formData, setFormData] = useState<EmployerForm>({
    employerId: '',
    employerName: '',
    employerPosition: '',
    contactNo: '',
    email: '',
    password: '',
    address: '',
    gender: '',
    birthDay: '',
    baseSalary: '',
  });
  const [showAllHistory, setShowAllHistory] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams?.get('edit');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const playSuccessSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      const createTone = (frequency: number, startTime: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.25) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      createTone(523.25, now, 0.15, 'sine', 0.25);
      createTone(659.25, now + 0.08, 0.15, 'sine', 0.25);
      createTone(783.99, now + 0.16, 0.2, 'sine', 0.25);
      createTone(1046.50, now + 0.28, 0.35, 'sine', 0.2);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Registration history
  const [history, setHistory] = useState<RegistrationHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`${ENV.API_URL}/registration`);
      if (response.ok) {
        const result = await response.json();
        const historyWithDates = result.data.map((item: EmployerData) => ({
          id: item.id,
          employerId: item.employer_id,
          employerName: item.employer_name,
          timestamp: new Date(item.created_at || new Date().toISOString()),
          status: 'success',
          imageSrc: item.image,
        }));
        setHistory(historyWithDates.reverse());
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load history and check for edit mode
  useEffect(() => {
    fetchHistory();

    if (!searchParams) return;

    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const pos = searchParams.get('pos');

    if (editId && id && name && pos) {
      setFormData({
        employerId: id,
        employerName: name,
        employerPosition: pos,
        contactNo: searchParams.get('contact') || '',
        email: searchParams.get('email') || '',
        address: searchParams.get('address') || '',
        gender: searchParams.get('gender') || '',
        birthDay: searchParams.get('birthDay') || '',
        baseSalary: searchParams.get('salary') || '',
        password: '',
      });
      setIsModalOpen(true);
      setIsCameraOpen(false);
    }

  }, [searchParams, editId, fetchHistory]);

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

        faceapi = await import('@vladmandic/face-api');
        const MODEL_URL = '/models';

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (!faceapi) return;
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.4
          })
        );

        setDetectedFaces(detections.length);

        // Draw detections
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw face markers
          detections.forEach((detection) => {
            const box = detection.box;
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            const radiusX = box.width / 2;
            const radiusY = box.height * 0.6; // Slightly taller for face shape

            // Draw oval face marker with glow
            ctx.shadowColor = '#C01148';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#C01148';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dashed line for high-tech look

            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash

            // Draw scanner corners relative to the detection
            ctx.lineWidth = 3;
            ctx.shadowBlur = 0;

            // Top-left
            ctx.beginPath();
            ctx.moveTo(centerX - radiusX * 0.8, centerY - radiusY * 0.6);
            ctx.lineTo(centerX - radiusX, centerY - radiusY * 0.8);
            ctx.stroke();

            // Additional tech markers could go here
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

  const captureAndRegister = useCallback(async () => {
    if (isScanning || !videoRef.current || detectedFaces === 0) return;

    setIsScanning(true);
    setScanResult(null);

    // Skip duplicate checks if we are editing an existing employer
    if (!editId) {
      try {
        const checkResponse = await fetch(`${ENV.API_URL}/registration`);
        if (checkResponse.ok) {
          const { data: allEmployers } = await checkResponse.json();

          const isDuplicateId = allEmployers.some((emp: EmployerData) =>
            emp.employer_id.toLowerCase() === formData.employerId.toLowerCase()
          );

          const isDuplicateName = allEmployers.some((emp: EmployerData) =>
            emp.employer_name.toLowerCase() === formData.employerName.toLowerCase()
          );

          if (isDuplicateId) {
            setScanResult('error');
            showToast('Employer ID already exists!', 'error');
            setIsScanning(false);
            setTimeout(() => setScanResult(null), 3000);
            return;
          }

          if (isDuplicateName) {
            setScanResult('error');
            showToast('Employer name already exists!', 'error');
            setIsScanning(false);
            setTimeout(() => setScanResult(null), 3000);
            return;
          }
        }
      } catch (e) {
        console.error('Check duplicate failed:', e);
      }
    }

    const video = videoRef.current;

    // Create canvas from video
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror the capture to match the mirrored UI
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
      const imageSrc = canvas.toDataURL('image/jpeg');

      let faceDescriptor = null;
      try {
        if (!faceapi) return;
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          faceDescriptor = Array.from(detection.descriptor);
        } else {
          setIsScanning(false);
          setScanResult('error');
          showToast('Could not extract face descriptor. Please try again.', 'error');
          setTimeout(() => setScanResult(null), 3000);
          return;
        }
      } catch (descError) {
        console.error('Descriptor extraction error:', descError);
        setIsScanning(false);
        setScanResult('error');
        showToast('Failed to generate face descriptor.', 'error');
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      if (!faceDescriptor || faceDescriptor.length === 0) {
        setIsScanning(false);
        setScanResult('error');
        showToast('Face descriptor is invalid. Please try again.', 'error');
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      try {
        const endpoint = editId ? `${ENV.API_URL}/registration/${editId}` : `${ENV.API_URL}/registration`;
        const response = await fetch(endpoint, {
          method: editId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employer_id: formData.employerId,
            employer_name: formData.employerName,
            employer_position: formData.employerPosition,
            contact_no: formData.contactNo,
            email: formData.email,
            password: formData.password,
            address: formData.address,
            gender: formData.gender,
            birth_day: formData.birthDay,
            base_salary: formData.baseSalary,
            face_detected: true,
            status: 'present',
            image: imageSrc,
            descriptor: faceDescriptor,
          }),
        });

        if (response.ok) {
          setIsScanning(false);
          setScanResult('success');
          showToast(editId ? 'Employer updated successfully!' : 'Employer registered successfully!', 'success');
          playSuccessSound();

          if (editId) {
            setTimeout(() => router.push('/admin/employer'), 2000);
          }

          fetchHistory();

          setTimeout(() => {
            setFormData({ employerId: '', employerName: '', employerPosition: '', contactNo: '', email: '', password: '', address: '', gender: '', birthDay: '', baseSalary: '' });
            setIsModalOpen(true);
            setIsCameraOpen(false);
            setScanResult(null);
            setIsScanning(false);
          }, 2000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Registration failed (Status: ${response.status})`);
        }
      } catch (error: unknown) {
        console.error('API Error Details:', error);
        setIsScanning(false);
        setScanResult('error');
        const errorMessage = error instanceof Error ? error.message : 'Operation failed';
        showToast(errorMessage, 'error');
      } finally {
        setTimeout(() => setScanResult(null), 3000);
      }
    }
  }, [detectedFaces, formData, editId, isScanning, fetchHistory, showToast, router, playSuccessSound]);

  const toggleCamera = () => {
    setIsCameraOpen(prev => !prev);
    setScanResult(null);
    setIsScanning(false);
  };

  const handleFormChange = (field: keyof EmployerForm, value: string) => {
    let finalValue = value;

    // Apply title case to name, position, id, and address
    const textFields: (keyof EmployerForm)[] = ['employerName', 'employerPosition', 'employerId', 'address'];

    if (textFields.includes(field)) {
      finalValue = value.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleStartRegistration = () => {
    if (formData.employerId && formData.employerName && formData.employerPosition) {
      setIsModalOpen(false);
      setIsCameraOpen(true);
    }
  };

  const handleCancel = () => {
    setFormData({ employerId: '', employerName: '', employerPosition: '', contactNo: '', email: '', password: '', address: '', gender: '', birthDay: '', baseSalary: '' });
    setIsModalOpen(false);
  };

  const handleNewRegistration = () => {
    setFormData({ employerId: '', employerName: '', employerPosition: '', contactNo: '', email: '', password: '', address: '', gender: '', birthDay: '', baseSalary: '' });
    setIsModalOpen(true);
    setIsCameraOpen(false);
    setScanResult(null);
    setIsScanning(false);
  };

  return (
    <>
      {/* Employer Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative w-full max-w-[420px] bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,_rgba(192,17,72,0.05)_0%,_transparent_50%)] pointer-events-none" />

            <div className="relative p-6 sm:p-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                  <ScanFace className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground leading-none">Employer Registration</h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mt-1.5">
                    Fill in details to begin scan
                  </p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl mb-6">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer",
                    activeTab === 'personal'
                      ? "bg-white dark:bg-white/10 text-secondary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  Personal
                </button>
                <button
                  onClick={() => setActiveTab('work')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer",
                    activeTab === 'work'
                      ? "bg-white dark:bg-white/10 text-secondary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Work
                </button>
              </div>

              <div className="space-y-6">
                {activeTab === 'personal' ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 ml-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.employerName}
                        onChange={(e) => handleFormChange('employerName', e.target.value)}
                        placeholder="Enter full name"
                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-xs font-bold text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 ml-1">
                          Gender
                        </label>
                        <div className="relative group">
                          <select
                            value={formData.gender}
                            onChange={(e) => handleFormChange('gender', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-xs font-bold text-foreground appearance-none shadow-sm cursor-pointer dark:[&>option]:bg-[#0A0A0A] dark:[&>option]:text-white"
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          <ScanLine className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 ml-1">
                          Birth Date
                        </label>
                        <input
                          type="date"
                          value={formData.birthDay}
                          onChange={(e) => handleFormChange('birthDay', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-xs font-bold text-foreground shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 ml-1">
                          Contact
                        </label>
                        <input
                          type="text"
                          value={formData.contactNo}
                          onChange={(e) => handleFormChange('contactNo', e.target.value)}
                          placeholder="Phone number"
                          className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-xs font-bold text-foreground shadow-sm"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 ml-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          placeholder="Email address"
                          className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-xs font-bold text-foreground shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 ml-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Login password"
                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-xs font-bold text-foreground shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 ml-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleFormChange('address', e.target.value)}
                        placeholder="Current home address"
                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-xs font-bold text-foreground shadow-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 ml-1">
                          Registration ID
                        </label>
                        <input
                          type="text"
                          value={formData.employerId}
                          onChange={(e) => handleFormChange('employerId', e.target.value)}
                          placeholder="ID"
                          className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-xs font-bold text-foreground shadow-sm"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 ml-1">
                          Job Position
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            value={formData.employerPosition}
                            onChange={(e) => handleFormChange('employerPosition', e.target.value)}
                            placeholder="Position"
                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-xs font-bold text-foreground shadow-sm"
                          />
                          <Briefcase className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary pointer-events-none opacity-60" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 ml-1">
                        Base Salary
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={formData.baseSalary}
                          onChange={(e) => handleFormChange('baseSalary', e.target.value)}
                          placeholder="Enter monthly salary"
                          className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-xs font-bold text-foreground shadow-sm"
                        />
                        <PhilippinePeso className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary pointer-events-none opacity-60" />
                      </div>
                    </div>

                    {/* Quick validation indicator */}
                    <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/70 leading-relaxed">
                        {!formData.employerId || !formData.employerName || !formData.employerPosition
                          ? "Required fields missing. Switch to Personal tab to check Name."
                          : "All essential fields captured. You can now initialize scanner."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartRegistration}
                  disabled={!formData.employerId || !formData.employerName || !formData.employerPosition}
                  className="flex-[1.5] py-3.5 rounded-xl bg-secondary hover:opacity-90 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-secondary/30 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <ScanFace className="w-4 h-4" />
                  Initialize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
        <header className="flex items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Employer Registration</h1>
          </div>
          {!isModalOpen && !isCameraOpen && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-secondary hover:opacity-90 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-secondary/30 active:scale-[0.98] transition-all flex items-center gap-1.5 sm:gap-2 w-fit cursor-pointer"
            >
              <UserCheck className="w-3 sm:w-4 h-3 sm:h-4" />
              New Registration
            </button>
          )}
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* LEFT COLUMN: FACIAL RECOGNITION CAPTURE */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
            <div className="relative w-full rounded-2xl overflow-hidden bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 shadow-xl flex-1 flex flex-col">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(192,17,72,0.06)_0%,_transparent_55%)] pointer-events-none" />

              <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col h-full relative z-10 w-full">
                <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8 w-full flex-shrink-0">
                  <div className="w-full sm:w-auto">
                    <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registration Station</div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground mt-1 sm:mt-2">Facial Recognition</h2>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mt-1 sm:mt-2">
                      Position the employer&apos;s face inside the frame
                    </p>
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
                        <Camera className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-secondary" />
                      )}
                    </span>
                  </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative w-full min-h-[250px] sm:min-h-[300px] md:min-h-[350px]">
                  {isCameraOpen ? (
                    <div className="relative w-full h-full max-w-xl sm:max-w-2xl bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl group flex flex-col justify-center items-center">
                      {/* Video Element (Mirrored) */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={cn(
                          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300 scale-x-[-1]",
                          isScanning ? "opacity-50 blur-sm" : "opacity-100"
                        )}
                      />

                      {/* Employer Info Overlay (Bottom Left) */}
                      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/40 dark:bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-700">
                        <div className="p-1.5 rounded-lg bg-secondary/10 border border-secondary/20 shadow-inner group-hover:scale-105 transition-transform">
                          <User className="w-3 h-3 text-secondary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-white leading-none tracking-tight truncate max-w-[120px]">{formData.employerName}</span>
                          <span className="text-[7px] font-bold text-white/50 uppercase tracking-widest mt-1 truncate">{formData.employerPosition}</span>
                        </div>
                      </div>

                      {/* Canvas for face detection overlay (Mirrored) */}
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-x-[-1]"
                      />

                      {/* Face Detection Status */}
                      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/60 to-transparent z-10">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className={cn(
                            "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all",
                            detectedFaces > 0
                              ? "bg-green-500/80 text-white"
                              : isModelLoading
                                ? "bg-yellow-500/80 text-white"
                                : "bg-secondary/60 text-white"
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
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-500/80 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                              <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                              <span className="hidden sm:inline">{modelError}</span>
                              <span className="sm:hidden">Error</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Facial Silhouette Viewfinder */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                        <div className="relative w-[80%] h-[80%] flex items-center justify-center">
                          <svg
                            viewBox="0 0 200 240"
                            className={cn(
                              "w-64 sm:w-80 h-auto overflow-visible transition-all duration-700",
                              detectedFaces > 0 ? "text-green-500" : "text-secondary",
                              isScanning && "scale-110 opacity-40 blur-[2px]"
                            )}
                            fill="none"
                          >
                            <defs>
                              <filter id="face-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                              </filter>
                            </defs>

                            {/* Corner Accents */}
                            <g className="opacity-60">
                              <path d="M20 40V20H40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                              <path d="M160 20H180V40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                              <path d="M20 200V220H40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                              <path d="M160 220H180V200" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </g>

                            {/* Main Face Outline */}
                            <path
                              d="M100 20C145 20 175 55 175 100C175 150 155 200 120 225C105 235 100 240 100 240C100 240 95 235 80 225C45 200 25 150 25 100C25 55 55 20 100 20Z"
                              stroke="currentColor"
                              strokeWidth={detectedFaces > 0 ? "4" : "2"}
                              filter="url(#face-glow)"
                              strokeDasharray={detectedFaces > 0 ? "none" : "200 400"}
                              className={cn(detectedFaces === 0 && "animate-scan-path")}
                            />

                            {/* Inner Silhouette Layer */}
                            <path
                              d="M100 35C135 35 160 65 160 100C160 140 145 185 115 210C105 220 100 225 100 225C100 225 95 220 85 210C55 185 40 140 40 100C40 65 65 35 100 35Z"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeOpacity="0.4"
                              fill="currentColor"
                              fillOpacity="0.05"
                            />

                            {/* Wireframe Detail Lines */}
                            <g className="opacity-20 translate-y-[-10px]">
                              <path d="M100 35V225" stroke="currentColor" strokeWidth="0.5" />
                              <path d="M50 100H150" stroke="currentColor" strokeWidth="0.5" />
                              <path d="M60 150H140" stroke="currentColor" strokeWidth="0.5" />
                              <path d="M70 180H130" stroke="currentColor" strokeWidth="0.5" />

                              <path d="M100 35L160 100" stroke="currentColor" strokeWidth="0.5" />
                              <path d="M100 35L40 100" stroke="currentColor" strokeWidth="0.5" />
                              <path d="M100 225L160 100" stroke="currentColor" strokeWidth="0.5" />
                              <path d="M100 225L40 100" stroke="currentColor" strokeWidth="0.5" />
                            </g>

                            {/* Scanning horizontal line */}
                            <g className="animate-face-scan">
                              <line x1="30" y1="100" x2="170" y2="100" stroke="currentColor" strokeWidth="2" filter="url(#face-glow)" />
                              <rect x="25" y="98" width="150" height="4" fill="currentColor" fillOpacity="0.1" />
                            </g>
                          </svg>
                        </div>
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
                              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                            >
                              <UserCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                              New Registration
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={isScanning || detectedFaces === 0}
                            onClick={captureAndRegister}
                            className={cn(
                              "px-6 sm:px-10 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 cursor-pointer",
                              detectedFaces > 0
                                ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30"
                                : "bg-secondary hover:opacity-90 shadow-lg shadow-secondary/30"
                            )}
                          >
                            <ScanFace className="w-3 sm:w-4 h-3 sm:h-4" />
                            {isScanning ? 'Generating Descriptor...' : detectedFaces === 0 ? 'Position Face in Frame' : 'Register Face'}
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
                        "rounded-2xl p-6 sm:p-10 md:p-14",
                        "bg-secondary/5 border-2 border-secondary/20 border-dashed",
                        "hover:bg-secondary/10 hover:border-secondary/40 hover:border-solid",
                        "active:scale-[0.99]",
                        "transition-all duration-300 overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                        isModelLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="absolute -top-16 sm:-top-24 -right-16 sm:-right-24 w-48 sm:w-72 h-48 sm:h-72 bg-secondary/10 rounded-full blur-[30px] sm:blur-[40px]" />
                      <div className="absolute -bottom-16 sm:-bottom-24 -left-16 sm:-left-24 w-48 sm:w-72 h-48 sm:h-72 bg-secondary/5 rounded-full blur-[30px] sm:blur-[40px]" />

                      <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-2xl bg-white dark:bg-secondary/10 shadow-xl border border-white/20 dark:border-secondary/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 mb-4 sm:mb-6 relative z-10">
                        {isModelLoading ? (
                          <Loader2 className="w-8 sm:w-10 md:w-12 h-8 sm:w-10 md:h-12 text-secondary/60 dark:text-secondary animate-spin" />
                        ) : (
                          <VideoOff className="w-8 sm:w-10 md:w-12 h-8 sm:w-10 md:h-12 text-secondary/60 dark:text-secondary" />
                        )}
                      </div>

                      <div className="relative z-10 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-secondary">
                          {isModelLoading ? "Loading AI Model..." : "Enable Scanner"}
                        </div>
                        <div className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-secondary/70">
                          {isModelLoading ? "Please wait..." : "Click to start scanning"}
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 border-t border-gray-100 dark:border-white/10 w-full flex-shrink-0">
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center flex-wrap gap-2">
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
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hidden sm:block">
                    {isModelLoading ? "Waiting for AI model..." : isCameraOpen ? (detectedFaces > 0 ? "Face detected - Ready to register" : "Position your face in the frame") : "Enable camera to scan"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REGISTRATION HISTORY */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 md:p-7 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm flex-1 flex flex-col min-h-[300px] sm:min-h-[400px] lg:min-h-[700px]">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-shrink-0">
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-secondary/10 border border-secondary/20">
                  <History className="w-4 sm:w-5 h-4 sm:h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-bold tracking-tight text-foreground">Registration History</h3>
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mt-0.5 sm:mt-1">
                    Facial recognition logs
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 custom-scrollbar">
                {isLoadingHistory ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                            <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-6 w-20 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
                      </div>
                    ))}
                  </>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 text-muted-foreground text-xs sm:text-sm font-medium">
                    No employers registered yet today.
                  </div>
                ) : (
                  <>
                    {history.slice(0, showAllHistory ? history.length : 5).map((record) => (
                      <div
                        key={record.id}
                        className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border bg-secondary/10 border-secondary/20 overflow-hidden flex items-center justify-center text-secondary">
                            {record.imageSrc ? (
                              <Image src={record.imageSrc} alt="Captured" className="w-full h-full object-cover" width={48} height={48} />
                            ) : (
                              <ScanFace className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {record.employerName}
                            </div>
                            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mt-0.5">
                              {record.employerId} &middot; {record.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 flex-shrink-0">
                          <CheckCircle className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest hidden sm:block">Registered</span>
                        </div>
                      </div>
                    ))}
                    {history.length > 5 && (
                      <button
                        onClick={() => setShowAllHistory(!showAllHistory)}
                        className="w-full py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-secondary hover:text-secondary/80 transition-colors text-center"
                      >
                        {showAllHistory ? 'Show Less' : `Show More (${history.length - 5})`}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md",
            toast.type === 'success' && "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
            toast.type === 'info' && "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
            toast.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          )}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'info' && <ScanFace className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        @keyframes scan-path {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-scan-path {
          animation: scan-path 3s linear infinite;
        }
        @keyframes scan-line {
          0%, 100% { transform: translateY(-120px) scaleX(0.8); opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { transform: translateY(120px) scaleX(1); opacity: 1; }
        }
        .animate-face-scan {
          animation: scan-line 4s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(192, 17, 72, 0.2);
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </>
  );
};

import { Suspense } from 'react';

const EmployerRegistrationPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    }>
      <RegistrationContent />
    </Suspense>
  );
};

export default EmployerRegistrationPage;