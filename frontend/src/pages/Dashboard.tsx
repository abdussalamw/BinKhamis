import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Award,
  ArrowUpRight,
  Bell,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#0d9488', '#fb7185', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'student';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (role === 'student') {
          const response = await api.get('/stats/student-overview');
          setStats(response.data);
          const chartRes = await api.get('/stats/attendance-chart');
          setChartData(chartRes.data);
        } else {
          const [overviewRes, chartRes, distRes] = await Promise.all([
            api.get('/stats/overview'),
            api.get('/stats/attendance-chart'),
            api.get('/stats/circle-distribution')
          ]);
          
          setStats(overviewRes.data.overview);
          setChartData(chartRes.data);
          
          const distData = distRes.data.stages || distRes.data.circles || [];
          setDistribution(distData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <div className="relative">
                <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
            </div>
            <p className="font-black text-slate-500 animate-pulse">جاري تنسيق الإبداع ببياناتك...</p>
        </div>
      </div>
    );
  }

  // Define Cards based on Role
  let statCards = [];
  if (role === 'student') {
    statCards = [
      { title: 'نسبة حضوري', value: `${stats?.attendance_rate || 0}%`, icon: CheckCircle, color: 'bg-primary', secondaryColor: 'bg-teal-400', sub: 'التزامك اليومي بالحلقة' },
      { title: 'إنجاز الحفظ', value: stats?.memorized_pages || 0, icon: BookOpen, color: 'bg-secondary', secondaryColor: 'bg-rose-400', sub: 'صفحة تم حفظها وإتقانها' },
      { title: 'مستوى التجويد', value: stats?.tajweed_score || 'ممتاز', icon: Award, color: 'bg-accent', secondaryColor: 'bg-yellow-400', sub: 'تقييم المعلم الأخير لك' },
      { title: 'نقاط التميز', value: stats?.points || 0, icon: Zap, color: 'bg-indigo-500', secondaryColor: 'bg-indigo-300', sub: 'رصيد نقاطك التشجيعية' },
    ];
  } else {
    statCards = [
      { title: role === 'teacher' ? 'طلابي' : 'إجمالي الطلاب', value: stats?.total_students || 0, icon: Users, color: 'bg-primary', secondaryColor: 'bg-teal-400', sub: role === 'teacher' ? 'طالباً في حلقتك' : 'طالب مسجل في النظام' },
      { title: role === 'teacher' ? 'أيام الحلقة' : 'حلقات نشطة', value: stats?.active_circles || stats?.days_count || 0, icon: BookOpen, color: 'bg-secondary', secondaryColor: 'bg-rose-400', sub: role === 'teacher' ? 'إجمالي أيام التدريس' : 'توزيع الطلاب مكتملاً' },
      { title: 'نسبة الحضور', value: `${stats?.attendance_rate || 0}%`, icon: CheckCircle, color: 'bg-accent', secondaryColor: 'bg-yellow-400', sub: 'معدل الحضور اليومي' },
      { title: 'إنجازات الحفظ', value: stats?.total_progress || 0, icon: Award, color: 'bg-indigo-500', secondaryColor: 'bg-indigo-300', sub: 'سجل إنجاز تراكمي' },
    ];
  }

  return (
    <div className="space-y-12 animate-in fade-in zoom-in duration-1000 pb-20">
      {/* Top Welcome Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-2">
        <div className="relative">
          <div className="absolute -top-4 -right-4 text-primary/10 animate-float hidden md:block">
            <Sparkles size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex flex-wrap items-center gap-2 md:gap-3">
             أهلاً بك، <span className="bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">{user?.name || 'مستخدم'}</span>
             <span className="inline-block animate-float text-lg md:text-xl">✨</span>
          </h1>
          <p className="mt-1 text-[11px] md:text-sm font-bold text-slate-400 dark:text-slate-500 max-w-xl leading-relaxed">
            {role === 'student' 
              ? 'مرحباً بطلنا المتميز. إليك ملخص سريع لإنجازاتك اليوم.'
              : 'مرحباً بك في نظام إدارة الحلقات. إليك نظرة سريعة على أداء اليوم.'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white dark:bg-midnight shadow-xl shadow-slate-200/20 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">تحديث البيانات: فوري</span>
            </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 px-2 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card-premium group p-5 transition-all hover:translate-y-[-4px]">
            {/* Giant Background Number */}
            <div className="text-giant-number">{stat.value}</div>
            
            {/* Boundary-Breaking Floating Icon */}
            <div className={`floating-icon ${stat.color} text-white animate-float`} style={{ animationDelay: `${i * 0.5}s`, width: '40px', height: '40px' }}>
              <stat.icon size={20} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {stat.title}
                </div>
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all group-hover:bg-primary group-hover:text-white dark:bg-slate-800">
                    <ArrowUpRight size={16} />
                </div>
              </div>
              
              <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                {stat.value}
              </h4>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                {stat.sub}
              </p>
              
              <div className="mt-6 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${stat.color} transition-all duration-1000 ease-out delay-500`} 
                    style={{ width: i === 2 ? stat.value : '75%' }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Creative Charts & Content Area */}
      <div className="grid grid-cols-12 gap-6 px-2">
        {/* Modern Analytics Area Chart */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card-premium p-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <Zap size={20} className="text-secondary" />
                    {role === 'student' ? 'رحلتي التعليمية' : 'نبض الحلقات الذكي'}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {role === 'student' ? 'مخطط بياني يوضح تقدمك في الحفظ والمراجعة' : 'تحليل الأداء التفاعلي لطلابك خلال الأسبوع'}
                  </p>
                </div>
                {role !== 'student' && (
                  <div className="flex items-center p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl gap-2">
                      <button className="px-4 py-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-xs font-black text-primary">أسبوعي</button>
                      <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">شهري</button>
                  </div>
                )}
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '15px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                        itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="attendance" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" name="الحضور" />
                    <Area type="monotone" dataKey="progress" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorSec)" name="الإنجاز" />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sophisticated Distribution View - Hidden for students */}
        {role !== 'student' && (
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card-premium p-6 flex-grow">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">توزيع الأجيال</h3>
              <p className="text-xs font-bold text-slate-400 mb-6">حسب المراحل والمستويات</p>
              
              <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">{stats?.total_students || 0}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">طالب</span>
                  </div>
                  <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={distribution}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={85}
                                  outerRadius={115}
                                  paddingAngle={10}
                                  dataKey="value"
                              >
                                  {distribution.map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                  ))}
                              </Pie>
                              <Tooltip 
                                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                              />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {distribution.length > 0 ? distribution.slice(0, 4).map((item: any, i) => (
                      <div key={i} className="pill-row">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl mr-3" style={{ backgroundColor: `${COLORS[i % COLORS.length]}20` }}>
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          </div>
                          <div className="flex-grow ml-4 mr-4">
                              <p className="text-sm font-black text-slate-700 dark:text-slate-300">{item.name}</p>
                          </div>
                          <span className="text-base font-black text-primary">{item.value}</span>
                      </div>
                  )) : (
                      <div className="text-center py-10">
                          <div className="inline-block p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                              <Users size={32} className="text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-400">لا يوجد بيانات حالياً</p>
                      </div>
                  )}
              </div>
              
              <button className="w-full mt-8 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-sm font-black text-slate-500 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group">
                  عرض التفاصيل الكاملة
                  <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Student Special Section - Visible only for Students */}
        {role === 'student' && (
          <div className="col-span-12 lg:col-span-4 space-y-6">
             <div className="glass-card-premium p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/10">
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="text-primary" size={20} />
                  وسام التميز
                </h3>
                <div className="flex flex-col items-center text-center space-y-3">
                   <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-accent animate-bounce">
                      <Award size={40} />
                   </div>
                   <p className="text-sm font-black text-slate-700 dark:text-slate-200">أنت في المركز الخامس على مستوى الحلقة!</p>
                   <p className="text-[10px] font-bold text-slate-400">استمر في التقدم لتصل إلى المركز الأول</p>
                </div>
             </div>

             <div className="glass-card-premium p-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">آخر ملاحظات المعلم</h3>
                <div className="space-y-4">
                   <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">"ما شاء الله، إتقان ممتاز في سورة البقرة، استمر على هذا التركيز يا بطل."</p>
                      <div className="mt-3 flex items-center justify-between">
                         <span className="text-[9px] font-black text-primary">الأستاذ محمد العلي</span>
                         <span className="text-[9px] font-bold text-slate-400">منذ يومين</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

