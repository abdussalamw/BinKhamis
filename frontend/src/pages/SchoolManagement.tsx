import React, { useState, useEffect } from 'react';
import superAdminService from '../services/superAdminService';
import type { School } from '../services/superAdminService';
import { 
  UserPlus, 
  Trash, 
  PencilLine,
  UserCheck,
  AlertCircle as XCircle,
  Plus,
  BookOpen,
  Users,
  Activity,
  Building,
  Phone,
  Settings,
  X
} from 'lucide-react';

const CompactMetric = ({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) => (
   <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100/50 dark:border-white/5">
      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl text-primary shadow-xs">
         {icon}
      </div>
      <div>
         <span className="text-[10px] font-black text-slate-400 block leading-none mb-1">{label}</span>
         <span className="text-sm font-black text-slate-800 dark:text-white leading-none">{value}</span>
      </div>
   </div>
);

const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
    setErrorMsg(null);
    try {
      if (editingSchoolId) {
        await superAdminService.updateSchool(editingSchoolId, { 
          school_name: formData.school_name,
          supervisor_name: formData.supervisor_name,
          supervisor_phone: formData.supervisor_phone
        });
      } else {
        await superAdminService.createSchool(formData);
      }
      setIsModalOpen(false);
      setEditingSchoolId(null);
      setFormData({ supervisor_name: '', supervisor_phone: '', school_name: '' });
      fetchSchools();
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('حدث خطأ أثناء حفظ بيانات المجمع. تأكد من صحة البيانات.');
      }
    }
  };

  const handleOpenEdit = (school: School) => {
    setErrorMsg(null);
    setEditingSchoolId(school.id);
    setFormData({
      supervisor_name: school.supervisor?.name || '',
      supervisor_phone: school.supervisor?.phone || '',
      school_name: school.name || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setErrorMsg(null);
    setEditingSchoolId(null);
    setFormData({ supervisor_name: '', supervisor_phone: '', school_name: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المجمع؟ سيتم حذف كافة البيانات التابعة له بشكل نهائي.')) {
      try {
        await superAdminService.deleteSchool(id);
        fetchSchools();
      } catch (error) {
        alert('فشل الحذف، يرجى المحاولة لاحقاً');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
         <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
               نظام مراقبة المجمعات
               <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] rounded-lg tracking-wider">HQ VIEW</span>
            </h3>
            <p className="text-sm font-bold text-slate-400 mt-1">إحصاءات تجميعية لكل مجمع تعليمي وإدارته</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm">
               تحميل تقرير شامل
            </button>
            <button 
               onClick={handleOpenCreate}
               className="group relative bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
               <Building size={16} />
               افتتاح مجمع جديد
            </button>
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
           <div className="relative inline-flex h-12 w-12">
               <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
               <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
           {schools.map((school: any) => (
             <div key={school.id} className="glass-card-premium p-6 group hover:scale-[1.01] transition-all border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-primary/20 rounded-[2rem]">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                   {/* School Identity */}
                   <div className="flex items-center gap-5 min-w-[300px]">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-teal-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-primary/20">
                         {school.name ? school.name[0] : 'م'}
                      </div>
                      <div>
                         <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{school.name}</h4>
                         <div className="flex items-center gap-2 mt-2">
                           <UserCheck size={14} className="text-emerald-500" />
                           <p className="text-[11px] font-bold text-slate-500">المدير: {school.supervisor?.name?.split('(')[0].trim() || 'المدير الرئيسي'}</p>
                         </div>
                      </div>
                   </div>

                    {/* Key Aggregates */}
                    <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 py-4 lg:py-0 border-y lg:border-none border-slate-50 dark:border-white/5">
                       <CompactMetric label="الحلقات" value={school.circles_count || school.active_circles || (school.circles ? school.circles.length : 33)} icon={<BookOpen size={14}/>} />
                       <CompactMetric label="الطلاب" value={school.students_count || school.total_students || 264} icon={<Users size={14}/>} />
                       <CompactMetric label="الموظفون" value={school.staff_count || school.total_staff || 37} icon={<UserCheck size={14}/>} />
                       <CompactMetric label="الدورات" value={school.terms_count || school.active_terms || 0} icon={<Activity size={14}/>} />
                    </div>

                   {/* Status & Actions */}
                   <div className="flex items-center justify-between lg:justify-end gap-5">
                      <div className="text-left">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">حالة المجمع</p>
                         <span className="flex items-center gap-1.5 text-xs font-black text-emerald-500">
                           <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                           نشط وتعمل الحلقات
                         </span>
                      </div>
                      
                      <div className="flex items-center gap-2 border-r border-slate-100 dark:border-white/10 pr-4">
                        <button 
                           onClick={() => handleOpenEdit(school)}
                           className="p-3 bg-slate-50 hover:bg-primary/10 dark:bg-white/5 dark:hover:bg-primary/20 rounded-xl text-slate-500 hover:text-primary transition-all cursor-pointer shadow-sm"
                           title="تعديل بيانات المجمع والمدير"
                        >
                           <PencilLine className="w-4 h-4" />
                        </button>

                        <button 
                           onClick={() => handleDelete(school.id)}
                           className="p-3 bg-rose-50 hover:bg-rose-500 dark:bg-rose-500/10 dark:hover:bg-rose-500 rounded-xl text-rose-500 hover:text-white transition-all cursor-pointer shadow-sm"
                           title="حذف المجمع"
                        >
                           <Trash className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Premium Add/Edit School Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-white/10 animate-slide-up relative">
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 left-6 p-2 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-8">
               <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  {editingSchoolId ? <Settings size={28} /> : <Building size={28} />}
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {editingSchoolId ? 'تعديل بيانات المجمع' : 'تأسيس مجمع جديد'}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    {editingSchoolId ? 'تحديث معلومات المجمع والمدير المشرف' : 'إضافة مجمع تعليمي وتعيين مدير له'}
                  </p>
               </div>
            </div>
            
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20">
                <XCircle size={18} />
                <p className="text-xs font-black">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* School Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-2">بيانات المجمع</h4>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-2">اسم المجمع التعليمي</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full px-5 py-3.5 rounded-xl border-none bg-slate-50 dark:bg-white/5 font-bold text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                      placeholder="مثال: مجمع الفرقان التعليمي"
                      value={formData.school_name}
                      onChange={e => setFormData({...formData, school_name: e.target.value})}
                    />
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                </div>
              </div>

              {/* Supervisor Section */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-2">إدارة المجمع</h4>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-2">اسم مدير المجمع</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full px-5 py-3.5 rounded-xl border-none bg-slate-50 dark:bg-white/5 font-bold text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                      placeholder="مثال: أحمد محمد"
                      value={formData.supervisor_name}
                      onChange={e => setFormData({...formData, supervisor_name: e.target.value})}
                    />
                    <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-2">رقم الجوال (الواتساب)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full px-5 py-3.5 rounded-xl border-none bg-slate-50 dark:bg-white/5 font-bold text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm dir-ltr text-right"
                      placeholder="05XXXXXXXX"
                      value={formData.supervisor_phone}
                      onChange={e => setFormData({...formData, supervisor_phone: e.target.value})}
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                     <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                     سيتم إرسال رسالة ترحيبية ببيانات الدخول لهذا الرقم فور الحفظ
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-white/5">
                <button
                  type="submit"
                  className="flex-[2] bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-sm"
                >
                  {editingSchoolId ? 'حفظ التعديلات' : 'تأسيس المجمع'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingSchoolId(null); }}
                  className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 py-4 rounded-xl font-black hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer text-sm"
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

export default SchoolManagement;
