'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Search, MoreHorizontal, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  type: string;
  title?: string;
  title2?: string;
  color: string;
  left: string;
  width: string;
  avatar?: string;
  avatars?: string[];
  extra?: string;
  top?: string;
  active?: boolean;
}

const hours = Array.from({ length: 7 }, (_, i) => ({ day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i], date: 29 + i }));

const weeks: { id: string; date: string; events: CalendarEvent[] }[] = [
  { id: '16', date: 'Jun 2023', events: [
    { type: 'available', title: 'Available', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5', left: '60%', width: '35%', avatars: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3'], extra: '+22' }
  ]},
  { id: '17', date: 'Jun 2023', events: [
    { type: 'leave', title: 'Sarah M. - Sick Leave', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/5', left: '42%', width: '25%', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { type: 'available', title: 'Available', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5', left: '42%', width: '30%', avatars: ['https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5', 'https://i.pravatar.cc/150?u=6'], extra: '+21', top: '50px' },
    { type: 'available', title: 'Available', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5', left: '72%', width: '20%', avatars: ['https://i.pravatar.cc/150?u=7', 'https://i.pravatar.cc/150?u=8'], extra: '+24', top: '50px' }
  ]},
  { id: '18', date: 'Jun 2023', events: [
    { type: 'meeting', title: 'Meeting', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5', left: '42%', width: '15%', avatars: ['https://i.pravatar.cc/150?u=9', 'https://i.pravatar.cc/150?u=10'] },
    { type: 'available', title: 'Available', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5', left: '42%', width: '45%', avatars: ['https://i.pravatar.cc/150?u=11', 'https://i.pravatar.cc/150?u=12'], extra: '+17', top: '50px' },
    { type: 'available', title2: 'Available', color: 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/30', left: '88%', width: '12%', active: true }
  ]}
];

const EmployeeHome = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl animate-in fade-in duration-500 ease-out">
        
        {/* Top Controls Palette */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 md:gap-6">
           <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl sm:rounded-[1.5rem] w-fit shadow-2xl">
              <button className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 bg-secondary text-white text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg shadow-secondary/40 border border-secondary/50 hover:scale-105 active:scale-95 transition-all">month</button>
              <button className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 text-gray-500 text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors">week</button>
              <button className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 text-gray-500 text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors">day</button>
           </div>

           <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="flex items-center gap-2 sm:gap-3 p-1 bg-white/5 border border-white/10 rounded-xl sm:rounded-[1.5rem] shadow-2xl">
                 <button className="p-1.5 sm:p-2 md:p-2.5 text-gray-500 hover:text-white transition-colors hover:bg-white/5 rounded-lg sm:rounded-xl group ring-1 ring-inset ring-transparent hover:ring-white/10"><ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5 group-hover:-translate-x-1 transition-transform" /></button>
                 <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4">
                   <CalendarIcon className="w-4 sm:w-5 h-4 sm:h-5 text-secondary animate-pulse" />
                   <span className="text-xs sm:text-base font-black text-white uppercase tracking-tight">April 2025</span>
                 </div>
                 <button className="p-1.5 sm:p-2 md:p-2.5 text-gray-500 hover:text-white transition-colors hover:bg-white/5 rounded-lg sm:rounded-xl group ring-1 ring-inset ring-transparent hover:ring-white/10"><ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" /></button>
              </div>
              <button className="p-2.5 sm:p-3 md:p-4 bg-secondary text-white rounded-xl sm:rounded-[1.5rem] shadow-2xl shadow-secondary/40 hover:scale-[1.05] active:scale-[0.95] transition-all border border-secondary/50 group">
                <UserPlus className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:rotate-[360deg] transition-transform duration-1000" />
              </button>
           </div>
        </div>

        {/* Global Calendar Panel */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl sm:rounded-[3rem] md:rounded-[4rem] p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-black flex flex-col min-h-[450px] sm:min-h-[550px] md:min-h-[650px] relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(192,17,72,0.03)_0%,_transparent_50%)] pointer-events-none" />

          {/* Table Header Design */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] border-b border-white/5 pb-3 sm:pb-5 md:pb-8 mb-2 sm:mb-3 md:mb-4">
            <div className="flex flex-col gap-0.5 sm:gap-1 justify-center">
               <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-gray-700 uppercase tracking-widest block">Timezone</span>
               <span className="text-white text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-tight">PHL (UTC+8)</span>
            </div>
            <div className="grid grid-cols-7 w-full text-center items-center">
               {hours.map(h => (
                 <div key={h.day} className="flex flex-col gap-1 sm:gap-2 group cursor-pointer">
                   <span className="text-[8px] sm:text-[9px] md:text-[11px] font-black text-gray-600 uppercase tracking-widest leading-none group-hover:text-secondary transition-colors">{h.day}</span>
                   <div className={cn(
                     "w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto flex items-center justify-center rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] md:text-xs font-black transition-all",
                     h.date === 31 ? "bg-secondary text-white shadow-lg shadow-secondary/30 ring-2 ring-secondary/50 scale-110" : "text-gray-400 group-hover:bg-white/5 group-hover:text-white"
                   )}>
                     {h.date}
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Grid Rows Data */}
          <div className="flex-1 flex flex-col pt-2 sm:pt-3 md:pt-4 overflow-x-auto">
            {weeks.map((week, idx) => (
              <div key={week.id} className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] flex-1 border-b border-white/5 group min-h-[100px] sm:min-h-[140px] md:min-h-[180px] hover:bg-white/[0.01] transition-all">
                <div className="flex flex-col justify-center gap-1 sm:gap-2 border-r border-white/5 py-4 sm:py-5 md:py-8 pr-4 sm:pr-5 md:pr-8">
                   <span className="text-sm sm:text-base md:text-lg font-black text-white/40 group-hover:text-white leading-none uppercase tracking-tighter transition-all">Week {week.id}</span>
                   <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-gray-700 uppercase tracking-widest group-hover:text-gray-500 transition-all hidden sm:block">{week.date}</span>
                </div>

                <div className="relative grid grid-cols-7 w-full h-full">
                  {/* Visual Grid Lines */}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className={cn("h-full border-r border-white/5 opacity-50", i === 6 && "border-r-0")} />
                  ))}

                  {/* Overlaid Event Badges */}
                  <div className="absolute inset-0 p-2 sm:p-4 md:p-6 pointer-events-none">
                    {week.events.map((event, eIdx) => (
                      <div 
                        key={eIdx}
                        className={cn(
                          "absolute h-[28px] sm:h-[36px] md:h-[42px] rounded-lg sm:rounded-[1rem] md:rounded-[1.2rem] border px-2 sm:px-3 md:px-5 flex items-center gap-1.5 sm:gap-2 md:gap-3 pointer-events-auto cursor-pointer shadow-xl hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97] transition-all group/event",
                          event.color,
                          event.active ? "z-20 animate-in fade-in zoom-in duration-500" : "z-10 bg-black/40 backdrop-blur-md"
                        )}
                        style={{ 
                          left: event.left, 
                          width: event.width, 
                          top: event.top || '10px' 
                        }}
                      >
                         {event.avatar && <Image src={event.avatar} alt="Avatar" width={18} height={18} className="w-[18px] h-[18px] sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-lg sm:rounded-xl border border-white/20 shadow-lg grayscale group-hover/event:grayscale-0 transition-all" />}
                         {event.avatars && (
                           <div className="flex -space-x-1 sm:-space-x-2 group-hover/event:-space-x-0 transition-all duration-500">
                             {event.avatars.map((av, avIdx) => (
                               <Image key={avIdx} src={av} alt="Avatar" width={18} height={18} className="w-[18px] h-[18px] sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-lg sm:rounded-xl border-2 border-black/50 shadow-md grayscale group-hover/event:grayscale-0 transition-all" />
                             ))}
                             {event.extra && <div className="w-5 h-5 sm:w-6 md:w-7 rounded-lg sm:rounded-xl bg-secondary text-white border-2 border-black flex items-center justify-center text-[7px] sm:text-[8px] md:text-[9px] font-black shadow-md">{event.extra}</div>}
                           </div>
                         )}
                         <span className={cn("text-[7px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate", event.active ? "text-white" : "text-white/80 group-hover/event:text-white")}>{event.title || event.title2}</span>
                         {event.active && (
                           <div className="ml-auto w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-white rounded-full border-2 sm:border-4 border-secondary animate-bounce shadow-lg shadow-black" />
                         )}
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Branding Glow */}
          <div className="absolute -bottom-10 sm:-bottom-16 md:-bottom-20 -right-10 sm:-right-16 md:-right-20 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-secondary/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
          <div className="absolute -top-10 sm:-top-16 md:-top-20 -left-10 sm:-left-16 md:-left-20 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-secondary/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
        </div>

      </div>
    </Layout>
  );
};

export default EmployeeHome;
