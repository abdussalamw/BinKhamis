import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import axios from '../services/api';

const ImportData: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'students' | 'attendance'>('students');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setStatus('loading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = importType === 'students' ? '/import/students' : '/import/attendance';
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
      setStatus('success');
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء الاستيراد');
      setStatus('error');
    }
  };

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          استيراد البيانات
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          {/* Settings Card */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">إعدادات الاستيراد</h3>
            </div>
            <div className="p-6.5">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">نوع البيانات</label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value as any)}
                    className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  >
                    <option value="students">قاعدة بيانات الطلاب (Excel)</option>
                    <option value="attendance">سجل الحضور الفصلي (CSV)</option>
                  </select>
                </div>
              </div>

              <div className="mb-4.5">
                <label className="mb-3 block text-black dark:text-white">اختر الملف</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={importType === 'students' ? '.xls,.xlsx' : '.csv'}
                  className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                />
              </div>

              <button
                onClick={handleImport}
                disabled={!file || status === 'loading'}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
              >
                {status === 'loading' ? <Loader2 className="animate-spin" /> : 'بدء عملية الاستيراد'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          {/* Result Card */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark h-full min-h-[300px]">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">نتيجة العملية</h3>
            </div>
            <div className="p-6.5 flex flex-col items-center justify-center h-full">
              {status === 'idle' && (
                <div className="text-center text-bodydark2">
                  <Upload size={48} className="mx-auto mb-4 opacity-20" />
                  <p>الرجاء اختيار ملف للبدء</p>
                </div>
              )}

              {status === 'loading' && (
                <div className="text-center">
                  <Loader2 size={48} className="mx-auto mb-4 animate-spin text-primary" />
                  <p>جاري معالجة الملف... قد يستغرق ذلك دقيقة</p>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center">
                  <CheckCircle size={48} className="mx-auto mb-4 text-success" />
                  <h4 className="text-xl font-bold text-black dark:text-white mb-2">تم الاستيراد بنجاح!</h4>
                  <div className="bg-gray-2 dark:bg-meta-4 p-4 rounded text-right w-full">
                    <p className="text-sm">عدد السجلات المضافة: {result?.added || 0}</p>
                    <p className="text-sm">عدد السجلات المحدثة: {result?.updated || 0}</p>
                    <p className="text-sm">عدد الأخطاء: {result?.errors || 0}</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center">
                  <AlertTriangle size={48} className="mx-auto mb-4 text-danger" />
                  <h4 className="text-xl font-bold text-black dark:text-white mb-2">فشلت العملية</h4>
                  <p className="text-danger">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-9 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="font-medium text-black dark:text-white mb-4 flex items-center gap-2">
            <FileText size={20} /> ملاحظات هامة
        </h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-body">
            <li>تأكد أن ملف الإكسل يحتوي على الأعمدة المطلوبة بنفس المسميات في `prombt.md`.</li>
            <li>ملف الحضور (CSV) يجب أن تكون أعمدة التواريخ فيه متسلسلة.</li>
            <li>يتم مطابقة الطلاب بناءً على "رقم الإثبات" أو "الاسم الكامل".</li>
            <li>يفضل تقسيم الملفات الكبيرة (أكثر من 1000 سجل) لضمان سرعة المعالجة.</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportData;
