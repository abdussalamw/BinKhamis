import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import DefaultLayout from './layout/DefaultLayout';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentForm from './pages/StudentForm';

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
      <Route element={<DefaultLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/users" element={<StudentList />} />
        <Route path="/users/create" element={<StudentForm />} />
      </Route>
    </Routes>
  );
}

export default App;
