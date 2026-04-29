import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Users, User as UserIcon, MapPin, ChevronLeft, 
  LayoutGrid, List, Plus, Search, Filter,
  MoreHorizontal, Edit3, Settings
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

  const fetchCircles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/circles');
      setCircles(response.data);
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Compact Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">إدارة الحلقات</h1>
            <p className="text-sm font-bold text-slate-400">إجمالي {circles.length} حلقة تعليمية مسجلة</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
              >
                  <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
              >
                  <List size={18} />
              </button>
          </div>
          <button 
            onClick={() => navigate('/circles/new')}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            إضافة حلقة
          </button>
        </div>
      </div>

      {/* Compact Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="بحث باسم الحلقة أو المعلم..."
            className="w-full rounded-xl border-none bg-white dark:bg-slate-900 py-3 pr-11 pl-4 font-bold text-slate-700 dark:text-slate-200 outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <Filter size={16} className="text-slate-400" />
          <select 
            className="bg-transparent border-none outline-none font-bold text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          >
            <option value="">كل المواقع</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-black text-slate-400">جاري تحميل الحلقات...</span>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredCircles.map((circle) => (
            <div key={circle.id} className="bg-white dark:bg-slate-900 group p-6 rounded-[2rem] transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col h-full border border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <Users size={24} />
                </div>
                <div className={`h-2 w-2 rounded-full ${circle.is_active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-300'}`}></div>
              </div>

              <div className="flex-grow">
                <h4 className="text-xl font-black text-slate-800 dark:text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                  {circle.name}
                </h4>
                <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs">
                        <UserIcon size={14} className="text-primary" />
                        <span>{circle.teacher?.name || 'بدون معلم'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px]">
                        <MapPin size={12} className="text-slate-300" />
                        <span>{circle.location || 'قاعة عامة'}</span>
                    </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-primary font-black text-[10px]">
                  {circle.enrollments_count} طالب
                </div>
                <Link 
                    to={`/circles/${circle.id}`}
                    className="flex items-center gap-1 text-[11px] font-black text-primary hover:gap-2 transition-all"
                >
                    إدارة الحلقة
                    <ChevronLeft size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-right text-sm">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th className="py-5 px-6 font-black text-slate-500 uppercase text-[10px] tracking-wider">اسم الحلقة</th>
                        <th className="py-5 px-6 font-black text-slate-500 uppercase text-[10px] tracking-wider">المعلم</th>
                        <th className="py-5 px-6 font-black text-slate-500 uppercase text-[10px] tracking-wider">الموقع</th>
                        <th className="py-5 px-6 font-black text-slate-500 uppercase text-[10px] tracking-wider text-center">الطلاب</th>
                        <th className="py-5 px-6 font-black text-slate-500 uppercase text-[10px] tracking-wider text-left"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredCircles.map(circle => (
                        <tr key={circle.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-3 px-6 font-black text-slate-800 dark:text-white group-hover:text-primary">{circle.name}</td>
                            <td className="py-3 px-6 font-bold text-slate-500">{circle.teacher?.name || '-'}</td>
                            <td className="py-3 px-6 font-bold text-slate-400 text-xs">{circle.location}</td>
                            <td className="py-3 px-6 text-center">
                                <span className="bg-primary/5 text-primary py-1 px-3 rounded-lg font-black text-xs">
                                    {circle.enrollments_count}
                                </span>
                            </td>
                            <td className="py-3 px-6 text-left">
                                <div className="flex items-center justify-end gap-2">
                                  <Link to={`/circles/${circle.id}/edit`} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800">
                                      <Settings size={14} />
                                  </Link>
                                  <Link to={`/circles/${circle.id}/edit`} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white transition-all dark:bg-slate-800">
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
