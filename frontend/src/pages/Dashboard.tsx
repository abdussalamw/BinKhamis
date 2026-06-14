import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  Clock, 
  BarChart, 
  UserCheck, 
  PieChart, 
  Calendar,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  BookOpen,
  Layout,
  Building,
  ShieldCheck,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import api from '../services/api';

// --- OWNER DASHBOARD: Platform Oversight ---
const OwnerDashboard = ({ data }: { data: any }) => {
  // Extract schools array first
  const schools = Array.isArray(data) ? data : (data?.schools || []);
  
  // Robustly extract or calculate stats
  const stats = {
    total_schools: data?.stats?.total_schools || data?.total_schools || schools.length,
    total_students: data?.stats?.total_students || data?.total_students || schools.reduce((acc: number, s: any) => acc + (parseInt(s.students_count) || 0), 0),
    total_staff: data?.stats?.total_staff || data?.total_staff || schools.reduce((acc: number, s: any) => acc + (parseInt(s.staff_count) || 0), 0),
    total_circles: data?.stats?.total_circles || data?.total_circles || schools.reduce((acc: number, s: any) => acc + (parseInt(s.circles_count) || parseInt(s.active_circles) || 0), 0),
    growth_rate: data?.stats?.growth_rate || data?.growth_rate || '---'
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Platform Vision Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PlatformStatCard 
          title="المجمعات التعليمية" 
          value={stats.total_schools || '0'} 
          subtitle="توسع جغرافي نشط"
          icon={<Globe className="text-white" />} 
          color="bg-slate-900"
        />
        <PlatformStatCard 
          title="إجمالي الطلاب" 
          value={stats.total_students || '0'} 
          subtitle="طالب تحت إشراف المنصة"
          icon={<Users className="text-white" />} 
          color="bg-indigo-600"
        />
        <PlatformStatCard 
          title="الكوادر الإشرافية" 
          value={stats.total_staff || '0'} 
          subtitle="مدراء ومعلمون مفعلون"
          icon={<ShieldCheck className="text-white" />} 
          color="bg-emerald-600"
        />
        <PlatformStatCard 
          title="إجمالي الحلقات" 
          value={stats.total_circles || '0'} 
          subtitle="حلقة قرآنية مفعلة"
          icon={<BookOpen className="text-white" />} 
          color="bg-amber-500"
        />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
           <div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                 نظام مراقبة المجمعات
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] rounded-full">HQ VIEW</span>
              </h3>
              <p className="text-sm font-bold text-slate-400 mt-1">إحصاءات تجميعية لكل مجمع تعليمي (بدون الدخول في التفاصيل التشغيلية)</p>
           </div>
           <div className="flex items-center gap-2">
              <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 px-5 py-3 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all">تحميل تقرير شامل</button>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                 <Building size={16} />
                 افتتاح مجمع جديد
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {schools.map((school: any) => (
             <div key={school.id} className="glass-card-premium p-6 group hover:scale-[1.01] transition-all border-none shadow-sm hover:shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                   {/* School Identity */}
                   <div className="flex items-center gap-5 min-w-[280px]">
                      <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-600/20">
                         {school.name[0]}
                      </div>
                      <div>
                         <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{school.name}</h4>
                         <p className="text-[11px] font-bold text-slate-400 mt-1">مدير المجمع: {school.supervisor?.name?.split('(')[0].trim() || '---'}</p>
                      </div>
                   </div>

                    {/* Key Aggregates */}
                    <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 py-4 lg:py-0 border-y lg:border-none border-slate-50">
                       <CompactMetric label="الحلقات" value={school.circles_count || school.active_circles || (school.circles ? school.circles.length : 0)} icon={<BookOpen size={14}/>} />
                       <CompactMetric label="الطلاب" value={school.students_count || school.total_students || 0} icon={<Users size={14}/>} />
                       <CompactMetric label="الموظفون" value={school.staff_count || school.total_staff || 0} icon={<UserCheck size={14}/>} />
                       <CompactMetric label="الدورات" value={school.terms_count || school.active_terms || 0} icon={<Activity size={14}/>} />
                    </div>

                   {/* Status & Action */}
                   <div className="flex items-center justify-between lg:justify-end gap-6">
                      <div className="text-left">
                         <p className="text-[10px] font-black text-slate-300 uppercase">حالة المجمع</p>
                         <span className="text-xs font-black text-emerald-500">نشط وتعمل الحلقات</span>
                      </div>
                      <button className="bg-slate-900 text-white px-5 py-3 rounded-xl font-black text-xs hover:bg-indigo-600 transition-all">
                         عرض الإحصاءات
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// --- SUPERVISOR DASHBOARD: Mosque/Complex Management ---
const SupervisorDashboard = ({ data, staff }: { data: any, staff: any[] }) => {
  const stats = data?.stats || data || {};
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">إدارة مجمع المسجد</h2>
            <p className="text-sm font-bold text-slate-400">توزيع الصلاحيات ومتابعة مدراء الإدارات</p>
         </div>
         <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-xl font-black text-xs text-slate-500">إعدادات المجمع</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-600/20">إضافة مدير نظام</button>
         </div>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCardSmall title="إجمالي الطلاب" value={stats.total_students || stats.students_count || '0'} icon={<Users className="text-primary"/>} />
         <StatCardSmall title="الحلقات النشطة" value={stats.active_circles || stats.circles_count || '0'} icon={<BookOpen className="text-indigo-500"/>} />
         <StatCardSmall title="مدراء الإدارات" value={staff.length} icon={<ShieldCheck className="text-emerald-500"/>} />
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-card-premium p-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">توزيع المهام الإدارية</h3>
            <div className="space-y-4">
               {staff.length > 0 ? staff.map((member) => (
                 <div key={member.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center font-black text-indigo-600">
                          {member.name[0]}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800 dark:text-white">{member.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {member.role === 'admin' ? 'مدير الشؤون الإدارية' : 'مشرف تعليمي'}
                          </p>
                       </div>
                    </div>
                    <button className="text-xs font-black text-primary hover:underline">تعديل</button>
                 </div>
               )) : (
                 <p className="text-center py-6 text-slate-400 font-bold text-sm">لم يتم تعيين مدراء إدارات بعد</p>
               )}
            </div>
         </div>
 
         <div className="glass-card-premium p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
               <Activity className="text-slate-300" />
            </div>
            <h4 className="text-lg font-black text-slate-800 dark:text-white">نشاط المجمع العام</h4>
            <p className="text-xs font-bold text-slate-400 mt-2 px-10">يمكنك هنا مراقبة أداء مدراء الشؤون الإدارية ونتائج طلاب المجمع بشكل تجميعي.</p>
         </div>
      </div>
    </div>
  );
};
 
// --- STAFF/ADMIN DASHBOARD: Operational Detail ---
const StaffDashboard = ({ data, recentStudents }: { data: any, recentStudents: any[] }) => {
  const stats = data?.stats || data || {};
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <StatCardSmall title="إجمالي الطلاب" value={stats.total_students || stats.students_count || '0'} icon={<Users className="text-primary"/>} />
         <StatCardSmall title="حضور اليوم" value={`${stats.attendance_rate || 0}%`} icon={<CheckCircle className="text-emerald-500"/>} />
         <StatCardSmall title="إنجاز الحلقات" value={stats.total_progress || stats.progress_count || '0'} icon={<BookOpen className="text-indigo-500"/>} />
         <StatCardSmall title="الحلقات المسجلة" value={stats.active_circles || stats.circles_count || '0'} icon={<TrendingUp className="text-amber-500"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 glass-card-premium p-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">الطلاب الجدد هذا الأسبوع</h3>
            {recentStudents.length > 0 ? (
               <div className="space-y-3">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary font-black text-xs shadow-sm">
                             {student.name[0]}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-800 dark:text-white">{student.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold">{student.profile?.academic_stage || 'مستجد'}</p>
                          </div>
                       </div>
                       <button className="text-xs font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">الملف الشامل</button>
                    </div>
                  ))}
               </div>
            ) : (
               <div className="p-10 border-2 border-dashed border-slate-100 dark:border-white/10 rounded-[2rem] text-center">
                  <p className="font-black text-slate-300">لا يوجد طلاب جدد مسجلين هذا الأسبوع</p>
               </div>
            )}
         </div>
         <div className="glass-card-premium p-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">إجراءات سريعة</h3>
            <div className="space-y-3">
               <QuickAction label="إضافة طالب جديد" color="bg-indigo-600" />
               <QuickAction label="إضافة معلم" color="bg-emerald-600" />
               <QuickAction label="إنشاء حلقة" color="bg-slate-900" />
               <QuickAction label="تصدير بيانات" color="bg-slate-100 dark:bg-slate-800" textColor="text-slate-600 dark:text-slate-400" />
            </div>
         </div>
      </div>
    </div>
  );
};

// --- Helper UI Components ---

const PlatformStatCard = ({ title, value, subtitle, icon, color }: any) => (
  <div className="glass-card-premium p-8 relative overflow-hidden group border-none shadow-md">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700`}></div>
    <div className="relative z-10 flex items-center gap-6">
      <div className={`h-16 w-16 rounded-2xl ${color} flex items-center justify-center shadow-xl shadow-current/10`}>
         {React.cloneElement(icon as React.ReactElement, { size: 30 })}
      </div>
      <div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
         <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
         <p className="text-[10px] font-bold text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  </div>
);

const CompactMetric = ({ label, value, icon }: any) => (
  <div className="flex items-center gap-2">
    <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">{icon}</div>
    <div>
       <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">{label}</p>
       <p className="text-sm font-black text-slate-700 dark:text-slate-300 leading-none">{value}</p>
    </div>
  </div>
);

const StatCardSmall = ({ title, value, icon, trend }: any) => (
  <div className="glass-card p-6 flex items-center gap-5">
    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl shrink-0">
      {React.cloneElement(icon as React.ReactElement, { size: 22 })}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <div className="flex items-center gap-2">
        <span className="text-xl font-black text-slate-800 dark:text-white">{value}</span>
        {trend === 'up' && <span className="text-[10px] text-emerald-500 font-black">+4%</span>}
      </div>
    </div>
  </div>
);

const QuickAction = ({ label, color, textColor = "text-white" }: any) => (
  <button className={`w-full p-4 rounded-2xl ${color} ${textColor} font-black text-xs shadow-sm hover:scale-[1.02] active:scale-95 transition-all`}>
    {label}
  </button>
);

// --- Main Dashboard Entry Point ---

const Dashboard: React.FC = () => {
  const [role, setRole] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [realStats, setRealStats] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setRole(userData.role);
      fetchRealDashboardData(userData.role);
      
      if (userData.role === 'supervisor' || userData.role === 'admin') {
        fetchStaffAndStudents();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchRealDashboardData = async (userRole: string) => {
    setLoading(true);
    try {
      if (userRole === 'owner') {
        try {
          const res = await api.get('/super-admin');
          let data = res.data;
          
          // If the data is empty or suspiciously minimal, try fetching from schools endpoint
          const hasSchools = Array.isArray(data) ? data.length > 0 : (data?.schools?.length > 0);
          
          if (!hasSchools) {
            const schoolsRes = await api.get('/super-admin/schools');
            // If schoolsRes.data is an array [ {id...} ], then our robust mapping handles it.
            // If it's { schools: [...] }, it also handles it.
            data = schoolsRes.data;
          }
          
          setRealStats(data);
        } catch (e) {
          // If /super-admin fails, try the fallback schools endpoint
          const schoolsRes = await api.get('/super-admin/schools');
          setRealStats(schoolsRes.data);
        }
      } else {
        const res = await api.get('/stats/overview');
        setRealStats(res.data.overview || res.data);
      }
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffAndStudents = async () => {
    try {
      const staffRes = await api.get('/staff');
      // Filter for management/admin roles for the supervisor view
      const managementStaff = staffRes.data.filter((s: any) => s.role === 'admin' || s.role === 'manager');
      setStaff(managementStaff.slice(0, 3));

      const studentsRes = await api.get('/students');
      // Assume the API returns them in reverse chronological order or sort them
      const sortedStudents = [...studentsRes.data].sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setRecentStudents(sortedStudents.slice(0, 5));
    } catch (e) {
      console.error("Error fetching auxiliary dashboard data:", e);
    }
  };

  const renderDashboard = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-slate-400">جاري جلب إحصائيات المنصة...</p>
        </div>
      </div>
    );

    switch (role) {
      case 'owner':
        return <OwnerDashboard data={realStats} />;
      case 'supervisor':
        return <SupervisorDashboard data={realStats} staff={staff} />;
      case 'admin':
      case 'teacher':
        return <StaffDashboard data={realStats} recentStudents={recentStudents} />;
      default:
        return (
          <div className="py-20 text-center">
             <p className="font-black text-slate-400 uppercase tracking-widest">يرجى تسجيل الدخول لعرض البيانات</p>
          </div>
        );
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'رئيس المنصة';
      case 'supervisor': return 'مدير المجمع';
      case 'admin': return 'مدير الشؤون الإدارية';
      case 'manager': return 'مشرف تعليمي';
      case 'teacher': return 'معلم حلقة';
      default: return role;
    }
  };

  return (
    <div className="p-4 md:p-0">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
            مرحباً، {user?.name?.split('(')[0].trim() || 'مستخدم'} 👋
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
              {getRoleLabel(role)}
            </span>
            <p className="text-slate-500 font-bold text-sm">إليك تحليل أداء {role === 'owner' ? 'المنصة الكلي' : 'المجمع'} اليوم</p>
          </div>
        </div>
        
        {role === 'owner' && (
           <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">عرض التحكم الشامل للمنصة</span>
           </div>
        )}
      </div>
      
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
