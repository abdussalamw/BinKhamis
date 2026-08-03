import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, TrendingUp, Activity, CheckCircle, BookOpen, ShieldCheck, Globe
} from 'lucide-react';
import api from '../services/api';

// --- OWNER DASHBOARD ---
const OwnerDashboard = ({ data }: { data: any }) => {
  const schools = Array.isArray(data) ? data : (data?.schools || []);
  const stats = {
    total_schools: data?.stats?.total_schools || data?.total_schools || schools.length,
    total_students: data?.stats?.total_students || data?.total_students || schools.reduce((acc: number, s: any) => acc + (parseInt(s.students_count) || 0), 0),
    total_staff: data?.stats?.total_staff || data?.total_staff || schools.reduce((acc: number, s: any) => acc + (parseInt(s.staff_count) || 0), 0),
    total_circles: data?.stats?.total_circles || data?.total_circles || schools.reduce((acc: number, s: any) => acc + (parseInt(s.circles_count) || parseInt(s.active_circles) || 0), 0),
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformStatCard 
          title="المجمعات التعليمية" 
          value={stats.total_schools || '0'} 
          subtitle="توسع جغرافي نشط"
          icon={<Globe className="text-white" />} 
          color="bg-primary"
        />
        <PlatformStatCard 
          title="إجمالي الطلاب" 
          value={stats.total_students || '0'} 
          subtitle="طالب تحت إشراف المنصة"
          icon={<Users className="text-white" />} 
          color="bg-secondary"
        />
        <PlatformStatCard 
          title="الكوادر الإشرافية" 
          value={stats.total_staff || '0'} 
          subtitle="مدراء ومعلمون مفعلون"
          icon={<ShieldCheck className="text-white" />} 
          color="bg-teal-600"
        />
        <PlatformStatCard 
          title="إجمالي الحلقات" 
          value={stats.total_circles || '0'} 
          subtitle="حلقة قرآنية مفعلة"
          icon={<BookOpen className="text-white" />} 
          color="bg-amber-500"
        />
      </div>
    </div>
  );
};

// --- SUPERVISOR DASHBOARD ---
const SupervisorDashboard = ({ data, staff, schoolInfo }: { data: any, staff: any[], schoolInfo?: any }) => {
  const stats = data?.stats || data || {};
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white">إدارة {schoolInfo?.name || 'المجمع التعليمي'}</h2>
            <p className="text-xs font-bold text-slate-400">توزيع الصلاحيات ومتابعة مدراء الإدارات</p>
         </div>
         <div className="flex gap-2">
            <Link to="/school-settings" className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-lg font-black text-[10px] text-slate-500">إعدادات المجمع</Link>
            <Link to="/staff/new" className="px-3 py-1.5 bg-primary text-white rounded-lg font-black text-[10px] shadow-sm">إضافة مدير نظام</Link>
         </div>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <StatCardSmall title="إجمالي الطلاب" value={stats.total_students || stats.students_count || '0'} icon={<Users className="text-primary"/>} />
         <StatCardSmall title="الحلقات النشطة" value={stats.active_circles || stats.circles_count || '0'} icon={<BookOpen className="text-primary"/>} />
         <StatCardSmall title="مدراء الإدارات" value={staff.length} icon={<ShieldCheck className="text-secondary"/>} />
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="glass-card-premium p-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4">توزيع المهام الإدارية</h3>
            <div className="space-y-3">
               {staff.length > 0 ? staff.map((member) => (
                 <div key={member.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                          {member.name[0]}
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-800 dark:text-white">{member.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold">
                            {member.role === 'admin' ? 'مدير الشؤون الإدارية' : 'مشرف تعليمي'}
                          </p>
                       </div>
                    </div>
                    <Link to={`/staff/${member.id}/edit`} className="text-[10px] font-black text-primary hover:underline">تعديل</Link>
                 </div>
               )) : (
                 <p className="text-center py-4 text-slate-400 font-bold text-xs">لم يتم تعيين مدراء إدارات بعد</p>
               )}
            </div>
         </div>
 
         <div className="glass-card-premium p-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
               <Activity className="text-slate-300 w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white">نشاط المجمع العام</h4>
            <p className="text-[10px] font-bold text-slate-400 mt-1 px-6">يمكنك هنا مراقبة أداء مدراء الشؤون الإدارية ونتائج طلاب المجمع بشكل تجميعي.</p>
         </div>
      </div>
    </div>
  );
};
 
