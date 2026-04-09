import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, UserPlus, Bed, FlaskConical, Receipt, BarChart3, LogOut } from 'lucide-react';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('hms_user');
    const token = localStorage.getItem('hms_token');
    if (!storedUser || !token) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
      fetchAdmitted();
    }
  }, []);

  const fetchAdmitted = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const { data } = await axios.get('http://localhost:5000/api/patients/admitted', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-card shadow-lg flex flex-col">
        <div className="p-6 text-center border-b font-bold text-2xl text-primary tracking-tight">
          HMS CORE
        </div>
        <nav className="flex-1 p-4 space-y-2 font-medium">
          <Link to="/" className="flex items-center gap-3 px-4 py-2 text-primary bg-secondary rounded-md shadow-sm">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/opd" className="flex items-center gap-3 px-4 py-2 hover:bg-secondary rounded-md transition-all">
            <UserPlus size={20} /> OPD Reg
          </Link>
          <Link to="/ipd" className="flex items-center gap-3 px-4 py-2 hover:bg-secondary rounded-md transition-all">
            <Bed size={20} /> IPD Admit
          </Link>
          <Link to="/lab" className="flex items-center gap-3 px-4 py-2 hover:bg-secondary rounded-md transition-all">
            <FlaskConical size={20} /> Lab Services
          </Link>
          <Link to="/mis" className="flex items-center gap-3 px-4 py-2 hover:bg-secondary rounded-md transition-all">
            <BarChart3 size={20} /> MIS Reports
          </Link>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-8 py-4 text-destructive border-t hover:bg-destructive/10 transition-all font-medium">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <header className="flex justify-between items-center bg-card p-6 rounded-xl shadow-sm border">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
            <p className="text-muted-foreground">Today's snapshot of hospital activity</p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold uppercase text-sm tracking-widest">
            {user?.role} Access
          </div>
        </header>

        {/* Admitted Patient Dashboard */}
        <section className="bg-card p-6 rounded-xl shadow-sm border space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Bed className="text-primary" /> Admitted Patients Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-secondary/50 text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  <th className="p-4">Patient Name (UHID)</th>
                  <th className="p-4">Room Type</th>
                  <th className="p-4">Bill (₹)</th>
                  <th className="p-4">Paid (₹)</th>
                  <th className="p-4">Due (₹)</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-muted-foreground">No patients admitted</td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p._id} className="border-b hover:bg-secondary/30 transition-all">
                      <td className="p-4">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{p.uhid}</div>
                      </td>
                      <td className="p-4 font-medium">{p.ipdDetails.roomType}</td>
                      <td className="p-4 font-bold text-primary">₹{p.billing.grandTotal}</td>
                      <td className="p-4 font-bold text-green-600">₹{p.billing.totalPaid}</td>
                      <td className="p-4 font-bold text-destructive">₹{p.billing.dueAmount}</td>
                      <td className="p-4 text-center">
                        <Link to={`/billing/${p._id}`} className="inline-block px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:ring-2 ring-primary ring-offset-2 transition-all">
                          Update / Bill
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
