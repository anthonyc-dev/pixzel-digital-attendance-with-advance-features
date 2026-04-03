'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Calendar,
    LogIn,
    LogOut,
    AlertTriangle,
    FileText,
    CheckCircle2,
    XCircle,
    Clock as ClockIcon,
    User,
    Briefcase,
    Heart,
    ChevronRight,
    ChevronDown,
    Edit2,
    Save,
    X,
    Home,
    Activity,
    Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/mainPage/Header';

type LeaveType = 'emergency' | 'sick' | 'vacation' | 'personal' | 'family' | 'medical' | 'other';

interface ApiLogEntry {
    id: string;
    employer_registration?: {
        employer_id: string;
    };
    employer_id?: string;
    timestamp: string;
    type: string;
    status?: string;
    remarks?: string;
}

interface AttendanceRecord {
    id: string;
    date: string;
    timeIn: string | null;
    timeOut: string | null;
    status: 'present' | 'absent' | 'late' | 'early-out' | 'emergency' | 'leave';
    remarks?: string;
    leaveType?: 'emergency' | 'sick' | 'vacation' | 'personal' | 'family' | 'medical' | 'other';
    leaveReason?: string;
    leaveDuration?: string;
    leaveApproved?: boolean;
    overtime?: number;
}

interface UserProfile {
    name: string;
    position: string;
    department: string;
    employeeId: string;
    email: string;
    avatar?: string;
    leaveBalance?: {
        sick: number;
        vacation: number;
        personal: number;
        emergency: number;
    };
}