const StaffDashboard = ({ data, recentStudents, schoolInfo }: { data: any, recentStudents: any[], schoolInfo?: any }) => {
  const stats = data?.stats || data || {};
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <StatCardSmall title="إجمالي الطلاب" value={stats.total_students || stats.students_count || '0'} icon={<Users className="text-primary"/>} />
         <StatCardSmall title="حضور اليوم" value={`${stats.attendance_rate || 0}%`} icon={<CheckCircle className="text-secondary"/>} />
         <StatCardSmall title="إنجاز الحلقات" value={stats.total_progress || stats.progress_count || '0'} icon={<BookOpen className="text-teal-600"/>} />
         <StatCardSmall title="الحلقات المسجلة" value={stats.active_circles || stats.circles_count || '0'} icon={<TrendingUp className="text-amber-500"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 glass-card-premium p-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">الطلاب الجدد هذا الأسبوع</h3>
                <Link to="/students" className="text-[10px] font-black text-primary hover:underline">عرض الكل</Link>
            </div>
            {recentStudents.length > 0 ? (
               <div className="space-y-2">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-primary font-black text-[10px] shadow-sm">
                             {student.name[0]}
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-800 dark:text-white">{student.name}</p>
                             <p className="text-[9px] text-slate-400 font-bold">{student.academic_stage || 'مستجد'}</p>
                          </div>
                       </div>
                       <Link to={`/students/${student.id}`} className="text-[9px] px-2 py-1 bg-primary/10 rounded font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">الملف الشامل</Link>
                    </div>
                  ))}
               </div>
            ) : (
               <div className="p-6 border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-center flex flex-col items-center">
                  <p className="font-black text-xs text-slate-400 mb-2">لا يوجد طلاب جدد مسجلين هذا الأسبوع</p>
                  <Link to="/students/new" className="text-[10px] bg-primary text-white px-3 py-1.5 rounded-lg font-black">إضافة أول طالب</Link>
               </div>
            )}
         </div>
         <div className="glass-card-premium p-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4">إجراءات سريعة</h3>
            <div className="space-y-2">
               <QuickAction label="إضافة طالب جديد" to="/students/new" color="bg-primary" />
               <QuickAction label="إضافة معلم" to="/staff/new" color="bg-secondary" />
               <QuickAction label="إنشاء حلقة" to="/circles/new" color="bg-slate-900" />
               <QuickAction label="تصدير بيانات" to="/reports" color="bg-slate-100 dark:bg-slate-800" textColor="text-slate-600 dark:text-slate-400" />
            </div>
         </div>
      </div>
    </div>
  );
};

// --- Helper UI Components ---
const PlatformStatCard = ({ title, value, subtitle, icon, color }: any) => (
  <div className="glass-card-premium p-5 relative overflow-hidden group border-none shadow-sm">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-700`}></div>
    <div className="relative z-10 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center shadow-lg shadow-current/10 shrink-0`}>
         {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <div>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{title}</p>
         <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
         <p className="text-[9px] font-bold text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  </div>
);

const StatCardSmall = ({ title, value, icon, trend }: any) => (
  <div className="glass-card p-4 flex items-center gap-4 shadow-sm">
    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl shrink-0">
      {React.cloneElement(icon as React.ReactElement, { size: 18 })}
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{title}</p>
      <div className="flex items-center gap-2">
        <span className="text-base font-black text-slate-800 dark:text-white">{value}</span>
        {trend === 'up' && <span className="text-[9px] text-emerald-500 font-black">+4%</span>}
      </div>
    </div>
  </div>
);

