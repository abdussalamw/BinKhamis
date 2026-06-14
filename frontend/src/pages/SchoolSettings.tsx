import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  MapPin, 
  Phone, 
  Mail,
  Upload as UploadCloudIcon,
  UserCheck as CheckCircle2,
  Building,
  Calendar,
  Clock,
  Plus,
  Loader
} from 'lucide-react';

const SchoolSettings: React.FC = () => {
  const [school, setSchool] = useState<any>(null);
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showTermModal, setShowTermModal] = useState(false);
  const [termFormData, setTermFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false
  });

  const fetchInitialData = async () => {
    try {
      const response = await api.get('/auth/me'); 
      const schoolId = response.data.school_id;
      if (schoolId) {
        const [schoolRes, termsRes] = await Promise.all([
          api.get(`/school-info`),
          api.get('/terms')
        ]);
        setSchool(schoolRes.data);
        setTerms(termsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/school-info`, school);
      setMessage('تم تحديث بيانات المجمع بنجاح');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/terms', termFormData);
      setShowTermModal(false);
      setTermFormData({ name: '', start_date: '', end_date: '', is_current: false });
      const termsRes = await api.get('/terms');
      setTerms(termsRes.data);
    } catch (error) {
      alert('خطأ في إضافة الدورة الدراسية');
    }
  };

  if (loading) return <div className="flex justify-center py-20 animate-pulse dark:text-white">جاري التحميل...</div>;
  if (!school) return <div className="p-10 text-center text-slate-500">لا تملك صلاحية تعديل بيانات المجمع.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-600/10 rounded-2xl">
          <Building className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">إعدادات مجمع {school.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold">إدارة الهوية والتقويم الدراسي للمجمع</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logo Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card-premium p-8 text-center">
            <div className="relative group w-40 h-40 mx-auto rounded-[2.5rem] overflow-hidden border-4 border-slate-50 dark:border-white/5 shadow-inner">
              {school.logo ? (
                <img src={school.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                  <Building className="w-16 h-16 text-slate-200" />
                </div>
              )}
              <div className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <UploadCloudIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="mt-6 font-black text-slate-800 dark:text-white text-xl">شعار المجمع</h3>
            <p className="text-xs text-slate-400 mt-2 px-4 leading-relaxed font-bold">سيظهر هذا الشعار في كافة التقارير والشهادات الصادرة من مجمع {school.name}</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdate} className="glass-card-premium p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">اسم المجمع</label>
                <input
                  type="text"
                  value={school.name || ''}
                  onChange={e => setSchool({...school, name: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-black text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                    <Phone size={14} /> رقم التواصل
                  </label>
                  <input
                    type="text"
                    value={school.phone || ''}
                    onChange={e => setSchool({...school, phone: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                    <Mail size={14} /> البريد الرسمي
                  </label>
                  <input
                    type="email"
                    value={school.email || ''}
                    onChange={e => setSchool({...school, email: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                  <MapPin size={14} /> العنوان
                </label>
                <textarea
                  value={school.address || ''}
                  onChange={e => setSchool({...school, address: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-indigo-600 outline-none transition-all min-h-[120px] font-bold"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                {message && (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{message}</span>
                  </>
                )}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Academic Terms Section - Moved to Supervisor/Complex level */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <Calendar className="text-indigo-600" />
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">التقويم الدراسي للمجمع</h3>
           </div>
           <button 
              onClick={() => setShowTermModal(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-indigo-600 transition-all shadow-lg"
           >
              إضافة فصل/دورة جديدة
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {terms.map((term: any) => (
             <div key={term.id} className={`glass-card-premium p-6 border-2 transition-all ${term.is_current ? 'border-indigo-600' : 'border-transparent'}`}>
                {term.is_current && <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-widest mb-4 inline-block">الفصل الحالي</span>}
                <h4 className="text-lg font-black text-slate-800 mb-4">{term.name}</h4>
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock size={14} />
                      <span>يبدأ: {term.start_date}</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock size={14} />
                      <span>ينتهي: {term.end_date}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Add Term Modal */}
      {showTermModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-midnight w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
              <h2 className="text-2xl font-black text-slate-900 mb-8">إضافة دورة تعليمية</h2>
              <form onSubmit={handleAddTerm} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">اسم الفصل/الدورة</label>
                    <input 
                       type="text" 
                       required
                       className="w-full bg-slate-50 p-4 rounded-2xl border-none ring-1 ring-slate-100 font-bold"
                       value={termFormData.name}
                       onChange={e => setTermFormData({...termFormData, name: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">تاريخ البدء</label>
                       <input 
                          type="date" 
                          required
                          className="w-full bg-slate-50 p-4 rounded-2xl border-none ring-1 ring-slate-100 font-bold text-xs"
                          value={termFormData.start_date}
                          onChange={e => setTermFormData({...termFormData, start_date: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">تاريخ الانتهاء</label>
                       <input 
                          type="date" 
                          required
                          className="w-full bg-slate-50 p-4 rounded-2xl border-none ring-1 ring-slate-100 font-bold text-xs"
                          value={termFormData.end_date}
                          onChange={e => setTermFormData({...termFormData, end_date: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="flex gap-2 pt-4">
                    <button type="submit" className="flex-grow bg-indigo-600 text-white py-4 rounded-2xl font-black">حفظ الدورة</button>
                    <button type="button" onClick={() => setShowTermModal(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black">إلغاء</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSettings;
