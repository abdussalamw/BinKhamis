import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Save, 
  User, 
  Moon, 
  Sun,
  Smartphone,
  Globe,
  Palette
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [darkMode, setDarkMode] = useState(false);

  const tabs = [
    { id: 'general', title: 'عام', icon: SettingsIcon },
    { id: 'profile', title: 'الملف الشخصي', icon: User },
    { id: 'appearance', title: 'المظهر', icon: Palette },
    { id: 'whatsapp', title: 'الواتساب', icon: Smartphone },
    { id: 'security', title: 'الأمان', icon: Shield },
    { id: 'backup', title: 'النسخ الاحتياطي', icon: Database },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white">الإعدادات</h1>
        <p className="text-lg font-bold text-slate-500 dark:text-slate-400">تحكم في تفضيلات النظام وإعدادات التواصل</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <div className="glass-card rounded-[32px] p-4 shadow-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon size={22} strokeWidth={2.5} />
                <span>{tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="glass-card rounded-[40px] p-10 shadow-2xl min-h-[600px] flex flex-col">
            <div className="flex-grow">
              {activeTab === 'general' && (
                <div className="space-y-8 animate-in slide-in-from-left duration-500">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">الإعدادات العامة</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">تعديل معلومات المؤسسة الأساسية</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-300 pr-2">اسم المؤسسة</label>
                      <input 
                        type="text" 
                        defaultValue="حلقات بن خميس"
                        className="w-full rounded-2xl border-none bg-slate-50 p-4 font-bold text-slate-800 shadow-inner outline-none ring-2 ring-transparent transition-all focus:ring-primary/20 dark:bg-slate-800 dark:text-white" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-300 pr-2">الفصل الدراسي</label>
                      <select className="w-full rounded-2xl border-none bg-slate-50 p-4 font-bold text-slate-800 shadow-inner outline-none ring-2 ring-transparent transition-all focus:ring-primary/20 dark:bg-slate-800 dark:text-white">
                        <option>الفصل الأول 1447</option>
                        <option selected>الفصل الثاني 1447</option>
                        <option>الفصل الثالث 1447</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-300 pr-2">لغة النظام</label>
                      <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl dark:bg-slate-800 shadow-inner">
                        <button className="flex-1 py-3 px-4 rounded-xl bg-white text-primary font-black shadow-sm dark:bg-slate-700 dark:text-white">العربية</button>
                        <button className="flex-1 py-3 px-4 rounded-xl text-slate-400 font-black">English</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-300 pr-2">المنطقة الزمنية</label>
                      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl dark:bg-slate-800 shadow-inner font-bold text-slate-800 dark:text-white">
                        <Globe size={20} className="text-primary" />
                        <span>(GMT+03:00) الرياض</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-8 animate-in slide-in-from-left duration-500">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">المظهر والسمات</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">تخصيص واجهة المستخدم حسب تفضيلاتك</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div 
                      onClick={() => setDarkMode(false)}
                      className={`relative overflow-hidden cursor-pointer rounded-[32px] p-8 border-4 transition-all ${!darkMode ? 'border-primary bg-primary/5 shadow-xl scale-[1.02]' : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800'}`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${!darkMode ? 'bg-primary text-white' : 'bg-white text-slate-400 dark:bg-slate-700'}`}>
                          <Sun size={24} />
                        </div>
                        {!darkMode && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white"><Save size={14} /></div>}
                      </div>
                      <h4 className="text-xl font-black text-slate-800 dark:text-white">الوضع الفاتح</h4>
                      <p className="text-sm font-bold text-slate-400 mt-2">واجهة مشرقة ومريحة للعين في النهار</p>
                    </div>

                    <div 
                      onClick={() => setDarkMode(true)}
                      className={`relative overflow-hidden cursor-pointer rounded-[32px] p-8 border-4 transition-all ${darkMode ? 'border-primary bg-primary/5 shadow-xl scale-[1.02]' : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800'}`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-primary text-white' : 'bg-white text-slate-400 dark:bg-slate-700'}`}>
                          <Moon size={24} />
                        </div>
                        {darkMode && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white"><Save size={14} /></div>}
                      </div>
                      <h4 className="text-xl font-black text-slate-800 dark:text-white">الوضع الداكن</h4>
                      <p className="text-sm font-bold text-slate-400 mt-2">واجهة أنيقة تقلل إجهاد العين في المساء</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'whatsapp' && (
                <div className="space-y-8 animate-in slide-in-from-left duration-500">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white">إعدادات الواتساب</h3>
                      <p className="text-sm font-bold text-slate-400 mt-1">الربط مع خدمة Evolution API للتنبيهات</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-black">متصل</span>
                    </div>
                  </div>

                  <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-emerald-500">
                            <Smartphone size={40} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-800 dark:text-white">حالة الجلسة: نشطة</h4>
                            <p className="text-sm font-bold text-slate-500 mt-1">يتم الآن إرسال التنبيهات من خلال الرقم المرتبط بنجاح</p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button className="px-8 py-3 rounded-xl bg-white text-slate-600 font-black shadow-sm dark:bg-slate-700 dark:text-white">إعادة فحص الاتصال</button>
                            <button className="px-8 py-3 rounded-xl bg-danger/10 text-danger font-black">قطع الاتصال</button>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white shadow-sm dark:bg-slate-800">
                        <div>
                            <p className="font-black text-slate-800 dark:text-white">تنبيه الغياب التلقائي</p>
                            <p className="text-xs font-bold text-slate-400">إرسال رسالة فور رصد غياب الطالب في التحضير</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary cursor-pointer">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition"></span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white shadow-sm dark:bg-slate-800">
                        <div>
                            <p className="font-black text-slate-800 dark:text-white">رسائل الترحيب للطلاب الجدد</p>
                            <p className="text-xs font-bold text-slate-400">إرسال رسالة ترحيبية وتفاصيل الحلقة عند التسجيل</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 cursor-pointer">
                            <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition"></span>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                <button className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400">إلغاء</button>
                <button className="flex items-center gap-2 px-12 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95">
                    <Save size={20} />
                    <span>حفظ كافة التغييرات</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
