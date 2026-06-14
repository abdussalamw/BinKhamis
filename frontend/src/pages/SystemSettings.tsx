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
  const [activeTab, setActiveTab] = useState<'general' | 'whatsapp' | 'theme'>('general');
  const [status, setStatus] = useState<SystemStatus>({ backend: false, database: false, whatsapp: 'LOADING' });
  
  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    site_name: 'حلقات برو - Halqat Pro',
    primary_color: '#4f46e5',
    allow_registration: true,
    whatsapp_api_url: 'http://localhost:8080',
    whatsapp_token: 'global_secret_token',
    whatsapp_instance: 'MainInstance'
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/health');
      setStatus(response.data);
    } catch (error) {
      console.error('Health check failed');
    }
  };

  const handleSavePlatform = () => {
    alert('تم حفظ إعدادات حلقات برو بنجاح!');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-10 text-center md:text-right">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">إعدادات حلقات برو</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold">التحكم المركزي في هوية المنصة وخدماتها</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 dark:bg-white/5 p-2 rounded-[2rem] border border-slate-100 dark:border-white/5">
        <TabButton 
           active={activeTab === 'general'} 
           onClick={() => setActiveTab('general')} 
           icon={<Globe size={18}/>} 
           label="الإعدادات العامة" 
        />
        <TabButton 
           active={activeTab === 'whatsapp'} 
           onClick={() => setActiveTab('whatsapp')} 
           icon={<MessageSquare size={18}/>} 
           label="بوابة الواتساب" 
        />
        <TabButton 
           active={activeTab === 'theme'} 
           onClick={() => setActiveTab('theme')} 
           icon={<Palette size={18}/>} 
           label="الهوية البصرية" 
        />
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'general' && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="glass-card-premium p-8">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">معلومات المنصة</h3>
                    <div className="space-y-4">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">اسم النظام</label>
                          <input 
                             type="text" 
                             className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" 
                             value={platformSettings.site_name}
                             onChange={(e) => setPlatformSettings({...platformSettings, site_name: e.target.value})}
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
              <SaveButton onClick={handleSavePlatform} />
           </div>
        )}

        {activeTab === 'whatsapp' && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="glass-card-premium p-8">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                       <MessageSquare size={32} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black">ربط بوابة Evolution API</h3>
                       <p className="text-xs font-bold text-slate-400">الإعدادات المركزية لإرسال الرسائل عبر جميع المجمعات</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">رابط الخادم (API URL)</label>
                       <input 
                          type="text" 
                          placeholder="http://vps-ip:8080"
                          className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" 
                          value={platformSettings.whatsapp_api_url}
                          onChange={(e) => setPlatformSettings({...platformSettings, whatsapp_api_url: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">اسم النسخة (Instance Name)</label>
                       <input 
                          type="text" 
                          className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" 
                          value={platformSettings.whatsapp_instance}
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">مفتاح الحماية (Global API Key)</label>
                       <input 
                          type="password" 
                          className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" 
                          value={platformSettings.whatsapp_token}
                       />
                    </div>
                 </div>

                 <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                    <Zap size={20} className="text-amber-500 mt-1" />
                    <div>
                       <p className="text-xs font-black text-amber-900 mb-1">تنبيه هام</p>
                       <p className="text-[11px] text-amber-700 font-bold leading-relaxed">بوابة الواتساب هي العمود الفقري للتواصل مع أولياء الأمور والطلاب. تأكد من أن بيانات الاتصال صحيحة لضمان وصول الإشعارات الفورية.</p>
                    </div>
                 </div>
              </div>
              <SaveButton onClick={handleSavePlatform} />
           </div>
        )}

        {activeTab === 'theme' && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
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
                                onClick={() => setPlatformSettings({...platformSettings, primary_color: color})}
                                className={`w-12 h-12 rounded-2xl transition-all ${platformSettings.primary_color === color ? 'scale-125 ring-4 ring-slate-100' : ''}`}
                                style={{ backgroundColor: color }}
                             ></button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <p className="text-sm font-black mb-4">نمط العرض الافتراضي</p>
                       <div className="grid grid-cols-2 gap-4">
                          <button className="p-6 bg-white border-2 border-primary rounded-[2rem] text-center">
                             <div className="w-full h-8 bg-slate-50 rounded-lg mb-2"></div>
                             <span className="text-xs font-black">فاتح (Light)</span>
                          </button>
                          <button className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] text-center">
                             <div className="w-full h-8 bg-slate-800 rounded-lg mb-2"></div>
                             <span className="text-xs font-black text-white">داكن (Dark)</span>
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
              <SaveButton onClick={handleSavePlatform} />
           </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs transition-all ${active ? 'bg-white dark:bg-slate-900 shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatusRow = ({ label, status }: { label: string, status: boolean }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl">
    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{label}</span>
    <div className="flex items-center gap-2">
       <span className={`text-[10px] font-black ${status ? 'text-emerald-500' : 'text-rose-500'}`}>{status ? 'ONLINE' : 'OFFLINE'}</span>
       <div className={`h-2 w-2 rounded-full ${status ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
    </div>
  </div>
);

const SaveButton = ({ onClick }: { onClick: () => void }) => (
  <div className="flex justify-end pt-6">
     <button 
        onClick={onClick}
        className="flex items-center gap-2 bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
     >
        <Save size={18} />
        حفظ التغييرات
     </button>
  </div>
);

export default SystemSettings;
