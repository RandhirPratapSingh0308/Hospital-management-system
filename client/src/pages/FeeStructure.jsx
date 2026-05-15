import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserPlus, Settings, Trash2, Edit2, Plus, Save, X, Activity, DollarSign } from 'lucide-react';

const FeeStructure = () => {
  const [doctors, setDoctors] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'fees'

  // Modal states
  const [showDocModal, setShowDocModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editingFee, setEditingFee] = useState(null);

  const [docForm, setDocForm] = useState({ name: '', specialization: '', contact: '', opdFee: 0, ipdVisitFee: 0 });
  const [feeForm, setFeeForm] = useState({ name: '', category: 'Service', rate: 0 });

  const token = localStorage.getItem('hms_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, fRes] = await Promise.all([
        axios.get('http://localhost:5000/api/doctors', { headers }),
        axios.get('http://localhost:5000/api/fees', { headers })
      ]);
      setDoctors(dRes.data);
      setFees(fRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoc) {
        await axios.put(`http://localhost:5000/api/doctors/${editingDoc._id}`, docForm, { headers });
      } else {
        await axios.post('http://localhost:5000/api/doctors', docForm, { headers });
      }
      setShowDocModal(false);
      setEditingDoc(null);
      setDocForm({ name: '', specialization: '', contact: '', opdFee: 0, ipdVisitFee: 0 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving doctor');
    }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFee) {
        await axios.put(`http://localhost:5000/api/fees/${editingFee._id}`, feeForm, { headers });
      } else {
        await axios.post('http://localhost:5000/api/fees', feeForm, { headers });
      }
      setShowFeeModal(false);
      setEditingFee(null);
      setFeeForm({ name: '', category: 'Service', rate: 0 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving fee');
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/doctors/${id}`, { headers });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting doctor');
    }
  };

  const deleteFee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee item?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/fees/${id}`, { headers });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting fee');
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-primary animate-pulse">Loading Fee Structure...</div>;

  return (
    <div className="w-full mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <Settings className="text-primary" size={32} />
            Fee Structure Management
          </h1>
          <p className="text-gray-500 font-medium mt-1">Manage doctor consultation fees and hospital service charges.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border">
          <button 
            onClick={() => setActiveTab('doctors')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'doctors' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Doctors
          </button>
          <button 
            onClick={() => setActiveTab('fees')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'fees' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Services & Rooms
          </button>
        </div>
      </div>

      {activeTab === 'doctors' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-700">Available Doctors</h2>
            <button 
              onClick={() => { setShowDocModal(true); setEditingDoc(null); setDocForm({ name: '', specialization: '', contact: '', opdFee: 0, ipdVisitFee: 0 }); }}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              <UserPlus size={18} />
              Add Doctor
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => (
              <div key={doc._id} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-primary rounded-2xl">
                    <Activity size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingDoc(doc); setDocForm(doc); setShowDocModal(true); }} className="p-2 text-gray-400 hover:text-primary transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => deleteDoctor(doc._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{doc.name}</h3>
                <p className="text-sm text-gray-500 font-medium mb-4">{doc.specialization}</p>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">OPD Fee</label>
                    <span className="text-lg font-black text-primary">₹{doc.opdFee}</span>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">IPD Visit</label>
                    <span className="text-lg font-black text-primary">₹{doc.ipdVisitFee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-700">General Services & Rates</h2>
            <button 
              onClick={() => { setShowFeeModal(true); setEditingFee(null); setFeeForm({ name: '', category: 'Service', rate: 0 }); }}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
              Add Service
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Item Name</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Rate (₹)</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {fees.map(fee => (
                  <tr key={fee._id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-4 font-bold text-gray-700">{fee.name}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${fee.category === 'Room' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {fee.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-black text-primary">₹{fee.rate}</td>
                    <td className="px-8 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => { setEditingFee(fee); setFeeForm(fee); setShowFeeModal(true); }} className="p-2 text-gray-400 hover:text-primary">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteFee(fee._id)} className="p-2 text-gray-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctor Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-widest">{editingDoc ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button onClick={() => setShowDocModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleDocSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Doctor Name</label>
                <input required className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 ring-primary/20 outline-none" value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Specialization</label>
                <input required className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 ring-primary/20 outline-none" value={docForm.specialization} onChange={e => setDocForm({...docForm, specialization: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">OPD Fee (₹)</label>
                  <input type="number" required className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 ring-primary/20 outline-none" value={docForm.opdFee} onChange={e => setDocForm({...docForm, opdFee: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">IPD Visit Fee (₹)</label>
                  <input type="number" required className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 ring-primary/20 outline-none" value={docForm.ipdVisitFee} onChange={e => setDocForm({...docForm, ipdVisitFee: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg hover:brightness-110 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                <Save size={18} />
                {editingDoc ? 'Update Doctor' : 'Save Doctor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fee Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-widest">{editingFee ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={() => setShowFeeModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleFeeSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Service Name</label>
                <input required className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 ring-primary/20 outline-none" value={feeForm.name} onChange={e => setFeeForm({...feeForm, name: e.target.value})} placeholder="e.g. ICU Room Rate, Oxygen, etc." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                <select className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 ring-primary/20 outline-none font-bold" value={feeForm.category} onChange={e => setFeeForm({...feeForm, category: e.target.value})}>
                  <option value="Room">Room</option>
                  <option value="Service">Service</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Rate (₹)</label>
                <input type="number" required className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 ring-primary/20 outline-none font-bold text-primary" value={feeForm.rate} onChange={e => setFeeForm({...feeForm, rate: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg hover:brightness-110 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                <Save size={18} />
                {editingFee ? 'Update Service' : 'Save Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructure;
