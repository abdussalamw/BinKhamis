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
  Clock3
} from 'lucide-react';

const AttendanceBoard: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Record<string, string>>>({});
  const [dates, setDates] = useState<string[]>([]);
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
    for (let i = 0; i < 4; i++) { // Even more compact: 4 days
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
      let data = response.data.data || response.data;
      
      // Frontend restriction for Teacher/Supervisor if backend isn't filtering yet
      if (role === 'teacher' && user?.circle_id) {
        data = data.filter((c: any) => c.id === user.circle_id);
      } else if (role === 'supervisor' && user?.allowed_circles?.length > 0) {
        data = data.filter((c: any) => user.allowed_circles.includes(c.id));
      }
      
      setCircles(data);
      if (data.length > 0) {
        // If teacher, auto-select their circle
        const defaultCircle = (role === 'teacher' && user?.circle_id) 
          ? data.find((c: any) => c.id === user.circle_id)?.id || data[0].id
          : data[0].id;
        setSelectedCircle(defaultCircle);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCircleStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/circles/${selectedCircle}`);
      const studentList = response.data.enrollments?.map((e: any) => e.student) || response.data.students || [];
      setStudents(studentList);
      
      const attendanceRes = await axios.get(`/attendance/circle/${selectedCircle}`);
      const existingRecords = attendanceRes.data;
      
      const initial: Record<string, Record<string, string>> = {};
      studentList.forEach((s: Student) => {
        initial[s.id] = {};
        existingRecords.forEach((rec: any) => {
          if (rec.student_id === s.id) {
            initial[s.id][rec.date] = rec.status;
          }
        });
      });
      setAttendance(initial);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId: string, date: string) => {
    const current = attendance[studentId]?.[date];
    const sequence = [null, 'present', 'absent', 'late', 'excused'];
    const nextIndex = (sequence.indexOf(current as any) + 1) % sequence.length;
    const nextStatus = sequence[nextIndex];

    setAttendance({
      ...attendance,
      [studentId]: { ...attendance[studentId], [date]: nextStatus as string },
    });
  };

  const markAllPresent = () => {
    const today = dates[0];
    const newAttendance = { ...attendance };
    students.forEach(student => {
      if (!newAttendance[student.id]) newAttendance[student.id] = {};
      newAttendance[student.id][today] = 'present';
    });
    setAttendance(newAttendance);
  };

  const filteredStudents = students.filter(s => 
    (s.full_name || (s as any).name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveAttendance = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const today = dates[0];
      const records = Object.entries(attendance).map(([studentId, dates]) => ({
        student_id: studentId,
        status: dates[today] || 'present'
      }));

      await axios.post('/attendance', {
        circle_id: selectedCircle,
        date: today,
        records,
        send_notifications: sendNotifications
      });

      setMessage({ type: 'success', text: 'تم حفظ التحضير بنجاح' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل حفظ التحضير' });
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status: string | null) => {
    switch (status) {
      case 'present': return { color: 'bg-emerald-500', icon: <Check size={10} strokeWidth={4} /> };
      case 'absent': return { color: 'bg-danger', icon: <X size={10} strokeWidth={4} /> };
      case 'late': return { color: 'bg-amber-500', icon: <Clock size={10} strokeWidth={4} /> };
      case 'excused': return { color: 'bg-blue-500', icon: <UserCheck size={10} strokeWidth={4} /> };
      default: return { color: 'bg-slate-50 dark:bg-slate-800/50', icon: null };
    }
  };

  // Quick Stats
  const today = dates[0];
  const stats = {
    total: students.length,
    present: Object.values(attendance).filter(d => d[today] === 'present').length,
    absent: Object.values(attendance).filter(d => d[today] === 'absent').length,
    late: Object.values(attendance).filter(d => d[today] === 'late').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-500 pb-10">
      
      {/* Dense Premium Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
           {/* Left: Title & Search */}
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shrink-0">
                  <CheckCircle2 size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-800 dark:text-white leading-tight">تحضير اليوم</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <div className="relative">
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="ابحث عن طالب..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-32 lg:w-48 bg-transparent py-2.5 pr-9 pl-3 text-xs font-bold outline-none border-none"
                    />
                 </div>
                 <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
                 <div className="relative">
                    <select
                      value={selectedCircle}
                      onChange={(e) => setSelectedCircle(e.target.value)}
                      disabled={role === 'teacher' && circles.length === 1}
                      className={`bg-transparent py-2.5 pr-3 pl-8 text-xs font-black text-slate-600 dark:text-slate-300 outline-none appearance-none cursor-pointer ${role === 'teacher' && circles.length === 1 ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {circles.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                 </div>
              </div>
           </div>

           {/* Right: Actions */}
           <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <div className="flex items-center gap-1.5 px-2">
                    <Smartphone size={14} className={sendNotifications ? 'text-emerald-500' : 'text-slate-300'} />
                    <span className="text-[10px] font-black text-slate-500">إشعار</span>
                 </div>
                 <button 
                    onClick={() => setSendNotifications(!sendNotifications)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${sendNotifications ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                 >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${sendNotifications ? 'translate-x-5' : 'translate-x-1'}`} />
                 </button>
              </div>

              <button 
                onClick={markAllPresent}
                className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black border border-slate-100 dark:border-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                تحضير الجميع
              </button>

              <button 
                onClick={saveAttendance}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white text-xs font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>حفظ التحضير</span>
              </button>
           </div>
        </div>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400"><Users size={20} /></div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">إجمالي الطلاب</p>
               <p className="text-lg font-black text-slate-800 dark:text-white">{stats.total}</p>
            </div>
         </div>
         <div className="bg-emerald-500/5 p-4 rounded-3xl border border-emerald-500/10 flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={20} /></div>
            <div>
               <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-tighter">الحاضرون</p>
               <p className="text-lg font-black text-emerald-600">{stats.present}</p>
            </div>
         </div>
         <div className="bg-danger/5 p-4 rounded-3xl border border-danger/10 flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-danger/10 flex items-center justify-center text-danger"><UserMinus size={20} /></div>
            <div>
               <p className="text-[9px] font-black text-danger/60 uppercase tracking-tighter">الغائبون</p>
               <p className="text-lg font-black text-danger">{stats.absent}</p>
            </div>
         </div>
         <div className="bg-amber-500/5 p-4 rounded-3xl border border-amber-500/10 flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Clock3 size={20} /></div>
            <div>
               <p className="text-[9px] font-black text-amber-600/60 uppercase tracking-tighter">المتأخرون</p>
               <p className="text-lg font-black text-amber-600">{stats.late}</p>
            </div>
         </div>
      </div>

      {message && (
        <div className={`p-3.5 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-500 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10' : 'bg-danger/10 text-danger border border-danger/10'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="font-black text-xs">{message.text}</span>
        </div>
      )}

      {/* Modern Dense Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-5 px-8 text-right font-black text-slate-400 text-[10px] uppercase tracking-wider sticky right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 border-l border-slate-50 dark:border-slate-800">بيانات الطالب</th>
                {dates.map((date, idx) => {
                  const d = new Date(date);
                  const isToday = idx === 0;
                  return (
                    <th key={date} className={`py-3 px-3 text-center min-w-[75px] ${isToday ? 'bg-primary/5' : ''}`}>
                      <div className={`text-[9px] font-black uppercase mb-1 ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                        {isToday ? 'اليوم' : d.toLocaleDateString('ar-SA', { weekday: 'short' })}
                      </div>
                      <div className={`text-base font-black leading-none ${isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{d.getDate()}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={dates.length + 1} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="text-primary animate-spin" />
                        <span className="font-black text-slate-300 text-[10px] uppercase tracking-widest">جاري سحب البيانات...</span>
                    </div>
                </td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={dates.length + 1} className="py-24 text-center">
                   <div className="flex flex-col items-center gap-2 text-slate-300">
                      <Search size={48} strokeWidth={1} />
                      <p className="font-black text-xs uppercase">لم يتم العثور على طلاب</p>
                   </div>
                </td></tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors group">
                    <td className="py-4 px-8 sticky right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 border-l border-slate-50 dark:border-slate-800">
                       <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-primary transition-colors">
                             {(student.full_name || (student as any).name || '?').charAt(0)}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{student.full_name || (student as any).name}</span>
                             <span className="text-[9px] font-bold text-slate-400">ID: #{(student.id as string).substring(0, 6)}</span>
                          </div>
                       </div>
                    </td>
                    {dates.map((date, idx) => {
                      const config = getStatusConfig(attendance[student.id]?.[date] || null);
                      const isToday = idx === 0;
                      return (
                        <td key={date} className={`py-3 px-3 text-center ${isToday ? 'bg-primary/5' : ''}`}>
                          <button
                            onClick={() => toggleStatus(student.id, date)}
                            className={`mx-auto w-9 h-9 rounded-[1.1rem] flex items-center justify-center transition-all transform active:scale-90 hover:scale-105 ${config.color} ${attendance[student.id]?.[date] ? 'text-white shadow-lg' : 'opacity-20 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            style={{ boxShadow: attendance[student.id]?.[date] ? `0 8px 15px -4px ${config.color.includes('emerald') ? 'rgba(16,185,129,0.4)' : config.color.includes('danger') ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}` : 'none' }}
                          >
                            {config.icon || <span className="text-slate-300 font-black text-lg">.</span>}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Dense Legend */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-8">
        {[
          { color: 'bg-emerald-500', icon: Check, label: 'حاضر' },
          { color: 'bg-danger', icon: X, label: 'غائب' },
          { color: 'bg-amber-500', icon: Clock, label: 'متأخر' },
          { color: 'bg-blue-500', icon: UserCheck, label: 'مستأذن' }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-lg ${item.color} flex items-center justify-center text-white`}><item.icon size={10} strokeWidth={4} /></div>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceBoard;
