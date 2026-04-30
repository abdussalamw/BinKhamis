import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../services/api';
import { 
  User as UserIcon, Phone, MapPin, Calendar, Award, 
  CheckCircle, Clock, BookOpen, ChevronLeft, 
  Hash, Flag, School, Users, Activity, LogOut,
  Smartphone, ShieldCheck, Edit3
} from 'lucide-react';

interface StudentProfileData {
  id: string;
  name: string;
  phone: string;
  profile: {
    short_name: string | null;
    national_id: string | null;
    nationality: string | null;
    birth_date: string | null;
    neighborhood: string | null;
    grade_level: string | null;
    academic_stage: string | null;
    program: string | null;
    parent_phone_1: string | null;
    parent_relation_1: string | null;
    parent_phone_2: string | null;
    parent_relation_2: string | null;
    student_phone: string | null;
    enrollment_semester: string | null;
    completion_year: string | null;
    end_semester: string | null;
    end_reason: string | null;
    studied_semesters: number | null;
  } | null;
  enrollments?: Array<{
    id: string;
    circle: {
      id: string;
      name: string;
    }
  }>;
}

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'student';

  useEffect(() => {
    // 1. Initial check for students
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
      const data = response.data;
      
      // 2. Secondary check for Teachers/Supervisors after data is fetched
      const studentCircleId = data.enrollments?.[0]?.circle?.id;
      
      if (role === 'teacher' && user?.circle_id && studentCircleId !== user.circle_id) {
        setAccessDenied(true);
      } else if (role === 'supervisor' && user?.allowed_circles?.length > 0 && !user.allowed_circles.includes(studentCircleId)) {
         setAccessDenied(true);
      } else {
        setStudent(data);
      }
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
        <ShieldCheck size={48} />
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

  const currentCircle = student.enrollments && student.enrollments.length > 0 
    ? student.enrollments[0].circle 
    : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link to="/students" className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-colors">
          <ChevronLeft size={20} />
          العودة لقاعدة البيانات
        </Link>
        <div className="flex gap-3">
          {(role === 'admin' || role === 'supervisor') && (
            <button 
              onClick={() => navigate(`/students/edit/${student.id}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Edit3 size={18} />
              تعديل البيانات
            </button>
          )}
          <button className="px-6 py-3 rounded-2xl bg-primary text-white font-black hover:bg-primary-dark transition-all shadow-lg shadow-primary/30">تقرير الإنجاز</button>
        </div>
      </div>

      {/* Hero Profile Section */}
      <div className="relative">
        <div className="h-48 w-full rounded-[2.5rem] bg-gradient-to-br from-primary via-[#4e73df] to-[#224abe] shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <UserIcon size={180} className="text-white" />
          </div>
        </div>
        
        <div className="px-8 -mt-20">
          <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl border border-white/20 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
              <div className="h-40 w-40 rounded-3xl bg-white p-2 shadow-2xl dark:bg-slate-800 -mt-20 md:-mt-24">
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
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-500"><School size={18} className="text-primary" /> {student.profile?.academic_stage} - {student.profile?.grade_level}</span>
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-500"><Award size={18} className="text-amber-500" /> برنامج {student.profile?.program || 'عام'}</span>
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-500"><MapPin size={18} className="text-rose-500" /> {student.profile?.neighborhood || 'غير محدد'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Right Column: Detailed Info Grid */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity & Personal */}
            <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/10">
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="text-primary" size={24} />
                البيانات الثبوتية
              </h3>
              <div className="space-y-5">
                <InfoItem icon={<Hash size={18}/>} label="رقم الهوية" value={student.profile?.national_id} />
                <InfoItem icon={<Flag size={18}/>} label="الجنسية" value={student.profile?.nationality} />
                <InfoItem icon={<Calendar size={18}/>} label="تاريخ الميلاد" value={student.profile?.birth_date} />
                <InfoItem icon={<UserIcon size={18}/>} label="الاسم المختصر" value={student.profile?.short_name} />
              </div>
            </div>

            {/* Academic History */}
            <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/10">
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                <Activity className="text-amber-500" size={24} />
                السجل الأكاديمي
              </h3>
              <div className="space-y-5">
                <InfoItem icon={<Clock size={18}/>} label="فصل القبول" value={student.profile?.enrollment_semester} />
                <InfoItem icon={<BookOpen size={18}/>} label="فصول الدراسة" value={student.profile?.studied_semesters?.toString()} unit="فصل" />
                <InfoItem icon={<Award size={18}/>} label="سنة الختمة" value={student.profile?.completion_year} />
                <InfoItem icon={<LogOut size={18}/>} label="حالة الانتهاء" value={student.profile?.end_reason} />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/10">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
              <Users className="text-indigo-500" size={24} />
              بيانات التواصل العائلي
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-black text-slate-400 mb-2">جهة الاتصال الأساسية</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-700 dark:text-slate-200 text-lg">{student.profile?.parent_phone_1 || 'غير متوفر'}</p>
                      <p className="text-xs font-bold text-primary">صلة القرابة: {student.profile?.parent_relation_1}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                      <Smartphone size={24} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-black text-slate-400 mb-2">جهة الاتصال الثانوية</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-700 dark:text-slate-200 text-lg">{student.profile?.parent_phone_2 || 'غير متوفر'}</p>
                      <p className="text-xs font-bold text-slate-500">صلة القرابة: {student.profile?.parent_relation_2 || '-'}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                      <Phone size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Column: Side Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Contact Card */}
          <div className="glass-card p-8 rounded-3xl bg-primary shadow-2xl shadow-primary/20 text-white overflow-hidden relative group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Smartphone size={150} />
            </div>
            <h3 className="text-xl font-black mb-6 relative z-10">تواصل سريع</h3>
            <div className="space-y-4 relative z-10">
              <a href={`tel:${student.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10">
                <Phone size={20} />
                <span className="font-black">اتصال بالطالب</span>
              </a>
              <a href={`https://wa.me/${student.profile?.parent_phone_1}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/80 hover:bg-emerald-500 transition-all shadow-lg">
                <CheckCircle size={20} />
                <span className="font-black">واتساب ولي الأمر</span>
              </a>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/10">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">الحلقة الحالية</h3>
            {currentCircle ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white">{currentCircle.name}</p>
                    <Link to={`/circles/${currentCircle.id}`} className="text-xs font-bold text-emerald-600 hover:underline">عرض تفاصيل الحلقة</Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-400">الطالب غير ملتحق بأي حلقة حالياً</p>
                <button className="mt-4 text-primary font-black text-xs hover:underline">تسكين في حلقة</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  unit?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, unit }) => (
  <div className="flex items-center gap-4 group">
    <div className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm">
      {icon}
    </div>
    <div className="flex-grow">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="font-black text-slate-700 dark:text-slate-200">
        {value || 'غير مسجل'} {value && unit && <span className="text-xs font-bold text-slate-400 mr-1">{unit}</span>}
      </p>
    </div>
  </div>
);

export default StudentProfile;
