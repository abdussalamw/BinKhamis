import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../services/api';
import { 
  User as UserIcon, Phone, MapPin, Calendar, Award, 
  CheckCircle, Clock, BookOpen, ChevronLeft, 
  Hash, Flag, School, Users, Activity, LogOut,
  Smartphone, Shield, Edit, UserX, Globe
} from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  identity_type: string;
  national_id?: string;
  passport_number?: string;
  place_of_birth?: string;
  birth_date?: string;
  academic_stage?: string;
  grade_level?: string;
  memorization_amount?: string;
  neighborhood?: string;
  school_name?: string;
  is_active: boolean;
  school_id?: string;
  guardian_id?: string;
  secondary_guardian_id?: string;
  guardian?: {
    id: string;
    full_name: string;
    phone_number: string;
    whatsapp_number?: string;
    relation?: string;
  };
  secondary_guardian?: {
    id: string;
    full_name: string;
    phone_number: string;
    whatsapp_number?: string;
    relation?: string;
  };
  enrollments?: Array<{
    id: string;
    status: string;
    circle: {
      id: string;
      name: string;
      location?: string;
    };
  }>;
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | null }) => (
  value ? (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
      <span className="text-primary mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{value}</p>
      </div>
    </div>
  ) : null
);

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  let user: any = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}
  const role = user?.role || 'student';

  useEffect(() => {
    if (role === 'student' && id !== user?.id) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/students/${id}`);
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="py-32 text-center">
      <div className="inline-block h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-slate-400">جاري تحميل السجل الشامل للطالب...</p>
    </div>
  );

  if (accessDenied) return (
    <div className="py-24 text-center max-w-lg mx-auto">
      <div className="h-20 w-20 bg-danger/10 text-danger rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Shield size={48} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">وصول مقيد</h2>
      <p className="text-slate-500 font-bold mb-8">عذراً، لا تملك الصلاحيات الكافية لعرض بيانات هذا الطالب.</p>
      <button onClick={() => navigate(-1)} className="px-8 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20">العودة للخلف</button>
    </div>
  );

  if (!student) return (
    <div className="py-20 text-center">
      <h2 className="text-2xl font-black text-danger mb-4">عذراً، لم يتم العثور على الطالب</h2>
      <Link to="/" className="text-primary font-bold hover:underline">العودة للرئيسية</Link>
    </div>
  );

  const currentCircle = student.enrollments?.find(e => e.status === 'active')?.circle || null;
  const guardian = student.guardian;
  const secondaryGuardian = student.secondary_guardian;

  const identityTypeLabel = 
    student.identity_type === 'iqama' ? 'هوية مقيم' :
    student.identity_type === 'passport' ? 'رقم جواز' :
    student.identity_type === 'border_number' ? 'رقم حدود' : 'هوية وطنية';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link to="/students" className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-colors">
          <ChevronLeft size={20} />
          العودة لقائمة الطلاب
        </Link>
        <div className="flex gap-3">
          {(role === 'admin' || role === 'supervisor' || role === 'owner') && (
            <button 
              onClick={() => navigate(`/students/${student.id}/edit`)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Edit size={18} />
              تعديل بيانات الطالب
            </button>
          )}
        </div>
      </div>

      {/* Profile Hero */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
        <div className="h-36 bg-gradient-to-br from-primary via-teal-500 to-emerald-600 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        </div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-8">
            <div className="h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-white shrink-0">
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center font-black text-primary text-6xl shadow-inner">
                {(student.name || '?').charAt(0)}
              </div>
            </div>
            <div className="flex-grow text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-slate-800 dark:text-white leading-tight">{student.name}</h1>
                {currentCircle ? (
                  <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black border border-emerald-500/20 flex items-center gap-2">
                     <CheckCircle size={14} /> ملتحق بـ {currentCircle.name}
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-slate-500/10 text-slate-500 text-xs font-black border border-slate-500/20">غير مسكن</span>
                )}
                {student.status === 'discontinued' ? (
                  <span className="px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-black border border-rose-500/20 flex items-center gap-1.5">
                    <UserX size={14} /> منقطع
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-600 text-xs font-black border border-teal-500/20 flex items-center gap-1.5">
                    <Activity size={14} /> نشط
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-500"><School size={18} className="text-primary" /> {student.academic_stage || 'عام'} - {student.grade_level || 'غير محدد'}</span>
                <span className="flex items-center gap-2 text-sm font-bold text-slate-500"><Award size={18} className="text-amber-500" /> الحفظ: {student.memorization_amount || 'مسار عام'}</span>
                <span className="flex items-center gap-2 text-sm font-bold text-slate-500"><MapPin size={18} className="text-rose-500" /> {student.neighborhood || 'غير محدد'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Details Grid */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity & Personal */}
            <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/10 space-y-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Shield className="text-primary" size={24} />
                البيانات الثبوتية والهوية
              </h3>
              <div className="space-y-4 pt-2">
                <InfoItem icon={<Flag size={18}/>} label="نوع الهوية" value={identityTypeLabel} />
                <InfoItem icon={<Hash size={18}/>} label="رقم الهوية / المقيم / الحدود" value={student.national_id} />
                {student.passport_number && (
                  <InfoItem icon={<Globe size={18}/>} label="رقم الجواز" value={student.passport_number} />
                )}
                <InfoItem icon={<MapPin size={18}/>} label="مكان الميلاد" value={student.place_of_birth} />
                <InfoItem icon={<Calendar size={18}/>} label="تاريخ الميلاد" value={student.birth_date} />
              </div>
            </div>

            {/* Academic History */}
            <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/10 space-y-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Activity className="text-amber-500" size={24} />
                السجل الأكاديمي والقرآني
              </h3>
              <div className="space-y-4 pt-2">
                <InfoItem icon={<School size={18}/>} label="المرحلة الدراسية" value={student.academic_stage} />
                <InfoItem icon={<BookOpen size={18}/>} label="الصف / المستوى" value={student.grade_level} />
                <InfoItem icon={<Award size={18}/>} label="مقدار الحفظ" value={student.memorization_amount} />
                <InfoItem icon={<Clock size={18}/>} label="حالة القيد" value={student.status === 'discontinued' ? 'منقطع' : student.status === 'graduated' ? 'متخرج' : 'نشط'} />
                <InfoItem icon={<MapPin size={18}/>} label="الحي" value={student.neighborhood} />
                <InfoItem icon={<School size={18}/>} label="المدرسة" value={student.school_name} />
              </div>
            </div>
          </div>

          {/* Contact & Guardian Section */}
          <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/10">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <Users className="text-teal-500" size={24} />
              بيانات التواصل وأولياء الأمور
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Phone */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-black text-slate-400 mb-2">جوال الطالب مباشر</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-700 dark:text-slate-200 text-lg dir-ltr text-right">{student.phone || 'غير متوفر'}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Smartphone size={22} />
                  </div>
                </div>
              </div>

              {/* Guardian 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-black text-slate-400 mb-2">ولي الأمر 1 (الرئيسي)</p>
                {guardian ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-800 dark:text-white text-base">{guardian.full_name}</p>
                      <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1">{guardian.relation || 'ولي أمر'} — {guardian.phone_number}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                      <Phone size={22} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-400">غير مسجل</p>
                )}
              </div>

              {/* Guardian 2 */}
              {secondaryGuardian && (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 md:col-span-2">
                  <p className="text-xs font-black text-slate-400 mb-2">ولي الأمر 2 (إضافي)</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-800 dark:text-white text-base">{secondaryGuardian.full_name}</p>
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-1">{secondaryGuardian.relation || 'ولي أمر 2'} — {secondaryGuardian.phone_number}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                      <Phone size={22} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-primary to-teal-700 text-white shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black mb-6">إجراءات سريعة</h3>
            <div className="space-y-3">
              {student.phone && (
                <a href={`tel:${student.phone}`} className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm">
                  <Phone size={18} />
                  <span>اتصال بالطالب</span>
                </a>
              )}
              {guardian?.phone_number && (
                <a href={`tel:${guardian.phone_number}`} className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm">
                  <Phone size={18} />
                  <span>اتصال بولي الأمر</span>
                </a>
              )}
              {guardian?.whatsapp_number && (
                <a href={`https://wa.me/${guardian.whatsapp_number?.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm">
                  <Phone size={18} />
                  <span>واتساب ولي الأمر</span>
                </a>
              )}
              {(role === 'admin' || role === 'supervisor' || role === 'owner') && (
                <Link to={`/students/${student.id}/edit`} className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm">
                  <UserIcon size={18} />
                  <span>تعديل البيانات</span>
                </Link>
              )}
            </div>
          </div>

          {/* Enrolled Circles */}
          {student.enrollments && student.enrollments.length > 0 && (
            <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/10">
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <BookOpen className="text-emerald-500" size={22} />
                الحلقات المسجل فيها
              </h3>
              <div className="space-y-3">
                {student.enrollments.map(enrollment => (
                  <Link key={enrollment.id} to={`/circles/${enrollment.circle?.id}`} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-lg">
                      {(enrollment.circle?.name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-700 dark:text-slate-200 text-sm">{enrollment.circle?.name}</p>
                      <p className="text-[10px] font-bold text-emerald-600">{enrollment.status === 'active' ? 'ملتحق' : 'غير نشط'}</p>
                    </div>
                    <ChevronLeft size={16} className="mr-auto text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
