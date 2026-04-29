import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { 
  Search, Filter, MoreHorizontal, Eye, Edit3, 
  UserPlus, FileDown, UserCheck, Users, 
  MapPin, GraduationCap, X, ChevronDown
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
  enrollments_count?: number; // Added to check if enrolled
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
    only_enrolled: true, // Default to currently enrolled
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/students');
      setStudents(response.data);
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header Section - More Compact */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">إدارة الطلاب</h1>
            <p className="text-sm font-bold text-slate-400">إجمالي {filteredStudents.length} طالباً مطابقاً للبحث</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 font-bold transition-all ${showFilters ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            <Filter size={18} />
            تصفية متقدمة
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 transition-all">
            <FileDown size={18} />
            تصدير
          </button>
          <button 
            onClick={() => navigate('/students/new')}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus size={18} />
            إضافة طالب
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="glass-card p-6 rounded-[2rem] grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
          <FilterSelect 
            label="المرحلة" 
            icon={<GraduationCap size={16}/>}
            value={filters.academic_stage} 
            options={['ابتدائي', 'متوسط', 'ثانوي', 'جامعي']}
            onChange={(val) => setFilters({...filters, academic_stage: val})}
          />
          <FilterSelect 
            label="البرنامج" 
            icon={<Award size={16}/>}
            value={filters.program} 
            options={['الصفوة', 'تميز', 'إبداع']}
            onChange={(val) => setFilters({...filters, program: val})}
          />
          <FilterSelect 
            label="الحي" 
            icon={<MapPin size={16}/>}
            value={filters.neighborhood} 
            options={Array.from(new Set(students.map(s => s.profile?.neighborhood).filter(Boolean)))}
            onChange={(val) => setFilters({...filters, neighborhood: val})}
          />
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">حالة الالتحاق</label>
            <button 
              onClick={() => setFilters({...filters, only_enrolled: !filters.only_enrolled})}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all border ${filters.only_enrolled ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
            >
              <span className="flex items-center gap-2">
                <UserCheck size={18} />
                الملتحقون حالياً
              </span>
              <div className={`w-4 h-4 rounded-full border-2 ${filters.only_enrolled ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}></div>
            </button>
          </div>
        </div>
      )}

      {/* Compact Search Bar */}
      <div className="relative group max-w-2xl">
        <input
          type="text"
          placeholder="بحث سريع بالاسم أو رقم الهوية..."
          className="w-full rounded-2xl border-none bg-white dark:bg-slate-900 py-4 pr-12 pl-6 font-bold text-slate-700 dark:text-slate-200 outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm group-hover:shadow-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
      </div>

      {/* Compact Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 px-6 font-black text-slate-500 uppercase text-[11px] tracking-widest">الطالب</th>
                <th className="py-4 px-6 font-black text-slate-500 uppercase text-[11px] tracking-widest">المرحلة / الصف</th>
                <th className="py-4 px-6 font-black text-slate-500 uppercase text-[11px] tracking-widest">البرنامج</th>
                <th className="py-4 px-6 font-black text-slate-500 uppercase text-[11px] tracking-widest">الحالة</th>
                <th className="py-4 px-6 font-black text-slate-500 uppercase text-[11px] tracking-widest text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="inline-block h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Users size={48} />
                      <p className="font-black">لا يوجد طلاب يطابقون هذه الفلاتر</p>
                      <button 
                        onClick={() => setFilters({ academic_stage: '', grade_level: '', program: '', neighborhood: '', only_enrolled: false })}
                        className="text-primary text-sm font-bold hover:underline"
                      >
                        إعادة تعيين الكل
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary text-sm shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                            {(student.name || '?').charAt(0)}
                        </div>
                        <div>
                            <h5 className="font-black text-slate-800 dark:text-white text-sm leading-tight">{student.name}</h5>
                            <p className="text-[10px] font-bold text-slate-400">{student.profile?.national_id || 'بدون هوية'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{student.profile?.academic_stage || 'غير محدد'}</span>
                        <span className="text-[10px] font-bold text-slate-400">{student.profile?.grade_level || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex rounded-lg bg-primary/5 py-1 px-3 text-[10px] font-black text-primary border border-primary/10">
                        {student.profile?.program || 'عام'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      {student.enrollments_count && student.enrollments_count > 0 ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg w-fit">
                          <UserCheck size={12} />
                          ملتحق
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-400/10 px-2 py-1 rounded-lg w-fit">
                          <X size={12} />
                          غير مسكن
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/students/${student.id}`} 
                          title="عرض الملف"
                          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800"
                        >
                            <Eye size={16} />
                        </Link>
                        <button 
                          onClick={() => navigate(`/students/${student.id}/edit`)}
                          title="تعديل"
                          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white transition-all dark:bg-slate-800"
                        >
                            <Edit3 size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-200 transition-all dark:bg-slate-800">
                            <MoreHorizontal size={16} />
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
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">{label}</label>
    <div className="relative">
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {icon}
      </div>
      <select
        className="w-full appearance-none rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 pr-10 pl-4 font-bold text-slate-700 dark:text-slate-300 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">الكل</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
    </div>
  </div>
);

const Award: React.FC<{size?: number, className?: string}> = ({size=18, className=""}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

export default StudentList;
