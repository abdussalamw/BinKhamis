import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, 
  Cell, Legend, ComposedChart, Area, AreaChart as RechartsAreaChart
} from 'recharts';
import { 
  FileDown, Calendar, TrendingUp, Users, 
  Award, Search, User, ChevronLeft,
  LayoutDashboard, GraduationCap, Map, Printer, Info, Sparkles
} from 'lucide-react';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'circle' | 'stage' | 'student'>('overview');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedCircle, setSelectedCircle] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/dashboard');
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSearch = async (val: string) => {
    setSearchTerm(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await api.get(`/students?search=${val}`);
      setSearchResults(response.data.filter((s: any) => s.name.includes(val)).slice(0, 5));
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const fetchStudentReport = async (studentId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/student/${studentId}`);
      setSelectedStudent(response.data);
      setActiveTab('student');
    } catch (error) {
      console.error('Student error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCircleReport = async (circleId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/circle/${circleId}`);
      setSelectedCircle(response.data);
    } catch (error) {
      console.error('Circle error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !reportData) return (
    <div className="py-20 text-center flex flex-col items-center gap-4">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-slate-500">جاري معالجة التقارير...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Compact Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">مركز التقارير التحليلية</h1>
            <p className="text-xs font-bold text-slate-400">إصدار مستقر - بيانات حية</p>
          </div>
        </div>
        
        <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
          {(['overview', 'circle', 'stage', 'student'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== 'student') setSelectedStudent(null);
                if (tab !== 'circle') setSelectedCircle(null);
              }}
              className={`px-5 py-2.5 rounded-lg font-black text-[11px] transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab === 'overview' && 'الرئيسية'}
              {tab === 'circle' && 'الحلقات'}
              {tab === 'stage' && 'المراحل'}
              {tab === 'student' && 'الطلاب'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && reportData && (
        <div className="space-y-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard title="الطلاب" value={reportData.kpis?.total_students} icon={<Users size={18}/>} color="primary" growth={reportData.growth?.students} />
              <KPICard title="الحضور" value={`${reportData.kpis?.attendance_rate}%`} icon={<Calendar size={18}/>} color="emerald" growth={reportData.growth?.attendance} />
              <KPICard title="الإنجاز" value={reportData.kpis?.overall_progress?.toFixed(1)} icon={<Award size={18}/>} color="amber" growth={reportData.growth?.achievements} />
              <KPICard title="الحلقات" value={reportData.kpis?.active_circles} icon={<Map size={18}/>} color="indigo" growth={0} />
           </div>

           <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 xl:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                 <h3 className="text-sm font-black text-slate-700 dark:text-white mb-6 uppercase tracking-wider">نمو المجمع الشهري</h3>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={reportData.monthlyProgress || []}>
                          <CartesianGrid stroke="#f8fafc" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                          <Area type="monotone" dataKey="students" fill="#6366f1" stroke="#6366f1" fillOpacity={0.05} name="طلاب" />
                          <Bar dataKey="achievements" barSize={15} fill="#10b981" radius={[4, 4, 0, 0]} name="أوجه" />
                          <Line type="monotone" dataKey="attendance" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} name="حضور %" />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="col-span-12 xl:col-span-4 space-y-6">
                 <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-lg">
                    <h4 className="text-xs font-black mb-4 flex items-center gap-2">
                       <Sparkles size={14} className="text-primary" /> رؤى ذكية
                    </h4>
                    <div className="space-y-3">
                       {reportData.insights?.map((ins: string, i: number) => (
                         <div key={i} className="text-[11px] font-bold text-slate-300 flex gap-2">
                            <div className="h-1 w-1 bg-primary rounded-full mt-1.5 shrink-0" />
                            <p>{ins}</p>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black text-slate-700 dark:text-white mb-4">توزيع البرامج</h4>
                    <div className="h-[150px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie data={reportData.programDistribution || []} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                {reportData.programDistribution?.map((_: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                             </Pie>
                             <Tooltip />
                          </PieChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'circle' && reportData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-right duration-300">
           {!selectedCircle ? (
             <div className="overflow-x-auto">
                <table className="w-full text-right">
                   <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                         <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحلقة</th>
                         <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الطلاب</th>
                         <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الحضور</th>
                         <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">الإجراء</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {reportData.circleRankings?.map((circle: any) => (
                        <tr key={circle.id} onClick={() => fetchCircleReport(circle.id)} className="hover:bg-slate-50/50 transition-all cursor-pointer">
                           <td className="py-4 px-6">
                              <p className="font-black text-slate-700 dark:text-slate-200 text-sm">{circle.name}</p>
                              <p className="text-[10px] font-bold text-slate-400">{circle.teacher}</p>
                           </td>
                           <td className="py-4 px-6 text-center text-sm font-black text-slate-600">{circle.student_count}</td>
                           <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                 <span className="text-xs font-black text-primary">{circle.attendance}%</span>
                                 <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{width: `${circle.attendance}%`}}></div>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-left">
                              <ChevronLeft size={16} className="text-slate-300" />
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           ) : (
             <div className="p-6 space-y-6 animate-in zoom-in duration-200">
                <div className="flex items-center justify-between">
                   <button onClick={() => setSelectedCircle(null)} className="text-primary font-black text-[11px] flex items-center gap-1">
                      <ChevronLeft className="rotate-180" size={14} /> عودة
                   </button>
                   <h3 className="font-black text-slate-800 dark:text-white">تحليل حلقة {selectedCircle.circle?.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="h-[250px] bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={selectedCircle.attendanceTrend || []}>
                            <CartesianGrid stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="date" hide />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                            <Tooltip />
                            <Line type="monotone" dataKey="total_present" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                         </LineChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="space-y-4">
                      {selectedCircle.insights?.map((ins: string, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-500">
                           {ins}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'student' && (
        <div className="animate-in slide-in-from-left duration-300">
           {!selectedStudent ? (
             <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-xl mx-auto text-center space-y-6">
                <Search size={40} className="mx-auto text-primary/20" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white">ابحث عن طالب</h3>
                <div className="relative">
                   <input 
                     type="text"
                     placeholder="اسم الطالب..."
                     className="w-full py-4 pr-12 pl-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm outline-none"
                     value={searchTerm}
                     onChange={(e) => handleStudentSearch(e.target.value)}
                   />
                   <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
                {searchResults.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 overflow-hidden text-right">
                    {searchResults.map(s => (
                      <button key={s.id} onClick={() => fetchStudentReport(s.id)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-all border-b last:border-0">
                        <span className="font-black text-xs text-slate-700">{s.name}</span>
                        <ChevronLeft size={14} className="text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
             </div>
           ) : (
             <div className="space-y-6 animate-in zoom-in duration-200">
                <div className="flex items-center justify-between no-print">
                   <button onClick={() => setSelectedStudent(null)} className="text-primary font-black text-[11px] flex items-center gap-1">
                      <ChevronLeft className="rotate-180" size={14} /> عودة
                   </button>
                   <button onClick={() => window.print()} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-[11px] flex items-center gap-2">
                      <Printer size={14} /> طباعة البطاقة
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                   <div className="md:col-span-4 space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                         <div className="h-20 w-20 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black">
                           {selectedStudent.student?.name?.charAt(0)}
                         </div>
                         <h3 className="font-black text-slate-800 dark:text-white">{selectedStudent.student?.name}</h3>
                         <p className="text-[11px] font-bold text-slate-400 mt-1">{selectedStudent.student?.profile?.academic_stage}</p>
                         <div className="mt-6 flex justify-center gap-3">
                            <div className="px-4 py-2 bg-emerald-50 rounded-lg text-emerald-600 font-black text-xs">
                               الحضور: {Math.round((selectedStudent.attendanceSummary?.find((a:any)=>a.status==='present')?.total || 0) / 
                               (selectedStudent.attendanceSummary?.reduce((acc:any,c:any)=>acc+c.total,0) || 1) * 100)}%
                            </div>
                            <div className="px-4 py-2 bg-indigo-50 rounded-lg text-indigo-600 font-black text-xs">
                               الإنجاز: {selectedStudent.progressHistory?.reduce((a:any,c:any)=>a+c.pages,0)} و
                            </div>
                         </div>
                      </div>
                      <div className="bg-slate-900 p-6 rounded-3xl text-white">
                         <h4 className="text-[11px] font-black mb-4">ملاحظات النظام</h4>
                         <div className="space-y-3">
                            {selectedStudent.insights?.map((ins: string, i: number) => (
                               <p key={i} className="text-[10px] font-bold text-slate-300 leading-relaxed">• {ins}</p>
                            ))}
                         </div>
                      </div>
                   </div>
                   <div className="md:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-black mb-8 flex items-center gap-2">
                         <TrendingUp size={16} className="text-primary" /> منحنى الحفظ التراكمي
                      </h4>
                      <div className="h-[300px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsAreaChart data={selectedStudent.progressHistory || []}>
                               <CartesianGrid stroke="#f1f5f9" vertical={false} />
                               <XAxis dataKey="date" hide />
                               <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                               <Tooltip />
                               <Area type="monotone" dataKey="pages" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={3} />
                            </RechartsAreaChart>
                         </ResponsiveContainer>
                      </div>
                      {/* Compact Heatmap */}
                      <div className="mt-8 border-t pt-6">
                         <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">سجل الانضباط الأخير</p>
                         <div className="flex flex-wrap gap-1">
                            {selectedStudent.heatmap?.slice(-60).map((d: any, i: number) => (
                               <div key={i} className={`h-3 w-3 rounded-sm ${d.count === 4 ? 'bg-emerald-500' : d.count === 2 ? 'bg-amber-400' : 'bg-slate-100'}`} title={d.date} />
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'stage' && reportData && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in slide-in-from-top duration-300">
           <div className="md:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-black mb-8 uppercase tracking-widest">تحليل مقارنة المراحل</h3>
              <div className="h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={reportData.stageStats || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 800, fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 800, fontSize: 10}} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                   </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
           <div className="md:col-span-4 space-y-4">
              {reportData.stageStats?.map((stage: any, i: number) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100">
                   <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-sm">{stage.name}</span>
                      <GraduationCap size={16} className="text-primary" />
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                         <span>الانضباط</span>
                         <span className="text-primary">{stage.attendance}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                         <div className="h-full bg-primary" style={{width: `${stage.attendance}%`}}></div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

const KPICard: React.FC<{title: string, value: any, icon: React.ReactNode, color: string, growth: number}> = ({title, value, icon, color, growth}) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
    <div className="flex items-center justify-between mb-3">
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${color === 'primary' ? 'bg-primary/10 text-primary' : color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-600/10 text-indigo-600'}`}>
        {icon}
      </div>
      {growth !== 0 && (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${growth > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {growth > 0 ? '+' : ''}{growth}%
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{value || 0}</p>
  </div>
);

export default Reports;
