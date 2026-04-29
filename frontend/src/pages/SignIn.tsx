import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Phone, Loader2, ChevronLeft } from 'lucide-react';
import axios from '../services/api';

const SignIn: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/login', { phone, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err: any) {
      setError('رقم الجوال أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] dark:bg-slate-950 px-4 font-cairo" dir="rtl">
      <div className="w-full max-w-[500px] animate-in fade-in zoom-in duration-700">
        <div className="glass-card overflow-hidden rounded-[40px] shadow-2xl p-10 md:p-16">
            <div className="mb-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-2xl shadow-primary/40">
                  <span className="text-4xl font-black text-white">ق</span>
              </div>
              <h2 className="mb-3 text-3xl font-black text-slate-800 dark:text-white">
                تسجيل الدخول
              </h2>
              <p className="font-bold text-slate-500">نظام إدارة حلقات بن خميس</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-black text-slate-700 dark:text-slate-300">
                  رقم الجوال
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="05xxxxxxxx"
                    className="w-full rounded-2xl border-none bg-slate-100 py-5 pr-12 pl-6 font-bold text-slate-800 outline-none ring-2 ring-transparent transition-all focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone size={20} />
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-black text-slate-700 dark:text-slate-300">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-2xl border-none bg-slate-100 py-5 pr-12 pl-6 font-bold text-slate-800 outline-none ring-2 ring-transparent transition-all focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={20} />
                  </span>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-danger/10 p-4 text-center text-sm font-bold text-danger animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-primary py-5 font-black text-white shadow-2xl shadow-primary/30 transition-all hover:bg-opacity-90 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                        <span>دخول للنظام</span>
                        <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                    </>
                )}
              </button>

              <div className="mt-10 text-center">
                <p className="text-sm font-bold text-slate-500">
                  نسيت كلمة المرور؟{' '}
                  <Link to="#" className="text-primary hover:underline">
                    تواصل مع الإدارة
                  </Link>
                </p>
              </div>
            </form>
        </div>
        
        <p className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} مجمع بن خميس
        </p>
      </div>
    </div>
  );
};

export default SignIn;
