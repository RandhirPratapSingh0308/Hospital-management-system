import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, RotateCcw, Search, User } from 'lucide-react';
import { format } from 'date-fns';

const PatientHistory = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDischarged();
  }, []);

  const fetchDischarged = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const { data } = await axios.get('http://localhost:5000/api/patients/discharged', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReAdmit = async (id) => {
    if (!window.confirm('Are you sure you want to re-admit this patient?')) return;
    
    try {
      const token = localStorage.getItem('hms_token');
      await axios.post(`http://localhost:5000/api/patients/${id}/re-admit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Patient Re-Admitted Successfully');
      fetchDischarged();
    } catch (err) {
      alert(err.response?.data?.message || 'Error re-admitting patient');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.uhid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center font-bold text-primary animate-pulse">Loading Records...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl shadow-sm border">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <History className="text-primary" /> Patient Discharge Records
        </h3>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search Name or UHID..." 
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm outline-none focus:ring-2 ring-primary/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-secondary/50 text-muted-foreground uppercase text-xs font-bold tracking-wider">
                <th className="p-4 px-6">Patient Info</th>
                <th className="p-4 px-6">Room / Dr.</th>
                <th className="p-4 px-6">Discharge Date</th>
                <th className="p-4 px-6 text-right">Total Bill</th>
                <th className="p-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-muted-foreground italic">No discharge records found.</td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p._id} className="hover:bg-secondary/30 transition-all text-sm group">
                    <td className="p-4 px-6">
                      <div className="font-bold text-gray-800">{p.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.uhid} | {p.gender}, {p.age}yrs</div>
                    </td>
                    <td className="p-4 px-6">
                        <div className="font-medium">{p.ipdDetails.roomType}</div>
                        <div className="text-xs text-primary font-bold">{p.consultantDoctor?.name || 'N/A'}</div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="font-medium text-gray-700">{format(new Date(p.updatedAt), 'PPP')}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{format(new Date(p.updatedAt), 'p')}</div>
                    </td>
                    <td className="p-4 px-6 text-right font-black text-gray-800">
                      ₹{p.billing.grandTotal}
                    </td>
                    <td className="p-4 px-6 text-center">
                      <button 
                        onClick={() => handleReAdmit(p._id)}
                        className="flex items-center gap-2 mx-auto px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all font-bold text-xs"
                      >
                        <RotateCcw size={14} /> Re-Admit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
