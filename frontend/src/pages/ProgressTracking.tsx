import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import type { Student } from '../schema';
import { Book, Award, Clock, Plus, Search, ChevronDown, CheckCircle2 } from 'lucide-react';

interface ProgressRecord {
  id: string;
  surah_name: string;
  surah_number: number;
  start_verse: number;
  end_verse: number;
  completion_date: string;
  quality_rating: 'ممتاز' | 'جيد' | 'يحتاج_مراجعة';
  notes: string;
}

const ProgressTracking: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    surah_name: '',
    start_verse: 1,
    end_verse: 1,
    quality_rating: 'ممتاز' as const,
    notes: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchProgress();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/students');
      setStudents(response.data);
      if (response.data.length > 0) setSelectedStudent(response.data[0].id);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/students/${selectedStudent}/progress`);
      setRecords(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/students/${selectedStudent}/progress`, newRecord);
      setShowAddForm(false);
      fetchProgress();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'ممتاز': return 'bg-emerald-500 text-emerald-500';
      case 'جيد': return 'bg-primary text-primary';
      case 'يحتاج_مراجعة': return 'bg-amber-500 text-amber-500';
      default: return 'bg-slate-400 text-slate-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">تتبع الإنجاز</h1>
          <p className="text-slate-500 dark:text-slate-400">سجل حفظ ومراجعة الطلاب اليومي</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              className="appearance-none rounded-2xl border-none bg-white py-4 pr-12 pl-10 font-bold text-slate-700 shadow-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 min-w-[250px]"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" />
            <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-opacity-90 active:scale-95"
          >
            <Plus size={20} />
            إنجاز جديد
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="glass-card rounded-3xl p-8 border-2 border-primary/20 animate-in slide-in-from-top duration-500">
          <div className="mb-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Book size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">تسجيل إنجاز جديد للطالب</h3>
          </div>
          <form onSubmit={handleAddProgress} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="mb-2 block text-sm font-bold text-slate-500">اسم السورة</label>
              <input
                type="text"
                className="w-full rounded-2xl bg-slate-50 border-none py-4 px-6 font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary dark:bg-slate-900/50 dark:ring-slate-700"
                value={newRecord.surah_name}
                onChange={e => setNewRecord({...newRecord, surah_name: e.target.value})}
                required
                placeholder="مثال: البقرة"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-500">من آية</label>
                <input
                  type="number"
                  className="w-full rounded-2xl bg-slate-50 border-none py-4 px-6 font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary dark:bg-slate-900/50 dark:ring-slate-700"
                  value={newRecord.start_verse}
                  onChange={e => setNewRecord({...newRecord, start_verse: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-500">إلى آية</label>
                <input
                  type="number"
                  className="w-full rounded-2xl bg-slate-50 border-none py-4 px-6 font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary dark:bg-slate-900/50 dark:ring-slate-700"
                  value={newRecord.end_verse}
                  onChange={e => setNewRecord({...newRecord, end_verse: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-500">تقييم الحفظ</label>
              <select
                className="w-full rounded-2xl bg-slate-50 border-none py-4 px-6 font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary dark:bg-slate-900/50 dark:ring-slate-700"
                value={newRecord.quality_rating}
                onChange={e => setNewRecord({...newRecord, quality_rating: e.target.value as any})}
              >
                <option value="ممتاز">ممتاز ⭐⭐⭐</option>
                <option value="جيد">جيد ⭐⭐</option>
                <option value="يحتاج_مراجعة">يحتاج مراجعة ⭐</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-500">ملاحظات المعلم</label>
              <input
                type="text"
                className="w-full rounded-2xl bg-slate-50 border-none py-4 px-6 font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary dark:bg-slate-900/50 dark:ring-slate-700"
                value={newRecord.notes}
                onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
                placeholder="مثال: يحتاج تركيز على أحكام المد"
              />
            </div>
            <div className="md:col-span-1 flex items-end justify-end gap-3">
              <button type="button" onClick={() => setShowAddForm(false)} className="py-4 px-8 font-bold text-slate-400 hover:text-slate-600 transition-colors">إلغاء</button>
              <button type="submit" className="py-4 px-10 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 active:scale-95 transition-all">حفظ الإنجاز</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-right">
                <th className="py-6 px-8 font-black text-slate-800 dark:text-white">السورة</th>
                <th className="py-6 px-8 font-black text-slate-800 dark:text-white">المقدار المسجل</th>
                <th className="py-6 px-8 font-black text-slate-800 dark:text-white">التاريخ</th>
                <th className="py-6 px-8 font-black text-slate-800 dark:text-white">التقييم</th>
                <th className="py-6 px-8 font-black text-slate-800 dark:text-white">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center font-bold text-slate-400">جاري تحميل سجلات الإنجاز...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center font-bold text-slate-400">لم يتم تسجيل أي إنجاز لهذا الطالب بعد</td></tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Book size={20} />
                        </div>
                        <p className="font-black text-slate-800 dark:text-white">{record.surah_name}</p>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">من {record.start_verse}</span>
                        <span>إلى</span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{record.end_verse}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Clock size={14} />
                        {new Date(record.completion_date).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <span className={`inline-flex items-center gap-1.5 rounded-xl bg-opacity-10 py-2 px-4 text-xs font-black ${getRatingColor(record.quality_rating)}`}>
                        <CheckCircle2 size={14} />
                        {record.quality_rating}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 italic">"{record.notes || 'لا توجد ملاحظات'}"</p>
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

export default ProgressTracking;
