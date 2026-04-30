import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Shield, Database, Save, Smartphone, RefreshCw, Power, QrCode, AlertCircle, CheckCircle2, Trash2, History, Loader2, X, Upload, Key, Download, BellRing, FileText, AlertTriangle, CheckCircle, Sparkles, Zap, Lock
} from 'lucide-react';
import api from '../services/api';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [loading, setLoading] = useState(false);
  const [waStatus, setWaStatus] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('رسالة تجريبية من نظام بن خميس');
  
  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'students' | 'attendance'>('students');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (activeTab === 'whatsapp') {
      fetchStatus();
    }
  }, [activeTab]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/whatsapp/status');
      setWaStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch WA status', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async () => {
    try {
      setLoading(true);
      await api.post('/whatsapp/restart');
      await fetchStatus();
    } catch (error) {
      alert('فشل إعادة تشغيل الخدمة');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('هل أنت متأكد من قطع الربط؟ سيتوقف إرسال الرسائل.')) return;
    try {
      setLoading(true);
      await api.post('/whatsapp/logout');
      await fetchStatus();
    } catch (error) {
      alert('فشل تسجيل الخروج');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchQR = async () => {
    try {
      setLoading(true);
      const response = await api.get('/whatsapp/qr');
      if (response.data && response.data.base64) {
        setQrCode(response.data.base64);
      } else {
        alert('فشل الحصول على الباركود، تأكد من حالة الخدمة');
      }
    } catch (error) {
      alert('خطأ في الاتصال بالخدمة');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testNumber) return alert('يرجى إدخال الرقم');
    try {
      setLoading(true);
      const response = await api.post('/whatsapp/test-message', {
        number: testNumber,
        message: testMessage
      });
      if (response.data.success) {
        alert('تم إرسال الرسالة بنجاح');
      } else {
        alert('فشل إرسال الرسالة');
      }
    } catch (error) {
      alert('خطأ في الإرسال');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      // In a real app, this would trigger a download from the API
      setTimeout(() => {
        alert('تم تجهيز النسخة الاحتياطية بنجاح');
        setLoading(false);
      }, 1500);
    } catch (error) {
      alert('فشل إنشاء النسخة الاحتياطية');
      setLoading(false);
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImportFile(e.target.files[0]);
      setImportStatus('idle');
      setImportError(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImportStatus('loading');
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const endpoint = importType === 'students' ? '/import/students' : '/import/attendance';
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(response.data);
      setImportStatus('success');
    } catch (err: any) {
      console.error('Import error:', err);
      setImportError(err.response?.data?.message || 'حدث خطأ أثناء الاستيراد');
      setImportStatus('error');
    }
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'student';

  const allTabs = [
    { id: 'general', title: 'عام', icon: SettingsIcon, roles: ['admin'] },
    { id: 'whatsapp', title: 'الواتساب', icon: Smartphone, roles: ['admin'] },
    { id: 'import', title: 'استيراد البيانات', icon: Upload, roles: ['admin'] },
    { id: 'notifications', title: 'التنبيهات', icon: BellRing, roles: ['admin', 'supervisor'] },
    { id: 'security', title: 'الأمان', icon: Shield, roles: ['admin', 'supervisor', 'teacher', 'student'] },
    { id: 'backup', title: 'النسخ الاحتياطي', icon: Database, roles: ['admin'] },
  ];

  const tabs = allTabs.filter(tab => tab.roles.includes(role));

  useEffect(() => {
    // If current active tab is not allowed for this role, switch to the first allowed tab
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0]?.id || 'security');
    }
  }, [role]);

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-500 pb-10">
      {/* QR Modal */}
      {qrCode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black text-xl text-slate-800 dark:text-white">مسح الباركود</h3>
              <button onClick={() => setQrCode(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-inner inline-block">
              <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 mx-auto" />
            </div>
            <p className="text-sm font-bold text-slate-500 leading-relaxed">
              افتح واتساب على هاتفك، انتقل إلى الإعدادات {'>'} الأجهزة المرتبطة، ثم قم بمسح هذا الكود.
            </p>
            <button 
              onClick={() => { setQrCode(null); fetchStatus(); }}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20"
            >
              تم الربط بنجاح
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
            <SettingsIcon size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-white">إعدادات النظام</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">تخصيص كامل للتجربة والتواصل</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
          <Save size={14} />
          <span>حفظ كافة التغييرات</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Navigation Sidebar */}
        <div className="lg:w-60 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-2 shadow-sm border border-slate-100 dark:border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black transition-all mb-1 last:mb-0 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon size={16} strokeWidth={2.5} />
                <span>{tab.title}</span>
              </button>
            ))}
          </div>
          
          {/* Quick Stats Panel */}
          <div className="mt-4 bg-slate-900 rounded-[28px] p-5 text-white overflow-hidden relative group">
             <div className="relative z-10 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase">حالة التخزين</p>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[65%] rounded-full"></div>
                </div>
                <p className="text-[10px] font-bold text-slate-300">تم استهلاك 1.2GB من 2GB</p>
             </div>
             <Database className="absolute -bottom-2 -right-2 text-slate-800 h-20 w-20 transform group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[500px] relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-[32px]">
                <Loader2 size={32} className="text-primary animate-spin" />
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in slide-in-from-left duration-400">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <SettingsIcon size={18} className="text-primary" />
                  <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">الإعدادات الأساسية</h3>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   {/* Logo Upload */}
                   <div className="w-full md:w-32 space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase text-center block">شعار النظام</label>
                      <div className="relative group mx-auto">
                        <div className="h-28 w-28 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 cursor-pointer">
                           <Upload size={24} className="text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 cursor-pointer">
                           <X size={14} />
                        </div>
                      </div>
                   </div>

                   {/* Form Grid */}
                   <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-1">اسم المؤسسة</label>
                        <input type="text" defaultValue="حلقات بن خميس" className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-1">الفصل الدراسي الحالي</label>
                        <select className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-primary/10">
                          <option selected>الفصل الثاني 1447</option>
                          <option>الفصل الثالث 1447</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-1">لغة النظام</label>
                        <select className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-primary/10">
                          <option selected>العربية</option>
                          <option>English</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-1">المنطقة الزمنية</label>
                        <select className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-primary/10">
                          <option selected>(GMT+03:00) Riyadh</option>
                        </select>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* WhatsApp Tab */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6 animate-in slide-in-from-left duration-400">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-emerald-500" />
                    <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">بوابة الواتساب (Evolution API)</h3>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                    waStatus?.state?.instance?.state === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${waStatus?.state?.instance?.state === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    {waStatus?.state?.instance?.state === 'open' ? 'الجلسة نشطة ومتصلة' : 'بانتظار الربط'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">اسم الجلسة</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">{waStatus?.instance?.instance?.instanceName || 'BinKhamis'}</span>
                      <History size={14} className="text-primary" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الرقم المتصل</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200" dir="ltr">{waStatus?.instance?.instance?.owner?.split('@')[0] || '----'}</span>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">نوع الربط</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">Multi-Device</span>
                      <Smartphone size={14} className="text-indigo-500" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الحالة التقنية</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">{waStatus?.state?.instance?.state || 'unknown'}</span>
                      <div className={`h-2 w-2 rounded-full ${waStatus?.state?.instance?.state === 'open' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className={`h-24 w-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary shadow-inner`}>
                        {waStatus?.state?.instance?.state === 'open' ? (
                          <div className="relative">
                             <img src={`https://ui-avatars.com/api/?name=${waStatus?.instance?.instance?.owner?.split('@')[0] || 'WA'}&background=6366f1&color=fff`} className="h-20 w-20 rounded-[1.5rem]" alt="WA" />
                             <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-lg border-4 border-white dark:border-slate-800 flex items-center justify-center">
                               <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                             </div>
                          </div>
                        ) : (
                          qrCode ? (
                            <img src={qrCode} className="h-20 w-20 rounded-lg" alt="QR Code" />
                          ) : (
                            <QrCode size={40} className="text-slate-200" />
                          )
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-black text-slate-800 dark:text-white">حالة الاتصال الفوري</h4>
                      <p className="text-[11px] font-bold text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                        {waStatus?.state?.instance?.state === 'open' 
                          ? 'بوابة الإرسال جاهزة وتعمل بأفضل أداء. جميع التنبيهات ستصل لأولياء الأمور لحظياً.' 
                          : 'يجب ربط الجلسة بمسح الباركود عبر تطبيق الواتساب في هاتفك لتفعيل الإشعارات التلقائية.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 w-full">
                      {waStatus?.state?.instance?.state !== 'open' ? (
                        <button onClick={handleFetchQR} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-500 text-white text-sm font-black shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:bg-emerald-600">
                          <QrCode size={18} />
                          <span>توليد باركود جديد للربط</span>
                        </button>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 w-full">
                          <button onClick={fetchStatus} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100">
                            <RefreshCw size={16} />
                            <span className="text-[9px] font-black uppercase">تحديث</span>
                          </button>
                          <button onClick={handleRestart} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-amber-600 transition-all hover:bg-amber-50">
                            <Power size={16} />
                            <span className="text-[9px] font-black uppercase">إعادة تشغيل</span>
                          </button>
                          <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-rose-50 text-rose-600 transition-all hover:bg-rose-100">
                            <Trash2 size={16} />
                            <span className="text-[9px] font-black uppercase">قطع الربط</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="glass-card-premium p-6 space-y-4">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إرسال تجريبي</h4>
                           <Sparkles size={14} className="text-amber-500" />
                        </div>
                        <div className="space-y-3">
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-400 pr-1">رقم الجوال (مع مفتاح الدولة)</label>
                              <div className="relative">
                                <input 
                                  type="text" 
                                  placeholder="9665xxxxxxxx" 
                                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 pl-10 text-xs font-bold border-none outline-none ring-1 ring-slate-100 dark:ring-white/5 focus:ring-primary/20"
                                  value={testNumber}
                                  onChange={(e) => setTestNumber(e.target.value)}
                                />
                                <Smartphone size={14} className="absolute left-3 top-3.5 text-slate-300" />
                              </div>
                           </div>
                           <button onClick={handleSendTest} className="w-full py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black transition-all hover:bg-slate-800">
                              إرسال رسالة اختبار
                           </button>
                        </div>
                     </div>

                     <div className="glass-card-premium p-6">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                              <Zap size={16} />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black text-slate-800 dark:text-white">إحصائيات الإرسال</h4>
                              <p className="text-[8px] font-bold text-slate-400">آخر 24 ساعة</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">الرسائل المرسلة</p>
                              <p className="text-sm font-black text-slate-700 dark:text-white">1,284</p>
                           </div>
                           <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">نسبة النجاح</p>
                              <p className="text-sm font-black text-emerald-500">99.2%</p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in slide-in-from-left duration-400">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <BellRing size={18} className="text-primary" />
                  <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">إعدادات التنبيهات</h3>
                </div>
                
                <div className="space-y-3">
                   {[
                     { id: 'absent', title: 'تنبيه الغياب', desc: 'إرسال رسالة لولي الأمر فور تسجيل الطالب غائب' },
                     { id: 'progress', title: 'تنبيه الإنجاز اليومي', desc: 'إرسال ملخص الحفظ والمراجعة بعد انتهاء الحلقة' },
                     { id: 'late', title: 'تنبيه التأخر', desc: 'إرسال رسالة في حال تجاوز الطالب وقت الحضور المحدد' },
                   ].map((item) => (
                     <div key={item.id} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-primary shadow-sm">
                              <Smartphone size={18} />
                           </div>
                           <div>
                              <h4 className="text-xs font-black text-slate-800 dark:text-white">{item.title}</h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.desc}</p>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in slide-in-from-left duration-400">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <Shield size={18} className="text-primary" />
                  <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">إعدادات الأمان</h3>
                </div>
                
                <div className="max-w-md space-y-5">
                   <div className="space-y-1.5">
                     <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-1">كلمة المرور الحالية</label>
                     <div className="relative">
                       <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-3.5 text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all pl-12" 
                       />
                       <Lock className="absolute left-4 top-3.5 text-slate-300" size={16} />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-1">كلمة المرور الجديدة</label>
                     <div className="relative">
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-3.5 text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all pl-12" 
                        />
                        <Key className="absolute left-4 top-3.5 text-slate-300" size={16} />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-1">تأكيد كلمة المرور</label>
                     <div className="relative">
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-3.5 text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all pl-12" 
                        />
                        <Key className="absolute left-4 top-3.5 text-slate-300" size={16} />
                     </div>
                   </div>
                   <button className="w-full py-4 rounded-[2rem] bg-slate-900 text-white text-xs font-black shadow-lg transition-all hover:bg-black active:scale-95 flex items-center justify-center gap-2">
                      <Save size={16} />
                      <span>تحديث كلمة المرور</span>
                   </button>
                </div>
              </div>
            )}

            {/* Backup Tab */}
            {activeTab === 'backup' && (
              <div className="space-y-6 animate-in slide-in-from-left duration-400">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <Database size={18} className="text-primary" />
                  <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">النسخ الاحتياطي والبيانات</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                         <Download size={24} />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-slate-800 dark:text-white">تصدير قاعدة البيانات</h4>
                         <p className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed">قم بإنشاء نسخة احتياطية كاملة من بيانات الطلاب، الموظفين، وسجلات التحضير بصيغة SQL.</p>
                      </div>
                      <button onClick={handleBackup} className="w-full py-3.5 rounded-2xl bg-primary text-white text-xs font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                         <Save size={14} />
                         <span>بدء النسخ الاحتياطي الآن</span>
                      </button>
                   </div>

                   <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4 opacity-75">
                      <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shadow-sm">
                         <Upload size={24} />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-slate-800 dark:text-white">استعادة نسخة احتياطية</h4>
                         <p className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed">رفع ملف SQL لاستعادة بيانات النظام السابقة. (يرجى الحذر، سيتم مسح البيانات الحالية).</p>
                      </div>
                      <button disabled className="w-full py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-400 text-xs font-black flex items-center justify-center gap-2 cursor-not-allowed">
                         <RefreshCw size={14} />
                         <span>استعادة البيانات</span>
                      </button>
                   </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                   <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-[10px] font-bold text-amber-600 leading-relaxed">ينصح دائماً بأخذ نسخة احتياطية بشكل أسبوعي لضمان سلامة بيانات الطلاب والمعلمين وحمايتها من أي فقدان مفاجئ.</p>
                </div>
              </div>
            )}

            {/* Import Tab */}
            {activeTab === 'import' && (
              <div className="space-y-6 animate-in slide-in-from-left duration-400">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <Upload size={18} className="text-primary" />
                  <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">استيراد البيانات</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Import Settings */}
                  <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-5">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 pr-1">نوع البيانات المراد استيرادها</label>
                        <select
                          value={importType}
                          onChange={(e) => setImportType(e.target.value as any)}
                          className="w-full rounded-2xl bg-white dark:bg-slate-900 p-3.5 text-xs font-bold border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-primary/20 transition-all"
                        >
                          <option value="students">قاعدة بيانات الطلاب (Excel)</option>
                          <option value="attendance">سجل الحضور الفصلي (CSV)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 pr-1">الملف المصدر</label>
                        <div className="relative group">
                          <input
                            type="file"
                            onChange={handleImportFileChange}
                            accept={importType === 'students' ? '.xls,.xlsx' : '.csv'}
                            className="hidden"
                            id="import-file-input"
                          />
                          <label 
                            htmlFor="import-file-input"
                            className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer transition-all hover:border-primary/50 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50"
                          >
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-primary transition-colors">
                              <Upload size={24} />
                            </div>
                            <div className="text-center">
                              <span className="block text-xs font-black text-slate-700 dark:text-slate-200">
                                {importFile ? importFile.name : 'اضغط لاختيار ملف'}
                              </span>
                              <span className="block text-[10px] font-bold text-slate-400 mt-1">
                                {importType === 'students' ? 'صيغة Excel فقط (.xls, .xlsx)' : 'صيغة CSV فقط (.csv)'}
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleImport}
                      disabled={!importFile || importStatus === 'loading'}
                      className="w-full py-4 rounded-[2rem] bg-primary text-white text-xs font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {importStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                      <span>بدء عملية الاستيراد</span>
                    </button>
                  </div>

                  {/* Import Results */}
                  <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
                    {importStatus === 'idle' && (
                      <div className="text-center space-y-4">
                        <div className="h-20 w-20 rounded-[2rem] bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-200 mx-auto">
                          <Upload size={32} />
                        </div>
                        <p className="text-xs font-black text-slate-400">بانتظار اختيار الملف لبدء الاستيراد</p>
                      </div>
                    )}

                    {importStatus === 'loading' && (
                      <div className="text-center space-y-4">
                        <Loader2 size={48} className="text-primary animate-spin mx-auto" />
                        <h4 className="text-sm font-black text-slate-800 dark:text-white">جاري المعالجة...</h4>
                        <p className="text-[10px] font-bold text-slate-400 max-w-[200px]">يرجى الانتظار، جاري تحليل البيانات وتحديث السجلات في قاعدة البيانات.</p>
                      </div>
                    )}

                    {importStatus === 'success' && (
                      <div className="text-center space-y-5 w-full">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                          <CheckCircle size={32} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-white">تم الاستيراد بنجاح!</h4>
                          <p className="text-[10px] font-bold text-emerald-500 mt-1">اكتملت العملية دون أخطاء حرجة</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-right">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400 font-bold">سجلات جديدة:</span>
                            <span className="font-black text-emerald-500">{importResult?.added || 0}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400 font-bold">سجلات محدثة:</span>
                            <span className="font-black text-primary">{importResult?.updated || 0}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400 font-bold">أخطاء التنسيق:</span>
                            <span className="font-black text-amber-500">{importResult?.errors || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {importStatus === 'error' && (
                      <div className="text-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto">
                          <AlertTriangle size={32} />
                        </div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white">فشلت عملية الاستيراد</h4>
                        <div className="p-3 rounded-xl bg-danger/5 border border-danger/10">
                          <p className="text-[10px] font-bold text-danger">{importError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Help Section */}
                <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-primary" />
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">تعليمات هامة للاستيراد</h4>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pr-4">
                    <li className="text-[10px] font-bold text-slate-400 list-disc">تأكد أن الملف يحتوي على أعمدة (الاسم، الهوية، الجوال) في استيراد الطلاب.</li>
                    <li className="text-[10px] font-bold text-slate-400 list-disc">يتم مطابقة الطلاب المسجلين سابقاً بناءً على رقم الهوية لتجنب التكرار.</li>
                    <li className="text-[10px] font-bold text-slate-400 list-disc">في سجل الحضور، يجب أن يكون تنسيق التاريخ (YYYY-MM-DD).</li>
                    <li className="text-[10px] font-bold text-slate-400 list-disc">يفضل ألا يتجاوز حجم الملف 5 ميجابايت لضمان سلاسة المعالجة.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
