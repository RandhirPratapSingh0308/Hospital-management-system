import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Receipt, PlusCircle, AlertCircle, Printer, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';

const Billing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newBill, setNewBill] = useState({ type: '', unit: '', amount: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const token = localStorage.getItem('hms_token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const pRes = await axios.get(`http://localhost:5000/api/patients/admitted`, { headers });
      const current = pRes.data.find(x => x._id === id);
      setPatient(current);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = async () => {
    if (!newBill.type || !newBill.unit || !newBill.amount) return alert('Please fill all fields');
    
    const token = localStorage.getItem('hms_token');
    try {
      const { data } = await axios.post(`http://localhost:5000/api/patients/${id}/bill-item`, {
        type: newBill.type,
        unit: Number(newBill.unit),
        amount: Number(newBill.amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatient(data);
      setShowModal(false);
      setNewBill({ type: '', unit: '', amount: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding bill item');
    }
  };

  if (loading || !patient) return <div className="p-20 text-center font-bold text-primary animate-pulse">Loading Patient Data...</div>;

  // Combine all charges for the table
  const tableRows = [];
  
  // 1. Room Charges
  if (patient.ipdDetails.daysInRoom > 0) {
    tableRows.push({
      type: patient.ipdDetails.roomType,
      unit: patient.ipdDetails.daysInRoom,
      amount: patient.ipdDetails.roomRate,
      total: patient.billing.totalRoomCharges
    });
  }

  // 2. Oxygen Usage
  if (patient.ipdDetails.oxygenUsage.hours > 0) {
    tableRows.push({
      type: 'Oxygen Usage',
      unit: patient.ipdDetails.oxygenUsage.hours,
      amount: patient.ipdDetails.oxygenUsage.ratePerHour,
      total: patient.billing.totalOxygenCharges
    });
  }

  // 3. Lab Tests
  patient.ipdDetails.labTests.forEach(test => {
    tableRows.push({
      type: test.testName,
      unit: 1,
      amount: test.price,
      total: test.price
    });
  });

  // 4. Custom Bill Items
  (patient.ipdDetails.billItems || []).forEach(item => {
    tableRows.push({
      type: item.type,
      unit: item.unit,
      amount: item.amount,
      total: item.total
    });
  });

  return (
    <div className="w-full mx-auto p-4 space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-xl shadow-sm border p-8 flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-800">{patient.name}</h2>
          <p className="text-sm font-mono text-gray-500">{patient.uhid} | {patient.gender}, {patient.age}yrs</p>
        </div>
        <div className="text-right space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400 block">Admission Date</label>
          <span className="text-sm font-medium text-gray-700">{format(new Date(patient.ipdDetails.admissionDate), 'MMMM do, yyyy')}</span>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#4a8df3] hover:bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
        >
          Add Bill
        </button>
      </div>

      {/* Bill Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#4a8df3] text-white uppercase text-xs font-black tracking-widest">
                <th className="p-4 px-8 w-1/3">Type</th>
                <th className="p-4 text-center">Unit</th>
                <th className="p-4 text-center">Amount</th>
                <th className="p-4 text-center px-8">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400 font-medium italic">No charges added yet.</td>
                </tr>
              ) : (
                tableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-all font-medium text-gray-600 text-sm">
                    <td className="p-4 px-8">{row.type}</td>
                    <td className="p-4 text-center">{row.unit}</td>
                    <td className="p-4 text-center">{row.amount}</td>
                    <td className="p-4 text-center px-8">{row.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Block */}
        <div className="p-8 bg-blue-50/30 border-t flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between font-black text-gray-700">
              <span className="text-sm uppercase tracking-tight">Grand Total:</span>
              <span>{patient.billing.grandTotal} /-</span>
            </div>
            <div className="flex justify-between font-black text-gray-500">
              <span className="text-sm uppercase tracking-tight">Advance:</span>
              <span>{patient.billing.totalPaid} /-</span>
            </div>
            <div className="flex justify-between font-black text-destructive border-t pt-2 text-lg">
              <span className="uppercase tracking-tighter">Due:</span>
              <span>{patient.billing.dueAmount} /-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 text-center border-b relative">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Update Bill</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="absolute right-6 top-5 text-gray-400 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase px-1">Type:</label>
                  <select 
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/20 outline-none font-medium transition-all"
                    value={newBill.type}
                    onChange={e => setNewBill({...newBill, type: e.target.value})}
                  >
                    <option value="">Select Service Type...</option>
                    <option value="ICU">ICU</option>
                    <option value="Private Room">Private Room</option>
                    <option value="General Ward">General Ward</option>
                    <option value="Oxygen">Oxygen</option>
                    <option value="Consultant Fee">Consultant Fee</option>
                    <option value="Lab Charges">Lab Charges</option>
                    <option value="Nursing Charges">Nursing Charges</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Unit:</label>
                    <input 
                      type="number" 
                      className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/20 outline-none font-medium transition-all text-center"
                      value={newBill.unit}
                      onChange={e => setNewBill({...newBill, unit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Amount:</label>
                    <input 
                      type="number" 
                      className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/20 outline-none font-medium transition-all text-center"
                      value={newBill.amount}
                      onChange={e => setNewBill({...newBill, amount: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={handleAddBill}
                className="w-full bg-[#4a8df3] text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
