'use client';

import React, { useEffect, useState } from 'react';
import {
    ClipboardCheck,
    Search,
    Filter,
    Download,
    ChevronRight,
    Clock,
    ArrowUpRight,
    TrendingUp,
    UserCheck,
    UserMinus,
    FileSpreadsheet,
    ArrowLeft,
    MoreHorizontal,
    Pencil,
    Trash2,
    AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Employee {
    id: string;
    employer_id: string;
    employer_name: string;
    employer_position: string;
    status: string;
    image: string | null;
    created_at: string;
}

interface AttendanceRecord {
    id: string;
    employer_registration_id: string;
    type: 'time_in' | 'time_out';
    status: string;
    timestamp: string;
    employer_registration?: {
        employer_id: string;
        employer_name: string;
        employer_position: string;
        image: string;
    };
}

interface GroupedAttendance {
    id: string;
    rawDate: string;
    date: string;
    day: string;
    time_in?: string;
    time_out?: string;
    total_hours?: string;
    status: string;
    remarks?: string;
    logIds?: string[];
}

// Function to convert image to base64 for PDF
const getBase64Image = (imgUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.src = imgUrl;
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
    });
};

// Static JSON for API Development Reference - Highly Detailed Mock
const MOCK_DTR_DATA = {
    status: "success",
    message: "DTR data fetched successfully",
    data: [
        {
            id: "att-mock-001",
            employer_id: "EMP-PIXZ-001",
            employer_name: "Jesper Ian",
            employer_position: "Lead UI Developer",
            status: "active",
            time_in: "07:55 AM",
            time_out: "05:15 PM",
            excuse: null,
            created_at: new Date().toISOString(),
            total_hours: 9.3,
            overtime_minutes: 15,
            is_late: false,
            department: "Engineering",
            image: null
        },
        {
            id: "att-mock-002",
            employer_id: "EMP-PIXZ-002",
            employer_name: "Anthony C.",
            employer_position: "Senior Designer",
            status: "late",
            time_in: "09:12 AM",
            time_out: "06:15 PM",
            excuse: "Inclement weather",
            created_at: new Date().toISOString(),
            total_hours: 9,
            overtime_minutes: 0,
            is_late: true,
            department: "Creatives",
            image: null
        }
    ],
    metadata: {
        total_records: 2,
        current_page: 1,
        total_pages: 1,
        filters_applied: ["date_range", "department"]
    }
};

const DTRPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    const exportToCSV = () => {
        const isIndividual = !!selectedEmployee;
        const filename = `${isIndividual ? selectedEmployee.employer_name.replace(/\s+/g, '_') + '_' : ''}DTR_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`;

        const headers = isIndividual
            ? ["Date", "Day", "Time In", "Time Out", "Total Hours", "Status", "Remarks"]
            : ["Employer ID", "Name", "Position", "Department", "Status", "Total Logs"];

        let data = [];
        if (isIndividual) {
            data = getGroupedAttendance(selectedEmployee.id).map(log => [
                log.date,
                log.day,
                log.time_in || '--:-- --',
                log.time_out || '--:-- --',
                log.total_hours || '0.00',
                log.status.toUpperCase(),
                log.remarks || 'None'
            ]);
        } else {
            data = (searchTerm ? filteredEmployees : employees).map(emp => {
                const logs = attendance.filter(a => a.employer_registration_id === emp.id);
                return [
                    emp.employer_id,
                    emp.employer_name,
                    emp.employer_position,
                    "General", // Could be dynamic if added to schema
                    emp.status.toUpperCase(),
                    logs.length.toString()
                ];
            });
        }

        const csvContent = [
            headers.join(','),
            ...data.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = async () => {
        try {
            setExporting(true);
            const { jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const brandColor = [192, 17, 72]; // #C01148

            // Try to add Logo
            try {
                const logoBase64 = await getBase64Image('/pixzel-logo.png');
                doc.addImage(logoBase64, 'PNG', 15, 10, 25, 25);
            } catch (err) {
                console.warn('Could not load logo for PDF', err);
                // Fallback: draw a colored circle or square
                doc.setFillColor(192, 17, 72);
                doc.roundedRect(15, 10, 25, 25, 3, 3, 'F');
            }

            // Company Info Header
            doc.setTextColor(192, 17, 72);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.text('PIXZEL DIGITAL SERVICE', 45, 22);

            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Advanced Digital Attendance Tracking System', 45, 28);
            doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 45, 33);

            // Line Separator
            doc.setDrawColor(230, 230, 230);
            doc.line(15, 40, 195, 40);

            // Report Title
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            const reportTitle = selectedEmployee
                ? `DAILY TIME RECORD: ${selectedEmployee.employer_name.toUpperCase()}`
                : 'DAILY TIME RECORD: OVERALL SUMMARY';
            doc.text(reportTitle, 15, 52);

            if (selectedEmployee) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Employee ID: ${selectedEmployee.employer_id}`, 15, 58);
                doc.text(`Position: ${selectedEmployee.employer_position}`, 15, 63);
                doc.text(`Month of ${format(new Date(), 'MMMM yyyy')}`, 150, 58, { align: 'right' });
            }

            // Table
            const headers = selectedEmployee
                ? [["DATE", "DAY", "TIME IN", "TIME OUT", "HOURS", "STATUS", "REMARKS"]]
                : [["ID", "EMPLOYEE", "POSITION", "STATUS", "LOGS"]];

            const tableData = selectedEmployee
                ? getGroupedAttendance(selectedEmployee.id).map(log => [
                    log.date,
                    log.day,
                    log.time_in || '--:-- --',
                    log.time_out || '--:-- --',
                    log.total_hours || '0.00',
                    log.status.toUpperCase().replace('_', ' '),
                    log.remarks || '---'
                ])
                : (searchTerm ? filteredEmployees : employees).map(emp => [
                    emp.employer_id,
                    emp.employer_name,
                    emp.employer_position,
                    emp.status.toUpperCase(),
                    attendance.filter(a => a.employer_registration_id === emp.id).length
                ]);

            autoTable(doc, {
                startY: selectedEmployee ? 70 : 60,
                head: headers,
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: [192, 17, 72],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 5,
                    valign: 'middle',
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [250, 250, 250]
                },
                margin: { left: 15, right: 15 }
            });

            // Footer
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Page ${i} of ${pageCount} - Pixzel Digital Daily Time Record System`,
                    105,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            }

            const filename = `${selectedEmployee ? selectedEmployee.employer_name.replace(/\s+/g, '_') + '_' : ''}DTR_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
            doc.save(filename);

        } catch (error) {
            console.error('PDF generation error:', error);
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        // Log the static JSON for API structure reference
        console.log("🛠️ DTR API MOCK DATA STRUCTURE (FOR NEW API):", MOCK_DTR_DATA);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && !target.closest('.action-menu-button') && !target.closest('.action-menu-dropdown')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch employers
                const empRes = await fetch('/api/registration', { cache: 'no-store' });
                const empData = await empRes.json();
                setEmployees(empData.data || []);

                // Fetch attendance records
                const attRes = await fetch('/api/attendance', { cache: 'no-store' });
                if (!attRes.ok) {
                    throw new Error('Failed to fetch attendance');
                }
                const attData = await attRes.json();
                setAttendance(attData || []);

            } catch (error) {
                console.error('Failed to fetch DTR data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredEmployees = employees.filter(emp =>
        emp.employer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employer_position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onTimeRate = attendance.length > 0
        ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
        : 100;

    const stats = [
        { title: 'Total Handled', value: employees.length.toString().padStart(2, '0'), icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'On Time Rate', value: `${onTimeRate}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
        { title: 'Late Entries', value: attendance.filter(a => a.status === 'late').length.toString().padStart(2, '0'), icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { title: 'Activity Logs', value: attendance.length.toString().padStart(2, '0'), icon: ClipboardCheck, color: 'text-secondary', bg: 'bg-secondary/10' },
    ];

    // Helper to group logs by day for a specific employee
    const getGroupedAttendance = (empId: string): GroupedAttendance[] => {
        const empLogs = attendance.filter(a => a.employer_registration_id === empId);
        const groups: Record<string, GroupedAttendance & { raw_in?: Date, raw_out?: Date }> = {};

        empLogs.forEach(log => {
            const dateObj = new Date(log.timestamp);
            const dateKey = format(dateObj, 'yyyy-MM-dd');

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    id: dateKey,
                    rawDate: dateKey,
                    date: format(dateObj, 'MMM dd, yyyy'),
                    day: format(dateObj, 'EEEE'),
                    status: '---',
                    remarks: '',
                    logIds: []
                };
            }

            if (!groups[dateKey].logIds) groups[dateKey].logIds = [];
            groups[dateKey].logIds!.push(log.id);

            if (log.type === 'time_in') {
                groups[dateKey].time_in = format(dateObj, 'hh:mm aa');
                groups[dateKey].status = log.status; // 'present' or 'late'
                groups[dateKey].raw_in = dateObj;
            } else if (log.type === 'time_out') {
                groups[dateKey].time_out = format(dateObj, 'hh:mm aa');
                groups[dateKey].raw_out = dateObj;
            }
        });

        // Calculate hours
        Object.values(groups).forEach(group => {
            if (group.raw_in && group.raw_out) {
                const diff = group.raw_out.getTime() - group.raw_in.getTime();
                const hours = diff / (1000 * 60 * 60);
                group.total_hours = hours > 0 ? hours.toFixed(2) : '0.00';
            }
        });

        return Object.values(groups).sort((a, b) => {
            return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
        });
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">Daily Time Record</h1>
                    </div>
                    <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80 flex items-center gap-2">
                        Comprehensive attendance activity logs
                    </p>
                </div>

                {!selectedEmployee && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToCSV}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all group disabled:opacity-50"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-green-500 transition-transform group-hover:scale-110" />
                            <span>CSV</span>
                        </button>
                        <button
                            onClick={exportToPDF}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            <Download className={cn("w-3.5 h-3.5", exporting && "animate-bounce")} />
                            <span>{exporting ? 'Generating...' : 'PDF'}</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Stats Summary */}
            {!selectedEmployee && (
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className={cn("p-2 rounded-xl", stat.bg)}>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-secondary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </div>
                            <div className="text-2xl font-black text-foreground tabular-nums mb-0.5 tracking-tighter">{stat.value}</div>
                            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">{stat.title}</div>
                        </div>
                    ))}
                </section>
            )}

            {/* Main Content Area */}
            <div className="flex flex-col gap-6">
                {/* Navigation and Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {selectedEmployee ? (
                        <button
                            onClick={() => {
                                setSelectedEmployee(null);
                                setSearchTerm('');
                            }}
                            className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-secondary cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <>
                            <div className="relative group w-full max-w-5xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-secondary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by Employer Name or Position..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all shadow-sm"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-foreground/70 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
                                <Filter className="w-3.5 h-3.5 text-secondary" />
                                <span>All Departments</span>
                            </button>
                        </>
                    )}
                </div>

                {!selectedEmployee ? (
                    /* Employer Cards Grid - 4 per row */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="h-64 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse border border-gray-100 dark:border-white/5" />
                            ))
                        ) : filteredEmployees.length === 0 ? (
                            <div className="col-span-full py-20 text-center opacity-40">
                                <UserMinus className="w-16 h-16 mx-auto mb-4" />
                                <p className="font-black uppercase tracking-widest text-xs">No Employers Found</p>
                            </div>
                        ) : (
                            filteredEmployees.map((emp) => (
                                <button
                                    key={emp.id}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className="group relative flex flex-col items-center p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-secondary/10 text-center overflow-hidden cursor-pointer"
                                >
                                    {/* Watermark Logo */}
                                    {emp.image && (
                                        <div className="absolute inset-0 z-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                                            <Image
                                                src={emp.image}
                                                alt="watermark"
                                                fill
                                                className="object-cover scale-150 grayscale"
                                            />
                                        </div>
                                    )}

                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <ChevronRight className="w-5 h-5 text-secondary" />
                                    </div>

                                    <div className="relative mb-4 z-10">
                                        <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-700" />
                                        {emp.image ? (
                                            <Image
                                                src={emp.image}
                                                alt={emp.employer_name}
                                                width={80}
                                                height={80}
                                                className="relative w-20 h-20 rounded-lg object-cover border-2 border-white dark:border-white/10 shadow-xl transition-all duration-500"
                                            />
                                        ) : (
                                            <div className="relative w-20 h-20 rounded-lg bg-secondary/10 flex items-center justify-center text-3xl font-black text-secondary border-2 border-white dark:border-white/10 shadow-xl transition-all">
                                                {emp.employer_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1 mb-4 z-10">
                                        <span className="text-[10px] font-black text-secondary tracking-[0.2em] uppercase">{emp.employer_id}</span>
                                        <h3 className="font-black text-sm text-foreground tracking-tight line-clamp-1">{emp.employer_name}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest line-clamp-1 mb-2">{emp.employer_position}</p>

                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-current",
                                            emp.status === 'active' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                                emp.status === 'late' ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                                                    "bg-red-500/10 text-red-600 border-red-500/20"
                                        )}>
                                            <div className="w-1 h-1 rounded-full bg-current" />
                                            {emp.status}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 z-10">
                                        <span>Activity Log</span>
                                        <span className="text-foreground">{attendance.filter(a => a.employer_registration_id === emp.id).length} Logs</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    /* Specific Employee DTR Table */
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl flex items-center gap-6 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ClipboardCheck className="w-24 h-24 text-secondary rotate-12" />
                            </div>
                            <div className="relative">
                                {selectedEmployee.image ? (
                                    <Image src={selectedEmployee.image} alt={selectedEmployee.employer_name} width={64} height={64} className="w-16 h-16 rounded-lg object-cover border-2 border-white dark:border-white/10 shadow-lg" />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center text-2xl font-black text-secondary uppercase">
                                        {selectedEmployee.employer_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[10px] font-black text-secondary tracking-widest uppercase">{selectedEmployee.employer_id}</span>
                                </div>
                                <h2 className="text-xl font-black text-foreground tracking-tight">{selectedEmployee.employer_name}</h2>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{selectedEmployee.employer_position}</p>
                            </div>
                            <div className="hidden md:flex flex-col items-end gap-3">
                                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Export Activity</div>
                                <div className="flex items-center gap-2 text-white">
                                    <button
                                        onClick={exportToCSV}
                                        disabled={exporting}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg font-black uppercase tracking-widest text-[8px] text-foreground hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                                    >
                                        <FileSpreadsheet className="w-3 h-3 text-green-500" />
                                        <span>CSV</span>
                                    </button>
                                    <button
                                        onClick={exportToPDF}
                                        disabled={exporting}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-white rounded-lg font-black uppercase tracking-widest text-[8px] shadow-lg shadow-secondary/10 hover:opacity-90 transition-all disabled:opacity-50"
                                    >
                                        <Download className={cn("w-3 h-3", exporting && "animate-bounce")} />
                                        <span>{exporting ? '...' : 'PDF'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 text-center">
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Date Log</th>
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Time In</th>
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Time Out</th>
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Total Hours</th>
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status Type</th>
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Remarks</th>
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-center">
                                        {getGroupedAttendance(selectedEmployee.id).length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-10 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-40">
                                                        <UserMinus className="w-12 h-12" />
                                                        <p className="font-black uppercase tracking-widest text-[10px]">No Records Found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            getGroupedAttendance(selectedEmployee.id).map((log, idx) => (
                                                <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300">
                                                    <td className="p-3">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-black text-[11px] tracking-tight text-foreground/80">{log.date}</span>
                                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{log.day}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={cn(
                                                            "text-[10px] font-black tabular-nums px-2 py-0.5 rounded-lg border",
                                                            log.time_in ? "text-green-500 bg-green-500/10 border-green-500/10" : "text-gray-400 bg-gray-400/10 border-gray-400/10 opacity-40"
                                                        )}>
                                                            {log.time_in || '--:-- --'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={cn(
                                                            "text-[10px] font-black tabular-nums px-2 py-0.5 rounded-lg border",
                                                            log.time_out ? "text-red-500 bg-red-500/10 border-red-500/10" : "text-gray-400 bg-gray-400/10 border-gray-400/10 opacity-40"
                                                        )}>
                                                            {log.time_out || '--:-- --'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex flex-col items-center">
                                                            <span className={cn(
                                                                "text-[10px] font-black tabular-nums px-2 py-0.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-500/80",
                                                                !log.total_hours && "opacity-20"
                                                            )}>
                                                                {log.total_hours ? `${log.total_hours} hrs` : '0.00 hrs'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ring-1 ring-inset",
                                                            log.status === 'present' ? "bg-green-500/10 text-green-600 ring-green-600/20 border-green-600/30" :
                                                                log.status === 'late' ? "bg-yellow-500/10 text-yellow-600 ring-yellow-600/20 border-yellow-600/30" :
                                                                    "bg-red-500/10 text-red-600 ring-red-600/20 border-red-600/30"
                                                        )}>
                                                            <div className={cn("w-1 h-1 rounded-full",
                                                                log.status === 'present' ? "bg-green-600" :
                                                                    log.status === 'late' ? "bg-yellow-600" : "bg-red-600"
                                                            )} />
                                                            <span>{log.status === 'on_time' ? 'present' : log.status.replace('_', ' ')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex flex-col items-center gap-1">
                                                            {log.remarks ? (
                                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit">
                                                                    <AlertCircle className="w-2.5 h-2.5" />
                                                                    <span>{log.remarks}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[8px] font-bold text-gray-400 uppercase opacity-40 italic">No Remarks</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center relative">
                                                        <div className="relative inline-block">
                                                            <button
                                                                onClick={() => setOpenMenuId(openMenuId === log.id ? null : log.id)}
                                                                className="action-menu-button p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all text-gray-400 cursor-pointer"
                                                            >
                                                                <MoreHorizontal className="w-4 h-4 pointer-events-none" />
                                                            </button>

                                                            {openMenuId === log.id && (
                                                                <div className="action-menu-dropdown absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 min-w-[120px] animate-in fade-in slide-in-from-right-2 duration-200">
                                                                    <button
                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                                    >
                                                                        <Pencil className="w-3 h-3 text-secondary" />
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DTRPage;