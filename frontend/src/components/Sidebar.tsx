import { LayoutDashboard, Users, BookOpen, Calendar, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  return (
    <aside
      className={`absolute left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <span className="text-2xl font-bold text-white">نظام الحلقات</span>
        </NavLink>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">القائمة الرئيسية</h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    'group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ' +
                    (isActive && 'bg-graydark dark:bg-meta-4')
                  }
                >
                  <LayoutDashboard size={18} />
                  الرئيسية
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    'group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ' +
                    (isActive && 'bg-graydark dark:bg-meta-4')
                  }
                >
                  <Users size={18} />
                  المستخدمين
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/circles"
                  className={({ isActive }) =>
                    'group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ' +
                    (isActive && 'bg-graydark dark:bg-meta-4')
                  }
                >
                  <BookOpen size={18} />
                  الحلقات
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/attendance"
                  className={({ isActive }) =>
                    'group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ' +
                    (isActive && 'bg-graydark dark:bg-meta-4')
                  }
                >
                  <Calendar size={18} />
                  التحضير
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
