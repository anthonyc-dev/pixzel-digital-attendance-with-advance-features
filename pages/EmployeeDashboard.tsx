import React from 'react';
import Layout from '@/components/Layout';
import { Download, Search, SlidersHorizontal, CalendarDays, MoreHorizontal, CheckCircle2, Clock3, Umbrella, UserX, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const stats = [
  { title: 'Present Today', value: '40', sub: '124 People Remaining', icon: CheckCircle2, iconColor: 'text-green-500', bgColor: 'bg-green-50' },
  { title: 'Late Entry', value: '26', sub: '12 People are on Time', icon: Clock3, iconColor: 'text-orange-500', bgColor: 'bg-orange-50' },
  { title: 'On Leave', value: '04', sub: 'Approved Leave', icon: Umbrella, iconColor: 'text-blue-500', bgColor: 'bg-blue-50' },
  { title: 'Absent', value: '01', sub: 'Without Informing', icon: UserX, iconColor: 'text-red-500', bgColor: 'bg-red-50' },
];

const employees = [
  { 
    name: 'Dianne Russell', role: 'UI/UX Designer', avatar: 'https://i.pravatar.cc/150?u=dianne',
    attendance: [
      { day: 'Sun', hours: '8 Hours', status: 'active', icon: 'check' },
      { day: 'Mon', hours: '4h 36m', status: 'late', icon: 'clock' },
      { day: 'Tue', hours: 'Leave', status: 'leave', icon: 'smile' },
      { day: 'Wed', hours: '8h 39m', status: 'active', icon: 'check' },
      { day: 'Thu', hours: 'Active', status: 'active', icon: null },
      { day: 'Fri', hours: '', status: 'empty' },
      { day: 'Sat', hours: '', status: 'empty' },
    ]
  },
  { 
    name: 'Bessie Cooper', role: 'Product Designer', avatar: 'https://i.pravatar.cc/150?u=bessie',
    attendance: [
      { day: 'Sun', hours: '6h 24m', status: 'late', icon: 'clock' },
      { day: 'Mon', hours: '8 Hours', status: 'active', icon: 'check' },
      { day: 'Tue', hours: '8 Hours', status: 'active', icon: 'check' },
      { day: 'Wed', hours: 'Absent', status: 'absent', icon: 'x' },
      { day: 'Thu', hours: 'Active', status: 'active', icon: null },
      { day: 'Fri', hours: '', status: 'empty' },
      { day: 'Sat', hours: '', status: 'empty' },
    ]
  },
  { 
    name: 'Brooklyn Jones', role: 'Marketing Officer', avatar: 'https://i.pravatar.cc/150?u=brooklyn',
    attendance: [
      { day: 'Sun', hours: '8 Hours', status: 'active', icon: 'check' },
      { day: 'Mon', hours: '8h 12m', status: 'active', icon: 'check' },
      { day: 'Tue', hours: '3h 45m', status: 'late', icon: 'clock' },
      { day: 'Wed', hours: '8 Hours', status: 'active', icon: 'check' },
      { day: 'Thu', hours: 'Leave', status: 'leave', icon: 'smile' },
      { day: 'Fri', hours: '', status: 'empty' },
      { day: 'Sat', hours: '', status: 'empty' },
    ]
  }
];

const EmployeeDashboard = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full max-w-7xl">
        
        {/* Page Title */}
        <header className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-primary">Employee Attendance</h1>
            <p className="text-gray-400 text-sm font-medium">Analyse attendance records of employee</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-secondary text-white rounded-xl font-bold text-sm shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className="p-6 bg-white border border-gray-100 rounded-3xl hover:border-secondary/20 hover:shadow-xl hover:shadow-gray-100 transition-all group flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-xl", stat.bgColor)}>
                  <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                </div>
                <button className="text-gray-300 hover:text-primary transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <div>
                <div className="text-4xl font-black text-primary mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">{stat.title}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{stat.sub}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Table Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  className="bg-gray-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:ring-1 focus:ring-secondary/20 transition-all w-64"
                />
             </div>
             <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl">
                <span className="px-3 py-1 bg-white text-[10px] font-bold text-gray-500 rounded-lg shadow-sm border border-gray-50 flex items-center gap-2">
                  Leave <span className="text-gray-300">×</span>
                </span>
                <span className="px-3 py-1 bg-white text-[10px] font-bold text-gray-500 rounded-lg shadow-sm border border-gray-50 flex items-center gap-2">
                  Absent <span className="text-gray-300">×</span>
                </span>
                <span className="px-3 py-1 bg-white text-[10px] font-bold text-gray-500 rounded-lg shadow-sm border border-gray-50 flex items-center gap-2">
                  Active <span className="text-gray-300">×</span>
                </span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-primary hover:bg-white transition-all">
              <SlidersHorizontal className="w-3 h-3" />
              Filter <span className="text-gray-300 ml-1">03</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-primary hover:bg-white transition-all">
              <CalendarDays className="w-3 h-3" />
              08. August 2025
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="w-full bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm shadow-gray-50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 w-64">Employee</th>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <th key={day} className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-l border-gray-100">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={emp.name} className={cn("group hover:bg-gray-50/50 transition-colors", i !== employees.length - 1 && "border-b border-gray-100")}>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                       <Image src={emp.avatar} alt={emp.name} width={40} height={40} className="rounded-xl grayscale-[0.5] group-hover:grayscale-0 transition-all border border-gray-100" />
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-primary leading-tight">{emp.name}</span>
                          <span className="text-[10px] font-bold text-gray-400">{emp.role}</span>
                       </div>
                    </div>
                  </td>
                  {emp.attendance.map((att, j) => (
                    <td key={j} className="p-5 border-l border-gray-100 relative min-w-[120px]">
                      <span className="absolute top-3 right-4 text-[10px] font-black text-gray-300">{1 + j + (i*2) % 31}</span>
                      {att.status !== 'empty' ? (
                        <div className={cn(
                          "mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black w-fit transition-all",
                          att.status === 'active' && "bg-green-50 text-green-600 border border-green-100",
                          att.status === 'late' && "bg-orange-50 text-orange-600 border border-orange-100",
                          att.status === 'leave' && "bg-purple-50 text-purple-600 border border-purple-100",
                          att.status === 'absent' && "bg-red-50 text-red-600 border border-red-100"
                        )}>
                          {att.icon === 'check' && <CheckCircle2 className="w-3 h-3" />}
                          {att.icon === 'clock' && <Clock3 className="w-3 h-3" />}
                          {att.icon === 'smile' && <Umbrella className="w-3 h-3" />}
                          {att.icon === 'x' && <UserX className="w-3 h-3" />}
                          {att.hours}
                        </div>
                      ) : (
                        <div className="mt-4 h-[24px] w-full bg-[radial-gradient(circle_at_1px_1px,_#f3f4f6_1px,_transparent_0)] bg-[size:10px_10px]" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
