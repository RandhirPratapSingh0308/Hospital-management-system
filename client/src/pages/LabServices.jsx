import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, FileText, Printer, Plus, X } from 'lucide-react';

const LabServices = () => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd } = useForm();
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [user, setUser] = useState(null);
  const [nextUHID, setNextUHID] = useState('');
  const [maxUHIDNum, setMaxUHIDNum] = useState(0);
  const navigate = useNavigate();

  const watchedUHID = watch('uhid');

  useEffect(() => {
    fetchTests();
    fetchNextUHID();
    const storedUser = localStorage.getItem('hms_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchNextUHID = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/patients/next-uhid', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms_token')}` }
      });
      setNextUHID(data.nextUHID);
      setValue('uhid', data.nextUHID);
      
      const num = parseInt(data.nextUHID.split('-')[1]);
      setMaxUHIDNum(num - 1); // The last used number
    } catch (err) {
      console.error('Error fetching next UHID', err);
    }
  };

  const handleUHIDChange = async (e) => {
    const uhid = e.target.value.toUpperCase();
    setValue('uhid', uhid);
    
    if (!uhid.startsWith('PT-')) return;

    try {
      const { data } = await axios.get(`http://localhost:5000/api/patients/uhid/${uhid}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms_token')}` }
      });
      if (data) {
        setValue('patientName', data.name);
        setValue('contact', data.contact);
        setValue('address', data.address || '');
        setValue('city', data.city || '');
        setValue('state', data.state || '');
      }
    } catch (err) {
      // If not found, we don't clear fields as it might be a new registration
      // But we could clear if we want a fresh start
    }
  };

  const fetchTests = async () => {
    const { data } = await axios.get('http://localhost:5000/api/lab', {
      headers: { Authorization: `Bearer ${localStorage.getItem('hms_token')}` }
    });
    setLabTests(data);
  };

  const onDirectSubmit = async (formData) => {
    // Validation: Check if UHID is not more than max + 1
    const enteredNum = parseInt(formData.uhid.split('-')[1]);
    if (isNaN(enteredNum) || enteredNum > maxUHIDNum + 1) {
      alert(`Invalid UHID. You can only use an existing UHID or the next one (${nextUHID})`);
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/patients/direct-lab', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms_token')}` }
      });
      alert('Walk-in Lab Service Registered successfully');
      reset();
      fetchNextUHID(); // Refresh next UHID
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAdd = async (formData) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/lab', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms_token')}` }
      });
      alert('New Test Added Successfully');
      setShowAddForm(false);
      resetAdd();
      fetchTests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Direct Walk-in Test */}
        <div className="bg-card p-8 rounded-3xl shadow-xl   bg-opacity-90 relative overflow-hidden">
           <div className="flex items-center gap-3 mb-6">
              <FlaskConical className="text-primary" size={28} />
              <h2 className="text-1xl font-bold">Direct Walk-in Test</h2>
           </div>
           <form onSubmit={handleSubmit(onDirectSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">UHID</label>
                    <input 
                      {...register('uhid', { required: true })} 
                      className="w-full px-4 py-2 border rounded-xl bg-background font-mono" 
                      placeholder="PT-001"
                      onBlur={handleUHIDChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Patient Name</label>
                    <input {...register('patientName', { required: true })} className="w-full px-4 py-2 border rounded-xl bg-background" />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact</label>
                    <input {...register('contact', { required: true })} className="w-full px-4 py-2 border rounded-xl bg-background" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Address</label>
                    <input {...register('address')} className="w-full px-4 py-2 border rounded-xl bg-background" />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City</label>
                    <input {...register('city')} className="w-full px-4 py-2 border rounded-xl bg-background" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">State</label>
                    <input {...register('state')} className="w-full px-4 py-2 border rounded-xl bg-background" />
                  </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Test</label>
                     <select 
                       {...register('testId', { required: true })} 
                       className="w-full px-4 py-2 border rounded-xl bg-background cursor-pointer hover:border-primary transition-all shadow-sm"
                       onChange={e => {
                         const test = labTests.find(t => t._id === e.target.value);
                         if(test) setValue('amount', test.price);
                       }}
                     >
                        <option value="">Choose Test</option>
                        {labTests.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount (₹)</label>
                     <input type="number" {...register('amount')} readOnly className="w-full px-4 py-2 border rounded-xl bg-muted/30 font-bold text-primary shadow-inner" />
                  </div>
               </div>
              <button disabled={loading} type="submit" className="w-full py-2 bg-primary text-white  tracking-[2px] rounded-xl hover:brightness-110 active:scale-95 transition-all">
                {loading ? 'Processing...' : 'Confirm & Pay'}
              </button>
           </form>
        </div>

        {/* Test Management / Catalog */}
        <div className="bg-card p-8 rounded-3xl shadow-xl border-t-8 border-secondary space-y-6">
           <div className="flex items-center justify-between mb-2">
              <h2 className="text-1xl font-bold">Test Catalog</h2>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-primary font-bold text-xs hover:underline flex items-center gap-1"
                >
                  {showAddForm ? <><X size={14}/> Close</> : <><Plus size={14}/> Add New Test</>}
                </button>
              )}
           </div>

           {showAddForm && (
             <form onSubmit={handleSubmitAdd(onSubmitAdd)} className="p-4 bg-secondary/30 rounded-2xl space-y-3 border-2 border-dashed border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Test Name</label>
                      <input {...registerAdd('name', { required: true })} className="w-full px-3 py-2 text-sm border rounded-lg bg-background" placeholder="e.g. CBC" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Price (₹)</label>
                      <input type="number" {...registerAdd('price', { required: true })} className="w-full px-3 py-2 text-sm border rounded-lg bg-background" placeholder="0.00" />
                   </div>
                </div>
                <button disabled={loading} type="submit" className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl hover:brightness-110 transition-all">
                  {loading ? 'Adding...' : 'Save New Test'}
                </button>
             </form>
           )}

           <div className="space-y-4 h-[280px] overflow-y-auto pr-2 custom-scrollbar">
               {labTests.map(t => (
                <div key={t._id} className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-all">
                   <div>
                      <div className="font-bold text-1xl">{t.name}</div>
                   </div>
                   <div className="text-xl font-bold text-primary">₹{t.price}</div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Lab Reports History / Printing */}
      <div className="bg-card p-8 rounded-3xl shadow-xl space-y-6 border border-secondary">
         <h2 className="text-1xl font-bold flex items-center gap-2"><Printer className="text-muted-foreground" /> Recent Lab Reports</h2>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b text-xs font-bold text-muted-foreground uppercase tracking-widest">
                     <th className="p-4">Patient</th>
                     <th className="p-4">Test Name</th>
                     <th className="p-4">Date</th>
                     <th className="p-4 text-right">Action</th>
                  </tr>
               </thead>
               <tbody>
                  <tr className="border-b hover:bg-secondary/20 transition-all">
                     <td className="p-4">
                        <div className="font-bold">Rahul Sharma</div>
                        <div className="text-xs font-mono">PT-994</div>
                     </td>
                     <td className="p-4 font-medium">CBC (Complete Blood Count)</td>
                     <td className="p-4 text-xs font-medium">today</td>
                     <td className="p-4 text-right">
                        <button className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs flex items-center gap-2 ml-auto">
                           <FileText size={14} /> Print Report
                        </button>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default LabServices;
