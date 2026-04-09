import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BarChart3, TrendingUp, Wallet, UserCheck, Calendar, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfToday } from 'date-fns';

const MISReports = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('hms_token');
    try {
      const { data } = await axios.get('http://localhost:5000/api/patients/admitted', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const pDate = new Date(p.createdAt);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the whole end day
    return pDate >= start && pDate <= end;
  });

//   const calculateTotals = () => {
//     const totals = patients.reduce((acc, p) => {
//       acc.registrations += 1;
//       acc.collection += p.billing.totalPaid;
//       acc.discount += p.billing.discount;
//       acc.due += p.billing.dueAmount;
//       return acc;
//     }, { registrations: 0, collection: 0, discount: 0, due: 0 });
//     return totals;
//   };

//   const totals = calculateTotals();

  return (
    <div className="w-full mx-auto space-y-8">
      {/* ... header and analytics cards ... */}

      {/* Transaction Table */}
      
      <div className="bg-card rounded-3xl shadow-xl border overflow-hidden">
         <div className="py-4 px-8 border-b flex flex-col md:flex-row justify-between items-center bg-secondary/20 gap-4">
            <h3 className="text-xl font-bold">Line-Item Collection Details</h3>
            <div className="flex items-center gap-2 bg-background p-2 rounded-xl border shadow-sm">
                <div className="flex items-center gap-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">From</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
                    />
                </div>
                <div className="w-px h-4 bg-muted mx-1"></div>
                <div className="flex items-center gap-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">To</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
                    />
                </div>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-secondary/50 text-xs font-black uppercase tracking-widest text-muted-foreground border-b">
                  <tr>
                     <th className="p-6">Patient (UHID)</th>
                     <th className="p-6">Date</th>
                     <th className="p-6">Service Type</th>
                     <th className="p-6">Amount Collected</th>
                     <th className="p-6">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-secondary">
                  {filteredPatients.map(p => (
                    <tr key={p._id} className="hover:bg-secondary/30 transition-all font-medium">
                       <td className="p-6">
                          <div className="font-bold">{p.name}</div>
                          <div className="text-xs font-mono">{p.uhid}</div>
                       </td>
                       <td className="p-6 text-sm">{format(new Date(p.createdAt), 'PPp')}</td>
                       <td className="p-6">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase">{p.isIPD ? 'IPD Admission' : 'OPD Visit'}</span>
                       </td>
                       <td className="p-6 font-bold text-green-600 text-lg">₹{p.billing.totalPaid}</td>
                       <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${p.billing.dueAmount > 0 ? 'bg-destructive/10 text-destructive' : 'bg-green-600/10 text-green-600'}`}>
                             {p.billing.dueAmount > 0 ? 'Due Clear Pending' : 'Paid Full'}
                          </span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default MISReports;
