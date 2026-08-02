import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { 
  Search, Filter, MoreHorizontal, Eye, Edit, 
  UserPlus, FileDown, UserCheck, Users, 
  MapPin, GraduationCap, ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface StudentData {
  id: string;
  name: string;
  phone: string;
  profile: {
    national_id: string | null;
    academic_stage: string | null;
    grade_level: string | null;
    program: string | null;
    neighborhood: string | null;
  } | null;
  enrollments_count?: number; 
}

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    academic_stage: '',
    grade_level: '',
    program: '',
    neighborhood: '',
    only_enrolled: true, 
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'student';

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/students');
      let data = response.data;
      
      if (role === 'teacher' && user?.circle_id) {
        data = data.filter((s: any) => s.enrollments?.some((e: any) => e.circle_id === user.circle_id));
      } else if (role === 'supervisor' && user?.allowed_circles?.length > 0) {
        data = data.filter((s: any) => s.enrollments?.some((e: any) => user.allowed_circles.includes(e.circle_id)));
      }
      
      const mappedData = data.map((s: any) => ({
        ...s,
        profile: s.student_profile || s.active_profile || s.profile || {}
      }));
      
      setStudents(mappedData);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = (students || []).filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.profile?.national_id?.includes(searchTerm));
    
    const matchesStage = !filters.academic_stage || student.profile?.academic_stage === filters.academic_stage;
    const matchesGrade = !filters.grade_level || student.profile?.grade_level === filters.grade_level;
    const matchesProgram = !filters.program || student.profile?.program === filters.program;
    const matchesNeighborhood = !filters.neighborhood || student.profile?.neighborhood === filters.neighborhood;
    const matchesEnrolled = !filters.only_enrolled || (student.enrollments_count && student.enrollments_count > 0);

    return matchesSearch && matchesStage && matchesGrade && matchesProgram && matchesNeighborhood && matchesEnrolled;
  });

  return (
    <div className="space-y-4 animate-in fade-in zoom-in duration-700 pb-10">
      {/* Dynamic Header */}
      <div className="glass-card-premium p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-visible rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="relative group">
              <div className="absolute -inset-1 bg-primary/20 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-sm transform group-hover:rotate-3 transition-transform">
                <Users size={20} className="text-white" />
              </div>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                إدارة الطلاب
                <div className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase">Active</div>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">إجمالي {filteredStudents.length} طالباً في النظام حالياً</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`group flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black transition-all ${showFilters ? 'bg-primary text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-400'}`}
          >
            <Filter size={14} className={showFilters ? 'animate-pulse' : ''} />
            تصفية
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-500 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-400 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
            <FileDown size={14} />
            تصدير
          </button>
          <button 
            onClick={() => navigate('/students/new')}
            className="group relative flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[10px] font-black text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <UserPlus size={14} />
            إضافة طالب
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="glass-card-premium p-4 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-500 overflow-visible rounded-2xl">
          <FilterSelect 
            label="المرحلة التعليمية" 
            icon={<GraduationCap size={14} className="text-primary"/>}
            value={filters.academic_stage} 
            options={['ابتدائي', 'متوسط', 'ثانوي', 'جامعي']}
            onChange={(val) => setFilters({...filters, academic_stage: val})}
          />
          <FilterSelect 
            label="نوع البرنامج" 
            icon={<Award size={14} className="text-secondary"/>}
            value={filters.program} 
            options={['الصفوة', 'تميز', 'إبداع']}
            onChange={(val) => setFilters({...filters, program: val})}
          />
          <FilterSelect 
            label="الحي السكني" 
            icon={<MapPin size={14} className="text-emerald-500"/>}
            value={filters.neighborhood} 
            options={Array.from(new Set(students.map(s => s.profile?.neighborhood).filter(Boolean))) as string[]}
            onChange={(val) => setFilters({...filters, neighborhood: val})}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">حالة الالتحاق</label>
            <button 
              onClick={() => setFilters({...filters, only_enrolled: !filters.only_enrolled})}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-black transition-all border ${filters.only_enrolled ? 'bg-emerald-50/50 border-emerald-200/50 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-slate-50 border-transparent text-slate-400 dark:bg-white/5'}`}
            >
              <span className="flex items-center gap-1.5">
                <UserCheck size={14} />
                الملتحقون حالياً
              </span>
              <div className={`w-2.5 h-2.5 rounded-full border-2 ${filters.only_enrolled ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}></div>
            </button>
          </div>
        </div>
      )}

      {/* Modern Search Control */}
      <div className="relative group max-w-lg px-1">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-0 group-focus-within:opacity-10 transition duration-1000"></div>
        <div className="relative">
            <input
              type="text"
              placeholder="ابحث بالاسم أو رقم الهوية..."
              className="w-full rounded-xl border-none bg-white dark:bg-midnight py-2.5 pr-10 pl-4 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none ring-1 ring-slate-100 dark:ring-white/5 focus:ring-primary/20 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
        </div>
      </div>

      {/* Premium Data Table */}
      <div className="glass-card-premium overflow-hidden border-none shadow-sm dark:shadow-none rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th className="py-3 px-4 font-black text-slate-400 uppercase text-[9px] tracking-wider">بيانات الطالب</th>
                <th className="py-3 px-4 font-black text-slate-400 uppercase text-[9px] tracking-wider">المستوى التعليمي</th>
                <th className="py-3 px-4 font-black text-slate-400 uppercase text-[9px] tracking-wider">المسار</th>
                <th className="py-3 px-4 font-black text-slate-400 uppercase text-[9px] tracking-wider">حالة القيد</th>
                <th className="py-3 px-4 font-black text-slate-400 uppercase text-[9px] tracking-wider text-left">إدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="relative inline-flex h-8 w-8">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300">
                          <Users size={24} />
                      </div>
                      <div>
                          <p className="font-black text-slate-400 text-xs">لم يتم العثور على نتائج</p>
                          <button 
                            onClick={() => setFilters({ academic_stage: '', grade_level: '', program: '', neighborhood: '', only_enrolled: false })}
                            className="mt-1 text-primary text-[10px] font-black hover:underline"
                          >
                            إعادة تعيين المرشحات
                          </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary text-[10px] shadow-inner group-hover:scale-105 transition-all">
                                {(student.name || '?').charAt(0)}
                            </div>
                        </div>
                        <div>
                            <h5 className="font-black text-slate-800 dark:text-white text-[11px] group-hover:text-primary transition-colors">{student.name}</h5>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-wider">{student.profile?.national_id || 'ID UNKNOWN'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{student.profile?.academic_stage || 'عام'}</span>
                        <span className="text-[9px] font-bold text-slate-400">{student.profile?.grade_level || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex rounded-lg bg-slate-50 dark:bg-white/5 py-1 px-2.5 text-[9px] font-black text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5">
                        {student.profile?.program || 'برنامج عام'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {student.enrollments_count && student.enrollments_count > 0 ? (
                        <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          نشط حالياً
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-300">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                          غير ملتحق
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/students/${student.id}`} 
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-primary hover:shadow-sm transition-all border border-slate-100 dark:border-white/5"
                        >
                            <Eye size={12} />
                        </Link>
                        <button 
                          onClick={() => navigate(`/students/${student.id}/edit`)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-500 hover:shadow-sm transition-all border border-slate-100 dark:border-white/5"
                        >
                            <Edit size={12} />
                        </button>
                        <button className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 hover:shadow-sm transition-all border border-slate-100 dark:border-white/5">
                            <MoreHorizontal size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, icon, value, options, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider mr-2">{label}</label>
    <div className="relative">
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {icon}
      </div>
      <select
        className="w-full appearance-none rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 pr-9 pl-3 font-bold text-slate-700 dark:text-slate-300 text-[10px] outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">الكل</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
    </div>
  </div>
);

const Award: React.FC<{size?: number, className?: string}> = ({size=16, className=""}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

export default StudentList;
