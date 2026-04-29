import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import type { Circle, Student } from '../schema';
import { 
  Calendar as CalendarIcon, 
  Save, 
  Check, 
  X, 
  Clock, 
  UserCheck, 
  BookOpen, 
  Smartphone,
  AlertCircle
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
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    setDates(days);
  };

  const fetchCircles = async () => {
    try {
      const response = await axios.get('/circles');
      const data = response.data.data || response.data;
      setCircles(data);
      if (data.length > 0) setSelectedCircle(data[0].id);
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
      
      // Fetch existing attendance for this circle
      const attendanceRes = await axios.get(`/attendance/circle/${selectedCircle}`);
      const existingRecords = attendanceRes.data;
      
      const initial: Record<string, Record<string, string>> = {};
      studentList.forEach((s: Student) => {
        initial[s.id] = {};
        // Map existing records
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

  const saveAttendance = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const records = Object.entries(attendance).map(([studentId, dates]) => ({
        student_id: studentId,
        status: dates[today] || 'present' // Default to present if not marked
      }));

      await axios.post('/attendance', {
        circle_id: selectedCircle,
        date: today,
        records,
        send_notifications: sendNotifications
      });

      setMessage({ type: 'success', text: 'تم حفظ التحضير وإرسال التنبيهات بنجاح' });
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل حفظ التحضير. تأكد من اتصال السيرفر' });
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status: string | null) => {
    switch (status) {
      case 'present': return { color: 'bg-emerald-500', icon: <Check size={16} />, label: 'حاضر' };
      case 'absent': return { color: 'bg-danger', icon: <X size={16} />, label: 'غائب' };
      case 'late': return { color: 'bg-amber-500', icon: <Clock size={16} />, label: 'متأخر' };
      case 'excused': return { color: 'bg-blue-500', icon: <UserCheck size={16} />, label: 'مستأذن' };
      default: return { color: 'bg-slate-100 dark:bg-slate-800', icon: null, label: '-' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white">لوحة التحضير الذكية</h1>
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400">سجل حضور طلاب حلقة بن خميس وفعل التنبيهات</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
             <div className={`p-2 rounded-xl transition-all ${sendNotifications ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}>
                <Smartphone size={20} />
             </div>
             <span className="text-sm font-black text-slate-700 dark:text-slate-300">تنبيهات الواتساب</span>
             <button 
                onClick={() => setSendNotifications(!sendNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sendNotifications ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
             >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${sendNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
          </div>

          <div className="relative">
              <select
                className="appearance-none rounded-2xl border-none bg-white py-4 pr-12 pl-10 font-black text-slate-700 shadow-xl shadow-slate-200/50 outline-none ring-2 ring-transparent transition-all focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-300 dark:shadow-none"
                value={selectedCircle}
                onChange={(e) => setSelectedCircle(e.target.value)}
              >
                {circles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                  <BookOpen size={22} />
              </div>
          </div>

          <button 
            onClick={saveAttendance}
            disabled={saving}
            className="flex items-center gap-3 rounded-2xl bg-primary px-10 py-4 font-black text-white shadow-xl shadow-primary/30 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {saving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <Save size={22} />}
            حفظ وإرسال
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-[24px] flex items-center gap-4 animate-in slide-in-from-top duration-500 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200' : 'bg-danger/10 text-danger border border-danger/20'}`}>
            {message.type === 'success' ? <Check size={24} /> : <AlertCircle size={24} />}
            <span className="font-black text-lg">{message.text}</span>
        </div>
      )}

      <div className="glass-card rounded-[40px] overflow-hidden shadow-2xl">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="min-w-[300px] py-8 px-10 text-right font-black text-slate-800 dark:text-white sticky right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 border-l border-slate-100 dark:border-slate-800">اسم الطالب</th>
                {dates.map((date, idx) => {
                  const d = new Date(date);
                  const isToday = idx === 0;
                  return (
                    <th key={date} className={`py-6 px-4 text-center min-w-[120px] ${isToday ? 'bg-primary/5' : ''}`}>
                      <div className={`text-xs font-black uppercase mb-1 ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                        {isToday ? 'اليوم' : d.toLocaleDateString('ar-SA', { weekday: 'short' })}
                      </div>
                      <div className={`text-2xl font-black ${isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{d.getDate()}</div>
                      <div className="text-[11px] font-bold text-slate-400">{d.toLocaleDateString('ar-SA', { month: 'short' })}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={dates.length + 1} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <span className="font-black text-slate-400">جاري جلب قائمة الطلاب والسجلات...</span>
                    </div>
                </td></tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="py-6 px-10 font-black text-slate-700 dark:text-slate-300 sticky right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 border-l border-slate-100 dark:border-slate-800 group-hover:text-primary transition-colors text-lg">
                      {student.full_name || (student as any).name}
                    </td>
                    {dates.map((date, idx) => {
                      const config = getStatusConfig(attendance[student.id]?.[date] || null);
                      const isToday = idx === 0;
                      return (
                        <td key={date} className={`py-5 px-4 text-center ${isToday ? 'bg-primary/5' : ''}`}>
                          <button
                            onClick={() => toggleStatus(student.id, date)}
                            className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 transform active:scale-90 hover:shadow-xl ${config.color} ${attendance[student.id]?.[date] ? 'text-white shadow-lg' : 'hover:bg-slate-200 dark:hover:bg-slate-700 opacity-40 hover:opacity-100'}`}
                          >
                            {config.icon || <span className="text-slate-400 dark:text-slate-500 font-black text-xl">-</span>}
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
      
      {/* Premium Legend */}
      <div className="glass-card p-10 rounded-[40px] flex flex-wrap items-center justify-center gap-12 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30"><Check size={20} /></div>
          <span className="text-lg font-black text-slate-600 dark:text-slate-300">حاضر</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-danger flex items-center justify-center text-white shadow-lg shadow-danger/30"><X size={20} /></div>
          <span className="text-lg font-black text-slate-600 dark:text-slate-300">غائب</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30"><Clock size={20} /></div>
          <span className="text-lg font-black text-slate-600 dark:text-slate-300">متأخر</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30"><UserCheck size={20} /></div>
          <span className="text-lg font-black text-slate-600 dark:text-slate-300">مستأذن</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceBoard;
