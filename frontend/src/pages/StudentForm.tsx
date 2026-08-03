import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ChevronLeft, User, Phone, MapPin, 
  Shield, GraduationCap, School, Book,
  CreditCard, Users, Save, Globe, Activity
} from 'lucide-react';

const StudentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    identity_type: 'national_id',
    identity_number: '',
    passport_number: '',
    place_of_birth: '',
    status: 'active',
    academic_stage: '',
    grade_level: '',
    school_name: '',
    neighborhood: '',
    birth_date: '',
    memorization_amount: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relation: 'أب',
    secondary_guardian_name: '',
    secondary_guardian_phone: '',
    secondary_guardian_relation: 'أم',
    is_active: true,
  });

  useEffect(() => {
    if (isEdit) fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      const response = await api.get(`/students/${id}`);
      const data = response.data;
      const profile = data.student_profile || data.active_profile || data.profile || {};
      const guardian = data.guardian || profile.guardian || {};
      const secGuardian = data.secondary_guardian || profile.secondary_guardian || {};
      
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        identity_type: data.identity_type || profile.identity_type || 'national_id',
        identity_number: data.national_id || profile.national_id || profile.identity_number || '',
        passport_number: data.passport_number || profile.passport_number || '',
        place_of_birth: data.place_of_birth || profile.place_of_birth || '',
        status: data.status || profile.status || 'active',
        academic_stage: data.academic_stage || profile.academic_stage || '',
        grade_level: data.grade_level || profile.grade_level || '',
        school_name: data.school_name || profile.school_name || '',
        neighborhood: data.neighborhood || profile.neighborhood || '',
        birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
        memorization_amount: data.memorization_amount || profile.current_level || '',
        guardian_name: guardian.full_name || '',
        guardian_phone: guardian.phone_number || '',
        guardian_relation: guardian.relation || 'أب',
        secondary_guardian_name: secGuardian.full_name || '',
        secondary_guardian_phone: secGuardian.phone_number || '',
        secondary_guardian_relation: secGuardian.relation || 'أم',
        is_active: data.is_active ?? true,
      });
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/students/${id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      navigate('/students');
    } catch (error: any) {
      console.error('Error saving student:', error);
      const msg = error.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات الطالب';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-black">جاري تحميل بيانات الطالب...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">
              {isEdit ? `تعديل ملف الطالب: ${formData.name}` : 'إضافة طالب جديد للمجمع'}
            </h1>
            <p className="text-xs font-bold text-slate-400">أدخل البيانات الأساسية، الأكاديمية، وبيانات ولي الأمر</p>
          </div>
        </div>
        <button onClick={() => navigate('/students')} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 transition-all">
          <ChevronLeft size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Info */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl border border-white/10">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Shield size={20} className="text-indigo-500" />
            المعلومات الشخصية والهوية
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">اسم الطالب الرباعي *</label>
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
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">رقم الهوية / المقيم / الحدود *</label>
              <input 
                type="text" required
                placeholder="10 أو 14 رقم"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.identity_number}
                onChange={e => setFormData({...formData, identity_number: e.target.value})}
              />
            </div>
          </div>

          {formData.identity_type === 'passport' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">رقم الجواز</label>
              <input 
                type="text"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.passport_number}
                onChange={e => setFormData({...formData, passport_number: e.target.value})}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">مكان الميلاد</label>
              <input 
                type="text"
                placeholder="مثال: المدينة المنورة"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.place_of_birth}
                onChange={e => setFormData({...formData, place_of_birth: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">تاريخ الميلاد</label>
              <input 
                type="date"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.birth_date}
                onChange={e => setFormData({...formData, birth_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">جوال الطالب</label>
              <input 
                type="text"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all text-left"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">الحي السكني</label>
              <input 
                type="text"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.neighborhood}
                onChange={e => setFormData({...formData, neighborhood: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Guardian Info & Academic Path */}
        <div className="space-y-8">
          {/* Guardian Info Card */}
          <div className="glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl border border-white/10">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Users size={20} className="text-teal-500" />
              بيانات ولي الأمر
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">اسم ولي الأمر</label>
              <input 
                type="text"
                placeholder="اسم ولي أمر الطالب"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-teal-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.guardian_name}
                onChange={e => setFormData({...formData, guardian_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">جوال ولي الأمر</label>
                <input 
                  type="text"
                  placeholder="05xxxxxxxx"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-teal-600/20 font-bold text-slate-700 dark:text-white transition-all text-left"
                  value={formData.guardian_phone}
                  onChange={e => setFormData({...formData, guardian_phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">صلة القرابة</label>
                <select 
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-teal-600/20 font-bold text-slate-700 dark:text-white transition-all"
                  value={formData.guardian_relation}
                  onChange={e => setFormData({...formData, guardian_relation: e.target.value})}
                >
                  <option value="أب">أب</option>
                  <option value="أم">أم</option>
                  <option value="أخ">أخ</option>
                  <option value="عم">عم</option>
                  <option value="خال">خال</option>
                  <option value="ولي أمر">ولي أمر آخر</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secondary Guardian Info Card */}
          <div className="glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl border border-white/10">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Users size={20} className="text-cyan-500" />
              معلومات ولي الأمر الثاني (إضافي)
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">اسم ولي الأمر الثاني</label>
              <input 
                type="text"
                placeholder="مثال: الأم أو الأخ"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-cyan-600/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.secondary_guardian_name}
                onChange={e => setFormData({...formData, secondary_guardian_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">جوال ولي الأمر الثاني</label>
                <input 
                  type="text"
                  placeholder="05xxxxxxxx"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-cyan-600/20 font-bold text-slate-700 dark:text-white transition-all text-left"
                  value={formData.secondary_guardian_phone}
                  onChange={e => setFormData({...formData, secondary_guardian_phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">صلة القرابة 2</label>
                <select 
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-cyan-600/20 font-bold text-slate-700 dark:text-white transition-all"
                  value={formData.secondary_guardian_relation}
                  onChange={e => setFormData({...formData, secondary_guardian_relation: e.target.value})}
                >
                  <option value="أم">أم</option>
                  <option value="أب">أب</option>
                  <option value="أخ">أخ</option>
                  <option value="أخت">أخت</option>
                  <option value="عم">عم</option>
                  <option value="خال">خال</option>
                  <option value="ولي أمر">ولي أمر آخر</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Info Card */}
          <div className="glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl border border-white/10">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap size={20} className="text-emerald-500" />
              المسار التعليمي والقرآني
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">المرحلة الدراسية</label>
                <select 
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                  value={formData.academic_stage}
                  onChange={e => setFormData({...formData, academic_stage: e.target.value})}
                >
                  <option value="">اختر المرحلة...</option>
                  <option value="الابتدائية">الابتدائية</option>
                  <option value="المتوسطة">المتوسطة</option>
                  <option value="الثانوية">الثانوية</option>
                  <option value="الجامعية">الجامعية</option>
                  <option value="خريج / موظف">خريج / موظف</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">الصف / المستوى</label>
                <input 
                  type="text"
                  placeholder="مثال: الأول متوسط"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                  value={formData.grade_level}
                  onChange={e => setFormData({...formData, grade_level: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">مقدار الحفظ الحالية</label>
                <input 
                  type="text"
                  placeholder="مثال: 5 أجزاء"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                  value={formData.memorization_amount}
                  onChange={e => setFormData({...formData, memorization_amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">حالة القيد في المجمع</label>
                <select 
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-indigo-600/20 font-bold text-slate-700 dark:text-white transition-all"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">نشط</option>
                  <option value="discontinued">منقطع</option>
                </select>
              </div>
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
                  <Shield size={24} />
                </button>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-white">تفعيل الحساب بالنظام</p>
                  <p className="text-[10px] font-bold text-slate-400">{formData.is_active ? 'الحساب نَشِط ويستطيع التفاعل' : 'الحساب معطل حالياً'}</p>
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
                    {isEdit ? 'تحديث ملف الطالب' : 'إضافة الطالب للمجمع'}
                  </>
                )}
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
