import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import DefaultLayout from './layout/DefaultLayout';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentForm from './pages/StudentForm';
import CircleList from './pages/CircleList';
import CircleDetails from './pages/CircleDetails';
import CircleForm from './pages/CircleForm';
import AttendanceBoard from './pages/AttendanceBoard';
import ProgressTracking from './pages/ProgressTracking';
import StudentProfile from './pages/StudentProfile';
import StaffList from './pages/StaffList';
import StaffForm from './pages/StaffForm';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import SignIn from './pages/SignIn';
import SystemSettings from './pages/SystemSettings';
import SchoolManagement from './pages/SchoolManagement';
import SchoolSettings from './pages/SchoolSettings';
import WhatsAppSettings from './pages/WhatsAppSettings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  console.log('App component rendering');
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-slate-950">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth/signin" element={<SignIn />} />
      
      {/* Shared Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DefaultLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          
          {/* Owner Only */}
          <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
            <Route path="/system-settings" element={<SystemSettings />} />
            <Route path="/schools" element={<SchoolManagement />} />
            <Route path="/whatsapp" element={<WhatsAppSettings />} />
          </Route>

          {/* Admin, Supervisor & Owner */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'supervisor', 'owner']} />}>
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/new" element={<StudentForm />} />
            <Route path="/students/:id/edit" element={<StudentForm />} />
            <Route path="/staff" element={<StaffList />} />
            <Route path="/staff/new" element={<StaffForm />} />
            <Route path="/staff/:id/edit" element={<StaffForm />} />
            <Route path="/school-settings" element={<SchoolSettings />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Teacher, Supervisor, Admin & Owner */}
          <Route element={<ProtectedRoute allowedRoles={['teacher', 'supervisor', 'admin', 'owner']} />}>
            <Route path="/attendance" element={<AttendanceBoard />} />
            <Route path="/progress" element={<ProgressTracking />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/circles" element={<CircleList />} />
            <Route path="/circles/new" element={<CircleForm />} />
            <Route path="/circles/:id/edit" element={<CircleForm />} />
            <Route path="/circles/:id" element={<CircleDetails />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
