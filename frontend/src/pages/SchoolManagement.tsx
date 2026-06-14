import React, { useState, useEffect } from 'react';
import superAdminService from '../services/superAdminService';
import type { School } from '../services/superAdminService';
import { 
  UserPlus, 
  Trash, 
  PencilLine,
  UserCheck as CheckCircle2,
  AlertCircle as XCircle,
  Plus
} from 'lucide-react';

const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    supervisor_name: '',
    supervisor_phone: '',
    school_name: ''
  });

  const fetchSchools = async () => {
    try {
      const data = await superAdminService.getSchools();
      setSchools(data.schools);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await superAdminService.createSchool(formData);
      setIsModalOpen(false);
      setFormData({ supervisor_name: '', supervisor_phone: '', school_name: '' });
      fetchSchools();
    } catch (error) {
      alert('خطأ في إضافة المجمع، ربما الرقم مسجل مسبقاً');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المجمع؟ سيتم حذف كافة البيانات التابعة له.')) {
      try {
        await superAdminService.deleteSchool(id);
        fetchSchools();
      } catch (error) {
        alert('فشل الحذف');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            إدارة المجمعات التعليمية
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            إدارة كافة المجمعات ومدراء المجمعات التابعين للمنصة
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة مجمع جديد</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <div 
              key={school.id}
              className="group relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                    <PencilLine className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(school.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500 transition-colors"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {school.name || 'مجمع جديد (لم يتم الإكمال)'}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span className="text-sm">مدير المجمع:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {school.supervisor?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span className="text-sm text-primary">الجوال:</span>
                  <span className="font-mono">{school.supervisor?.phone}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {school.is_active ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600">نشط</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-500">متوقف</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  ID: {school.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add School Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/20 animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
              <UserPlus className="w-7 h-7 text-primary" />
              إضافة مجمع ومدير مجمع جديد
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم مدير المجمع</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="مثال: أحمد محمد"
                  value={formData.supervisor_name}
                  onChange={e => setFormData({...formData, supervisor_name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">رقم الجوال (الواتساب)</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all font-mono"
                  placeholder="9665XXXXXXXX"
                  value={formData.supervisor_phone}
                  onChange={e => setFormData({...formData, supervisor_phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المجمع (اختياري)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="سيقوم مدير المجمع بإكماله لاحقاً"
                  value={formData.school_name}
                  onChange={e => setFormData({...formData, school_name: e.target.value})}
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                  حفظ البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-3 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Building2: React.FC<{size?: number, className?: string}> = ({size=18, className=""}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="10" width="20" height="12" rx="2" />
    <path d="M12 22V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v15" />
    <path d="M18 22V15a2 2 0 0 0-2-2h-4" />
  </svg>
);

export default SchoolManagement;
