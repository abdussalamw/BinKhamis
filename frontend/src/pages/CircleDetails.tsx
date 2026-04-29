import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ChevronRight, Users, User as UserIcon, Phone, 
  ArrowRight, Award, MapPin, Calendar, 
  Settings, CheckCircle, Info, UserPlus, FileText
} from 'lucide-react';

interface StudentInfo {
  id: string;
  name: string;
  profile?: {
    academic_stage: string;
    grade_level: string;
  };
}

interface Enrollment {
  id: string;
  student: StudentInfo;
}

interface CircleData {
  id: string;
  name: string;
  location: string;
  capacity: number;
  is_active: boolean;
  enrollments_count: number;
  teacher?: {
    name: string;
  };
  enrollments?: Enrollment[];
}

const CircleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<CircleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircleDetails();
  }, [id]);

  const fetchCircleDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/circles/${id}`);
      setCircle(response.data);
    } catch (error) {
      console.error('Error fetching circle details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="py-32 text-center flex flex-col items-center gap-4">
      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-400">جاري تحميل بيانات الحلقة والطلاب...</p>
    </div>
  );

  if (!circle) return (
    <div className="py-20 text-center">
      <h2 className="text-2xl font-black text-danger mb-4">عذراً، الحلقة غير موجودة</h2>
      <Link to="/circles" className="text-primary font-bold hover:underline">العودة لقائمة الحلقات</Link>
    </div>
  );

  const students = circle.enrollments?.map(e => e.student) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Header with Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-2">
            <Link to="/circles" className="hover:text-primary transition-colors">الحلقات</Link>
            <ChevronRight size={14} className="rtl:rotate-180" />
            <span className="text-slate-600 dark:text-slate-300">إدارة الحلقة</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            {circle.name}
            {circle.is_active ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20">نشطة</span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-black border border-slate-500/20">معطلة</span>
            )}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/circles/${circle.id}/edit`)}
            className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-4 font-black text-slate-600 shadow-sm hover:bg-slate-50 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
          >
            <Settings size={20} />
            إعدادات الحلقة
          </button>
          <button className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
            <CheckCircle size={20} />
            بدء التحضير اليومي
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Users size={180} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Award size={28} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase opacity-60">سعة الحلقة</p>
                  <p className="text-xl font-black">{circle.enrollments_count} / {circle.capacity}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-60 mb-1">معلم الحلقة المسجل</p>
                  <p className="text-lg font-black">{circle.teacher?.name || 'لم يتم التعيين'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-60 mb-1">الموقع الحالي</p>
                  <p className="text-sm font-bold flex items-center gap-2">
                    <MapPin size={16} className="opacity-60" />
                    {circle.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-white/10">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">إدارة سريعة</h3>
            <div className="space-y-3">
              <QuickAction icon={<UserPlus size={18} />} label="إضافة طالب للحلقة" color="primary" />
              <QuickAction icon={<FileText size={18} />} label="طباعة كشف الحضور" color="slate" />
              <QuickAction icon={<Info size={18} />} label="تعديل أوقات الحلقة" color="slate" />
            </div>
          </div>
        </div>

        {/* Right Column: Student Roster */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">كشف طلاب الحلقة</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">قائمة الطلاب المسكنين فعلياً في {circle.name}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Users size={20} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-5 px-8 font-black text-slate-500 uppercase text-[10px] tracking-widest">الطالب</th>
                    <th className="py-5 px-8 font-black text-slate-500 uppercase text-[10px] tracking-widest">المرحلة / الصف</th>
                    <th className="py-5 px-8 font-black text-slate-500 uppercase text-[10px] tracking-widest text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <Users size={48} />
                          <p className="font-black">لا يوجد طلاب في هذه الحلقة حالياً</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    students.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-8">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-black text-xs group-hover:bg-primary group-hover:text-white transition-all">
                              {student.name.charAt(0)}
                            </div>
                            <p className="font-black text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors text-sm">{student.name}</p>
                          </div>
                        </td>
                        <td className="py-4 px-8">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-600 dark:text-slate-400">{student.profile?.academic_stage || 'غير محدد'}</span>
                            <span className="text-[10px] font-bold text-slate-400">{student.profile?.grade_level || '-'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-8 text-left">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              to={`/students/${student.id}`} 
                              className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800"
                              title="عرض ملف الطالب"
                            >
                              <ChevronRight size={16} className="rtl:rotate-180" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color: 'primary' | 'slate';
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, color }) => (
  <button className={`w-full p-4 rounded-2xl flex items-center justify-between font-black text-sm transition-all group ${
    color === 'primary' 
    ? 'bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-sm' 
    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
  }`}>
    <span className="flex items-center gap-3">
      {icon}
      {label}
    </span>
    <ChevronRight size={16} className="rtl:rotate-180 opacity-40 group-hover:opacity-100" />
  </button>
);

export default CircleDetails;
