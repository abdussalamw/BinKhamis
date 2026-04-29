import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { 
  Search, Filter, MoreHorizontal, Eye, Edit3, 
  UserPlus, FileDown, ShieldCheck, UserCheck,
  Phone, CreditCard, Mail, Briefcase, 
  Power, PowerOff, CheckCircle2, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StaffData {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'teacher' | 'manager';
  is_active: boolean;
  profile?: {
    bank_account_number: string | null;
    specialization: string | null;
    qualification: string | null;
  };
}

const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (member: StaffData) => {
    try {
      // Optimistic UI update
      const updatedStaff = staff.map(s => 
        s.id === member.id ? { ...s, is_active: !s.is_active } : s
      );
      setStaff(updatedStaff);

      // Backend update
      await axios.patch(`/staff/${member.id}/toggle-status`);
    } catch (error) {
      console.error('Error toggling status:', error);
      fetchStaff(); // Rollback on error
    }
  };

  const filteredStaff = (staff || []).filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm) ||
                         member.profile?.bank_account_number?.includes(searchTerm);
    const matchesRole = !roleFilter || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">إدارة الكوادر البشرية</h1>
            <p className="text-sm font-bold text-slate-400">المعلمين والإداريين والمشرفين ({filteredStaff.length} عضو)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 transition-all">
            <FileDown size={18} />
            تصدير البيانات
          </button>
          <button 
            onClick={() => navigate('/staff/new')}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-black text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus size={18} />
            إضافة عضو
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-grow max-w-xl">
          <input
            type="text"
            placeholder="بحث بالاسم، الجوال، أو رقم الحساب البنكي..."
            className="w-full rounded-2xl border-none bg-white dark:bg-slate-900 py-4 pr-12 pl-6 font-bold text-slate-700 dark:text-slate-200 outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-600/20 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <Filter size={16} className="text-slate-400" />
          <select 
            className="bg-transparent border-none outline-none font-bold text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">كل الفئات</option>
            <option value="teacher">معلم</option>
            <option value="admin">إداري</option>
            <option value="manager">مشرف</option>
          </select>
        </div>
      </div>

      {/* Enhanced Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <th className="py-5 px-8 font-black text-slate-500 uppercase text-[10px] tracking-widest">العضو والوظيفة</th>
                <th className="py-5 px-8 font-black text-slate-500 uppercase text-[10px] tracking-widest">معلومات التواصل</th>
                <th className="py-5 px-8 font-black text-slate-500 uppercase text-[10px] tracking-widest">رقم الحساب البنكي</th>
                <th className="py-5 px-8 font-black text-slate-500 uppercase text-[10px] tracking-widest text-center">الحالة</th>
                <th className="py-5 px-8 font-black text-slate-500 uppercase text-[10px] tracking-widest text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="inline-block h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center font-black text-slate-400">لا يوجد بيانات للعرض</td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${member.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            {(member.name || '?').charAt(0)}
                        </div>
                        <div>
                            <h5 className={`font-black text-base leading-tight ${member.is_active ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{member.name}</h5>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
                              {member.role === 'teacher' ? 'معلم حلقة' : member.role === 'admin' ? 'إداري نظام' : 'مشرف عام'}
                            </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-8">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <Phone size={14} className="text-slate-400" />
                          {member.phone}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Mail size={14} className="text-slate-300" />
                          {member.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 w-fit">
                        <CreditCard size={16} className="text-indigo-400" />
                        <span className="font-mono font-black text-slate-700 dark:text-slate-300 text-sm">
                          {member.profile?.bank_account_number || 'غير مسجل'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-8 text-center">
                      <button 
                        onClick={() => toggleStatus(member)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                          member.is_active 
                          ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                        }`}
                      >
                        {member.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {member.is_active ? 'نشط حالياً' : 'غير نشط'}
                      </button>
                    </td>
                    <td className="py-4 px-8 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all dark:bg-slate-800">
                            <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => navigate(`/staff/${member.id}/edit`)}
                          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white transition-all dark:bg-slate-800"
                        >
                            <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => toggleStatus(member)}
                          className={`p-3 rounded-xl bg-slate-50 transition-all dark:bg-slate-800 ${member.is_active ? 'text-rose-500 hover:bg-rose-500 hover:text-white' : 'text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                          title={member.is_active ? 'تعطيل الحساب' : 'تنشيط الحساب'}
                        >
                            {member.is_active ? <PowerOff size={18} /> : <Power size={18} />}
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

export default StaffList;
