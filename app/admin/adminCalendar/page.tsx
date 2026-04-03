'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Search, 
  UserPlus, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowUpRight,
  Filter,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';

interface AttendanceRecord {
  id: string;
  employer_registration_id: string;
  type: 'time_in' | 'time_out';
  status: 'present' | 'late' | 'absent' | 'leave' | 'active' | string;
  timestamp: string;
  created_at: string;
  employer_registration?: {
    employer_id: string;
    employer_name: string;
    employer_position: string;
    image: string;
  };
}

type ViewType = 'month' | 'week' | 'day';

const AdminCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isAnimating, setIsAnimating] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Attendance Records
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/attendance');
        if (response.ok) {
          const data = await response.json();
          setRecords(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Organize Records by Date
  const groupedRecords = useMemo(() => {
    const groups: Record<string, AttendanceRecord[]> = {};
    records.forEach(record => {
      const dateStr = format(parseISO(record.created_at), 'yyyy-MM-dd');
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(record);
    });
    return groups;
  }, [records]);

  // Calendar Logic
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate(subMonths(currentDate, 1));
      setIsAnimating(false);
    }, 200);
  };

  const handleNextMonth = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate(addMonths(currentDate, 1));
      setIsAnimating(false);
    }, 200);
  };

  const dayRecords = selectedDate ? (groupedRecords[format(selectedDate, 'yyyy-MM-dd')] || []) : [];

  const getStatusType = (status: string): 'present' | 'late' | 'absent' | 'leave' => {
    const s = status.toLowerCase();
    if (s.includes('late')) return 'late';
    if (s.includes('absent')) return 'absent';
    if (s.includes('leave')) return 'leave';
    return 'present';
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl animate-in fade-in duration-700 ease-out pb-10">
      
      {/* Dynamic Header Controls */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 transition-all hover:scale-110">
              <CalendarIcon className="w-6 h-6 text-secondary" />
            </div>
            Admin Calendar
          </h1>
          <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80 pl-14">
            Managing employer activities & schedules
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl shadow-lg">
            {(['month', 'week', 'day'] as ViewType[]).map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={cn(
                  "px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95",
                  viewType === type 
                    ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {type}
              </button>
            ))}
          </div>
          
          <button className="p-3 bg-secondary text-white rounded-xl shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all group">
            <UserPlus className="w-5 h-5 group-hover:rotate-[360deg] transition-transform duration-700" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Calendar Panel */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-3xl min-h-[600px] flex flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(192,17,72,0.02)_0%,_transparent_50%)] pointer-events-none" />
          
          {isLoading && (
            <div className="absolute inset-x-0 top-0 h-1 bg-muted overflow-hidden z-20">
              <div className="h-full bg-secondary animate-progress origin-left" />
            </div>
          )}

          {/* Calendar Toolbar */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight transition-all">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-background rounded-md transition-all text-muted-foreground">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-border mx-0.5" />
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-background rounded-md transition-all text-muted-foreground">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search events..." 
                  className="pl-9 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all w-48 font-medium"
                />
              </div>
              <button className="p-2 border border-border rounded-lg hover:bg-muted transition-all">
                <Filter className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 mb-4 relative z-10 border-b border-border pb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className={cn(
            "grid grid-cols-7 grow gap-px bg-border/40 relative z-10 overflow-hidden rounded-xl border border-border/40 transition-all duration-300",
            isAnimating ? "opacity-30 blur-sm scale-[0.98]" : "opacity-100 scale-100"
          )}>
            {days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayActivities = groupedRecords[dateStr] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDayToday = isToday(day);

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[100px] sm:min-h-[120px] p-2 bg-white dark:bg-[#0c0c0c] transition-all cursor-pointer group relative",
                    !isCurrentMonth && "bg-gray-50/10 dark:bg-white/[0.01]",
                    isSelected && "ring-2 ring-inset ring-secondary z-20 shadow-xl",
                    isCurrentMonth && "hover:bg-gray-50/80 dark:hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-xs font-black w-6 h-6 flex items-center justify-center rounded-md transition-all",
                      isDayToday ? "bg-secondary text-white shadow-lg shadow-secondary/30" : isCurrentMonth ? "text-foreground" : "text-muted-foreground/20",
                      isSelected && !isDayToday && "bg-muted text-secondary"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Mini Activity Stack */}
                  <div className="mt-auto pt-2 flex flex-wrap -space-x-1.5 overflow-hidden">
                    {dayActivities.slice(0, 5).map((activity, i) => {
                      const name = activity.employer_registration?.employer_name || 'User';
                      const image = activity.employer_registration?.image;
                      const type = getStatusType(activity.status);
                      
                      return (
                        <div 
                          key={i} 
                          title={name}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 overflow-hidden ring-1 ring-border shadow-sm transform hover:-translate-y-1 hover:scale-110 transition-all z-10",
                            type === 'present' && "border-emerald-500",
                            type === 'late' && "border-amber-500",
                            type === 'absent' && "border-red-500",
                            type === 'leave' && "border-blue-500"
                          )}
                        >
                          {image ? (
                            <Image src={image} alt={name} width={24} height={24} className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full bg-secondary text-[8px] flex items-center justify-center text-white">
                              {name.charAt(0)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dayActivities.length > 5 && (
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-white dark:border-[#0c0c0c] flex items-center justify-center text-[7px] font-black text-muted-foreground ring-1 ring-border z-0">
                        +{dayActivities.length - 5}
                      </div>
                    )}
                  </div>

                  {/* Date Watermark */}
                  {!isCurrentMonth && (
                    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.02] bg-white dark:bg-[#0c0c0c] h-full w-full pointer-events-none select-none">
                       <span className="text-4xl font-black">{format(day, 'MM')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Activity Details */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-3xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
               <Clock className="w-24 h-24 text-secondary rotate-12" />
             </div>

             <div className="relative z-10">
               <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1 flex items-center gap-2">
                 <Clock className="w-3 h-3" /> Day Logs
                 {isLoading && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
               </div>
               <h3 className="text-xl font-black text-foreground tracking-tight mb-4">
                 {selectedDate ? format(selectedDate, 'EEEE, MMM do') : 'Select a date'}
               </h3>

               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {dayRecords.length > 0 ? (
                   dayRecords.map((record) => {
                     const type = getStatusType(record.status);
                     return (
                       <div 
                         key={record.id} 
                         className="group/item flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted transition-all cursor-pointer border border-transparent hover:border-border overflow-hidden"
                        >
                           <div className="relative">
                             {record.employer_registration?.image ? (
                               <Image src={record.employer_registration.image} alt={record.employer_registration.employer_name || 'User'} width={40} height={40} className="rounded-lg object-cover grayscale group-hover/item:grayscale-0 transition-all border border-border" unoptimized />
                             ) : (
                               <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center border border-border">
                                 <Users className="w-5 h-5 text-secondary" />
                               </div>
                             )}
                             <div className={cn(
                               "absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#1a1a1a] shadow-md",
                               type === 'present' && "bg-emerald-500",
                               type === 'late' && "bg-amber-500",
                               type === 'absent' && "bg-red-500",
                               type === 'leave' && "bg-blue-500"
                             )} />
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="text-xs font-black text-foreground truncate group-hover/item:text-secondary transition-colors">
                               {record.employer_registration?.employer_name || 'Unknown Guest'}
                             </div>
                             <div className="flex flex-col gap-0.5 mt-0.5">
                               <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest truncate">
                                 {record.employer_registration?.employer_position || 'Staff'}
                               </span>
                               <div className="flex items-center gap-1.5">
                                 <Clock className="w-2.5 h-2.5 text-muted-foreground/40" />
                                 <span className="text-[9px] font-bold text-muted-foreground uppercase">{format(parseISO(record.created_at), 'hh:mm aa')}</span>
                               </div>
                             </div>
                           </div>
                           <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover/item:text-secondary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all" />
                        </div>
                     );
                   })
                 ) : (
                   <div className="flex flex-col items-center justify-center py-12 opacity-40">
                     <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                       <AlertCircle className="w-8 h-8" />
                     </div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-center px-4 leading-relaxed">No dynamic activity<br/>found for this date</p>
                   </div>
                 )}
               </div>

               {dayRecords.length > 0 && (
                 <button className="w-full mt-6 py-2.5 rounded-xl bg-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                   Export for {format(selectedDate!, 'MMM dd')}
                 </button>
               )}
             </div>
          </div>

          {/* Dynamic Summary Stats */}
          <div className="bg-secondary p-6 rounded-2xl shadow-xl shadow-secondary/20 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none group-hover:scale-150 transition-all duration-700" />
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:translate-x-2 group-hover:-translate-y-2 transition-all">
               <Users className="w-16 h-16" />
            </div>
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Users className="w-6 h-6 text-white" />
                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Global Status</span>
              </div>
              <div>
                 <div className="text-3xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                   {records.length > 0 ? Math.round((records.filter(r => !getStatusType(r.status).match(/absent|leave/)).length / records.length) * 100) : '--'}%
                 </div>
                 <div className="text-[10px] font-black text-white/80 uppercase tracking-widest mt-1">System Efficiency</div>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-[9px] font-black uppercase tracking-widest mt-2 bg-black/10 px-2 py-1 rounded-lg w-fit backdrop-blur-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Real-time tracking active</span>
              </div>
            </div>
          </div>

          {/* Quick Filter Box */}
          <div className="p-5 border-2 border-dashed border-border rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-muted/30 hover:border-secondary/30 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-background transition-colors flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
              </div>
              <div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Integrity Review</div>
                <div className="text-xs font-bold text-foreground truncate">Check discrepancy logs</div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-[10px] font-black text-red-600">2</div>
          </div>

        </div>
      </div>
      
      {/* Background Atmosphere */}
      <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <style jsx global>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AdminCalendarPage;