const UserRecord = () => {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: 'Loading...',
        position: 'Updating...',
        department: '---',
        employeeId: '---',
        email: '---',
        leaveBalance: {
            sick: 0,
            vacation: 0,
            personal: 0,
            emergency: 0,
        },
    });

    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            const savedUser = localStorage.getItem('selectedUser');
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                setUserProfile(prev => ({
                    ...prev,
                    name: userData.name || 'Unknown',
                    position: userData.position || 'Employee',
                    employeeId: userData.employer_id || 'N/A',
                    avatar: userData.photo,
                }));

                // Fetch history if we have an id
                if (userData.employer_id) {
                    try {
                        const response = await fetch('/api/attendance'); // We'll filter client-side for now or fix [id] route
                        if (response.ok) {
                            const allLogs = await response.json();
                            const userLogs = allLogs.filter((log: ApiLogEntry) => 
                                log.employer_registration?.employer_id === userData.employer_id ||
                                log.employer_id === userData.employer_id
                            );
                            
                            setAttendanceRecords(userLogs.map((log: ApiLogEntry) => ({
                                id: log.id,
                                date: log.timestamp.split('T')[0],
                                timeIn: log.type === 'time_in' ? new Date(log.timestamp).toLocaleTimeString() : null,
                                timeOut: log.type === 'time_out' ? new Date(log.timestamp).toLocaleTimeString() : null,
                                status: log.status || 'present',
                                remarks: log.remarks,
                            })));
                        }
                    } catch (error) {
                        console.error('Failed to fetch user history:', error);
                    }
                }
            }
        };

        fetchUserData();
    }, []);

    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveDetails, setLeaveDetails] = useState({
        type: 'vacation',
        reason: '',
        duration: '',
        startDate: '',
        endDate: '',
        remarks: '',
    });

    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [emergencyDetails, setEmergencyDetails] = useState({
        type: 'emergency',
        reason: '',
        estimatedDuration: '',
        remarks: '',
    });

    const [showRemarkModal, setShowRemarkModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [remarkText, setRemarkText] = useState('');
    const [expandedRecords, setExpandedRecords] = useState<string[]>([]);
    const [currentStatus, setCurrentStatus] = useState<'clocked-in' | 'clocked-out' | 'on-leave' | 'emergency' | null>(null);

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

    const getStatusColor = (status: AttendanceRecord['status']) => {
        switch (status) {
            case 'present':
                return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
            case 'late':
                return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
            case 'early-out':
                return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
            case 'absent':
                return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
            case 'emergency':
                return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
            case 'leave':
                return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
            default:
                return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
        }
    };

    const getStatusIcon = (status: AttendanceRecord['status']) => {
        switch (status) {
            case 'present':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'late':
                return <ClockIcon className="w-4 h-4" />;
            case 'early-out':
                return <LogOut className="w-4 h-4" />;
            case 'absent':
                return <XCircle className="w-4 h-4" />;
            case 'emergency':
                return <AlertTriangle className="w-4 h-4" />;
            case 'leave':
                return <Briefcase className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getLeaveTypeIcon = (type?: string) => {
        switch (type) {
            case 'emergency':
                return <AlertTriangle className="w-4 h-4" />;
            case 'sick':
                return <Heart className="w-4 h-4" />;
            case 'vacation':
                return <Plane className="w-4 h-4" />;
            case 'personal':
                return <User className="w-4 h-4" />;
            case 'family':
                return <Home className="w-4 h-4" />;
            case 'medical':
                return <Activity className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const handleTimeIn = () => {
        const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            timeIn: formattedTime,
            timeOut: null,
            status: 'present',
        };
        setAttendanceRecords([newRecord, ...attendanceRecords]);
        setCurrentStatus('clocked-in');
    };

    const handleTimeOut = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = attendanceRecords.find(
            record => record.date === today && !record.timeOut
        );

        if (todayRecord) {
            const updatedRecords = attendanceRecords.map(record =>
                record.id === todayRecord.id
                    ? { ...record, timeOut: formattedTime, status: 'present' as const }
                    : record
            );
            setAttendanceRecords(updatedRecords);
            setCurrentStatus('clocked-out');
        }
    };

    const handleLeaveRequest = () => {
        setShowLeaveModal(true);
    };

    const submitLeaveRequest = () => {
        const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            timeIn: null,
            timeOut: null,
            status: 'leave',
            leaveType: leaveDetails.type as LeaveType,
            leaveReason: leaveDetails.reason,
            leaveDuration: leaveDetails.duration,
            remarks: leaveDetails.remarks,
            leaveApproved: true, // In real app, this would be pending approval
        };
        setAttendanceRecords([newRecord, ...attendanceRecords]);
        setShowLeaveModal(false);
        setLeaveDetails({
            type: 'vacation',
            reason: '',
            duration: '',
            startDate: '',
            endDate: '',
            remarks: '',
        });
        setCurrentStatus('on-leave');
    };

    const handleEmergencyLeave = () => {
        setShowEmergencyModal(true);
    };

    const submitEmergencyLeave = () => {
        const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            timeIn: currentStatus === 'clocked-in' ? formattedTime : null,
            timeOut: null,
            status: 'emergency',
            leaveType: 'emergency',
            leaveReason: emergencyDetails.reason,
            leaveDuration: emergencyDetails.estimatedDuration,
            remarks: emergencyDetails.remarks,
            leaveApproved: true,
        };
        setAttendanceRecords([newRecord, ...attendanceRecords]);
        setShowEmergencyModal(false);
        setEmergencyDetails({
            type: 'emergency',
            reason: '',
            estimatedDuration: '',
            remarks: '',
        });
        setCurrentStatus('emergency');
    };

    const addRemark = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setRemarkText(record.remarks || '');
        setShowRemarkModal(true);
    };

    const saveRemark = () => {
        if (selectedRecord) {
            const updatedRecords = attendanceRecords.map(record =>
                record.id === selectedRecord.id
                    ? { ...record, remarks: remarkText }
                    : record
            );
            setAttendanceRecords(updatedRecords);
            setShowRemarkModal(false);
            setSelectedRecord(null);
            setRemarkText('');
        }
    };

    const toggleRecordExpansion = (recordId: string) => {
        setExpandedRecords(prev =>
            prev.includes(recordId)
                ? prev.filter(id => id !== recordId)
                : [...prev, recordId]
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <Header realTimeClock={formattedTime} />

            <main className="max-w-7xl mx-auto p-6">
                {/* User Profile Section */}
                <div className="bg-card border border-border rounded-2xl p-6 mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                                {userProfile.avatar ? (
                                    <Image
                                        src={userProfile.avatar}
                                        alt="User avatar"
                                        className="w-full h-full object-cover"
                                        width={80}
                                        height={80}
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-muted-foreground" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{userProfile.name}</h1>
                                <p className="text-muted-foreground">{userProfile.position}</p>
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className="text-muted-foreground">ID: {userProfile.employeeId}</span>
                                    <span className="text-muted-foreground">Dept: {userProfile.department}</span>
                                    <span className="text-muted-foreground">{userProfile.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">{currentDate}</p>
                            <div className="mt-2 text-2xl font-bold text-foreground tabular-nums">
                                {formattedTime}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leave Balance Section */}
                {/* {userProfile.leaveBalance && (
                    <div className="bg-card border border-border rounded-2xl p-6 mb-8">
                        <h2 className="text-lg font-bold text-foreground mb-4">Leave Balance</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-muted rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Heart className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-muted-foreground">Sick Leave</span>
                                </div>
                                <p className={`text-2xl font-bold ${getLeaveBalanceColor(userProfile.leaveBalance.sick)}`}>
                                    {userProfile.leaveBalance.sick}
                                </p>
                                <p className="text-xs text-muted-foreground">days remaining</p>
                            </div>
                            <div className="p-4 bg-muted rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Plane className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-muted-foreground">Vacation</span>
                                </div>
                                <p className={`text-2xl font-bold ${getLeaveBalanceColor(userProfile.leaveBalance.vacation)}`}>
                                    {userProfile.leaveBalance.vacation}
                                </p>
                                <p className="text-xs text-muted-foreground">days remaining</p>
                            </div>
                            <div className="p-4 bg-muted rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm text-muted-foreground">Personal</span>
                                </div>
                                <p className={`text-2xl font-bold ${getLeaveBalanceColor(userProfile.leaveBalance.personal)}`}>
                                    {userProfile.leaveBalance.personal}
                                </p>
                                <p className="text-xs text-muted-foreground">days remaining</p>
                            </div>
                            <div className="p-4 bg-muted rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm text-muted-foreground">Emergency</span>
                                </div>
                                <p className={`text-2xl font-bold ${getLeaveBalanceColor(userProfile.leaveBalance.emergency)}`}>
                                    {userProfile.leaveBalance.emergency}
                                </p>
                                <p className="text-xs text-muted-foreground">days remaining</p>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Today's Status Section */}
                <div className="bg-card border border-border rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-bold text-foreground mb-4">Today&apos;s Status</h2>

                    {currentStatus === 'clocked-in' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="font-semibold text-blue-900 dark:text-blue-100">Currently Clocked In</p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">Time in: {formattedTime}</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleTimeOut}
                                    className="flex items-center gap-2 bg-destructive text-destructive-foreground"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Time Out
                                </Button>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleEmergencyLeave}
                                    variant="outline"
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Emergency Leave
                                </Button>
                                <Button
                                    onClick={handleLeaveRequest}
                                    variant="outline"
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Request Leave
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStatus === 'clocked-out' && (
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                <div>
                                    <p className="font-semibold text-green-900 dark:text-green-100">Attendance Completed</p>
                                    <p className="text-sm text-green-700 dark:text-green-300">You&apos;ve completed your attendance for today</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                View Summary
                            </Button>
                        </div>
                    )}

                    {currentStatus === 'on-leave' && (
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="font-semibold text-blue-900 dark:text-blue-100">On Leave Today</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">Your leave request has been approved</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStatus === 'emergency' && (
                        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                <div>
                                    <p className="font-semibold text-purple-900 dark:text-purple-100">Emergency Leave</p>
                                    <p className="text-sm text-purple-700 dark:text-purple-300">You&apos;re on emergency leave today</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!currentStatus && (
                        <div className="flex gap-4">
                            <Button
                                onClick={handleTimeIn}
                                className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:opacity-90 py-6 text-lg"
                            >
                                <LogIn className="w-5 h-5" />
                                Time In
                            </Button>
                            <Button
                                onClick={handleLeaveRequest}
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2 py-6 text-lg"
                            >
                                <Briefcase className="w-5 h-5" />
                                Request Leave
                            </Button>
                            <Button
                                onClick={handleEmergencyLeave}
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2 py-6 text-lg"
                            >
                                <AlertTriangle className="w-5 h-5" />
                                Emergency
                            </Button>
                        </div>
                    )}
                </div>

                {/* Attendance History */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-foreground">Attendance & Leave History</h2>
                        <div className="text-sm text-muted-foreground">
                            Total Records: {attendanceRecords.length}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {attendanceRecords.map((record) => (
                            <div
                                key={record.id}
                                className="bg-card border border-border rounded-xl overflow-hidden hover:border-secondary/50 transition-all"
                            >
                                <div
                                    className="p-4 cursor-pointer"
                                    onClick={() => toggleRecordExpansion(record.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                                <span className="font-medium text-foreground">
                                                    {new Date(record.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {record.timeIn && (
                                                    <div className="flex items-center gap-1">
                                                        <LogIn className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm text-foreground">{record.timeIn}</span>
                                                    </div>
                                                )}
                                                {record.timeOut && (
                                                    <div className="flex items-center gap-1">
                                                        <LogOut className="w-4 h-4 text-red-500" />
                                                        <span className="text-sm text-foreground">{record.timeOut}</span>
                                                    </div>
                                                )}
                                                {record.status === 'leave' && record.leaveType && (
                                                    <div className="flex items-center gap-1">
                                                        {getLeaveTypeIcon(record.leaveType)}
                                                        <span className="text-sm text-foreground capitalize">{record.leaveType} Leave</span>
                                                    </div>
                                                )}
                                                {record.status === 'emergency' && (
                                                    <div className="flex items-center gap-1">
                                                        <AlertTriangle className="w-4 h-4 text-purple-500" />
                                                        <span className="text-sm text-foreground">Emergency</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                                {getStatusIcon(record.status)}
                                                <span className="capitalize">
                                                    {record.status === 'early-out' ? 'Early Out' :
                                                        record.status === 'leave' ? 'Leave' : record.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {record.remarks && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    <span className="truncate max-w-37.5">{record.remarks}</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addRemark(record);
                                                }}
                                                className="p-1 hover:bg-muted rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                            {expandedRecords.includes(record.id) ? (
                                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {expandedRecords.includes(record.id) && (
                                    <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/30">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {record.leaveType && (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        {getLeaveTypeIcon(record.leaveType)}
                                                        <span className="text-muted-foreground">Leave Type:</span>
                                                        <span className="text-foreground font-medium capitalize">
                                                            {record.leaveType}
                                                        </span>
                                                    </div>
                                                    {record.leaveReason && (
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">Reason:</span>
                                                            <span className="text-foreground">{record.leaveReason}</span>
                                                        </div>
                                                    )}
                                                    {record.leaveDuration && (
                                                        <div className="flex items-center gap-2">
                                                            <ClockIcon className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">Duration:</span>
                                                            <span className="text-foreground">{record.leaveDuration}</span>
                                                        </div>
                                                    )}
                                                    {record.leaveApproved !== undefined && (
                                                        <div className="flex items-center gap-2">
                                                            {record.leaveApproved ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-500" />
                                                            )}
                                                            <span className="text-muted-foreground">Status:</span>
                                                            <span className={record.leaveApproved ? 'text-green-600' : 'text-red-600'}>
                                                                {record.leaveApproved ? 'Approved' : 'Pending'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {record.overtime && record.overtime > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Overtime:</span>
                                                    <span className="text-foreground font-medium">
                                                        {record.overtime} hours
                                                    </span>
                                                </div>
                                            )}
                                            {record.remarks && (
                                                <div className="col-span-2 flex items-start gap-2">
                                                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <span className="text-muted-foreground">Remarks:</span>
                                                        <p className="text-foreground mt-1">{record.remarks}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {!record.remarks && !record.leaveType && !record.overtime && (
                                                <div className="col-span-2 text-center text-muted-foreground py-2">
                                                    No additional details available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {attendanceRecords.length === 0 && (
                            <div className="text-center py-12 border border-dashed border-border rounded-xl">
                                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-foreground font-medium">No records found</p>
                                <p className="text-sm text-muted-foreground">Start by clocking in or requesting leave</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Leave Request Modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-foreground">Request Leave</h3>
                            <button
                                onClick={() => setShowLeaveModal(false)}
                                className="p-1 hover:bg-muted rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Leave Type *
                                </label>
                                <select
                                    value={leaveDetails.type}
                                    onChange={(e) => setLeaveDetails({ ...leaveDetails, type: e.target.value })}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                >
                                    <option value="vacation">Vacation Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="personal">Personal Leave</option>
                                    <option value="family">Family Leave</option>
                                    <option value="medical">Medical Leave</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Reason for Leave *
                                </label>
                                <textarea
                                    value={leaveDetails.reason}
                                    onChange={(e) => setLeaveDetails({ ...leaveDetails, reason: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    placeholder="Please describe your reason for leave..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Duration *
                                </label>
                                <input
                                    type="text"
                                    value={leaveDetails.duration}
                                    onChange={(e) => setLeaveDetails({ ...leaveDetails, duration: e.target.value })}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    placeholder="e.g., 1 day, 3 days, etc."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={leaveDetails.startDate}
                                        onChange={(e) => setLeaveDetails({ ...leaveDetails, startDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={leaveDetails.endDate}
                                        onChange={(e) => setLeaveDetails({ ...leaveDetails, endDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Additional Remarks
                                </label>
                                <textarea
                                    value={leaveDetails.remarks}
                                    onChange={(e) => setLeaveDetails({ ...leaveDetails, remarks: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    placeholder="Any additional information..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={() => setShowLeaveModal(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={submitLeaveRequest}
                                className="flex-1 bg-secondary text-secondary-foreground"
                                disabled={!leaveDetails.reason || !leaveDetails.duration}
                            >
                                Submit Leave Request
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Leave Modal */}
            {showEmergencyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-foreground">Emergency Leave Request</h3>
                            <button
                                onClick={() => setShowEmergencyModal(false)}
                                className="p-1 hover:bg-muted rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Emergency Type
                                </label>
                                <select
                                    value={emergencyDetails.type}
                                    onChange={(e) => setEmergencyDetails({ ...emergencyDetails, type: e.target.value })}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                >
                                    <option value="emergency">Emergency</option>
                                    <option value="family">Family Emergency</option>
                                    <option value="medical">Medical Emergency</option>
                                    <option value="personal">Personal Emergency</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Reason for Emergency *
                                </label>
                                <textarea
                                    value={emergencyDetails.reason}
                                    onChange={(e) => setEmergencyDetails({ ...emergencyDetails, reason: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    placeholder="Please describe your emergency..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Estimated Duration *
                                </label>
                                <input
                                    type="text"
                                    value={emergencyDetails.estimatedDuration}
                                    onChange={(e) => setEmergencyDetails({ ...emergencyDetails, estimatedDuration: e.target.value })}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    placeholder="e.g., Today only, 2 days, etc."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Additional Remarks
                                </label>
                                <textarea
                                    value={emergencyDetails.remarks}
                                    onChange={(e) => setEmergencyDetails({ ...emergencyDetails, remarks: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    placeholder="Any additional information..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={() => setShowEmergencyModal(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={submitEmergencyLeave}
                                className="flex-1 bg-destructive text-destructive-foreground"
                                disabled={!emergencyDetails.reason || !emergencyDetails.estimatedDuration}
                            >
                                Submit Emergency Leave
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remark Modal */}
            {showRemarkModal && selectedRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-foreground">Add Remark</h3>
                            <button
                                onClick={() => setShowRemarkModal(false)}
                                className="p-1 hover:bg-muted rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Date: {new Date(selectedRecord.date).toLocaleDateString()}
                                </label>
                                <textarea
                                    value={remarkText}
                                    onChange={(e) => setRemarkText(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    placeholder="Add your remarks here..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={() => setShowRemarkModal(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={saveRemark}
                                className="flex-1 bg-secondary text-secondary-foreground"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Remark
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserRecord;