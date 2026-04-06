'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Users, MoreHorizontal, CheckCircle2, ScanFace, Pencil, Trash2, X, AlertCircle, Calendar, Mail, MapPin, Phone, Briefcase, PhilippinePeso, User, ScanLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ENV } from '@/lib/api';

interface Employer {
  id: string;
  employer_id: string;
  employer_name: string;
  employer_position: string;
  contact_no?: string;
  email?: string;
  address?: string;
  gender?: string;
  birth_day?: string;
  base_salary?: string | number;
  face_detected: boolean;
  status: string;
  image: string;
  created_at: string;
}

const EmployerPage = () => {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'delete' } | null>(null);
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error' | 'delete') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const response = await fetch(`${ENV.API_URL}/registration`);
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

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;

    const id = showDeleteConfirm;
    setIsDeleting(id);
    try {
      const response = await fetch(`${ENV.API_URL}/registration/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEmployers(prev => prev.filter(emp => emp.id !== id));
        showToast('Employer removed successfully', 'delete');
      } else {
        showToast('Failed to delete employer', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Error deleting employer', 'error');
    } finally {
      setIsDeleting(null);
      setOpenMenuId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleEditRedirect = (employer: Employer) => {
    const params = new URLSearchParams({
      edit: employer.id,
      id: employer.employer_id,
      name: employer.employer_name,
      pos: employer.employer_position,
      contact: employer.contact_no || '',
      email: employer.email || '',
      address: employer.address || '',
      gender: employer.gender || '',
      birthDay: employer.birth_day || '',
      salary: String(employer.base_salary || '')
    });
    router.push(`/admin/employerRegistration?${params.toString()}`);
  };
  
    return (
      <>
        <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full mx-auto max-w-7xl animate-in fade-in duration-200 ease-out pb-4 sm:pb-6 lg:pb-10">
          <header className="flex flex-wrap items-start sm:items-end justify-between gap-2 sm:gap-4">
            <div className="space-y-0.5 sm:space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Employers</h1>
              <p className="text-muted-foreground text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] leading-none opacity-80">
                Manage registered employers
              </p>
            </div>
          </header>

          <section className="flex flex-col gap-4 sm:gap-6 flex-1 min-h-0">
            <div className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-lg overflow-hidden shadow-xl overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                    <th className="px-4 py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-20 sm:w-24 text-center whitespace-nowrap">Picture</th>
                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap">ID</th>
                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 min-w-[120px] whitespace-nowrap">Name</th>
                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 whitespace-nowrap">Position</th>
                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 whitespace-nowrap">Gender</th>
                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 whitespace-nowrap">Birth Date</th>
                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 whitespace-nowrap">Contact</th>
                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 min-w-[140px] whitespace-nowrap">Email</th>
                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 min-w-[150px] whitespace-nowrap">Address</th>
                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 whitespace-nowrap">Salary</th>
                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-16 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {isLoading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i}>
                          <td className="p-2 w-20 sm:w-24 border-r border-gray-100 dark:border-white/5">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-white/5 animate-pulse mx-auto" />
                          </td>
                          {Array.from({ length: 9 }).map((_, idx) => (
                            <td key={idx} className="px-4 py-2 border-l border-gray-100 dark:border-white/5">
                              <div className="h-3 w-full bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                            </td>
                          ))}
                          <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 text-center">
                            <div className="h-3 w-8 bg-gray-200 dark:bg-white/5 rounded animate-pulse mx-auto" />
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : employers.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Users className="w-8 h-8 opacity-50" />
                          <span className="text-xs font-bold uppercase tracking-widest">No employers found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    employers.map((employer) => (
                      <tr 
                        key={employer.id} 
                        onClick={() => setSelectedEmployer(employer)}
                        className="group hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all border-b border-gray-100 dark:border-white/5 last:border-0 h-fit cursor-pointer"
                      >
                        <td className="p-2 w-20 sm:w-24 align-middle text-center border-r border-gray-100 dark:border-white/5">
                          <button
                            onClick={() => employer.image && setPreviewImage(employer.image)}
                            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-none border border-gray-100 dark:border-white/10 overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:opacity-80 transition-opacity cursor-zoom-in"
                          >
                            {employer.image ? (
                              <Image src={employer.image} alt={employer.employer_name} className="w-full h-full object-cover" width={64} height={64} />
                            ) : (
                              <ScanFace className="w-6 h-6 text-[#0089C0]" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{employer.employer_id}</span>
                        </td>
                        <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                          <span className="text-xs sm:text-sm font-bold text-foreground leading-none tracking-tight group-hover:text-secondary transition-colors block max-w-[120px] truncate" title={employer.employer_name}>{employer.employer_name}</span>
                        </td>
                        <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 block truncate" title={employer.employer_position}>{employer.employer_position}</span>
                        </td>
                        {/* New API Fields */}
                        <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle whitespace-nowrap">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{employer.gender || '—'}</span>
                        </td>
                        <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle whitespace-nowrap">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">{employer.birth_day || '—'}</span>
                        </td>
                        <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">{employer.contact_no || '—'}</span>
                        </td>
                        <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 block max-w-[140px] truncate" title={employer.email || '—'}>{employer.email || '—'}</span>
                        </td>
                        <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 block max-w-[150px] truncate" title={employer.address || '—'}>{employer.address || '—'}</span>
                        </td>
                        <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                          <span className="text-[10px] sm:text-xs font-bold text-secondary">
                            {employer.base_salary ? `₱${Number(employer.base_salary).toLocaleString()}` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 relative align-middle text-center min-w-[70px]">
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === employer.id ? null : employer.id);
                              }}
                              className="action-menu-button p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                            </button>
                            {openMenuId === employer.id && (
                              <div className="action-menu-dropdown absolute right-[calc(100%+12px)] top-1/2 -translate-y-[68%] z-50 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 min-w-[140px] animate-in fade-in slide-in-from-right-4 duration-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditRedirect(employer);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                >
                                  <Pencil className="w-4 h-4 text-secondary" />
                                  Edit Employer
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(employer.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[80vh] w-fit h-fit overflow-hidden animate-in zoom-in-95 duration-200">
              <Image
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
                width={800}
                height={600}
              />
              <button className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Employer Detailed View Modal */}
        {selectedEmployer && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedEmployer(null)} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-white/10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              {/* Profile Image Background Overlay (Biometric Style) */}
              {selectedEmployer.image && (
                <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] pointer-events-none overflow-hidden blur-[60px]">
                  <Image 
                    src={selectedEmployer.image} 
                    alt="Background Biometric" 
                    className="w-full h-full object-cover scale-150 grayscale brightness-50" 
                    width={800} 
                    height={800}
                    priority
                  />
                </div>
              )}
              
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,_rgba(192,17,72,0.05)_0%,_transparent_50%)] pointer-events-none" />
              
              {/* Modal Header */}
              <div className="relative p-6 sm:p-8 flex items-center justify-between border-b border-gray-50 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Employer Profile</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mt-0.5">
                      Personnel Detail Information
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEmployer(null)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="relative p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Left: Image Profile */}
                  <div className="md:col-span-4 flex flex-col items-center gap-4">
                    <div className="w-full aspect-square rounded-xl border-2 border-secondary/20 overflow-hidden bg-gray-50 dark:bg-white/5 shadow-inner">
                      {selectedEmployer.image ? (
                        <Image src={selectedEmployer.image} alt={selectedEmployer.employer_name} className="w-full h-full object-cover" width={400} height={400} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ScanFace className="w-16 h-16 text-secondary/40" />
                        </div>
                      )}
                    </div>
                    <div className="w-full p-4 rounded-xl bg-secondary/5 border border-secondary/10 text-center">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-secondary/70">Registration ID</span>
                       <div className="text-xl font-bold text-foreground mt-0.5 tracking-tight">{selectedEmployer.employer_id}</div>
                    </div>
                  </div>

                  {/* Right: Detailed Info */}
                  <div className="md:col-span-8 space-y-8">
                    <div className="space-y-5">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary flex items-center gap-3">
                         Personal Details
                        <div className="h-px flex-1 bg-secondary/20" />
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            Full Name
                          </div>
                          <div className="text-xs font-bold text-foreground tracking-tight">
                            {selectedEmployer.employer_name}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5">
                            <ScanLine className="w-3 h-3" />
                            Gender
                          </div>
                          <div className="text-xs font-bold text-foreground tracking-tight capitalize">
                            {selectedEmployer.gender || '—'}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Birth Date
                          </div>
                          <div className="text-xs font-bold text-foreground tracking-tight">
                            {selectedEmployer.birth_day || '—'}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5">
                            <Phone className="w-3 h-3" />
                            Contact No.
                          </div>
                          <div className="text-xs font-bold text-foreground tracking-tight">
                            {selectedEmployer.contact_no || '—'}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5">
                            <Mail className="w-3 h-3" />
                            Email Address
                          </div>
                          <div className="text-xs font-bold text-foreground tracking-tight truncate max-w-full" title={selectedEmployer.email || ''}>
                            {selectedEmployer.email || '—'}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" />
                            Residential Address
                          </div>
                          <div className="text-xs font-bold text-foreground tracking-tight leading-relaxed">
                            {selectedEmployer.address || '—'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary flex items-center gap-3">
                        Work Details
                        <div className="h-px flex-1 bg-secondary/20" />
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5">
                            <Briefcase className="w-3 h-3" />
                            Job Position
                          </div>
                          <div className="text-xs font-bold text-foreground tracking-tight">
                            {selectedEmployer.employer_position}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5">
                            <PhilippinePeso className="w-3 h-3" />
                            Base Salary
                          </div>
                          <div className="text-xs font-bold text-secondary tracking-tight">
                            {selectedEmployer.base_salary ? `₱${Number(selectedEmployer.base_salary).toLocaleString()}` : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 sm:p-8 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-50 dark:border-white/5 flex gap-3">
                <button
                  onClick={() => {
                    handleEditRedirect(selectedEmployer);
                    setSelectedEmployer(null);
                  }}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Pencil className="w-4 h-4 text-secondary" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setSelectedEmployer(null)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-secondary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-secondary/20 hover:opacity-90 active:scale-98 transition-all cursor-pointer"
                >
                  Confirm Information
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Confirm Deletion</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Are you sure you want to remove this employer? This action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={!!isDeleting}
                    className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-10 fade-in duration-300">
            <div className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md",
              toast?.type === 'success' && "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
              toast?.type === 'delete' && "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
              toast?.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
            )}>
              {toast?.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast?.type === 'delete' && <Trash2 className="w-5 h-5" />}
              {toast?.type === 'error' && <AlertCircle className="w-5 h-5" />}
              <span className="text-xs font-bold uppercase tracking-widest">{toast?.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </>
    );
};

export default EmployerPage;


