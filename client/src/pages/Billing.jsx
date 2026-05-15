import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Receipt, PlusCircle, AlertCircle, Printer, CheckCircle, X, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import PrintBill from '../components/PrintBill';

const Billing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newBill, setNewBill] = useState({ type: '', unit: 1, amount: '' });
  const [fees, setFees] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDynamicData();
  }, [id]);

  const fetchDynamicData = async () => {
    const token = localStorage.getItem('hms_token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [fRes, dRes] = await Promise.all([
        axios.get('http://localhost:5000/api/fees', { headers }),
        axios.get('http://localhost:5000/api/doctors', { headers })
      ]);
      setFees(fRes.data);
      setDoctors(dRes.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  useEffect(() => {
    if (!newBill.type) return;
    
    if (newBill.type.startsWith('DOC:')) {
      const docId = newBill.type.split(':')[1];
      const doc = doctors.find(d => d._id === docId);
      if (doc) setNewBill(prev => ({ ...prev, amount: doc.ipdVisitFee, typeName: doc.name }));
    } else if (newBill.type.startsWith('FEE:')) {
      const feeId = newBill.type.split(':')[1];
      const fee = fees.find(f => f._id === feeId);
      if (fee) setNewBill(prev => ({ ...prev, amount: fee.rate, typeName: fee.name }));
    } else if (newBill.type === 'Other') {
      setNewBill(prev => ({ ...prev, amount: '', typeName: prev.customType || '' }));
    }
  }, [newBill.type, newBill.customType, doctors, fees]);

  const handleAddBill = async () => {
    const finalType = newBill.type === 'Other' ? newBill.customType : newBill.typeName;
    if (!finalType || !newBill.unit || !newBill.amount) return alert('Please fill all fields');
    
    const token = localStorage.getItem('hms_token');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      let data;
      if (isEditMode && editingItem) {
        // Update existing item
        const endpoint = editingItem.category === 'billItem' 
          ? `http://localhost:5000/api/patients/${id}/bill-item/${editingItem.id}`
          : editingItem.category === 'lab'
          ? `http://localhost:5000/api/patients/${id}/lab/${editingItem.id}`
          : editingItem.category === 'doctor'
          ? `http://localhost:5000/api/patients/${id}/doctor-visit/${editingItem.id}`
          : null;

        if (!endpoint) return alert('Cannot update this item type');

        const payload = editingItem.category === 'billItem'
          ? { type: finalType, unit: Number(newBill.unit), amount: Number(newBill.amount) }
          : editingItem.category === 'lab'
          ? { testName: finalType, price: Number(newBill.amount) }
          : { count: Number(newBill.unit), feePerVisit: Number(newBill.amount) };

        const res = await axios.patch(endpoint, payload, { headers });
        data = res.data;
      } else {
        // Add new item
        const res = await axios.post(`http://localhost:5000/api/patients/${id}/bill-item`, {
          type: finalType,
          unit: Number(newBill.unit),
          amount: Number(newBill.amount)
        }, { headers });
        data = res.data;
      }
      
      setPatient(data);
      setShowModal(false);
      setNewBill({ type: '', unit: 1, amount: '' });
      setIsEditMode(false);
      setEditingItem(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving bill item');
    }
  };

  const handleDelete = async (category, itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const token = localStorage.getItem('hms_token');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const endpoint = category === 'billItem'
        ? `http://localhost:5000/api/patients/${id}/bill-item/${itemId}`
        : category === 'lab'
        ? `http://localhost:5000/api/patients/${id}/lab/${itemId}`
        : category === 'doctor'
        ? `http://localhost:5000/api/patients/${id}/doctor-visit/${itemId}`
        : null;

      if (!endpoint) return alert('Cannot delete this item type');

      const { data } = await axios.delete(endpoint, { headers });
      setPatient(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting item');
    }
  };

  const handleEdit = (row) => {
    setIsEditMode(true);
    setEditingItem(row);
    setNewBill({
      type: row.category === 'billItem' ? 'Other' : '',
      customType: row.type,
      typeName: row.type,
      unit: row.unit,
      amount: row.amount
    });
    setShowModal(true);
  };

  const handlePrint = () => {
    window.print();
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
      total: patient.billing.totalRoomCharges,
      category: 'room'
    });
  }

  // 2. Oxygen Usage
  if (patient.ipdDetails.oxygenUsage.hours > 0) {
    tableRows.push({
      type: 'Oxygen Usage',
      unit: patient.ipdDetails.oxygenUsage.hours,
      amount: patient.ipdDetails.oxygenUsage.ratePerHour,
      total: patient.billing.totalOxygenCharges,
      category: 'oxygen'
    });
  }
  
  // 2b. Doctor Visits
  (patient.ipdDetails.doctorVisits || []).forEach(visit => {
    if (visit.count > 0) {
      tableRows.push({
        id: visit._id,
        type: `Consultation - ${visit.doctor?.name || 'Doctor'}`,
        unit: visit.count,
        amount: visit.feePerVisit,
        total: visit.count * visit.feePerVisit,
        category: 'doctor'
      });
    }
  });

  // 3. Lab Tests
  (patient.ipdDetails.labTests || []).forEach(test => {
    tableRows.push({
      id: test._id,
      type: test.testName,
      unit: 1,
      amount: test.price,
      total: test.price,
      category: 'lab'
    });
  });

  // 4. Custom Bill Items
  (patient.ipdDetails.billItems || []).forEach(item => {
    tableRows.push({
      id: item._id,
      type: item.type,
      unit: item.unit,
      amount: item.amount,
      total: item.total,
      category: 'billItem'
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
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold transition-all border border-gray-200 flex items-center gap-2"
          >
            <Printer size={18} />
            Print
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#4a8df3] hover:bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Add Bill
          </button>
        </div>
      </div>

      {/* Bill Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#4a8df3] text-white uppercase text-xs font-black tracking-widest">
                <th className="p-4 px-8 text-center w-16">S.I</th>
                <th className="p-4 px-8 w-1/3">Type</th>
                <th className="p-4 text-center">Unit</th>
                <th className="p-4 text-center">Charge</th>
                <th className="p-4 text-center">Amount</th>
                <th className="p-4 text-center px-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400 font-medium italic">No charges added yet.</td>
                </tr>
              ) : (
                tableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-all font-medium text-gray-600 text-sm">
                    <td className="p-4 text-center">{idx + 1}</td>
                    <td className="p-4 px-8">{row.type}</td>
                    <td className="p-4 text-center">{row.unit}</td>
                    <td className="p-4 text-center">{row.amount}</td>
                    <td className="p-4 text-center">{row.total}</td>
                    <td className="p-4 text-center px-8">
                      {['billItem', 'lab', 'doctor'].includes(row.category) && (
                        <div className="flex justify-center gap-3">
                          <button 
                            onClick={() => handleEdit(row)}
                            className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(row.category, row.id)}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
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
              <span className="uppercase tracking-tighter">Due Amount:</span>
              <span>{patient.billing.dueAmount} /-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Component */}
      <PrintBill patient={patient} tableRows={tableRows} />

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />

      {/* Add Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 text-center border-b relative">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">{isEditMode ? 'Edit Bill Item' : 'Add Bill Item'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setIsEditMode(false);
                  setEditingItem(null);
                  setNewBill({ type: '', unit: 1, amount: '' });
                }}
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
                    <optgroup label="Doctors (IPD Visit)">
                      {doctors.map(d => (
                        <option key={d._id} value={`DOC:${d._id}`}>{d.name} ({d.specialization})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Hospital Services">
                      {fees.filter(f => f.category !== 'Room').map(f => (
                        <option key={f._id} value={`FEE:${f._id}`}>{f.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Rooms">
                      {fees.filter(f => f.category === 'Room').map(f => (
                        <option key={f._id} value={`FEE:${f._id}`}>{f.name}</option>
                      ))}
                    </optgroup>
                    <option value="Other">Other...</option>
                  </select>
                </div>
                {newBill.type === 'Other' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Custom Type Name:</label>
                    <input 
                      className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/20 outline-none font-medium transition-all"
                      placeholder="Enter custom service name..."
                      onChange={e => setNewBill({...newBill, customType: e.target.value})}
                    />
                  </div>
                )}
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
                {isEditMode ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
