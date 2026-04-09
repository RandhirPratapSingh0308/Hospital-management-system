import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bed } from 'lucide-react';

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchAdmitted();
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

  const handleDischarge = async (p) => {
    if (p.billing.dueAmount > 0) {
      alert("Payment not done Please sattel down the payment than you can discharge the paitent!");
      return;
    }
    
    if (window.confirm('Are you sure you want to discharge this patient?')) {
      try {
        const token = localStorage.getItem('hms_token');
        await axios.post(`http://localhost:5000/api/patients/${p._id}/discharge`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Patient Discharged Successfully');
        fetchAdmitted(); // Refresh the list
      } catch (err) {
        alert(err.response?.data?.message || 'Error');
      }
    }
  };

  return (
    <div className="space-y-8">
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
                <th className="p-4 font-mono">Total (₹)</th>
                <th className="p-4 font-mono">Paid (₹)</th>
                <th className="p-4 font-mono">Due (₹)</th>
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
                  <tr key={p._id} className="border-b hover:bg-secondary/30 transition-all text-sm">
                    <td className="p-4">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.uhid}</div>
                    </td>
                    <td className="p-4 font-medium">{p.ipdDetails.roomType}</td>
                    <td className="p-4 font-bold text-primary">₹{p.billing.grandTotal}</td>
                    <td className="p-4 font-bold text-green-600">₹{p.billing.totalPaid}</td>
                    <td className="p-4 font-bold text-destructive">₹{p.billing.dueAmount}</td>
                    <td className="p-4 text-center space-x-2">
                      <Link to={`/admin/billing/${p._id}`} className="inline-block px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all">
                        Update / Bill
                      </Link>
                      <button 
                        onClick={() => handleDischarge(p)}
                        className="inline-block px-3 py-1.5 text-xs font-bold bg-destructive text-destructive-foreground rounded-lg hover:brightness-110 transition-all"
                      >
                        Discharge
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
