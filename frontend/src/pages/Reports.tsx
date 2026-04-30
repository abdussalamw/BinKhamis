import React, { useState, useEffect } from 'react';
import { 
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, 
  Cell, ComposedChart, Area
} from 'recharts';
import { 
  Calendar, Users, 
  Award, Search, ChevronLeft,
  LayoutDashboard, Map
} from 'lucide-react';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'complex' | 'stages' | 'circles' | 'students'>('complex');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedCircle, setSelectedCircle] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/reports/dashboard');
      setReportData(response.data);
    } catch (err: any) {
      console.error('Report error:', err);
      setError('حدث خطأ أثناء جلب البيانات. يرجى المحاولة لاحقاً.');
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
      setSearchResults(response.data.slice(0, 5));
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const fetchCircleReport = async (circleId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/circle/${circleId}`);
      setSelectedCircle(response.data);
      setActiveTab('circles');
    } catch (err) {
      console.error('Circle report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReport = async (studentId: string) => {
    setLoading(true);
    setSearchResults([]);
    setSearchTerm('');
    try {
      const response = await api.get(`/reports/student/${studentId}`);
      setSelectedStudent(response.data);
      setActiveTab('students');
    } catch (err) {
      console.error('Student report error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !reportData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-rose-500 font-black">{error}</p>
        <button onClick={fetchDashboardData} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">إعادة المحاولة</button>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tabs Selection */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
         {[
           { id: 'complex', label: 'المجمع (التحفيظ)', icon: LayoutDashboard },
           { id: 'stages', label: 'المراحل الدراسية', icon: Award },
           { id: 'circles', label: 'الحلقات القرآنية', icon: Map },
           { id: 'students', label: 'تقارير الطلاب', icon: Users },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => {
               setActiveTab(tab.id as any);
               setSelectedStudent(null);
               setSelectedCircle(null);
             }}
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap shadow-sm border ${activeTab === tab.id ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-white/5 hover:bg-slate-50'}`}
           >
             <tab.icon size={14} />
             {tab.label}
           </button>
         ))}
      </div>

      {activeTab === 'students' && (
        <div className="glass-card-premium p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white">بحث سريع عن طالب</h2>
              <p className="text-[9px] font-bold text-slate-400">للوصول للسجل الفردي</p>
            </div>
          </div>
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="اكتب اسم الطالب هنا..."
              className="w-full py-3 pr-12 pl-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => handleStudentSearch(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50">
                {searchResults.map(s => (
                  <button key={s.id} onClick={() => fetchStudentReport(s.id)} className="w-full p-4 text-right hover:bg-slate-50 flex items-center justify-between border-b last:border-0">
                    <span className="font-black text-xs text-slate-700 dark:text-slate-200">{s.name}</span>
                    <ChevronLeft size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
3      {/* COMPLEX TAB */}
      {activeTab === 'complex' && (
        <div className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <KPICard title="إجمالي الطلاب" value={reportData.kpis?.total_students} icon={<Users size={16}/>} color="primary" />
            <KPICard title="نسبة الانضباط" value={`${reportData.kpis?.attendance_rate}%`} icon={<Calendar size={16}/>} color="emerald" />
            <KPICard title="متوسط الإنجاز" value={reportData.kpis?.avg_progress} icon={<Award size={16}/>} color="amber" />
            <KPICard title="الحلقات" value={reportData.kpis?.active_circles} icon={<Map size={16}/>} color="indigo" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             <div className="lg:col-span-8 glass-card-premium p-6">
                <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest">نبض الأداء الشهري للمجمع</h3>
                <div className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={reportData.monthlyProgress}>
                        <CartesianGrid stroke="#f8fafc" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="students" fill="#6366f1" stroke="#6366f1" fillOpacity={0.05} />
                        <Bar dataKey="achievements" barSize={15} fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="attendance" stroke="#f59e0b" strokeWidth={3} />
                      </ComposedChart>
                   </ResponsiveContainer>
                </div>
             </div>
             <div className="lg:col-span-4 glass-card-premium p-6">
                <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest">توزيع المسارات</h3>
                <div className="h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={reportData.programDistribution} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                            {reportData.programDistribution?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                   {reportData.programDistribution?.map((p: any, i: number) => (
                     <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600">{p.name || 'عام'}</span>
                        <span className="text-primary">{p.value}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* STAGES TAB */}
      {activeTab === 'stages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
           {reportData.stageBreakdown?.map((stage: any, i: number) => (
             <div key={i} className="glass-card-premium p-6 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-base font-black text-slate-800 dark:text-white">{stage.name}</h3>
                   <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Award size={16} />
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">إجمالي الطلاب</span>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{stage.students}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">نسبة الحضور</span>
                      <span className="text-sm font-black text-emerald-500">{stage.attendance}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-primary" style={{width: `${stage.attendance}%`}} />
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* CIRCLES TAB */}
      {activeTab === 'circles' && (
        <div className="space-y-6">
          {selectedCircle ? (
            <div className="animate-in zoom-in duration-200 space-y-6">
               <button onClick={() => setSelectedCircle(null)} className="flex items-center gap-2 text-primary font-black text-xs">
                  <ChevronLeft className="rotate-180" size={14} /> العودة لترتيب الحلقات
               </button>
               <div className="glass-card-premium p-6">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                        {selectedCircle.circle?.name?.charAt(0)}
                     </div>
                     <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-white">{selectedCircle.circle?.name}</h2>
                        <p className="text-xs font-bold text-slate-400">بإشراف: {selectedCircle.circle?.teacher?.name}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                     <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الطلاب</p>
                        <p className="text-xl font-black text-slate-800 dark:text-white">{selectedCircle.stats?.total_students}</p>
                     </div>
                     <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">نسبة الحضور</p>
                        <p className="text-xl font-black text-emerald-500">{selectedCircle.stats?.attendance_rate}%</p>
                     </div>
                  </div>
                  
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">آخر عمليات التحضير</h3>
                  <div className="space-y-2">
                     {selectedCircle.recent_attendance?.map((a: any, i: number) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-white/5">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{a.date}</span>
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${a.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                             {a.status === 'present' ? 'حاضر' : 'غائب'}
                          </span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          ) : (
            <div className="glass-card-premium overflow-hidden">
               <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5">
                      <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase">الحلقة</th>
                      <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase text-center">الطلاب</th>
                      <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase text-center">الحضور</th>
                      <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {reportData.circleRankings?.map((circle: any) => (
                      <tr key={circle.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                        <td className="py-4 px-6">
                           <p className="font-black text-xs text-slate-700 dark:text-slate-200">{circle.name}</p>
                           <p className="text-[10px] font-bold text-slate-400">{circle.teacher}</p>
                        </td>
                        <td className="py-4 px-6 text-center text-xs font-black text-slate-600">{circle.students}</td>
                        <td className="py-4 px-6">
                           <div className="flex items-center justify-center gap-3">
                              <span className="text-xs font-black text-emerald-500">{circle.attendance}%</span>
                              <div className="w-16 h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500" style={{width: `${circle.attendance}%`}} />
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-6">
                           <button onClick={() => fetchCircleReport(circle.id)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all">
                              <ChevronLeft size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}
        </div>
      )}

      {/* STUDENT TAB */}
      {activeTab === 'students' && (
        <div className="space-y-6">
           {selectedStudent ? (
             <div className="animate-in zoom-in duration-200 space-y-6">
                <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-2 text-primary font-black text-xs">
                   <ChevronLeft className="rotate-180" size={14} /> العودة للبحث
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                   <div className="lg:col-span-4 glass-card-premium p-8 text-center">
                      <div className="h-20 w-20 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                         {selectedStudent.student?.name?.charAt(0)}
                      </div>
                      <h2 className="text-lg font-black text-slate-800 dark:text-white">{selectedStudent.student?.name}</h2>
                      <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest">{selectedStudent.student?.profile?.current_level}</p>
                      
                      <div className="mt-8 grid grid-cols-2 gap-4">
                         <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الحضور</p>
                            <p className="text-lg font-black text-emerald-500">{selectedStudent.summary?.attendance_rate}%</p>
                         </div>
                         <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الإنجاز</p>
                            <p className="text-lg font-black text-indigo-600">{selectedStudent.summary?.total_achievements}</p>
                         </div>
                      </div>
                   </div>
                   <div className="lg:col-span-8 glass-card-premium p-6">
                      <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest">السجل الأخير</h3>
                      <div className="space-y-3">
                         {selectedStudent.attendance?.map((a: any, i: number) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{a.date}</span>
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${a.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                 {a.status === 'present' ? 'حاضر' : 'غائب'}
                              </span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                   <Search size={32} />
                </div>
                <div>
                   <p className="text-sm font-black text-slate-400">ابدأ بالبحث عن طالب لعرض تقريره الفردي</p>
                   <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">تأكد من كتابة الاسم بشكل صحيح</p>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

const KPICard: React.FC<{title: string, value: any, icon: React.ReactNode, color: string}> = ({title, value, icon, color}) => (
  <div className="glass-card-premium p-4 md:p-6 hover:translate-y-[-2px] transition-transform shadow-sm">
    <div className={`h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 ${color === 'primary' ? 'bg-primary/10 text-primary' : color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-600/10 text-indigo-600'}`}>
      {icon}
    </div>
    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-base md:text-xl font-black text-slate-800 dark:text-white tracking-tight">{value || 0}</p>
  </div>
);

export default Reports;
