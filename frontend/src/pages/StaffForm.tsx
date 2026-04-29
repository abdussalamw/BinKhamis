import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ChevronLeft, Save, ShieldCheck, User, 
  Phone, Mail, CreditCard, Briefcase,
  Key, AlertCircle, Power
} from 'lucide-react';

const StaffForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher' as 'teacher' | 'admin' | 'manager',
    is_active: true,
    bank_account_number: '',
    specialization: '',
    qualification: '',
    password: '', // Only for creation or if explicitly changing
  });

  useEffect(() => {
    if (isEdit) fetchStaffData();
  }, [id]);

  const fetchStaffData = async () => {
    try {
      const response = await api.get(`/staff/${id}`);
      const data = response.data;
      const profile = data.profile || {};
      
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'teacher',
        is_active: data.is_active ?? true,
        bank_account_number: profile.bank_account_number || '',
        specialization: profile.specialization || '',
        qualification: profile.qualification || '',
        password: '', // Don't fetch password
      });
    } catch (error) {
      console.error('Error fetching staff member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/staff/${id}`, formData);
      } else {
        await api.post('/staff', formData);
      }
      navigate('/staff');
    } catch (error) {
      console.error('Error saving staff member:', error);
      alert('حدث خطأ أثناء حفظ بيانات العضو');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-black">جاري تحميل بيانات العضو...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">
              {isEdit ? `تعديل ملف: ${formData.name}` : 'إضافة عضو جديد للطاقم'}
            </h1>
            <p className="text-xs font-bold text-slate-400">إدارة صلاحيات وبيانات المعلمين والإداريين</p>
          </div>
        </div>
        <button onClick={() => navigate('/staff')} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 transition-all">
          <ChevronLeft size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Info */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl border border-white/10">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <User size={20} className="text-indigo-500" />
            بيانات الحساب
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">الاسم الكامل</label>
            <input 
              type="text" required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">البريد الإلكتروني (لتسجيل الدخول)</label>
            <div className="relative">
              <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email" required
                className="w-full pr-12 pl-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">كلمة المرور المؤقتة</label>
              <div className="relative">
                <Key size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" required
                  className="w-full pr-12 pl-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">نوع الدور</label>
              <select 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as any})}
              >
                <option value="teacher">معلم</option>
                <option value="admin">إداري</option>
                <option value="manager">مشرف</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">رقم الجوال</label>
              <input 
                type="text" required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Administrative Details */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl border border-white/10">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-amber-500" />
            البيانات الإدارية والمالية
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">رقم الحساب البنكي (الآيبان)</label>
            <div className="relative">
              <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                className="w-full pr-12 pl-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all font-mono"
                placeholder="SA..."
                value={formData.bank_account_number}
                onChange={e => setFormData({...formData, bank_account_number: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">التخصص التعليمي</label>
            <input 
              type="text"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
              placeholder="مثال: لغة عربية، دراسات إسلامية..."
              value={formData.specialization}
              onChange={e => setFormData({...formData, specialization: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">المؤهل العلمي</label>
            <input 
              type="text"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
              placeholder="بكالوريوس، ماجستير..."
              value={formData.qualification}
              onChange={e => setFormData({...formData, qualification: e.target.value})}
            />
          </div>

          <div className="pt-4">
             <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 flex gap-3">
                <AlertCircle className="text-indigo-500 flex-shrink-0" size={20} />
                <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-500 leading-relaxed">
                   ملاحظة: البيانات البنكية والوظيفية تستخدم لأغراض صرف المكافآت والتقارير الإدارية الداخلية فقط.
                </p>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="md:col-span-2 glass-card p-8 rounded-[2.5rem] shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${formData.is_active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-200 text-slate-400'}`}
                >
                  <Power size={24} />
                </button>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-white">حالة العضو</p>
                  <p className="text-[10px] font-bold text-slate-400">{formData.is_active ? 'الحساب نشط حالياً' : 'الحساب معطل (لا يمكنه الدخول)'}</p>
                </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                type="submit"
                disabled={saving}
                className="flex-grow md:flex-grow-0 flex items-center justify-center gap-3 bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : (
                  <>
                    <Save size={24} />
                    {isEdit ? 'تحديث بيانات العضو' : 'تعيين العضو الجديد'}
                  </>
                )}
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;
