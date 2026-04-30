import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Users, User as UserIcon, MapPin, ChevronLeft, 
  LayoutGrid, List, Plus, Search, Filter,
  Edit3, Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface CircleData {
  id: string;
  name: string;
  location: string;
  enrollments_count: number;
  teacher?: {
    name: string;
  };
  is_active: boolean;
}

const CircleList: React.FC = () => {
  const navigate = useNavigate();
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    teacher: '',
    location: '',
  });

  useEffect(() => {
    fetchCircles();
  }, []);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'student';

  const fetchCircles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/circles');
      let data = response.data;
      
      // Filter based on role if backend didn't filter yet
      if (role === 'teacher' && user?.circle_id) {
        data = data.filter((c: any) => c.id === user.circle_id);
      } else if (role === 'supervisor' && user?.allowed_circles?.length > 0) {
        data = data.filter((c: any) => user.allowed_circles.includes(c.id));
      }
      
      setCircles(data);
    } catch (error) {
      console.error('Error fetching circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCircles = (circles || []).filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circle.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filters.location || circle.location === filters.location;
    return matchesSearch && matchesLocation;
  });

  const locations = Array.from(new Set(circles.map(c => c.location).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-700 pb-20">
      {/* Premium Compact Header */}
      <div className="glass-card-premium p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-visible">
        <div className="flex items-center gap-5">
          <div className="relative group">
              <div className="absolute -inset-2 bg-secondary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
              <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-secondary to-rose-600 flex items-center justify-center shadow-lg shadow-secondary/20 transform group-hover:rotate-3 transition-transform">
                <LayoutGrid size={28} className="text-white" />
              </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">إدارة الحلقات</h1>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">متابعة {circles.length} حلقة قرآنية نشطة</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-100 dark:border-white/5">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  <List size={16} />
              </button>
          </div>
          <button 
            onClick={() => navigate('/circles/new')}
            className="group relative flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Plus size={16} />
            إضافة حلقة
          </button>
        </div>
      </div>

      {/* Refined Controls */}
      <div className="flex flex-wrap items-center gap-4 px-2">
        <div className="relative flex-grow max-w-md group">
          <input
            type="text"
            placeholder="ابحث باسم الحلقة أو المعلم..."
            className="w-full rounded-xl border-none bg-white dark:bg-midnight py-3 pr-11 pl-4 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none ring-1 ring-slate-100 dark:ring-white/5 focus:ring-primary/20 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-midnight px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
          <Filter size={14} className="text-slate-400" />
          <select 
            className="bg-transparent border-none outline-none font-black text-xs text-slate-500 dark:text-slate-400 cursor-pointer"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          >
            <option value="">جميع المواقع</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-primary/10"></div>
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
          <span className="text-xs font-black text-slate-400 animate-pulse">جاري جلب البيانات...</span>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 px-2">
          {filteredCircles.map((circle, i) => (
            <div key={circle.id} className="glass-card-premium group p-5 transition-all hover:translate-y-[-4px] flex flex-col h-full overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                    <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                      <Users size={20} />
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black ${circle.is_active ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' : 'bg-slate-50 text-slate-400 dark:bg-white/5'}`}>
                    <div className={`h-1 w-1 rounded-full ${circle.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    {circle.is_active ? 'نشطة' : 'متوقفة'}
                </div>
              </div>

              <div className="flex-grow">
                <h4 className="text-base font-black text-slate-800 dark:text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                  {circle.name}
                </h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-[10px]">
                        <UserIcon size={12} className="text-primary/60" />
                        <span>{circle.teacher?.name || 'لم يتم تعيين معلم'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px]">
                        <MapPin size={11} className="text-slate-300" />
                        <span>{circle.location || 'قاعة بن خميس العامة'}</span>
                    </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center -space-x-1 rtl:space-x-reverse">
                    <div className="h-6 px-2 rounded-md bg-slate-50 dark:bg-white/5 text-[9px] font-black text-primary flex items-center border border-slate-100 dark:border-white/10">
                      {circle.enrollments_count} طالب
                    </div>
                </div>
                <Link 
                    to={`/circles/${circle.id}`}
                    className="flex items-center gap-1 text-[10px] font-black text-primary hover:gap-2 transition-all"
                >
                    عرض التفاصيل
                    <ChevronLeft size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-premium overflow-hidden border-none shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <table className="w-full text-right text-sm border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <th className="py-4 px-6 font-black text-slate-400 uppercase text-[9px] tracking-widest">اسم الحلقة</th>
                        <th className="py-4 px-6 font-black text-slate-400 uppercase text-[9px] tracking-widest">المعلم المشرف</th>
                        <th className="py-4 px-6 font-black text-slate-400 uppercase text-[9px] tracking-widest">الموقع</th>
                        <th className="py-4 px-6 font-black text-slate-400 uppercase text-[9px] tracking-widest text-center">الطلاب</th>
                        <th className="py-4 px-6 font-black text-slate-400 uppercase text-[9px] tracking-widest text-left">إدارة</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {filteredCircles.map(circle => (
                        <tr key={circle.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                    <span className="font-black text-slate-800 dark:text-white text-xs group-hover:text-primary transition-colors">{circle.name}</span>
                                </div>
                            </td>
                            <td className="py-4 px-6 font-bold text-slate-500 text-xs">{circle.teacher?.name || '-'}</td>
                            <td className="py-4 px-6 font-bold text-slate-400 text-[10px]">{circle.location}</td>
                            <td className="py-4 px-6 text-center">
                                <span className="bg-slate-50 dark:bg-white/5 text-slate-500 py-1 px-3 rounded-lg font-black text-[10px] border border-slate-100 dark:border-white/5">
                                    {circle.enrollments_count}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-left">
                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Link to={`/circles/${circle.id}/edit`} className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-all border border-slate-100 dark:border-white/5">
                                      <Settings size={14} />
                                  </Link>
                                  <Link to={`/circles/${circle.id}/edit`} className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-500 transition-all border border-slate-100 dark:border-white/5">
                                      <Edit3 size={14} />
                                  </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default CircleList;
