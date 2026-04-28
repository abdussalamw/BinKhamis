import React from 'react';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {/* <!-- Card Item Start --> */}
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <Users className="text-primary" size={22} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">150</h4>
              <span className="text-sm font-medium">إجمالي الطلاب</span>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <BookOpen className="text-primary" size={22} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">12</h4>
              <span className="text-sm font-medium">الحلقات النشطة</span>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <CheckCircle className="text-primary" size={22} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">95%</h4>
              <span className="text-sm font-medium">نسبة الحضور اليوم</span>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <Clock className="text-primary" size={22} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">45</h4>
              <span className="text-sm font-medium">إنجازات هذا الأسبوع</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        {/* Chart or Recent Activity could go here */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
            <h3 className="text-xl font-semibold text-black dark:text-white mb-4">إحصائيات الحفظ</h3>
            <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-meta-4 rounded">
                <p className="text-bodydark2">رسم بياني توضيحي (سيتم دمجه لاحقاً)</p>
            </div>
        </div>
        
        <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
            <h3 className="text-xl font-semibold text-black dark:text-white mb-4">آخر التنبيهات</h3>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <p className="text-sm">غياب الطالب أحمد محمد عن حلقة الفجر</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <p className="text-sm">أتم الطالب خالد علي حفظ سورة البقرة</p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
