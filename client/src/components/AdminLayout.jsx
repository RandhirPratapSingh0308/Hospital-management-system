import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Bed, FlaskConical, BarChart3, LogOut, History } from 'lucide-react';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('hms_user');
    const token = localStorage.getItem('hms_token');
    if (!storedUser || !token) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/opd', icon: <UserPlus size={20} />, label: 'OPD Reg' },
    { path: '/admin/ipd', icon: <Bed size={20} />, label: 'IPD Admit' },
    { path: '/admin/lab', icon: <FlaskConical size={20} />, label: 'Lab Services' },
    { path: '/admin/records', icon: <History size={20} />, label: 'Patient Records' },
    { path: '/admin/mis', icon: <BarChart3 size={20} />, label: 'MIS Reports' },
  ];

  // Admin only menu items
  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin/users', icon: <UserPlus size={20} />, label: 'Manage Users' });
  }

  return (
    <div className="flex min-h-screen bg-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-card shadow-lg flex flex-col fixed h-full">
        <div className="p-6 text-center border-b font-bold text-2xl text-primary tracking-tight">
          HMS CORE
        </div>
        <nav className="flex-1 p-4 space-y-2 font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
                location.pathname === item.path
                  ? 'text-primary bg-secondary shadow-sm'
                  : 'hover:bg-secondary'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-8 py-4 text-destructive border-t hover:bg-destructive/10 transition-all font-medium"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center bg-card p-6 rounded-xl shadow-sm border mb-8">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
            <p className="text-muted-foreground">Today's snapshot of hospital activity</p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold uppercase text-sm tracking-widest">
            {user?.role} Access
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
