import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Student {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  profile: {
    current_level: string;
    gender: string;
  };
}

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      try {
        await api.delete(`/students/${id}`);
        setStudents(students.filter(s => s.id !== id));
      } catch (error) {
        alert('فشل حذف الطالب');
      }
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          قائمة الطلاب
        </h4>
        <Link to="/users/create" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90">
          <UserPlus size={18} />
          إضافة طالب
        </Link>
      </div>

      <div className="flex flex-col">
        <div className="grid grid-cols-5 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">الاسم</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">رقم الهاتف</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">المستوى</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">الجنس</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">العمليات</h5>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center">جاري التحميل...</div>
        ) : (
          students.length > 0 ? (
            students.map((student) => (
              <div
                className="grid grid-cols-5 border-b border-stroke dark:border-strokedark sm:grid-cols-5"
                key={student.id}
              >
                <div className="flex items-center p-2.5 xl:p-5">
                  <p className="text-black dark:text-white">{student.name}</p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="text-black dark:text-white">{student.phone}</p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="text-meta-3">{student.profile?.current_level || '-'}</p>
                </div>

                <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                  <p className="text-black dark:text-white">{student.profile?.gender === 'M' ? 'ذكر' : 'أنثى'}</p>
                </div>

                <div className="flex items-center justify-center p-2.5 gap-2 xl:p-5">
                  <button className="hover:text-primary">
                    <Edit size={18} />
                  </button>
                  <button className="hover:text-meta-1" onClick={() => handleDelete(student.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-bodydark2">لا يوجد طلاب مسجلين حالياً</div>
          )
        )}
      </div>
    </div>
  );
};

export default StudentList;
