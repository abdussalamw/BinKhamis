import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import type { Circle, Student } from '../schema';
import { 
  Save, 
  Check, 
  X, 
  Clock, 
  UserCheck, 
  Smartphone,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  Users,
  UserMinus,
  Loader,
  Zap,
  Sparkles
} from 'lucide-react';

const AttendanceBoard: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Record<string, string>>>({});
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchCircles();
    generateDates();
  }, []);

  useEffect(() => {
    if (selectedCircle) {
      fetchCircleStudents();
    }
  }, [selectedCircle]);

  const generateDates = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    setDates(days);
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'student';

  const fetchCircles = async () => {
    try {
      const response = await axios.get('/circles');
      let data = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
      
      if (role === 'teacher' && user?.circle_id) {
        const teacherCircles = data.filter((c: any) => c.id === user.circle_id || c.teacher_id === user.id);
        if (teacherCircles.length > 0) {
          data = teacherCircles;
        }
      }
      
      setCircles(data);
      if (data.length > 0) {
        const defaultCircle = (role === 'teacher' && user?.circle_id) 
          ? data.find((c: any) => c.id === user.circle_id)?.id || data[0].id
          : data[0].id;
        setSelectedCircle(defaultCircle);
      }
    } catch (error) {
      console.error('Error fetching circles:', error);
    }
  };

  const fetchCircleStudents = async () => {
    if (!selectedCircle) return;
    setLoading(true);
    try {
      const response = await axios.get(`/circles/${selectedCircle}`);
      const rawEnrollments = response.data.enrollments || [];
      let studentList = rawEnrollments.map((e: any) => e.student).filter((s: any) => s && s.id);
      
      // Fallback: If no students enrolled in this circle, fetch students list from school
      if (studentList.length === 0) {
        const allStudentsRes = await axios.get('/students?per_page=100');
        const rawAll = allStudentsRes.data.data || allStudentsRes.data;
        studentList = Array.isArray(rawAll) ? rawAll : [];
      }

      setStudents(studentList);
      
      const attendanceRes = await axios.get(`/attendance/circle/${selectedCircle}`);
      const existingRecords = attendanceRes.data;
      
      const initial: Record<string, Record<string, string>> = {};
      studentList.forEach((s: Student) => {
        initial[s.id] = {};
        // Default today to present if not recorded yet
        dates.forEach(d => {
          initial[s.id][d] = 'present';
        });

        if (Array.isArray(existingRecords)) {
          existingRecords.forEach((rec: any) => {
            if (rec.student_id === s.id && rec.date) {
              const formattedDate = String(rec.date).split('T')[0];
              initial[s.id][formattedDate] = rec.status;
            }
          });
        }
      });
      setAttendance(initial);
    } catch (error) {
      console.error('Error fetching circle students:', error);
    } finally {
      setLoading(false);
    }
  };

  const setStudentStatus = (studentId: string, status: string, date: string = dates[selectedDateIndex]) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [date]: status
      }
    }));
  };

  const toggleStudentPresence = (studentId: string, date: string = dates[selectedDateIndex]) => {
    const current = attendance[studentId]?.[date];
    const newStatus = current === 'present' ? 'absent' : 'present';
    setStudentStatus(studentId, newStatus, date);
  };

  const markAllStatus = (status: string) => {
    const date = dates[selectedDateIndex];
    const newAttendance = { ...attendance };
    students.forEach(student => {
      if (!newAttendance[student.id]) newAttendance[student.id] = {};
      newAttendance[student.id][date] = status;
    });
    setAttendance(newAttendance);
  };

  const filteredStudents = students.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveAttendance = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const activeDate = dates[selectedDateIndex];
      const records = Object.entries(attendance).map(([studentId, dateObj]) => ({
        student_id: studentId,
        status: dateObj[activeDate] || 'present'
      }));

      await axios.post('/attendance', {
        circle_id: selectedCircle,
        date: activeDate,
        records,
        send_notifications: sendNotifications
      });

      setMessage({ type: 'success', text: `تم حفظ تحضير يوم (${activeDate}) بنجاح` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل حفظ التحضير، يرجى المحاولة مرة أخرى' });
    } finally {
      setSaving(false);
    }
  };

  const activeDate = dates[selectedDateIndex] || dates[0];
  const stats = {
    total: students.length,
    present: students.filter(s => attendance[s.id]?.[activeDate] === 'present').length,
    absent: students.filter(s => attendance[s.id]?.[activeDate] === 'absent').length,
    late: students.filter(s => attendance[s.id]?.[activeDate] === 'late').length,
    excused: students.filter(s => attendance[s.id]?.[activeDate] === 'excused').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
           
           {/* Left Info & Circle Selector */}
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
                  <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">سجل التحضير والغياب</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Circle Selector & Student Search */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <div className="relative">
                    <select
                      value={selectedCircle}
                      onChange={(e) => setSelectedCircle(e.target.value)}
                      disabled={role === 'teacher' && circles.length === 1}
                      className={`bg-transparent py-2.5 pr-3 pl-8 text-xs font-black text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer ${role === 'teacher' && circles.length === 1 ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {circles.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                 </div>
                 
                 <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

                 <div className="relative">
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="ابحث عن طالب..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-32 lg:w-44 bg-transparent py-2.5 pr-9 pl-3 text-xs font-bold outline-none border-none"
                    />
                 </div>
              </div>
           </div>

           {/* Right Actions */}
           <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <div className="flex items-center gap-1.5 px-2">
                    <Smartphone size={14} className={sendNotifications ? 'text-emerald-500' : 'text-slate-300'} />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">إشعار ولي الأمر</span>
                 </div>
                 <button 
                    onClick={() => setSendNotifications(!sendNotifications)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${sendNotifications ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                 >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${sendNotifications ? 'translate-x-5' : 'translate-x-1'}`} />
                 </button>
              </div>

              <button 
                onClick={saveAttendance}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-white text-xs font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                <span>حفظ بيانات اليوم</span>
              </button>
           </div>
        </div>
      </div>

      {/* Date Selector Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
        <span className="text-xs font-black text-slate-400 px-3 flex items-center gap-1.5">
           <Clock size={14} /> تاريـخ التحضير:
        </span>
        {dates.map((dateStr, idx) => {
          const d = new Date(dateStr);
          const isSelected = selectedDateIndex === idx;
          const isToday = idx === 0;
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDateIndex(idx)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all ${
                isSelected 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>{isToday ? 'اليوم' : d.toLocaleDateString('ar-SA', { weekday: 'short' })}</span>
              <span className="text-[10px] opacity-80">({d.getDate()} {d.toLocaleDateString('ar-SA', { month: 'short' })})</span>
            </button>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
         <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black"><Users size={18} /></div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase">إجمالي الطلاب</p>
               <p className="text-base font-black text-slate-800 dark:text-white">{stats.total}</p>
            </div>
         </div>

         <div className="bg-emerald-500/5 p-4 rounded-3xl border border-emerald-500/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black"><Check size={18} /></div>
            <div>
               <p className="text-[9px] font-black text-emerald-600/70 uppercase">الحاضرون</p>
               <p className="text-base font-black text-emerald-600">{stats.present}</p>
            </div>
         </div>

         <div className="bg-rose-500/5 p-4 rounded-3xl border border-rose-500/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 font-black"><X size={18} /></div>
            <div>
               <p className="text-[9px] font-black text-rose-600/70 uppercase">الغائبون</p>
               <p className="text-base font-black text-rose-600">{stats.absent}</p>
            </div>
         </div>

         <div className="bg-amber-500/5 p-4 rounded-3xl border border-amber-500/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-black"><Clock size={18} /></div>
            <div>
               <p className="text-[9px] font-black text-amber-600/70 uppercase">المتأخرون</p>
               <p className="text-base font-black text-amber-600">{stats.late}</p>
            </div>
         </div>

         <div className="bg-blue-500/5 p-4 rounded-3xl border border-blue-500/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-black"><UserCheck size={18} /></div>
            <div>
               <p className="text-[9px] font-black text-blue-600/70 uppercase">المستأذنون</p>
               <p className="text-base font-black text-blue-600">{stats.excused}</p>
            </div>
         </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-500 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-black text-xs">{message.text}</span>
        </div>
      )}

      {/* Bulk Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <span className="text-xs font-black text-slate-700 dark:text-slate-300">العمليات الجماعية:</span>
        <div className="flex flex-wrap items-center gap-2">
           <button 
             onClick={() => markAllStatus('present')}
             className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 font-black text-xs hover:bg-emerald-500 hover:text-white transition-all"
           >
             <Check size={14} /> تحديد الجميع كـ حاضر
           </button>
           <button 
             onClick={() => markAllStatus('absent')}
             className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 font-black text-xs hover:bg-rose-500 hover:text-white transition-all"
           >
             <X size={14} /> تحديد الجميع كـ غائب
           </button>
        </div>
      </div>

      {/* Main Student Attendance List */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
         {loading ? (
           <div className="py-24 text-center flex flex-col items-center gap-3">
              <Loader size={36} className="text-primary animate-spin" />
              <span className="font-black text-xs text-slate-400 animate-pulse">جاري تحميل قائمة الطلاب...</span>
           </div>
         ) : filteredStudents.length === 0 ? (
           <div className="py-24 text-center flex flex-col items-center gap-3 text-slate-400">
              <Search size={40} strokeWidth={1.5} />
              <p className="font-black text-sm">لم يتم العثور على طلاب بالحلقة المختارة</p>
           </div>
         ) : (
           <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => {
                const currentStatus = attendance[student.id]?.[activeDate] || 'present';
                return (
                  <div key={student.id} className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                     
                     {/* Student Info & Quick Attendance Toggle */}
                     <div className="flex items-center gap-4">
                        {/* Attendance Toggle Power Switch Button */}
                        <button
                           onClick={() => toggleStudentPresence(student.id)}
                           title={currentStatus === 'present' ? 'انقر للتحويل إلى غائب' : 'انقر للتحويل إلى حاضر'}
                           className={`h-11 w-11 rounded-2xl flex items-center justify-center font-black transition-all hover:scale-110 active:scale-95 shadow-sm ${
                              currentStatus === 'present' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                              currentStatus === 'absent' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                              currentStatus === 'late' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                              'bg-blue-500 text-white shadow-blue-500/20'
                           }`}
                        >
                           {currentStatus === 'present' && <Check size={20} strokeWidth={3} />}
                           {currentStatus === 'absent' && <X size={20} strokeWidth={3} />}
                           {currentStatus === 'late' && <Clock size={20} strokeWidth={3} />}
                           {currentStatus === 'excused' && <UserCheck size={20} strokeWidth={3} />}
                        </button>

                        <div>
                           <h3 className="font-black text-sm text-slate-800 dark:text-white leading-snug">{student.name}</h3>
                           <p className="text-[10px] font-bold text-slate-400">الهوية: {student.national_id || student.phone || 'مسجل بالحلقة'}</p>
                        </div>
                     </div>

                     {/* Status Selection Pill Buttons */}
                     <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setStudentStatus(student.id, 'present')}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                            currentStatus === 'present' 
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50'
                          }`}
                        >
                          🟢 حاضر
                        </button>

                        <button
                          onClick={() => setStudentStatus(student.id, 'absent')}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                            currentStatus === 'absent' 
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50'
                          }`}
                        >
                          🔴 غائب
                        </button>

                        <button
                          onClick={() => setStudentStatus(student.id, 'late')}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                            currentStatus === 'late' 
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50'
                          }`}
                        >
                          🟡 متأخر
                        </button>

                        <button
                          onClick={() => setStudentStatus(student.id, 'excused')}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                            currentStatus === 'excused' 
                              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-105' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50'
                          }`}
                        >
                          🔵 مستأذن
                        </button>
                     </div>

                  </div>
                );
              })}
           </div>
         )}
      </div>

   </div>
  );
};

export default AttendanceBoard;
