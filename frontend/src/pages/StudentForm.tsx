import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const StudentForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: 'M',
    address: '',
    current_level: '',
    memorization_method: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/students', formData);
      navigate('/users');
    } catch (error) {
      alert('فشل إضافة الطالب');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">إضافة طالب جديد</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6.5">
        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <label className="mb-2.5 block text-black dark:text-white">الاسم الكامل</label>
            <input
              type="text"
              name="name"
              required
              onChange={handleChange}
              placeholder="أدخل اسم الطالب"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>

          <div className="w-full xl:w-1/2">
            <label className="mb-2.5 block text-black dark:text-white">رقم الهاتف</label>
            <input
              type="text"
              name="phone"
              required
              onChange={handleChange}
              placeholder="05xxxxxxx"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-4.5">
          <label className="mb-2.5 block text-black dark:text-white">البريد الإلكتروني (اختياري)</label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            placeholder="example@gmail.com"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          />
        </div>

        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">الجنس</label>
                <select 
                    name="gender" 
                    onChange={handleChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                >
                    <option value="M">ذكر</option>
                    <option value="F">أنثى</option>
                </select>
            </div>
            <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">المستوى الحالي</label>
                <input
                    type="text"
                    name="current_level"
                    onChange={handleChange}
                    placeholder="مثال: الجزء الأول"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                />
            </div>
        </div>

        <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray">
          حفظ البيانات
        </button>
      </form>
    </div>
  );
};

export default StudentForm;
