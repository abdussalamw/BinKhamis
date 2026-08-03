import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { 
  Search, Filter, MoreHorizontal, Eye, Edit, 
  UserPlus, FileDown, UserCheck, Users, 
  MapPin, GraduationCap, ChevronDown, UserX, Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface StudentData {
  id: string;
  name: string;
  phone: string;
  profile: {
    national_id?: string | null;
    identity_number?: string | null;
    passport_number?: string | null;
    identity_type?: string | null;
    status?: string | null;
    academic_stage?: string | null;
    grade_level?: string | null;
    program?: string | null;
    current_level?: string | null;
    neighborhood?: string | null;
    guardian?: {
      full_name?: string | null;
      phone_number?: string | null;
      relation?: string | null;
    } | null;
  } | null;
  enrollments_count?: number; 
  enrollments?: any[];
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
    status: '',
    only_enrolled: false, 
  });
  // FIX: add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage]);

  let user: any = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}
  const role = user?.role || 'student';

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      // FIX: use server-side pagination, removed client-side circle_id/allowed_circles filtering
      const response = await axios.get(`/students?per_page=50&page=${page}`);
      const rawData = response.data;
      let data = rawData.data || (Array.isArray(rawData) ? rawData : []);
      
      // FIX: set pagination metadata
      if (rawData.current_page) {
        setCurrentPage(rawData.current_page);
        setLastPage(rawData.last_page || 1);
        setTotal(rawData.total || data.length);
      }
      
      // Data comes directly from users table — no profile mapping needed
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = (students || []).filter((student: any) => {
    const idNum = String(student.national_id || student.passport_number || '');
    const guardianPhone = String(student.guardian?.phone_number || '');
    const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (idNum.length > 0 && idNum.includes(searchTerm)) ||
                         (guardianPhone.length > 0 && guardianPhone.includes(searchTerm));
    
    const matchesStage = !filters.academic_stage || student.academic_stage === filters.academic_stage;
    const matchesGrade = !filters.grade_level || student.grade_level === filters.grade_level;
    const matchesProgram = !filters.program || student.memorization_amount === filters.program;
    const matchesNeighborhood = !filters.neighborhood || student.neighborhood === filters.neighborhood;
    const matchesStatus = !filters.status || (student.status || 'active') === filters.status;
    const matchesEnrolled = !filters.only_enrolled || (student.enrollments_count && student.enrollments_count > 0);

    return matchesSearch && matchesStage && matchesGrade && matchesProgram && matchesNeighborhood && matchesStatus && matchesEnrolled;
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
                <div className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase">
                  {students.length} طالب
                </div>
            </h1>
            <p className="text-xs font-bold text-slate-400">إدارة ملفات الطلاب وسجلات تسجيلهم وأولياء أمورهم</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
              showFilters ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Filter size={14} />
            <span>فلترة</span>
          </button>

          <button 
            onClick={() => navigate('/students/new')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all"
          >
            <UserPlus size={14} />
            <span>إضافة طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="glass-card p-4 rounded-2xl grid grid-cols-2 md:grid-cols-5 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <label className="text-[10px] font-black text-slate-400 mb-1 block">المرحلة الدراسية</label>
            <select 
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border-none outline-none"
              value={filters.academic_stage}
              onChange={e => setFilters({...filters, academic_stage: e.target.value})}
            >
              <option value="">جميع المراحل</option>
              <option value="الابتدائية">الابتدائية</option>
              <option value="المتوسطة">المتوسطة</option>
              <option value="الثانوية">الثانوية</option>
              <option value="الجامعية">الجامعية</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 mb-1 block">حالة القيد</label>
            <select 
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border-none outline-none"
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value})}
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="discontinued">منقطع</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 mb-1 block">الحي السكني</label>
            <input 
              type="text" 
              placeholder="تصفية حسب الحي..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border-none outline-none"
              value={filters.neighborhood}
              onChange={e => setFilters({...filters, neighborhood: e.target.value})}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer pb-2">
              <input 
                type="checkbox" 
                className="rounded text-primary focus:ring-primary h-4 w-4"
                checked={filters.only_enrolled}
                onChange={e => setFilters({...filters, only_enrolled: e.target.checked})}
              />
              <span>الملتحقين بالحلقات فقط</span>
            </label>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ academic_stage: '', grade_level: '', program: '', neighborhood: '', status: '', only_enrolled: false })}
              className="w-full p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-black text-slate-600 dark:text-slate-200 hover:bg-slate-300 transition-all"
            >
              إعادة تعيين
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="ابحث باسم الطالب، رقم الهوية/الإقامة/الجواز، أو رقم ولي الأمر..."
          className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-xs outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Students Table */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4">الطالب والهوية</th>
                <th className="py-4 px-4">المرحلة والصف</th>
                <th className="py-4 px-4">ولي الأمر</th>
                <th className="py-4 px-4">الحلقة الحالية</th>
                <th className="py-4 px-4">الحالة</th>
                <th className="py-4 px-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="relative inline-flex h-8 w-8">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300">
                          <Users size={24} />
                      </div>
                      <div>
                          <p className="font-black text-slate-400 text-xs">لم يتم العثور على نتائج للبحث</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student: any) => {
                  const nationalId = student.profile?.national_id || student.profile?.passport_number || student.profile?.identity_number || student.national_id || 'غير مسجل';
                  const circleName = student.enrollments?.[0]?.circle?.name;
                  const isEnrolled = (student.enrollments_count && student.enrollments_count > 0) || !!circleName;
                  const isDiscontinued = student.profile?.status === 'discontinued';
                  const guardian = student.profile?.guardian;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center font-black text-primary text-xs shadow-inner">
                              {(student.name || '?').charAt(0)}
                          </div>
                          <div>
                              <h5 className="font-black text-slate-800 dark:text-white text-[11px] group-hover:text-primary transition-colors">{student.name}</h5>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-wider">
                                {student.profile?.identity_type === 'passport' ? 'الجواز' : 'الهوية'}: {nationalId}
                              </p>
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
                        {guardian || student.secondary_guardian || student.profile?.secondary_guardian ? (
                          <div className="flex flex-col text-[10px]">
                            {guardian && (
                              <div>
                                <span className="font-black text-slate-700 dark:text-slate-300">{guardian.full_name} ({guardian.relation || 'ولي أمر'})</span>
                                <p className="text-[9px] text-teal-600 dark:text-teal-400 font-mono" dir="ltr">{guardian.phone_number}</p>
                              </div>
                            )}
                            {(student.secondary_guardian || student.profile?.secondary_guardian) && (
                              <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-slate-500">{(student.secondary_guardian || student.profile?.secondary_guardian).full_name} ({(student.secondary_guardian || student.profile?.secondary_guardian).relation || 'ولي أمر 2'})</span>
                                <p className="text-[9px] text-cyan-600 dark:text-cyan-400 font-mono" dir="ltr">{(student.secondary_guardian || student.profile?.secondary_guardian).phone_number}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400">غير مسجل</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEnrolled ? (
                          <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg w-fit">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span>{circleName ? circleName : 'ملتحق بحلقة'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg w-fit">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                            <span>غير مسكن</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isDiscontinued ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black bg-rose-50 dark:bg-rose-500/10 text-rose-600">
                            <UserX size={10} />
                            <span>منقطع</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
                            <Activity size={10} />
                            <span>نشط</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link 
                            to={`/students/${student.id}`} 
                            title="عرض ملف الطالب"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/10 transition-all"
                          >
                            <Eye size={15} />
                          </Link>
                          <button 
                            onClick={() => navigate(`/students/${student.id}/edit`)}
                            title="تعديل بيانات الطالب"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                          >
                            <Edit size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FIX: Pagination Controls */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between px-4 py-3 glass-card rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400">
            إجمالي {total} طالب - صفحة {currentPage} من {lastPage}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-all"
            >
              السابق
            </button>
            <span className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-black">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
              disabled={currentPage === lastPage}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-all"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
