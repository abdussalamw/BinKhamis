import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ChevronLeft, Save, Users, MapPin, 
  ShieldCheck, UserCircle, 
  Trash2, AlertCircle
} from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
}

const CircleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    teacher_id: '',
    capacity: 15,
    is_active: true,
    description: '',
    schedule: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
  });

  useEffect(() => {
    fetchTeachers();
    if (isEdit) fetchCircleData();
  }, [id]);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/staff'); // Fetching from the new staff endpoint
      setTeachers(response.data.filter((u: any) => u.role === 'teacher'));
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchCircleData = async () => {
    try {
      const response = await api.get(`/circles/${id}`);
      const data = response.data;
      setFormData({
        name: data.name,
        location: data.location,
        teacher_id: data.teacher_id,
        capacity: data.capacity,
        is_active: data.is_active,
        description: data.description || '',
        schedule: data.schedule || [],
      });
    } catch (error) {
      console.error('Error fetching circle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/circles/${id}`, formData);
      } else {
        await api.post('/circles', formData);
      }
      navigate('/circles');
    } catch (error) {
      console.error('Error saving circle:', error);
      alert('حدث خطأ أثناء حفظ بيانات الحلقة');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-black">جاري تحميل البيانات...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">
              {isEdit ? `تعديل بيانات: ${formData.name}` : 'فتح حلقة تعليمية جديدة'}
            </h1>
            <p className="text-xs font-bold text-slate-400">أدخل تفاصيل الحلقة وتعيين المعلم المسؤول</p>
          </div>
        </div>
        <button onClick={() => navigate('/circles')} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 transition-all">
          <ChevronLeft size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl border border-white/10">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            المعلومات الأساسية
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">اسم الحلقة</label>
            <input 
              type="text"
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-primary/20 font-bold text-slate-700 dark:text-white transition-all"
              placeholder="مثال: حلقة علي بن أبي طالب"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">الموقع / القاعة</label>
            <div className="relative">
              <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                required
                className="w-full pr-12 pl-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-primary/20 font-bold text-slate-700 dark:text-white transition-all"
                placeholder="مثال: الدور الثاني - قاعة 5"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">السعة (طلاب)</label>
              <input 
                type="number"
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-primary/20 font-bold text-slate-700 dark:text-white transition-all"
                value={formData.capacity}
                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">حالة الحلقة</label>
              <button 
                type="button"
                onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all border ${formData.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
              >
                {formData.is_active ? 'نشطة حالياً' : 'معطلة'}
              </button>
            </div>
          </div>
        </div>

        {/* Teacher & Schedule */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl border border-white/10">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <UserCircle size={20} className="text-indigo-500" />
            التعيين والجدول
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">المعلم المسؤول</label>
            <select 
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-primary/20 font-bold text-slate-700 dark:text-white transition-all cursor-pointer appearance-none"
              value={formData.teacher_id}
              onChange={e => setFormData({...formData, teacher_id: e.target.value})}
            >
              <option value="">اختر معلماً...</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">أيام العمل</label>
            <div className="flex flex-wrap gap-2">
              {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const newSched = formData.schedule.includes(day) 
                      ? formData.schedule.filter(d => d !== day)
                      : [...formData.schedule, day];
                    setFormData({...formData, schedule: newSched});
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${formData.schedule.includes(day) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
             <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex gap-3">
                <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500">
                   تنبيه: تغيير المعلم سيؤدي لنقل صلاحية التحضير وتتبع الحفظ لهذا المعلم بشكل فوري.
                </p>
             </div>
          </div>
        </div>

        {/* Description & Footer */}
        <div className="md:col-span-2 glass-card p-8 rounded-[2.5rem] shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex-grow w-full md:w-auto">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">ملاحظات إضافية (اختياري)</label>
              <textarea 
                className="w-full mt-2 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-primary/20 font-bold text-slate-700 dark:text-white transition-all h-20"
                placeholder="أي تفاصيل أخرى حول الحلقة..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
           </div>
           
           <div className="flex items-center gap-4 w-full md:w-auto">
              {isEdit && (
                <button 
                  type="button"
                  className="p-4 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  title="حذف الحلقة"
                >
                  <Trash2 size={24} />
                </button>
              )}
              <button 
                type="submit"
                disabled={saving}
                className="flex-grow md:flex-grow-0 flex items-center justify-center gap-3 bg-primary text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : (
                  <>
                    <Save size={24} />
                    {isEdit ? 'تحديث البيانات' : 'فتح الحلقة الآن'}
                  </>
                )}
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default CircleForm;
