import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserCircle } from 'lucide-react';

const OPDRegistration = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const { data } = await axios.get('http://localhost:5000/api/doctors', {
      headers: { Authorization: `Bearer ${localStorage.getItem('hms_token')}` }
    });
    setDoctors(data);
  };

  const selectedDoctorId = watch('consultantDoctor');
  useEffect(() => {
    if (selectedDoctorId) {
      const doc = doctors.find(d => d._id === selectedDoctorId);
      if (doc) setValue('opdFee', doc.opdFee);
    }
  }, [selectedDoctorId, doctors, setValue]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/patients/opd', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms_token')}` }
      });
      alert('OPD Registration Successful');
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-card p-10 rounded-2xl shadow-xl space-y-8 border">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary text-primary-foreground rounded-3xl shadow-lg  ring-primary/20">
            <UserCircle size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-2x text-primary">OPD Outpatient Registration</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Unique ID (UHID)</label>
            <input {...register('uhid', { required: true })} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium" placeholder="e.g. PT-001" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
            <input {...register('name', { required: true })} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Age</label>
            <input type="number" {...register('age', { required: true })} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</label>
            <input type="date" {...register('dob')} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
            <select {...register('gender', { required: true })} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Contact Number</label>
            <input {...register('contact', { required: true })} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Consultant Doctor</label>
            <select {...register('consultantDoctor', { required: true })} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium">
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Doctor Fee (₹)</label>
            <input type="number" {...register('opdFee')} readOnly className="w-full px-5 py-3 border-2 rounded-xl bg-muted/30 font-bold text-primary" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Address</label>
            <input {...register('address')} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">City</label>
            <input {...register('city')} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Pincode</label>
            <input {...register('pincode')} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">State</label>
            <input {...register('state')} className="w-full px-5 py-3 border-2 rounded-xl bg-background border-muted focus:border-primary transition-all font-medium" />
          </div>
          {/* <div className="space-y-2"></div> */}
          <div className="space-y-2">
            <button disabled={loading} type="submit" className="w-full py-3 bg-primary text-primary-foreground text-lg rounded-2xl hover:brightness-110 active:scale-95 transition-all">
              {loading ? 'Registering...' : 'Confirm Registration'}
            </button>
          </div>
        </form>
    </div>
  );
};

export default OPDRegistration;
