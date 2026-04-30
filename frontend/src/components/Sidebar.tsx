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
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'student';

  const menuItems = [
    { title: 'لوحة التحكم', icon: LayoutDashboard, path: '/', roles: ['admin', 'supervisor', 'teacher', 'student'] },
    { title: 'ملفي الشخصي', icon: Users, path: '/student-profile', roles: ['student'] },
    { title: 'إدارة الطلاب', icon: Users, path: '/students', roles: ['admin', 'supervisor'] },
    { title: 'فريق العمل', icon: ShieldCheck, path: '/staff', roles: ['admin', 'supervisor'] },
    { title: 'الحلقات القرآنية', icon: BookOpen, path: '/circles', roles: ['admin', 'supervisor', 'teacher'] },
    { title: 'سجل الحضور', icon: Calendar, path: '/attendance', roles: ['admin', 'supervisor', 'teacher'] },
    { title: 'متابعة الحفظ', icon: TrendingUp, path: '/progress', roles: ['admin', 'supervisor', 'teacher'] },
    { title: 'مركز التقارير', icon: BarChart3, path: '/reports', roles: ['admin', 'supervisor', 'teacher'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/signin');
  };

  return (
    <aside
      className={`fixed right-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-hidden bg-white/70 backdrop-blur-3xl border-l border-white/40 shadow-[10px_0_40px_rgba(0,0,0,0.02)] transition-all duration-500 ease-in-out dark:bg-midnight/80 dark:border-white/5 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Sidebar Header - Simplified */}
      <div className="flex items-center justify-center py-6 border-b border-slate-50 dark:border-white/5 mb-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-slate-400 hover:text-primary transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto flex-grow px-6">
        <nav className="mt-4">
          <div className="space-y-2">
            <h3 className="mb-6 pr-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">
              القائمة الرئيسية
            </h3>
            <ul className="flex flex-col gap-3">
              {filteredItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      group relative flex items-center gap-3 rounded-xl px-4 py-3 font-black transition-all duration-500
                      ${isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-500 hover:bg-slate-50 hover:translate-x-[-5px] dark:text-slate-400 dark:hover:bg-white/5'
                      }
                    `}
                  >
                    <item.icon size={18} className="transition-transform group-hover:scale-110" />
                    <span className="text-xs">{item.title}</span>
                    
                    {!pathname.includes(item.path) && (
                        <Sparkles className="absolute left-4 opacity-0 group-hover:opacity-40 transition-opacity" size={14} />
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer - Compact Credits */}
      <div className="px-6 pb-8 mt-auto">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">النظام يعمل بكفاءة</span>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;

