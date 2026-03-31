import React from 'react';
import Layout from '@/components/Layout';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Search, MoreHorizontal, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const hours = Array.from({ length: 7 }, (_, i) => ({ day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i], date: 29 + i }));

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

const weeks: { id: string; date: string; events: CalendarEvent[] }[] = [
  { id: '16', date: 'Jun 2023', events: [
    { type: 'available', title: 'Available', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', left: '60%', width: '35%', avatars: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3'], extra: '+22' }
  ]},
  { id: '17', date: 'Jun 2023', events: [
    { type: 'leave', title: 'Sarah M. - Sick Leave', color: 'bg-orange-50 text-orange-600 border-orange-100', left: '42%', width: '25%', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { type: 'available', title: 'Available', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', left: '42%', width: '30%', avatars: ['https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5', 'https://i.pravatar.cc/150?u=6'], extra: '+21', top: '45px' },
    { type: 'available', title: 'Available', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', left: '72%', width: '20%', avatars: ['https://i.pravatar.cc/150?u=7', 'https://i.pravatar.cc/150?u=8'], extra: '+24', top: '45px' }
  ]},
  { id: '18', date: 'Jun 2023', events: [
    { type: 'meeting', title: 'Meeting', color: 'bg-blue-50 text-blue-600 border-blue-100', left: '42%', width: '15%', avatars: ['https://i.pravatar.cc/150?u=9', 'https://i.pravatar.cc/150?u=10'] },
    { type: 'available', title: 'Available', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', left: '42%', width: '45%', avatars: ['https://i.pravatar.cc/150?u=11', 'https://i.pravatar.cc/150?u=12'], extra: '+17', top: '45px' },
    { type: 'available', title2: 'Available', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', left: '88%', width: '12%', active: true }
  ]}
];

const EmployeeHome = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full max-w-7xl">
        
        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="flex items-center gap-2 p-1 bg-gray-50 border border-gray-100 rounded-2xl w-fit">
              <button className="px-6 py-2 bg-white text-primary text-xs font-black rounded-xl shadow-sm border border-gray-50">month</button>
              <button className="px-6 py-2 text-gray-400 text-xs font-black hover:text-primary transition-colors">week</button>
              <button className="px-6 py-2 text-gray-400 text-xs font-black hover:text-primary transition-colors">day</button>
           </div>

           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-1 bg-gray-50 border border-gray-100 rounded-2xl">
                 <button className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-white rounded-lg group"><ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /></button>
                 <div className="flex items-center gap-2 px-3">
                   <CalendarIcon className="w-4 h-4 text-secondary" />
                   <span className="text-sm font-black text-primary">April 2025</span>
                 </div>
                 <button className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-white rounded-lg group"><ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></button>
              </div>
              <button className="p-3 bg-secondary text-white rounded-2xl shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all">
                <UserPlus className="w-5 h-5" />
              </button>
           </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm shadow-gray-50 flex flex-col min-h-[600px] relative overflow-hidden">
          
          {/* Grid Header */}
          <div className="grid grid-cols-[120px_1fr] border-b border-gray-50 pb-6 mb-2">
            <div className="flex items-center gap-2">
               <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Timezone</span>
            </div>
            <div className="grid grid-cols-7 w-full text-center">
               {hours.map(h => (
                 <div key={h.day} className="flex flex-col gap-1">
                   <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">{h.day}</span>
                   <span className={cn("text-xs font-black text-gray-300", h.date === 31 && "text-primary")}>{h.date}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Grid Rows (Weeks) */}
          <div className="flex-1 flex flex-col">
            {weeks.map((week, idx) => (
              <div key={week.id} className="grid grid-cols-[120px_1fr] flex-1 border-b border-gray-50 group min-h-[160px]">
                <div className="flex flex-col justify-center gap-1 border-r border-gray-50 py-4">
                   <span className="text-sm font-black text-primary leading-none uppercase tracking-tighter">Week {week.id}</span>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{week.date}</span>
                </div>

                <div className="relative grid grid-cols-7 w-full h-full">
                  {/* Grid Lines Overlay */}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className={cn("h-full border-r border-gray-50/50", i === 6 && "border-r-0")} />
                  ))}

                  {/* Events Overlay */}
                  <div className="absolute inset-0 p-4 pointer-events-none">
                    {week.events.map((event, eIdx) => (
                      <div 
                        key={eIdx}
                        className={cn(
                          "absolute h-[34px] rounded-full border px-4 flex items-center gap-2 pointer-events-auto cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all",
                          event.color,
                          event.active && "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20"
                        )}
                        style={{ 
                          left: event.left, 
                          width: event.width, 
                          top: event.top || '15px' 
                        }}
                      >
                         {event.avatar && <Image src={event.avatar} alt="Avatar" width={20} height={20} className="rounded-full border border-white/20" />}
                         {event.avatars && (
                           <div className="flex -space-x-1.5 p-0.5">
                             {event.avatars.map((av, avIdx) => (
                               <Image key={avIdx} src={av} alt="Avatar" width={20} height={20} className="rounded-full border-2 border-white" />
                             ))}
                             {event.extra && <div className="w-5 h-5 rounded-full bg-secondary/10 border-2 border-white flex items-center justify-center text-[8px] font-black">{event.extra}</div>}
                           </div>
                         )}
                         <span className="text-[10px] font-black truncate">{event.title || event.title2}</span>
                         {event.active && <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-4 border-secondary animate-pulse" />}
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Decorative Corner */}
          <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        </div>

      </div>
    </Layout>
  );
};

export default EmployeeHome;
