import { useState, useEffect } from 'react';
import { 
  Bell, 
  Menu, 
  LogOut, 
  Settings as SettingsIcon, 
  User as UserIcon,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           localStorage.getItem('theme') === 'dark';
  });

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'مستخدم';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/signin');
  };

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white/70 dark:bg-midnight/70 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 transition-all duration-300">
      <div className="flex flex-grow items-center justify-between px-6 py-3 md:px-8">
        
        {/* Mobile Toggle & Left Actions */}
        <div className="flex items-center gap-4 lg:w-1/3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="p-2 rounded-xl border border-slate-100 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800 lg:hidden hover:bg-slate-50 transition-colors"
          >
            <Menu size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white dark:bg-white/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-slate-500 dark:text-slate-400 group">
            <Bell size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-midnight"></span>
          </button>
        </div>

        {/* Center: System Name */}
        <div className="flex items-center justify-center lg:w-1/3">
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none">
              مجمع بن خميس التعليمي
            </h1>
            <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest mt-1">
              نظام إدارة الحلقات
            </span>
          </div>
        </div>

        {/* Right (Left in RTL): User Dropdown */}
        <div className="flex items-center justify-end gap-4 lg:w-1/3">
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all group"
            >
              <div className="hidden text-right md:block">
                <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                  {user?.name || 'مستخدم'}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {role === 'admin' ? 'مدير النظام' : role}
                </p>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-secondary rounded-full blur-sm opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative h-9 w-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-primary font-black shadow-sm overflow-hidden border border-slate-100 dark:border-white/10">
                   {user?.name?.charAt(0) || <UserIcon size={18} />}
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)}
                ></div>
                <div className="absolute left-0 mt-3 w-64 origin-top-left glass-card-premium p-2 z-20 animate-in slide-in-from-top-2 duration-300 shadow-2xl">
                  <div className="px-4 py-3 mb-2 border-b border-slate-100 dark:border-white/5">
                    <p className="text-xs font-black text-slate-800 dark:text-white">{user?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{role}</p>
                  </div>

                  <div className="space-y-1">
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-primary/5 hover:text-primary transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        السمة: {isDarkMode ? 'الوضع الفاتح' : 'الوضع الليلي'}
                      </div>
                      <div className={`h-5 w-9 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'}`}>
                        <div className={`h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? '-translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </button>

                    <Link 
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-primary/5 hover:text-primary transition-all"
                    >
                      <SettingsIcon size={16} />
                      {role === 'admin' ? 'إعدادات النظام' : 'إعدادات الحساب'}
                    </Link>

                    <div className="my-1 border-t border-slate-100 dark:border-white/5"></div>

                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                    >
                      <LogOut size={16} />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
