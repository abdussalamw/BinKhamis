import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, RefreshCcw, LogOut, CheckCircle2, AlertCircle, QrCode, Loader2, ShieldCheck, Zap, Send, Phone } from 'lucide-react';
import api from '../services/api';

const WhatsAppSettings: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Test Message State
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('رسالة تجريبية من منصة حلقات برو 🚀');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const fetchStatus = useCallback(async () => {
    try {
      const response = await api.get('/whatsapp/status');
      console.log('WhatsApp Status:', response.data);
      setStatus(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch WhatsApp status:', err);
      setError(err.response?.data?.message || 'فشل الاتصال بخادم الواتساب. تأكد من تشغيل Evolution API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      // Only poll if not connected OR if waiting for QR
      if (status?.state?.instance?.state !== 'open') {
        fetchStatus();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchStatus, status?.state?.instance?.state]);

  const handleAction = async (action: 'restart' | 'logout') => {
    setActionLoading(true);
    try {
      await api.post(`/whatsapp/${action}`);
      setTimeout(() => fetchStatus(), 2000);
    } catch (err) {
      alert('فشلت العملية، يرجى المحاولة لاحقاً');
    } finally {
      setActionLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone) return;
    setTestStatus('loading');
    try {
      const response = await api.post('/whatsapp/send-test', {
        phone: testPhone,
        message: testMessage
      });
      if (response.data.success) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setTestStatus('error');
      }
    } catch (err) {
      setTestStatus('error');
    }
  };

  const isConnected = status?.state?.instance?.state === 'open';
  
  // Handle QR Data carefully
  // Evolution API v2 might return { code: "...", base64: "..." }
  const qrBase64 = status?.qr?.base64 || (status?.qr?.code ? `data:image/png;base64,${status.qr.base64}` : null);

  if (loading && !status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-slate-400 font-bold">جاري فحص حالة الاتصال...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 font-readex animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <MessageSquare className="text-emerald-500" size={32} />
            </div>
            إعدادات الواتساب
          </h1>
          <p className="text-slate-400 font-bold mt-2">إدارة الربط مع Evolution API وإرسال الإشعارات</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => { setLoading(true); fetchStatus(); }}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl font-black text-xs text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCcw size={16} className={actionLoading ? 'animate-spin' : ''} />
            تحديث الحالة
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Status & Test */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Status Card */}
          <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden transition-all ${isConnected ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20' : 'bg-amber-50/50 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/20'}`}>
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <MessageSquare size={120} />
            </div>
            
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center ${isConnected ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' : 'bg-amber-500 text-white shadow-xl shadow-amber-500/30'}`}>
                  {isConnected ? <ShieldCheck size={40} /> : <Zap size={40} />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                      {isConnected ? 'الواتساب متصل' : 'غير متصل حالياً'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isConnected ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                      {isConnected ? 'Active' : 'Offline'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-500">
                    {isConnected ? 'النظام جاهز لإرسال كافة الإشعارات التلقائية' : 'قم بمسح الرمز المقابل لربط جهازك بالمنصة'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-5 bg-white/60 dark:bg-slate-800/60 rounded-3xl border border-white dark:border-white/5 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">المثيلات المتاحة</p>
                  <p className="text-lg font-black text-slate-700 dark:text-white">{status?.state?.instance?.instanceName || 'HalqatPro'}</p>
               </div>
               <div className="p-5 bg-white/60 dark:bg-slate-800/60 rounded-3xl border border-white dark:border-white/5 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">إصدار المحرك</p>
                  <p className="text-lg font-black text-slate-700 dark:text-white">v2.1.0-Pro</p>
               </div>
            </div>

            {isConnected && (
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => handleAction('restart')}
                  className="flex-1 py-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl font-black text-sm text-slate-600 hover:bg-white transition-all border border-white dark:border-white/5"
                >
                  إعادة التشغيل
                </button>
                <button 
                  onClick={() => handleAction('logout')}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  قطع الاتصال
                </button>
              </div>
            )}
          </div>

          {/* Test Section */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-primary/10 rounded-xl">
                  <Send className="text-primary" size={24} />
               </div>
               <h4 className="font-black text-xl text-slate-800 dark:text-white">قسم اختبار الإرسال</h4>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 pr-2">رقم الجوال (مع مفتاح الدولة)</label>
                    <div className="relative">
                       <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <input 
                          type="text" 
                          placeholder="مثال: 9665xxxxxxxx" 
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                          className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 pr-2">نص الرسالة</label>
                    <input 
                        type="text" 
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                 </div>
              </div>

              <button 
                onClick={sendTestMessage}
                disabled={testStatus === 'loading' || !isConnected || !testPhone}
                className={`w-full py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all ${
                  !isConnected 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : testStatus === 'success'
                  ? 'bg-emerald-500 text-white'
                  : testStatus === 'error'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-900 text-white hover:bg-black dark:bg-primary dark:hover:bg-primary/80 shadow-xl shadow-primary/20'
                }`}
              >
                {testStatus === 'loading' ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : testStatus === 'success' ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Send size={20} />
                )}
                {!isConnected ? 'يجب الربط أولاً للإرسال' : testStatus === 'success' ? 'تم الإرسال بنجاح' : 'إرسال رسالة تجريبية الآن'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: QR Code */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center text-center sticky top-8">
            <div className="relative group mb-8">
              <div className="absolute -inset-6 bg-gradient-to-tr from-primary/30 to-emerald-500/30 rounded-[4rem] blur-3xl group-hover:blur-[4rem] transition-all opacity-40"></div>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5">
                {isConnected ? (
                  <div className="h-[250px] w-[250px] flex flex-col items-center justify-center text-emerald-500 animate-in zoom-in duration-500">
                    <div className="p-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-full mb-6">
                       <CheckCircle2 size={100} strokeWidth={1.5} />
                    </div>
                    <p className="font-black text-xl">الجهاز مرتبط</p>
                  </div>
                ) : qrBase64 ? (
                  <div className="relative">
                    <img src={qrBase64} alt="WhatsApp QR Code" className="h-[250px] w-[250px] rounded-2xl" />
                    <div className="absolute inset-0 border-4 border-primary/10 rounded-2xl pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="h-[250px] w-[250px] flex flex-col items-center justify-center text-slate-200">
                    <QrCode size={100} strokeWidth={1} className="animate-pulse" />
                    <p className="mt-6 font-black text-slate-400">جاري طلب الرمز...</p>
                  </div>
                )}
              </div>
            </div>

            {!isConnected && (
              <div className="space-y-6 w-full">
                <div className="p-5 bg-amber-50 dark:bg-amber-500/5 text-amber-600 rounded-3xl text-xs font-black flex items-center gap-4 border border-amber-100 dark:border-amber-500/20">
                  <div className="p-2 bg-amber-500 text-white rounded-lg">
                    <AlertCircle size={16} />
                  </div>
                  <span className="text-right leading-relaxed">ينتهي صلاحية الرمز خلال فترة قصيرة، يرجى المسح قبل انتهاء المهلة.</span>
                </div>
                
                <div className="space-y-2 text-right">
                   <p className="text-[10px] font-black text-slate-300 uppercase pr-2">تعليمات الربط</p>
                   <ul className="space-y-2">
                      {[
                        'افتح واتساب > الأجهزة المرتبطة',
                        'اضغط على ربط جهاز',
                        'وجه الكاميرا لهذا الرمز'
                      ].map((txt, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                           <div className="h-1.5 w-1.5 rounded-full bg-primary/40"></div>
                           {txt}
                        </li>
                      ))}
                   </ul>
                </div>
                
                {!qrBase64 && !isConnected && (
                   <button 
                     onClick={() => handleAction('restart')}
                     className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all border border-slate-100 dark:border-white/5"
                   >
                     محاولة توليد رمز جديد
                   </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSettings;
