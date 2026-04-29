import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Upload, 
  Settings as SettingsIcon,
  ChevronRight,
  LogOut,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const menuItems = [
    { title: 'الرئيسية', icon: LayoutDashboard, path: '/' },
    { title: 'الطلاب', icon: Users, path: '/students' },
    { title: 'المعلمين والإداريين', icon: ShieldCheck, path: '/staff' },
    { title: 'الحلقات', icon: BookOpen, path: '/circles' },
    { title: 'التحضير', icon: Calendar, path: '/attendance' },
    { title: 'تتبع الحفظ', icon: TrendingUp, path: '/progress' },
    { title: 'التقارير', icon: BarChart3, path: '/reports' },
    { title: 'استيراد البيانات', icon: Upload, path: '/import' },
    { title: 'الإعدادات', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <aside
      className={`fixed right-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-white shadow-2xl transition-all duration-300 ease-in-out dark:bg-slate-900 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 px-8 py-8 lg:py-10">
        <NavLink to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-xl font-bold text-white">ق</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">بن خميس</span>
        </NavLink>
        <button
          onClick={() => setSidebarOpen(false)}
          className="block lg:hidden text-slate-500 hover:text-primary"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-grow px-4">
        <nav className="mt-2">
          <div className="space-y-1">
            <h3 className="mb-4 pr-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              القائمة الرئيسية
            </h3>
            <ul className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`group relative flex items-center gap-3.5 rounded-xl px-4 py-3 font-semibold transition-all duration-300 ease-in-out ${
                      pathname === item.path
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={20} className={`${pathname === item.path ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} />
                    {item.title}
                    {pathname === item.path && (
                        <div className="absolute left-0 h-6 w-1 rounded-r-full bg-primary animate-pulse-slow"></div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 font-semibold text-danger hover:bg-danger/5 transition-all">
          <LogOut size={20} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
