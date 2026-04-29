import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Award,
  ArrowUpRight,
  Bell,
  Search,
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

const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, chartRes, distRes] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/stats/attendance-chart'),
          api.get('/stats/circle-distribution')
        ]);
        
        setStats(overviewRes.data.overview);
        setChartData(chartRes.data);
        
        // Fix: Use stages distribution for the pie chart as it's more relevant for overview
        const distData = distRes.data.stages || distRes.data.circles || [];
        setDistribution(distData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="font-black text-slate-400">جاري بناء لوحة التحكم ببياناتك الجديدة...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'إجمالي الطلاب', value: stats?.total_students || 0, icon: Users, color: 'from-blue-500 to-blue-600', trend: '+12%', sub: 'طالب مسجل في النظام' },
    { title: 'حلقات نشطة', value: stats?.active_circles || 0, icon: BookOpen, color: 'from-purple-500 to-purple-600', trend: 'ثابت', sub: 'توزيع الطلاب مكتملاً' },
    { title: 'نسبة الحضور اليوم', value: `${stats?.attendance_rate || 0}%`, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', trend: '+2.4%', sub: 'معدل الحضور اليومي' },
    { title: 'إنجازات الحفظ', value: stats?.total_progress || 0, icon: Award, color: 'from-amber-500 to-amber-600', trend: '+18%', sub: 'سجل إنجاز تراكمي' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-10">
      {/* Top Welcome Bar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-3">
             أهلاً بك، <span className="text-primary">أ. عبدالسلام</span>
             <span className="inline-block animate-bounce-slow">👋</span>
          </h1>
          <p className="mt-2 text-lg font-bold text-slate-500 dark:text-slate-400">
            نظرة شاملة على أداء مدرسة بن خميس - {new Date().toLocaleDateString('ar-SA', { dateStyle: 'full' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
                <input 
                    type="text" 
                    placeholder="بحث سريع..." 
                    className="w-64 rounded-2xl border-none bg-white py-4 pr-12 pl-6 font-bold text-slate-700 shadow-xl shadow-slate-200/20 outline-none ring-2 ring-transparent transition-all focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-300"
                />
                <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" />
            </div>
            <button className="relative rounded-2xl bg-white p-4 text-slate-500 shadow-xl shadow-slate-200/20 hover:text-primary dark:bg-slate-800">
                <Bell size={24} />
                <span className="absolute top-3 right-3 h-3 w-3 rounded-full border-2 border-white bg-danger dark:border-slate-800"></span>
            </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card group relative overflow-hidden rounded-[32px] p-8 transition-all hover:-translate-y-2 hover:shadow-2xl">
            <div className={`absolute top-0 right-0 h-32 w-32 translate-x-8 translate-y-[-16px] rounded-full bg-gradient-to-br ${stat.color} opacity-5`}></div>
            <div className="flex items-start justify-between">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/30`}>
                <stat.icon size={32} />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-slate-800">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-baseline gap-2">
                <h4 className="text-4xl font-black text-slate-800 dark:text-white">{stat.value}</h4>
              </div>
              <p className="mt-2 text-sm font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
              <p className="mt-4 text-[10px] font-black text-slate-500 dark:text-slate-400 opacity-60 bg-slate-100 dark:bg-slate-800 w-fit px-3 py-1 rounded-lg">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Attendance Area Chart */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-[40px] p-10 shadow-2xl">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">تحليلات الحضور والإنجاز</h3>
              <p className="text-sm font-bold text-slate-400">مقارنة أداء الطلاب خلال الـ 7 أيام الماضية</p>
            </div>
            <div className="flex gap-2">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <div className="h-3 w-3 rounded-full bg-primary"></div> حضور
                </span>
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500 ml-4">
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div> إنجاز
                </span>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4e73df" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4e73df" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
                    itemStyle={{ fontWeight: 800 }}
                />
                <Area type="monotone" dataKey="attendance" stroke="#4e73df" strokeWidth={4} fillOpacity={1} fill="url(#colorAttendance)" name="نسبة الحضور" />
                <Area type="monotone" dataKey="progress" stroke="#1cc88a" strokeWidth={4} fillOpacity={1} name="معدل الحفظ" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circle Distribution Pie Chart */}
        <div className="col-span-12 lg:col-span-4 glass-card rounded-[40px] p-10 shadow-2xl flex flex-col">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">توزيع الطلاب</h3>
            <p className="text-sm font-bold text-slate-400 mb-8">حسب المراحل الدراسية</p>
            
            <div className="flex-grow flex items-center justify-center">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={8}
                                dataKey="value"
                            >
                                {distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                {distribution.length > 0 ? distribution.map((item: any, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-sm font-black text-slate-800 dark:text-white">{item.value} طالب</span>
                    </div>
                )) : (
                    <p className="text-center text-sm font-bold text-slate-400 py-4">لا يوجد بيانات توزيع حالياً</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
