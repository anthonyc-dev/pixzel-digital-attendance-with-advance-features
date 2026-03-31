'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background font-sans">
            <div className="fixed top-0 left-0 h-screen z-40">
                <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            </div>

            <main className={isCollapsed ? "ml-20" : "ml-64"}>
                <div className=" h-screen overflow-y-auto">
                    <AdminHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    <div className="w-full px-6 pb-6 pt-10">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
