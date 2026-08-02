import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  LogIn, 
  Lock, 
  User, 
  AlertCircle,
  Loader,
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AccountOption {
  id: string;
  name: string;
  role: string;
  school_id: string;
}

const SignIn: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [multipleAccounts, setMultipleAccounts] = useState<AccountOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/');
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let cleanPhone = phone.trim().replace(/\s+/g, '');
      
      const config = schoolCode ? { headers: { 'X-School-ID': schoolCode } } : {};
      
      const payload: any = { 
        phone: cleanPhone, 
        password 
      };
      
      if (selectedRole) {
        payload.role = selectedRole;
      }
      
      const response = await api.post('/auth/login-password', payload, config);
      
      if (response.data.multiple_accounts) {
        setMultipleAccounts(response.data.accounts);
        setLoading(false);
        return;
      }

      if (response.data.success) {
        localStorage.setItem('token', response.data.access_token);
        
        const userData = {
          ...response.data.user,
          school_id: schoolCode || response.data.user.school_id
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'بيانات الدخول غير صحيحة. تأكد من الرقم وكلمة المرور وكود المجمع.');
    } finally {
      setLoading(false);
    }
  };

  const roleNames: Record<string, string> = {
    owner: 'superadmin',
    admin: 'مدير المجمع',
    supervisor: 'المشرف التعليمي',
    teacher: 'معلم حلقة',
    student: 'طالب'
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-mint-light dark:bg-midnight font-readex transition-colors duration-500" dir="rtl">
      
      {/* القسم الأول: بيانات الدخول (مفتوح بدون حاوية مغلقة) */}
      <div className="lg:col-span-6 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
        <div className="max-w-md w-full mx-auto">
          
          <div className="mb-10 text-right">
             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black mb-4">
                <Sparkles size={14} />
                بوابة الدخول الموحدة
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">حلقات برو</h1>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-xs md:text-sm mt-2">مرحباً بك، أدخل بياناتك للمتابعة إلى لوحة التحكم</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-black animate-in shake duration-300">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {multipleAccounts ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-bold">
                تم العثور على أكثر من حساب مرتبط برقم الجوال هذا. الرجاء تحديد الصفة المطلوبة للدخول:
              </div>
              <div className="space-y-2">
                {multipleAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={async () => {
                      setMultipleAccounts(null);
                      setLoading(true);
                      try {
                        let cleanPhone = phone.trim().replace(/\s+/g, '');
                        const config = schoolCode ? { headers: { 'X-School-ID': schoolCode } } : {};
                        const response = await api.post('/auth/login-password', {
                          phone: cleanPhone,
                          password,
                          role: acc.role
                        }, config);

                        if (response.data.success) {
                          localStorage.setItem('token', response.data.access_token);
                          const userData = {
                            ...response.data.user,
                            school_id: schoolCode || response.data.user.school_id
                          };
                          localStorage.setItem('user', JSON.stringify(userData));
                          navigate('/');
                        }
                      } catch (err: any) {
                        setError(err.response?.data?.message || 'فشل تسجيل الدخول بالحساب المحدد.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full p-4 text-right bg-white dark:bg-slate-800/80 hover:bg-primary/10 border border-slate-200 dark:border-white/10 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-black text-slate-800 dark:text-white text-sm">{acc.name}</div>
                      <div className="text-xs text-primary font-bold">{roleNames[acc.role] || acc.role}</div>
                    </div>
                    <ArrowRight size={18} className="text-slate-400 group-hover:text-primary rotate-180 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* الخانة الأولى: كود أو اسم نطاق المجمع */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  كود أو اسم نطاق المجمع (Subdomain)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 pointer-events-none">
                    <Globe size={18} />
                  </div>
                  <input
                    type="text"
                    className="block w-full pr-12 pl-4 py-3.5 bg-white dark:bg-slate-800/60 border-none rounded-2xl font-bold text-xs text-slate-800 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-primary transition-all shadow-xs"
                    placeholder="مثال: binkhamis (احذف أو اتركه فارغاً إذا كنت رئيس المنصة)"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mr-1">اتركه فارغاً أو احذفه إذا كنت تسجل كـ superadmin</p>
              </div>

              {/* الخانة الثانية: رقم الجوال */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  رقم الجوال
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 pointer-events-none">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pr-12 pl-4 py-3.5 bg-white dark:bg-slate-800/60 border-none rounded-2xl font-bold text-xs text-slate-800 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-primary transition-all shadow-xs font-mono"
                    placeholder="05XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* الخانة الثالثة: كلمة المرور */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pr-12 pl-10 py-3.5 bg-white dark:bg-slate-800/60 border-none rounded-2xl font-bold text-xs text-slate-800 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-primary transition-all shadow-xs"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-teal-700 text-white py-4 rounded-2xl font-black text-xs shadow-xl shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 mt-6 cursor-pointer"
              >
                {loading ? <Loader className="animate-spin" size={18} /> : (
                  <>
                    <span>تسجيل الدخول للنظام</span>
                    <ArrowRight size={18} className="rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
             <button className="text-xs font-bold text-slate-400 hover:text-primary transition-colors cursor-pointer">هل نسيت كلمة المرور؟</button>
          </div>

        </div>
      </div>

      {/* القسم الثاني: التعريف بالتطبيق (مباشرة على كامل ارتفاع وعرض الشق الأيسر) */}
      <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-midnight to-teal-950 px-8 md:px-16 py-12 text-white flex flex-col justify-between relative overflow-hidden min-h-screen">
        
        {/* Decorative Ambient Background */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-lg mx-auto w-full my-auto space-y-8">
          
          <div className="h-16 w-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-primary shadow-xl">
            <BookOpen size={32} />
          </div>

          <div>
            <h2 className="text-2xl md:text-4xl font-black leading-tight text-white mb-4">
              المنصة الذكية الشاملة لإدارة الحلقات والمجمعات القرآنية
            </h2>
            <p className="text-slate-300 font-medium text-xs md:text-sm leading-relaxed">
              نظام **حلقات برو** يوفر تجربة رقمية فائقة لربط إدارة المجمعات والكوادر التعليمية وأولياء الأمور بأعلى درجات الدقة والأمان.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 text-primary rounded-xl">
                  <BookOpen size={16} />
                </div>
                <h3 className="text-xs font-black text-white">متابعة الحفظ والمراجعة</h3>
              </div>
              <p className="text-[11px] font-bold text-slate-400">تسجيل ومتابعة إنجاز الطلاب اليومي بكل سلاسة.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <MessageSquare size={16} />
                </div>
                <h3 className="text-xs font-black text-white">إشعارات الواتساب الفورية</h3>
              </div>
              <p className="text-[11px] font-bold text-slate-400">إرسال التقارير والتنبيهات التلقائية لأولياء الأمور.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <BarChart3 size={16} />
                </div>
                <h3 className="text-xs font-black text-white">إحصاءات وتحليلات مركزية</h3>
              </div>
              <p className="text-[11px] font-bold text-slate-400">لوحة مراقبة شاملة لتطور أداء الحلقات والمجمعات.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="text-xs font-black text-white">حماية وتعدد المستأجرين</h3>
              </div>
              <p className="text-[11px] font-bold text-slate-400">عزل وتأمين بيانات كل مجمع تعليمي باستقلالية تامة.</p>
            </div>

          </div>
        </div>

        {/* Bottom Metric Pill */}
        <div className="relative z-10 max-w-lg mx-auto w-full pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" />
            <span className="text-xs font-black text-slate-200">النسخة القياسية المحدثة 2026</span>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HPro SaaS Suite</span>
        </div>

      </div>

    </div>
  );
};

export default SignIn;
