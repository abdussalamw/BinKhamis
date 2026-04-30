import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Loader2, 
  ChevronLeft, 
  MessageSquare, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  Shield, 
  Users, 
  User, 
  GraduationCap,
  Sparkles,
  Zap
} from 'lucide-react';
import api from '../services/api';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'phone' | 'login' | 'register'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.post('/auth/send-otp', { phone, name: mode === 'register' ? name : undefined });
      setSuccess('تم إرسال رمز التحقق إلى واتساب الخاص بك');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل إرسال الرمز. تأكد من الرقم وصلاحية الخدمة');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent, customPhone?: string, customCode?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    const finalPhone = customPhone || phone;
    const finalCode = customCode || code;

    try {
      const response = await api.post('/auth/verify-otp', { phone: finalPhone, code: finalCode });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      navigate('/');
    } catch (err: any) {
      console.error('Login Error:', err);
      const msg = err.response?.data?.message || 'فشل تسجيل الدخول. تأكد من اتصال السيرفر';
      setError(msg);
      alert('خطأ في الدخول: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const instantDemoLogin = async (demoPhone: string) => {
    setLoading(true);
    setPhone(demoPhone);
    setMode('login');
    setError('');
    handleVerifyOtp(undefined, demoPhone, '000000');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-mint-light dark:bg-midnight px-4 font-readex overflow-hidden" dir="rtl">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative w-full max-w-[460px] animate-in fade-in zoom-in duration-1000 py-12">
        
        {/* Floating Icon Decoration */}
        <div className="absolute -top-4 -right-4 h-12 w-12 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center text-primary animate-float z-20">
            <Sparkles size={24} />
        </div>
        
        <div className="glass-card-premium overflow-visible p-8 md:p-10">
            <div className="mb-10 text-center">
              <div className="relative mx-auto mb-6 h-20 w-20">
                  <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl animate-pulse"></div>
                  <div className="relative h-full w-full flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary to-teal-600 shadow-xl shadow-primary/30 transform -rotate-3">
                      <span className="text-4xl font-black text-white">ق</span>
                  </div>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-2">
                {mode === 'login' ? (step === 1 ? 'تسجيل الدخول' : 'تأكيد الرمز') : 'انضم إلينا الآن'}
              </h2>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">نظام إدارة حلقات بن خميس الجيل الثاني</p>
            </div>

            {/* Mode Switcher */}
            {step === 1 && (
              <div className="mb-8 flex p-1.5 bg-slate-100/50 dark:bg-white/5 rounded-2xl">
                <button 
                  onClick={() => setMode('login')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all duration-500 ${mode === 'login' ? 'bg-white dark:bg-slate-700 shadow-lg shadow-black/5 text-primary scale-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LogIn size={16} />
                  دخول سريع
                </button>
                <button 
                  onClick={() => setMode('register')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all duration-500 ${mode === 'register' ? 'bg-white dark:bg-slate-700 shadow-lg shadow-black/5 text-primary scale-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <UserPlus size={16} />
                  تسجيل جديد
                </button>
              </div>
            )}

            {error && (
              <div className="mb-8 rounded-[1.5rem] bg-danger/10 p-5 text-center text-sm font-black text-danger animate-shake border border-danger/10">
                <div className="flex items-center justify-center gap-3">
                    <Zap size={18} />
                    {error}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-8 rounded-[1.5rem] bg-success/10 p-5 text-center text-sm font-black text-success border border-success/10 animate-fade-in">
                {success}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="pr-4 block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      الاسم بالكامل
                    </label>
                    <div className="group relative">
                      <input
                        type="text"
                        placeholder="أدخل اسمك الثلاثي"
                        className="w-full rounded-xl border-none bg-slate-50 py-3.5 pr-12 pl-6 font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all focus:ring-primary/5 dark:bg-white/5 dark:text-slate-200 text-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={mode === 'register'}
                      />
                      <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="pr-4 block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    رقم الجوال
                  </label>
                  <div className="group relative">
                    <input
                      type="text"
                      placeholder="9665xxxxxxxx"
                      className="w-full rounded-xl border-none bg-slate-50 py-3.5 pr-12 pl-6 font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all focus:ring-primary/5 dark:bg-white/5 dark:text-slate-200 text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-creative w-full py-4 flex items-center justify-center gap-3 text-base"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                          <span>{mode === 'login' ? 'تأكيد الهوية والدخول' : 'بدء رحلة الإنجاز'}</span>
                          <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                      </>
                  )}
                </button>

                {mode === 'login' && (
                  <div className="pt-6">
                    <div className="relative mb-6 text-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-white/5"></div></div>
                        <span className="relative px-4 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-300 uppercase tracking-widest">تجربة سريعة</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      {[
                        { label: 'مدير النظام', icon: Shield, phone: '966500000000' },
                        { label: 'مشرف الحلقات', icon: Users, phone: '966533333333' },
                        { label: 'معلم الحلقة', icon: GraduationCap, phone: '966522222222' },
                        { label: 'طالب مجتهد', icon: User, phone: '966511111111' }
                      ].map((demo, i) => (
                        <button 
                            key={i}
                            type="button" 
                            onClick={() => instantDemoLogin(demo.phone)} 
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group text-right"
                        >
                          <div className="h-8 w-8 shrink-0 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <demo.icon size={16} />
                          </div>
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">{demo.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      رمز التحقق السري
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:opacity-70 transition-opacity"
                    >
                      تغيير الرقم
                      <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="group relative">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      className="w-full rounded-2xl border-none bg-slate-50 py-5 pr-10 pl-6 text-center text-3xl font-black tracking-[0.4em] text-primary outline-none ring-4 ring-transparent transition-all focus:ring-primary/5 dark:bg-white/5"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                    <MessageSquare size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-emerald-500 font-black text-white text-lg shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                          <span>تأكيد وفتح اللوحة</span>
                          <ChevronLeft size={20} />
                      </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-12 text-center pt-10 border-t border-slate-100 dark:border-white/5">
              <p className="text-xs font-black text-slate-400 tracking-wide">
                هل تواجه عائقاً؟{' '}
                <Link to="#" className="text-primary hover:text-secondary transition-colors underline decoration-primary/20 underline-offset-4">
                  تواصل مع الدعم الفني الذكي
                </Link>
              </p>
            </div>
        </div>
        
        <p className="mt-10 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em] opacity-50">
            Bin Khamis Hub &copy; {new Date().getFullYear()} — Designed for Excellence
        </p>
      </div>
    </div>
  );
};

export default SignIn;

