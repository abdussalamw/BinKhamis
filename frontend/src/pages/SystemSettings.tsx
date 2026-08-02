import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Check as CheckCircle2, 
  MessageSquare,
  Palette,
  Save,
  Globe,
  Zap,
  Layout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SystemStatus {
  backend: boolean;
  whatsapp: string;
  database: boolean;
}

const SystemSettings = () => {
  const [status, setStatus] = useState<SystemStatus>({ backend: false, database: false, whatsapp: 'LOADING' });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSaved, setIsSaved] = useState(false);
  
  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState(() => {
    const saved = localStorage.getItem('platform_settings');
    return saved ? JSON.parse(saved) : {
      site_name: 'حلقات برو - Halqat Pro',
      primary_color: '#4f46e5',
      allow_registration: true,
      whatsapp_api_url: 'http://localhost:8080',
      whatsapp_token: 'global_secret_token',
      whatsapp_instance: 'MainInstance'
    };
  });

  useEffect(() => {
    fetchStatus();

    const handleThemeSync = () => {
      setTheme(localStorage.getItem('theme') || 'light');
    };
    window.addEventListener('themeChangedHeader', handleThemeSync);
    return () => window.removeEventListener('themeChangedHeader', handleThemeSync);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/health');
      setStatus(response.data);
    } catch (error) {
      console.error('Health check failed');
    }
  };

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('themeChangedSettings'));
  };

  const changePrimaryColor = (color: string) => {
    setPlatformSettings({...platformSettings, primary_color: color});
    document.documentElement.style.setProperty('--color-primary', color);
  };

  const handleSavePlatform = () => {
    localStorage.setItem('platform_settings', JSON.stringify(platformSettings));
    document.title = platformSettings.site_name;
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-10 text-center md:text-right">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">إعدادات حلقات برو</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold">التحكم المركزي في هوية المنصة وخدماتها</p>
      </div>

      {/* Content Area */}
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="glass-card-premium p-8">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">معلومات المنصة</h3>
                    <div className="space-y-4">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">اسم النظام</label>
                          <input 
                             type="text" 
                             className="w-full bg-slate-100 dark:bg-white/5 border-none p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-200 text-slate-500 cursor-not-allowed" 
                             value={platformSettings.site_name}
                             disabled
                          />
                       </div>
                       <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl mt-4">
                          <span className="text-sm font-bold">تفعيل التسجيل الذاتي للطلاب</span>
                          <input 
                             type="checkbox" 
                             checked={platformSettings.allow_registration} 
                             onChange={(e) => setPlatformSettings({...platformSettings, allow_registration: e.target.checked})}
                             className="w-5 h-5 accent-primary"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="glass-card-premium p-8">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">حالة الخدمات المركزية</h3>
                    <div className="space-y-4">
                       <StatusRow label="اتصال الخادم (Backend)" status={status.backend} />
                       <StatusRow label="قاعدة البيانات" status={status.database} />
                       <StatusRow label="محرك الإشعارات" status={status.whatsapp === 'CONNECTED'} />
                    </div>
                 </div>
              </div>

              <div className="glass-card-premium p-8">
                 <h3 className="text-lg font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                    <Palette className="text-primary" />
                    تخصيص الهوية البصرية لـ حلقات برو
                 </h3>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                       <p className="text-sm font-black mb-4">اللون الأساسي للمنصة</p>
                       <div className="flex flex-wrap gap-4">
                           {['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                              <button 
                                 key={color}
                                 onClick={() => changePrimaryColor(color)}
                                 className={`w-12 h-12 rounded-2xl transition-all ${platformSettings.primary_color === color ? 'scale-125 ring-4 ring-slate-100' : ''}`}
                                 style={{ backgroundColor: color }}
                              ></button>
                           ))}
                       </div>
                    </div>

                    <div>
                       <p className="text-sm font-black mb-4">نمط العرض الافتراضي</p>
                        <div className="grid grid-cols-2 gap-4">
                           <button 
                             onClick={() => toggleTheme('light')}
                             className={`p-6 bg-white border-2 rounded-[2rem] text-center transition-all ${theme === 'light' ? 'border-primary shadow-lg shadow-primary/20 scale-105' : 'border-slate-100'}`}
                           >
                              <div className="w-full h-8 bg-slate-50 rounded-lg mb-2"></div>
                              <span className="text-xs font-black text-slate-700">فاتح (Light)</span>
                           </button>
                           <button 
                             onClick={() => toggleTheme('dark')}
                             className={`p-6 bg-slate-900 border-2 rounded-[2rem] text-center transition-all ${theme === 'dark' ? 'border-primary shadow-lg shadow-primary/20 scale-105' : 'border-slate-800'}`}
                           >
                              <div className="w-full h-8 bg-slate-800 rounded-lg mb-2"></div>
                              <span className="text-xs font-black text-white">داكن (Dark)</span>
                           </button>
                        </div>
                    </div>
                 </div>
              </div>
              
              <SaveButton onClick={handleSavePlatform} isSaved={isSaved} />
      </div>
    </div>
  );
};

const StatusRow = ({ label, status }: { label: string, status: boolean }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl">
    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{label}</span>
    <div className="flex items-center gap-2">
       <span className={`text-[10px] font-black ${status ? 'text-emerald-500' : 'text-rose-500'}`}>{status ? 'ONLINE' : 'OFFLINE'}</span>
       <div className={`h-2 w-2 rounded-full ${status ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
    </div>
  </div>
);

const SaveButton = ({ onClick, isSaved }: { onClick: () => void, isSaved?: boolean }) => (
  <div className="flex justify-end pt-6">
     <button 
        onClick={onClick}
        disabled={isSaved}
        className={`flex items-center gap-2 px-10 py-5 rounded-[2rem] font-black text-sm shadow-xl transition-all ${isSaved ? 'bg-emerald-500 text-white cursor-default' : 'bg-slate-900 text-white hover:scale-105 active:scale-95'}`}
     >
        {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
        {isSaved ? 'تم حفظ التغييرات بنجاح!' : 'حفظ التغييرات'}
     </button>
  </div>
);

export default SystemSettings;
