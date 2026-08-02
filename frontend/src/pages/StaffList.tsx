import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { 
  Search, Filter, Eye, Edit, 
  UserPlus, FileDown, Shield,
  Phone, CreditCard, Mail, 
  Power, Check as CheckCircle2, AlertCircle as XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StaffData {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'teacher' | 'manager' | 'supervisor';
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

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const viewerRole = user?.role || 'teacher';

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/staff');
      let data = response.data;
      
      // Role-based filtering logic
      if (viewerRole === 'owner') {
        data = data.filter((s: StaffData) => s.role === 'supervisor');
      } else if (viewerRole === 'supervisor') {
        data = data.filter((s: StaffData) => s.role !== 'supervisor' || s.id === user.id);
      } else if (viewerRole === 'admin') {
        data = data.filter((s: StaffData) => s.role === 'teacher' || s.role === 'manager');
      }
      
      const mappedData = data.map((s: any) => ({
        ...s,
        profile: s.teacher_profile || s.active_profile || s.profile || {}
      }));
      
      setStaff(mappedData);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (member: StaffData) => {
    try {
      const updatedStaff = staff.map(s => 
        s.id === member.id ? { ...s, is_active: !s.is_active } : s
      );
      setStaff(updatedStaff);
      await axios.patch(`/staff/${member.id}/toggle-status`);
    } catch (error) {
      console.error('Error toggling status:', error);
      fetchStaff();
    }
  };

  const filteredStaff = (staff || []).filter(member => {
    const matchesSearch = (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.phone || '').includes(searchTerm);
    const matchesRole = !roleFilter || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-white">إدارة الكوادر البشرية</h1>
            <p className="text-xs font-bold text-slate-400">المعلمين والإداريين والمشرفين ({filteredStaff.length} عضو)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-4 py-2 font-bold text-xs text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 transition-all">
            <FileDown size={14} />
            تصدير البيانات
          </button>
          <button 
            onClick={() => navigate('/staff/new')}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 font-black text-xs text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95"
          >
            <UserPlus size={14} />
            إضافة عضو
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-grow max-w-lg">
          <input
            type="text"
            placeholder="بحث بالاسم أو الجوال..."
            className="w-full rounded-xl border-none bg-white dark:bg-slate-900 py-2.5 pr-10 pl-4 font-bold text-xs text-slate-700 dark:text-slate-200 outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <Filter size={14} className="text-slate-400" />
          <select 
            className="bg-transparent border-none outline-none font-bold text-[10px] text-slate-600 dark:text-slate-400 cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">كل الفئات</option>
            <option value="teacher">معلم حلقة</option>
            <option value="admin">مدير الشؤون الإدارية</option>
            <option value="manager">مشرف تعليمي</option>
            {viewerRole === 'owner' && <option value="supervisor">مدير المجمع</option>}
          </select>
        </div>
      </div>

      {/* Enhanced Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-5 font-black text-slate-500 uppercase text-[9px] tracking-wider">العضو والوظيفة</th>
                <th className="py-3 px-5 font-black text-slate-500 uppercase text-[9px] tracking-wider">معلومات التواصل</th>
                <th className="py-3 px-5 font-black text-slate-500 uppercase text-[9px] tracking-wider">رقم الحساب البنكي</th>
                <th className="py-3 px-5 font-black text-slate-500 uppercase text-[9px] tracking-wider text-center">الحالة</th>
                <th className="py-3 px-5 font-black text-slate-500 uppercase text-[9px] tracking-wider text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center font-black text-xs text-slate-400">لا يوجد بيانات للعرض</td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${member.is_active ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                            {(member.name || '?').charAt(0)}
                        </div>
                        <div>
                            <h5 className={`font-black text-xs leading-tight ${member.is_active ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{member.name}</h5>
                            <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
                                {member.role === 'teacher' ? 'معلم حلقة' : member.role === 'admin' ? 'مدير الشؤون الإدارية' : member.role === 'supervisor' ? 'مدير المجمع' : 'مشرف تعليمي'}
                            </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <Phone size={12} className="text-slate-400" />
                          {member.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                          <Mail size={12} className="text-slate-300" />
                          {member.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2 p-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 w-fit">
                        <CreditCard size={12} className="text-primary/70" />
                        <span className="font-mono font-black text-slate-700 dark:text-slate-300 text-[10px]">
                          {member.profile?.bank_account_number || 'غير مسجل'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <button 
                        onClick={() => toggleStatus(member)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${
                          member.is_active 
                          ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                        }`}
                      >
                        {member.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {member.is_active ? 'نشط حالياً' : 'غير نشط'}
                      </button>
                    </td>
                    <td className="py-3 px-5 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800">
                            <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => navigate(`/staff/${member.id}/edit`)}
                          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white transition-all dark:bg-slate-800"
                        >
                            <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => toggleStatus(member)}
                          className={`p-2 rounded-lg bg-slate-50 transition-all dark:bg-slate-800 ${member.is_active ? 'text-rose-500 hover:bg-rose-500 hover:text-white' : 'text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                          title={member.is_active ? 'تعطيل الحساب' : 'تنشيط الحساب'}
                        >
                             {member.is_active ? <Power size={14} className="opacity-50" /> : <Power size={14} />}
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
