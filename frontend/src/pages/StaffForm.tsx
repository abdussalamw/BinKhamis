import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ChevronLeft, Save, Shield, User, 
  Mail, CreditCard, Briefcase,
  Key, BookOpen, Award, Building, DollarSign
} from 'lucide-react';

const QURAN_NARRATIONS = [
  'حفص عن عاصم',
  'شعبة عن عاصم',
  'قالون عن نافع',
  'ورش عن نافع',
  'الدوري عن أبي عمرو',
  'السوسي عن أبي عمرو',
  'ابن كثير المكي',
  'ابن عامر الشامي',
  'حمزة الزيات',
  'الكسائي',
  'أبو جعفر المدني',
  'يعقوب الحضرمي',
  'خلف العاشر',
  'القراءات العشر الكبرى',
  'القراءات العشر الصغرى'
];

const StaffForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const viewerRole = user?.role || 'teacher';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher' as 'teacher' | 'admin' | 'manager' | 'supervisor',
    identity_type: 'national_id',
    national_id: '',
    is_active: true,
    status: 'active',
    bank_name: '',
    bank_account_number: '',
    specialization: '',
    academic_qualification: '',
    graduation_year: '',
    university: '',
    basic_salary: '',
    quran_ijazat: [] as string[],
    password: '',
    allowed_circles: [] as string[],
    circle_id: '', 
  });

  const [allCircles, setAllCircles] = useState<any[]>([]);

  useEffect(() => {
    fetchCircles();
    if (isEdit) fetchStaffData();
    else {
      if (viewerRole === 'admin') setFormData(prev => ({...prev, role: 'teacher'}));
      else if (viewerRole === 'supervisor') setFormData(prev => ({...prev, role: 'admin'}));
    }
  }, [id]);

  const fetchCircles = async () => {
    try {
      const res = await api.get('/circles');
      setAllCircles(res.data.data || res.data);
    } catch (e) { console.error(e); }
  };

  const fetchStaffData = async () => {
    try {
      const response = await api.get(`/staff/${id}`);
      const data = response.data;
      const profile = data.teacher_profile || data.active_profile || data.profile || {};
      
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'teacher',
        identity_type: profile.identity_type || 'national_id',
        national_id: profile.national_id || '',
        is_active: data.is_active ?? true,
        status: profile.status || 'active',
        bank_name: profile.bank_name || '',
        bank_account_number: profile.bank_account_number || '',
        specialization: profile.specialization || '',
        academic_qualification: profile.academic_qualification || profile.qualification || '',
        graduation_year: profile.graduation_year || '',
        university: profile.university || '',
        basic_salary: profile.basic_salary || '',
        quran_ijazat: Array.isArray(profile.quran_ijazat) ? profile.quran_ijazat : [],
        password: '',
        allowed_circles: data.allowed_circles || [],
        circle_id: data.circle_id || '',
      });
    } catch (error) {
      console.error('Error fetching staff member:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIjaza = (ijazaName: string) => {
    if (ijazaName === 'القراءات العشر الكبرى' || ijazaName === 'القراءات العشر الصغرى') {
      if (formData.quran_ijazat.includes(ijazaName)) {
        setFormData(prev => ({ ...prev, quran_ijazat: prev.quran_ijazat.filter(i => i !== ijazaName) }));
      } else {
        setFormData(prev => ({ ...prev, quran_ijazat: [...prev.quran_ijazat, ijazaName] }));
      }
      return;
    }

    setFormData(prev => {
      const exists = prev.quran_ijazat.includes(ijazaName);
      if (exists) {
        return { ...prev, quran_ijazat: prev.quran_ijazat.filter(i => i !== ijazaName) };
      } else {
        return { ...prev, quran_ijazat: [...prev.quran_ijazat, ijazaName] };
      }
    });
  };

  const toggleAllIjazat = () => {
    if (formData.quran_ijazat.length === QURAN_NARRATIONS.length) {
      setFormData(prev => ({ ...prev, quran_ijazat: [] }));
    } else {
      setFormData(prev => ({ ...prev, quran_ijazat: [...QURAN_NARRATIONS] }));
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
    } catch (error: any) {
      console.error('Error saving staff member:', error);
      const msg = error.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات العضو';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-black">جاري تحميل بيانات العضو...</div>;

  const getAllowedRoles = () => {
    if (viewerRole === 'owner') return [
      { id: 'supervisor', label: 'مدير المجمع' },
      { id: 'admin', label: 'مدير الشؤون الإدارية' },
      { id: 'manager', label: 'مشرف تعليمي' },
      { id: 'teacher', label: 'معلم حلقة' }
    ];
    if (viewerRole === 'supervisor') return [
      { id: 'admin', label: 'مدير الشؤون الإدارية' },
      { id: 'manager', label: 'مشرف تعليمي' },
      { id: 'teacher', label: 'معلم حلقة' }
    ];
    if (viewerRole === 'admin') return [
      { id: 'manager', label: 'مشرف تعليمي' },
      { id: 'teacher', label: 'معلم حلقة' }
    ];
    return [{ id: 'teacher', label: 'معلم حلقة' }];
  };

  const allowedRoles = getAllowedRoles();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">
              {isEdit ? `تعديل ملف المعلم/الإداري: ${formData.name}` : 'إضافة عضو جديد للطاقم'}
            </h1>
            <p className="text-xs font-bold text-slate-400">إدارة البيانات الوظيفية، البنكية، والإجازات القرآنية</p>
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
            بيانات الحساب والهوية
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">الاسم الكامل *</label>
            <input 
              type="text" required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">نوع الهوية *</label>
              <select 
                className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.identity_type}
                onChange={e => setFormData({...formData, identity_type: e.target.value})}
              >
                <option value="national_id">هوية وطنية</option>
                <option value="iqama">هوية مقيم</option>
                <option value="passport">رقم جواز</option>
                <option value="border_number">رقم حدود</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">رقم الهوية / الإقامة *</label>
              <input 
                type="text" required
                placeholder="10 أو 14 رقم"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.national_id}
                onChange={e => setFormData({...formData, national_id: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">رقم الجوال *</label>
              <input 
                type="text" required
                placeholder="05xxxxxxxx"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all text-left"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">الدور الوظيفي *</label>
              <select 
                className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as any})}
              >
                {allowedRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email"
                placeholder="email@example.com"
                className="w-full pr-12 pl-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Professional & Financial Info */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl border border-white/10">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-emerald-500" />
            المؤهلات والبيانات المالية
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">المؤهل الأكاديمي</label>
              <select 
                className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-emerald-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.academic_qualification}
                onChange={e => setFormData({...formData, academic_qualification: e.target.value})}
              >
                <option value="">اختر المؤهل...</option>
                <option value="ثانوي">ثانوي</option>
                <option value="دبلوم">دبلوم</option>
                <option value="بكالوريوس">بكالوريوس</option>
                <option value="ماجستير">ماجستير</option>
                <option value="دكتوراه">دكتوراه</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">التخصص</label>
              <input 
                type="text"
                placeholder="مثال: الدراسات الإسلامية"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-emerald-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.specialization}
                onChange={e => setFormData({...formData, specialization: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">اسم البنك</label>
              <input 
                type="text"
                placeholder="مثال: الراجحي / الأهلي"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-emerald-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.bank_name}
                onChange={e => setFormData({...formData, bank_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">رقم الحساب (آيبان IBAN)</label>
              <input 
                type="text"
                placeholder="SA..."
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-emerald-600/20 font-bold text-slate-700 dark:text-white transition-all text-left"
                value={formData.bank_account_number}
                onChange={e => setFormData({...formData, bank_account_number: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">الراتب / المكافأة</label>
              <div className="relative">
                <DollarSign size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full pr-12 pl-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-emerald-600/20 font-bold text-slate-700 dark:text-white transition-all"
                  value={formData.basic_salary}
                  onChange={e => setFormData({...formData, basic_salary: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">حالة العمل</label>
              <select 
                className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-emerald-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">نشط</option>
                <option value="discontinued">منقطع</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quran Ijazat Section */}
        <div className="md:col-span-2 glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl border border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Award size={20} className="text-amber-500" />
              الإجازات القرآنية والروايات
            </h3>
            <button 
              type="button"
              onClick={toggleAllIjazat}
              className="text-xs font-black px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              {formData.quran_ijazat.length === QURAN_NARRATIONS.length ? 'إلغاء تحديد الجميع' : 'تحديد الجميع (القراءات العشر)'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QURAN_NARRATIONS.map((ijaza) => {
              const isSelected = formData.quran_ijazat.includes(ijaza);
              return (
                <button
                  key={ijaza}
                  type="button"
                  onClick={() => toggleIjaza(ijaza)}
                  className={`p-3.5 rounded-2xl text-xs font-bold text-right transition-all flex items-center justify-between border ${
                    isSelected 
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{ijaza}</span>
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-white bg-white' : 'border-slate-400'}`}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-amber-500" />}
                  </div>
                </button>
              );
            })}
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
                  <Shield size={24} />
                </button>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-white">تفعيل حساب الدخول</p>
                  <p className="text-[10px] font-bold text-slate-400">{formData.is_active ? 'يستطيع الدخول للوحة التحكم' : 'حساب الدخول معطل'}</p>
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
                    {isEdit ? 'تحديث ملف العضو' : 'إضافة العضو للمجمع'}
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
