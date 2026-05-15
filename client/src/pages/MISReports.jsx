import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BarChart3, TrendingUp, Wallet, UserCheck, Calendar, Download, Printer } from 'lucide-react';
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
    end.setHours(23, 59, 59, 999);
    return pDate >= start && pDate <= end;
  });

  const totalAmount = filteredPatients.reduce((sum, p) => sum + (p.billing.totalPaid || 0), 0);

  const handlePrint = () => {
    window.print();
  };

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
      
      <div id="printable-report" className="bg-card rounded-3xl shadow-xl border overflow-hidden">
         <div className="py-4 px-8 border-b flex flex-col md:flex-row justify-between items-center bg-secondary/20 gap-4">
            <h3 className="text-xl font-bold">Line-Item Collection Details</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-background p-2 rounded-xl border shadow-sm no-print">
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
              <button 
                onClick={handlePrint}
                className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 no-print flex items-center gap-2 font-bold text-sm"
              >
                <Printer size={18} />
                Print Report
              </button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-secondary/50 text-xs font-black uppercase tracking-widest text-muted-foreground border-b">
                  <tr>
                     <th className="p-6">S.I</th>
                     <th className="p-6">Patient (UHID)</th>
                     <th className="p-6">Date</th>
                     <th className="p-6">Received By</th>
                     <th className="p-6 text-right">Amount Collected</th>
                  </tr>
               </thead>
                <tbody className="divide-y divide-secondary">
                  {filteredPatients.map((p, idx) => (
                    <tr key={p._id} className="hover:bg-secondary/30 transition-all font-medium">
                       <td className="p-6 text-center">{idx + 1}</td>
                       <td className="p-6">
                          <div className="font-bold">{p.name}</div>
                          <div className="text-xs font-mono">{p.uhid}</div>
                       </td>
                       <td className="p-6 text-sm">{format(new Date(p.createdAt), 'PP')}</td>
                       <td className="p-6">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{p.receivedBy?.name || 'Admin'}</span>
                       </td>
                       <td className="p-6 font-bold text-green-600 text-lg text-right">₹{p.billing.totalPaid}</td>
                    </tr>
                  ))}
               </tbody>
               <tfoot className="bg-secondary/20 font-black">
                  <tr>
                    <td colSpan="4" className="p-6 text-right uppercase tracking-tighter">Total Collection:</td>
                    <td className="p-6 text-right text-2xl text-primary font-black">₹{totalAmount}</td>
                  </tr>
               </tfoot>
            </table>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 1cm; }
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print { display: none !important; }
          .bg-card { border: 1px solid #eee !important; shadow: none !important; }
          table { border: 1px solid black !important; }
          th, td { border: 1px solid #eee !important; }
        }
      `}} />
    </div>
  );
};

export default MISReports;
