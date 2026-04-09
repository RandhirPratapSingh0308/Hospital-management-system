import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bed } from 'lucide-react';

const IPDRegistration = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ROOM_RATES = {
    'General Ward': 1000,
    'Private Room': 3000,
    'ICU': 8000
  };

  useEffect(() => {
    fetchDoctors();
    fetchNextUHID();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/doctors', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms_token')}` }
      });
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchNextUHID = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/patients/next-uhid', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms_token')}` }
      });
      setValue('uhid', data.nextUHID);
    } catch (err) {
      console.error('Error fetching next UHID:', err);
    }
  };

  const selectedRoomType = watch('roomType');
  useEffect(() => {
    if (selectedRoomType) {
      setValue('roomRate', ROOM_RATES[selectedRoomType]);
    }
  }, [selectedRoomType, setValue]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/patients/ipd', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms_token')}` }
      });
      alert('IPD Admission Successful');
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-card px-10 py-6 rounded-2xl shadow-2xl space-y-8  border-primary/10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary text-primary-foreground rounded-3xl shadow-lg  ring-primary/20">
            <Bed size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-2x text-primary">IPD Inpatient Admission</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-medium">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">UHID</label>
            <input 
              {...register('uhid', { required: true })} 
              readOnly
              className="w-full px-5 py-3 border-2 rounded-xl bg-background border-transparent font-bold focus:outline-none " 
              
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Patient Name</label>
            <input {...register('name', { required: true })} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary focus:border-primary transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Room Type</label>
            <select {...register('roomType', { required: true })} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary focus:border-primary transition-all appearance-none cursor-pointer">
              <option value="">Select Room</option>
              {Object.keys(ROOM_RATES).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Base Room Rate (₹/day)</label>
            <input type="number" {...register('roomRate')} readOnly className="w-full px-5 py-3 border-2 rounded-2xl bg-secondary/20 font-black text-primary border-transparent" placeholder="X-X-X-X" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Consultant Doctor</label>
            <select {...register('consultantDoctor', { required: true })} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary focus:border-primary transition-all  cursor-pointer">
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>)} 
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Advance Amount (₹)</label>
            <input type="number" {...register('advancePaid', { required: true })} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary focus:border-primary transition-all font-bold text-green-600" defaultValue={0} />
          </div>
          
          {/* Demographic overlap for new patients */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Age</label>
            <input type="number" {...register('age', { required: true })} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Date of Birth</label>
            <input type="date" {...register('dob')} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Contact</label>
            <input {...register('contact', { required: true })} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Gender</label>
            <select {...register('gender', { required: true })} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary focus:border-primary transition-all appearance-none cursor-pointer">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="space-y-1 ">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Address</label>
            <input {...register('address')} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary transition-all" placeholder="Full Address" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">City</label>
            <input {...register('city')} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Pincode</label>
            <input {...register('pincode')} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">State</label>
            <input {...register('state')} className="w-full px-5 py-3 border-2 rounded-2xl bg-background border-secondary transition-all" />
          </div>
          
          <div className="col-span-1">
            <button disabled={loading} type="submit" className="w-full py-3 bg-primary text-primary-foreground text-lg rounded-2xl hover:brightness-110 active:scale-95 transition-all">
              {loading ? 'Admitting...' : 'Confirm IPD Admission'}
            </button>
          </div>
        </form>
    </div>
  );
};

export default IPDRegistration;
