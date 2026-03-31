import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  BarChart3, 
  Calendar, 
  Building2, 
  Clock, 
  Briefcase, 
  DollarSign, 
  Settings, 
  PlusCircle,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/EmployeeDashboard' },
  { name: 'Calendar', icon: Calendar, href: '/EmployeeHome' },
  { name: 'Company', icon: Building2, href: '#', hasSub: true },
  { 
    name: 'Activities', 
    icon: Clock, 
    href: '#', 
    hasSub: true,
    isOpen: true,
    subItems: [
      { name: 'Attendance', href: '/EmployeeDashboard', active: true },
      { name: 'Leave', href: '#', badge: '02' }
    ]
  },
  { name: 'Job Management', icon: Briefcase, href: '#', hasSub: true },
  { name: 'Payroll', icon: DollarSign, href: '#' },
];

const bottomItems = [
  { name: 'Settings', icon: Settings, href: '#' },
  { name: 'Integration', icon: PlusCircle, href: '#' },
];

const AppSidebar = () => {
  const router = useRouter();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col p-6 font-sans">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="p-2 bg-secondary rounded-lg">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-black tracking-tight text-primary">PIXZEL</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => (
          <div key={item.name} className="space-y-1">
            <Link 
              href={item.href}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-sm",
                router.pathname === item.href 
                  ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span className="font-semibold">{item.name}</span>
              </div>
              {item.hasSub && (
                item.isOpen ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />
              )}
            </Link>
            
            {item.subItems && item.isOpen && (
              <div className="ml-9 space-y-1 mt-1 border-l-2 border-gray-50 pl-4 py-1">
                {item.subItems.map((sub) => (
                  <Link 
                    key={sub.name}
                    href={sub.href}
                    className={cn(
                      "flex items-center justify-between py-2 text-xs font-medium transition-colors",
                      sub.active ? "text-secondary" : "text-gray-400 hover:text-primary"
                    )}
                  >
                    <span>{sub.name}</span>
                    {sub.badge && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold">
                        {sub.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto space-y-6">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <Link 
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 p-3 text-sm font-semibold text-gray-500 hover:text-primary transition-all rounded-xl"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Theme Slider */}
        <div className="p-1 bg-gray-50 rounded-xl flex items-center shadow-inner">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-white text-primary rounded-lg shadow-sm">
            <Sun className="w-3 h-3" />
            <span>Light</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-400">
            <Moon className="w-3 h-3" />
            <span>Dark</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
