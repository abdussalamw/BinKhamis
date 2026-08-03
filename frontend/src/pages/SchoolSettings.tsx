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
  Trash2,
  ShieldCheck,
  Sparkles,
  Loader
} from 'lucide-react';

interface Mosque {
  id: string;
  name: string;
  address: string;
}

const SchoolSettings: React.FC = () => {
  const [school, setSchool] = useState<any>(null);
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Mosque Modal & Form State
  const [showMosqueModal, setShowMosqueModal] = useState(false);
  const [newMosqueName, setNewMosqueName] = useState('');
  const [newMosqueAddress, setNewMosqueAddress] = useState('');

  // Educational Periods State
  const [newPeriodName, setNewPeriodName] = useState('');

  // Term Modal & Form State
  const [showTermModal, setShowTermModal] = useState(false);
  const [termFormData, setTermFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false
  });

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [schoolRes, termsRes] = await Promise.allSettled([
        api.get('/school-info'),
        api.get('/terms')
      ]);

      if (schoolRes.status === 'fulfilled' && schoolRes.value.data) {
        const data = schoolRes.value.data;
        if (!data.settings) data.settings = {};
        if (!data.settings.mosques) {
          data.settings.mosques = [
            { id: '1', name: data.name || 'المسجد الرئيسي', address: data.address || 'المقر الرئيسي' }
          ];
        }
        if (!data.settings.periods) {
          data.settings.periods = ['فجر', 'عصر', 'مغرب', 'عشاء'];
        }
        setSchool(data);
      }
      if (termsRes.status === 'fulfilled' && termsRes.value.data) {
        setTerms(Array.isArray(termsRes.value.data) ? termsRes.value.data : []);
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

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/school-info', school);
      setMessage('تم تحديث بيانات المجمع وإعداداته بنجاح');
      if (response.data?.school) {
        setSchool(response.data.school);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('خطأ في الحفظ، يرجى إعادة المحاولة.');
    } finally {
      setSaving(false);
    }
  };

  // Mosque Actions
  const handleAddMosque = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMosqueName.trim()) return;

    const newMosque: Mosque = {
      id: Date.now().toString(),
      name: newMosqueName.trim(),
      address: newMosqueAddress.trim() || 'الفرع التابع'
    };

    const currentMosques = school.settings?.mosques || [];
    const updatedSettings = {
      ...school.settings,
      mosques: [...currentMosques, newMosque]
    };

    setSchool({ ...school, settings: updatedSettings });
    setNewMosqueName('');
    setNewMosqueAddress('');
    setShowMosqueModal(false);
  };

  const handleRemoveMosque = (id: string) => {
    const currentMosques = school.settings?.mosques || [];
    if (currentMosques.length <= 1) {
      alert('يجب الإبقاء على مسجد/مقر واحد على الأقل للمجمع.');
      return;
    }
    const updatedSettings = {
      ...school.settings,
      mosques: currentMosques.filter((m: Mosque) => m.id !== id)
    };
    setSchool({ ...school, settings: updatedSettings });
  };

  // Period Actions
  const handleAddPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodName.trim()) return;

    const currentPeriods = school.settings?.periods || [];
    if (currentPeriods.includes(newPeriodName.trim())) {
      alert('هذه الفترة موجودة بالفعل');
      return;
    }

    const updatedSettings = {
      ...school.settings,
      periods: [...currentPeriods, newPeriodName.trim()]
    };

    setSchool({ ...school, settings: updatedSettings });
    setNewPeriodName('');
  };

  const handleRemovePeriod = (period: string) => {
    const currentPeriods = school.settings?.periods || [];
    const updatedSettings = {
      ...school.settings,
      periods: currentPeriods.filter((p: string) => p !== period)
    };
    setSchool({ ...school, settings: updatedSettings });
  };

  // Term Actions
  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/terms', termFormData);
      setShowTermModal(false);
      setTermFormData({ name: '', start_date: '', end_date: '', is_current: false });
      const termsRes = await api.get('/terms');
      setTerms(Array.isArray(termsRes.data) ? termsRes.data : []);
    } catch (error) {
      alert('خطأ في إضافة الدورة الدراسية');
    }
  };

  if (loading) return <div className="flex justify-center py-20 animate-pulse dark:text-white font-black">جاري تحميل بيانات وإعدادات المجمع...</div>;

  const mosques: Mosque[] = school?.settings?.mosques || [];
  const periods: string[] = school?.settings?.periods || ['فجر', 'عصر', 'مغرب', 'عشاء'];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Page Title */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">إعدادات مجمع {school?.name}</h1>
            <p className="text-slate-400 font-bold text-xs">إدارة الفروع، الفترات التعليمية، الهوية، والتقويم الدراسي</p>
          </div>
        </div>

        <button
          onClick={() => handleUpdate()}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-white font-black text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
          <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات العامة'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl text-xs font-black flex items-center gap-3">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {/* Main Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Logo & Supervisor Info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Logo Card */}
          <div className="glass-card-premium p-6 text-center">
            <h3 className="font-black text-slate-800 dark:text-white text-base mb-4">شعار المجمع الرسمي</h3>
            <div className="relative group w-36 h-36 mx-auto rounded-[2rem] overflow-hidden border-4 border-slate-50 dark:border-white/5 shadow-inner">
              {school?.settings?.logo || school?.logo ? (
                <img src={school?.settings?.logo || school?.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                  <Building className="w-12 h-12 text-slate-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <UploadCloudIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-bold">يظهر الشعار في كافة الشهادات والتقارير الصادرة من المجمع</p>
          </div>

          {/* Supervisor Card */}
          <div className="glass-card-premium p-6">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                   <ShieldCheck size={20} />
                </div>
                <h3 className="font-black text-slate-800 dark:text-white text-sm">المشرف الإداري للمجمع</h3>
             </div>
             
             {school?.supervisor ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                   <p className="font-black text-slate-800 dark:text-white text-xs">{school.supervisor.name}</p>
                   <p className="text-[10px] font-bold text-slate-400">رقم الجوال: {school.supervisor.phone || 'غير مسجل'}</p>
                   <p className="text-[10px] font-bold text-slate-400">البريد: {school.supervisor.email || 'غير مسجل'}</p>
                </div>
             ) : (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center">
                   <p className="text-xs font-bold text-amber-600">لم يتم تعيين مشرف مسند لهذا المجمع بعد</p>
                </div>
             )}
          </div>
        </div>

        {/* Right Side: Identity Form & Mosques & Periods */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Identity Form */}
          <form onSubmit={handleUpdate} className="glass-card-premium p-6 space-y-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">البيانات الأساسية والهوية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم المجمع التعليمي</label>
                <input
                  type="text"
                  required
                  value={school?.name || ''}
                  onChange={e => setSchool({...school, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border-none outline-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-primary font-black text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Phone size={12} /> رقم الهاتف الرسمي
                </label>
                <input
                  type="text"
                  value={school?.phone || ''}
                  onChange={e => setSchool({...school, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border-none outline-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-primary font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Mail size={12} /> البريد الإلكتروني الرسمي
                </label>
                <input
                  type="email"
                  value={school?.email || ''}
                  onChange={e => setSchool({...school, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border-none outline-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-primary font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} /> العنوان والموقع الرئيسي
                </label>
                <input
                  type="text"
                  value={school?.address || ''}
                  onChange={e => setSchool({...school, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border-none outline-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-primary font-bold text-xs"
                />
              </div>
            </div>
          </form>

          {/* Multiple Mosques Management Section */}
          <div className="glass-card-premium p-6 space-y-4">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-sm font-black text-slate-800 dark:text-white">المساجد والمقرات التابعة للمجمع</h3>
                   <p className="text-[10px] font-bold text-slate-400">إضافة وربط أكثر من مسجد تحت مظلة المجمع</p>
                </div>
                <button
                   onClick={() => setShowMosqueModal(true)}
                   className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white dark:bg-primary rounded-xl font-black text-xs shadow-sm hover:scale-105 transition-all"
                >
                   <Plus size={14} /> إضافة مسجد جديد
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mosques.map((mosque) => (
                   <div key={mosque.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <Building size={16} />
                         </div>
                         <div>
                            <p className="font-black text-xs text-slate-800 dark:text-white">{mosque.name}</p>
                            <p className="text-[9px] font-bold text-slate-400">{mosque.address}</p>
                         </div>
                      </div>
                      <button 
                         onClick={() => handleRemoveMosque(mosque.id)} 
                         className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                         title="حذف المسجد"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                ))}
             </div>
          </div>

          {/* Educational Periods Section */}
          <div className="glass-card-premium p-6 space-y-4">
             <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">الفترات التعليمية بالحلقات</h3>
                <p className="text-[10px] font-bold text-slate-400">تخصيص أوقات إقامة الحلقات (فجر، عصر، مغرب، عشاء...)</p>
             </div>

             <div className="flex flex-wrap gap-2 items-center">
                {periods.map((period) => (
                   <div key={period} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-black">
                      <span>فترة {period}</span>
                      <button onClick={() => handleRemovePeriod(period)} className="hover:text-rose-500 transition-colors">
                         &times;
                      </button>
                   </div>
                ))}
             </div>

             <form onSubmit={handleAddPeriod} className="flex items-center gap-2 pt-2">
                <input
                   type="text"
                   placeholder="اسم الفترة الجديدة (مثال: الضحى)..."
                   value={newPeriodName}
                   onChange={e => setNewPeriodName(e.target.value)}
                   className="flex-grow px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border-none outline-none ring-1 ring-slate-100 dark:ring-white/10 text-xs font-bold"
                />
                <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl font-black text-xs">
                   إضافة فترة
                </button>
             </form>
          </div>
        </div>
      </div>

      {/* Academic Terms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <Calendar className="text-primary" size={20} />
              <h3 className="text-lg font-black text-slate-800 dark:text-white">التقويم والدورات الدراسية للمجمع</h3>
           </div>
           <button 
              onClick={() => setShowTermModal(true)}
              className="px-5 py-2.5 bg-slate-900 text-white dark:bg-primary rounded-xl font-black text-xs hover:bg-primary transition-all shadow-sm"
           >
              إضافة فصل/دورة جديدة
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {terms.map((term: any) => (
             <div key={term.id} className={`glass-card-premium p-5 border-2 transition-all ${term.is_current ? 'border-primary' : 'border-transparent'}`}>
                {term.is_current && <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md uppercase tracking-widest mb-3 inline-block">الفصل الحالي</span>}
                <h4 className="text-base font-black text-slate-800 dark:text-white mb-3">{term.name}</h4>
                <div className="space-y-1.5">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock size={12} />
                      <span>يبدأ: {term.start_date}</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock size={12} />
                      <span>ينتهي: {term.end_date}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Add Mosque Modal */}
      {showMosqueModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">إضافة مسجد/فرع جديد للمجمع</h2>
              <form onSubmit={handleAddMosque} className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 pr-1">اسم المسجد</label>
                    <input 
                       type="text" 
                       required
                       placeholder="مثال: جامع عمر بن الخطاب"
                       className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-bold text-xs outline-none"
                       value={newMosqueName}
                       onChange={e => setNewMosqueName(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 pr-1">الموقع / العنوان الفرعي</label>
                    <input 
                       type="text" 
                       placeholder="مثال: الحي الشمالي"
                       className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-bold text-xs outline-none"
                       value={newMosqueAddress}
                       onChange={e => setNewMosqueAddress(e.target.value)}
                    />
                 </div>
                 <div className="flex gap-2 pt-4">
                    <button type="submit" className="flex-grow bg-primary text-white py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-primary/20">حفظ المسجد</button>
                    <button type="button" onClick={() => setShowMosqueModal(false)} className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs">إلغاء</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Add Term Modal */}
      {showTermModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">إضافة دورة تعليمية جديدة</h2>
              <form onSubmit={handleAddTerm} className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 pr-1">اسم الفصل/الدورة</label>
                    <input 
                       type="text" 
                       required
                       placeholder="مثال: الفصل الثاني 1447"
                       className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-bold text-xs outline-none"
                       value={termFormData.name}
                       onChange={e => setTermFormData({...termFormData, name: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 pr-1">تاريخ البدء</label>
                       <input 
                          type="date" 
                          required
                          className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-bold text-xs outline-none"
                          value={termFormData.start_date}
                          onChange={e => setTermFormData({...termFormData, start_date: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 pr-1">تاريخ الانتهاء</label>
                       <input 
                          type="date" 
                          required
                          className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-bold text-xs outline-none"
                          value={termFormData.end_date}
                          onChange={e => setTermFormData({...termFormData, end_date: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="flex gap-2 pt-4">
                    <button type="submit" className="flex-grow bg-primary text-white py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-primary/20">حفظ الدورة</button>
                    <button type="button" onClick={() => setShowTermModal(false)} className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs">إلغاء</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSettings;
