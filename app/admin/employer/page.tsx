'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { Users, Search, Filter, MoreHorizontal, CheckCircle2, ScanFace } from 'lucide-react';

interface Employer {
  id: string;
  employer_id: string;
  employer_name: string;
  employer_position: string;
  face_detected: boolean;
  status: string;
  image: string;
  created_at: string;
}

const EmployerPage = () => {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const response = await fetch('/api/employers');
        if (response.ok) {
          const result = await response.json();
          setEmployers(result.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch employers:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployers();
  }, []);

  const filteredEmployers = employers.filter(employer =>
    employer.employer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employer.employer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employer.employer_position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl animate-in fade-in duration-500 ease-out pb-4 sm:pb-6 lg:pb-10">
        <header className="flex flex-wrap items-start sm:items-end justify-between gap-4">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-foreground">Employer</h1>
            <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80">
              Manage registered employers
            </p>
          </div>
        </header>

        <section className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-wrap items-start md:items-center justify-between gap-3 sm:gap-4">
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search employer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-4 text-[10px] sm:text-[11px] uppercase tracking-widest font-black text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all w-full sm:w-64 md:w-80 shadow-sm"
              />
            </div>
          </div>

          <div className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                  <th className="p-4 sm:p-5 md:p-7 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Employer</th>
                  <th className="p-4 sm:p-5 md:p-7 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5">Position</th>
                  <th className="p-4 sm:p-5 md:p-7 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5">Status</th>
                  <th className="p-4 sm:p-5 md:p-7 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        <td className="p-4 sm:p-5 md:p-7">
                          <div className="flex items-center gap-3 sm:gap-5">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-white/5 animate-pulse" />
                            <div className="flex flex-col gap-2">
                              <div className="h-4 w-32 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                              <div className="h-3 w-20 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                        </td>
                        <td className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5">
                          <div className="h-6 w-20 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                        </td>
                        <td className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredEmployers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Users className="w-8 h-8 opacity-50" />
                        <span className="text-sm font-bold">No employers found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployers.map((employer) => (
                    <tr key={employer.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                      <td className="p-4 sm:p-5 md:p-7">
                        <div className="flex items-center gap-3 sm:gap-5">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0089C0]/10 border border-[#0089C0]/20 overflow-hidden flex items-center justify-center">
                            {employer.image ? (
                              <img src={employer.image} alt={employer.employer_name} className="w-full h-full object-cover" />
                            ) : (
                              <ScanFace className="w-5 h-5 sm:w-6 sm:h-6 text-[#0089C0]" />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs sm:text-base font-black text-foreground leading-none tracking-tight group-hover:text-secondary transition-colors">{employer.employer_name}</span>
                            <span className="text-[9px] sm:text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{employer.employer_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5">
                        <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">{employer.employer_position}</span>
                      </td>
                      <td className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                          employer.face_detected 
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" 
                            : "bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20"
                        )}>
                          <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                          {employer.face_detected ? 'Registered' : 'Pending'}
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5">
                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          {new Date(employer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default EmployerPage;
