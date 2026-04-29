import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import DefaultLayout from './layout/DefaultLayout';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentForm from './pages/StudentForm';
import CircleList from './pages/CircleList';
import CircleDetails from './pages/CircleDetails';
import CircleForm from './pages/CircleForm'; // New
import AttendanceBoard from './pages/AttendanceBoard';
import ProgressTracking from './pages/ProgressTracking';
import StudentProfile from './pages/StudentProfile';
import StaffList from './pages/StaffList';
import StaffForm from './pages/StaffForm'; // New
import ImportData from './pages/ImportData';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import SignIn from './pages/SignIn';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-boxdark">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  ) : (
    <Routes>
      <Route path="/auth/signin" element={<SignIn />} />
      <Route element={<DefaultLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/new" element={<StudentForm />} />
        <Route path="/students/:id/edit" element={<StudentForm />} />
        <Route path="/staff" element={<StaffList />} />
        <Route path="/staff/new" element={<StaffForm />} />
        <Route path="/staff/:id/edit" element={<StaffForm />} />
        <Route path="/attendance" element={<AttendanceBoard />} />
        <Route path="/progress" element={<ProgressTracking />} />
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/import" element={<ImportData />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/circles" element={<CircleList />} />
        <Route path="/circles/new" element={<CircleForm />} /> {/* New Create Route */}
        <Route path="/circles/:id/edit" element={<CircleForm />} /> {/* New Edit Route */}
        <Route path="/circles/:id" element={<CircleDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
