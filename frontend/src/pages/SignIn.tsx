import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  LogIn, 
  Lock, 
  User, 
  AlertCircle,
  Loader,
  ArrowRight
} from 'lucide-react';

const SignIn: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
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
      // Clean phone number: remove spaces and handle 05/966
      let cleanPhone = phone.trim().replace(/\s+/g, '');
      
      const config = schoolCode ? { headers: { 'X-School-ID': schoolCode } } : {};
      
      const response = await api.post('/auth/login-password', { 
        phone: cleanPhone, 
        password 
      }, config);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.access_token);
        
        // Save user and ensure school_id is persisted for interceptor
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
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 p-4 font-readex" dir="rtl">
      <div className="w-full max-w-[450px] animate-in fade-in zoom-in duration-500">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
          
          <div className="text-center mb-10">
             <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <LogIn className="text-primary w-10 h-10" />
             </div>
             <h1 className="text-3xl font-black text-slate-800 dark:text-white">حلقات برو</h1>
             <p className="text-slate-400 font-bold mt-2">مرحباً بك، سجل دخولك للمتابعة</p>
          </div>
 
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-black animate-in shake duration-300">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
 
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">رقم الجوال</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300"><User size={20} /></div>
                <input
                  type="text"
                  required
                  className="block w-full pr-14 pl-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-slate-800 dark:text-white outline-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
 
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">كود المجمع (للمجمعات فقط)</label>
              <input
                type="text"
                className="block w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-slate-800 dark:text-white outline-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="اتركه فارغاً إذا كنت المالك"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
              />
            </div>
 
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300"><Lock size={20} /></div>
                <input
                  type="password"
                  required
                  className="block w-full pr-14 pl-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-slate-800 dark:text-white outline-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
 
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : (
                <>
                  <span>دخول النظام</span>
                  <ArrowRight size={20} className="rotate-180" />
                </>
              )}
            </button>
          </form>
 
          <div className="mt-10 text-center">
             <button className="text-sm font-black text-slate-400 hover:text-primary transition-colors">هل نسيت كلمة المرور؟</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