const QuickAction = ({ label, to, color, textColor = "text-white" }: any) => (
  <Link to={to} className={`block w-full p-3 rounded-xl ${color} ${textColor} font-black text-[10px] text-center shadow-sm hover:scale-[1.02] active:scale-95 transition-all`}>
    {label}
  </Link>
);

// --- Main Dashboard Entry Point ---
const Dashboard: React.FC = () => {
  const [role, setRole] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [realStats, setRealStats] = useState<any>(null);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
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
      
      if (userData.role === 'supervisor' || userData.role === 'manager' || userData.role === 'admin' || userData.role === 'teacher') {
        fetchStaffAndStudents();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchRealDashboardData = async (userRole: string) => {
    setLoading(true);
    try {
      if (userRole === 'superadmin' || userRole === 'owner') {
        // FIX: /super-admin endpoint doesn't exist, use /super-admin/schools directly
        try {
          const schoolsRes = await api.get('/super-admin/schools');
          setRealStats(schoolsRes.data);
        } catch (e) {
          console.error("Error fetching schools data:", e);
          setRealStats({ schools: [], stats: { total_schools: 0, total_students: 0, total_staff: 0, total_circles: 0 } });
        }
      } else {
        const res = await api.get('/stats/overview');
        setRealStats(res.data.overview || res.data);
        
        try {
           const infoRes = await api.get('/school-info');
           setSchoolInfo(infoRes.data);
        } catch (e) {
           console.error("Error fetching school info:", e);
        }
      }
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffAndStudents = async () => {
    try {
      // FIX: handle paginated staff response (StaffController now returns paginate())
      const staffRes = await api.get('/staff');
      const staffData = staffRes.data?.data || (Array.isArray(staffRes.data) ? staffRes.data : []);
      const managementStaff = staffData.filter((s: any) => s.role === 'admin' || s.role === 'manager');
      setStaff(managementStaff.slice(0, 3));

      const studentsRes = await api.get('/students');
      const studentList = studentsRes.data?.data || (Array.isArray(studentsRes.data) ? studentsRes.data : []);
      const sortedStudents = [...studentList].sort((a: any, b: any) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setRecentStudents(sortedStudents.slice(0, 5));
    } catch (e) {
      console.error("Error fetching auxiliary dashboard data:", e);
    }
  };

  const renderDashboard = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-xs text-slate-400">جاري جلب إحصائيات المنصة...</p>
        </div>
      </div>
    );

    switch (role) {
      case 'superadmin':
      case 'owner':
        return <OwnerDashboard data={realStats} />;
      case 'supervisor':
      case 'manager':
        return <SupervisorDashboard data={realStats} staff={staff} schoolInfo={schoolInfo} />;
      case 'admin':
      case 'teacher':
        return <StaffDashboard data={realStats} recentStudents={recentStudents} schoolInfo={schoolInfo} />;
      default:
        return (
          <div className="py-16 text-center">
             <p className="font-black text-xs text-slate-400 uppercase tracking-widest">يرجى تسجيل الدخول لعرض البيانات</p>
          </div>
        );
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
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
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
            مرحباً، {user?.name?.split('(')[0].trim() || 'مستخدم'} 👋
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
              {getRoleLabel(role)} {schoolInfo?.name ? ` - ${schoolInfo.name}` : ''}
            </span>
            <p className="text-slate-500 font-bold text-[10px]">إليك تحليل أداء {role === 'superadmin' || role === 'owner' ? 'المنصة الكلي' : 'المجمع'} اليوم</p>
          </div>
        </div>
        
        {(role === 'superadmin' || role === 'owner') && (
           <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">عرض التحكم الشامل للمنصة</span>
           </div>
        )}
      </div>
      
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
