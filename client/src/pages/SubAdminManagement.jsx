import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserPlus, Key, Info, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const SubAdminManagement = () => {
    const [subadmins, setSubadmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // New Sub-Admin Form State
    const [newAdmin, setNewAdmin] = useState({ name: '', username: '', password: '' });
    const [showForm, setShowForm] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Password Update State
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [showUpdatePassword, setShowUpdatePassword] = useState(false);

    const token = localStorage.getItem('hms_token');

    useEffect(() => {
        fetchSubadmins();
    }, []);

    const fetchSubadmins = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('http://localhost:5000/api/auth/subadmins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubadmins(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch sub-admins');
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');
            await axios.post('http://localhost:5000/api/auth/subadmins', newAdmin, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Sub-admin created successfully');
            setNewAdmin({ name: '', username: '', password: '' });
            setShowForm(false);
            fetchSubadmins();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create sub-admin');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');
            await axios.put(`http://localhost:5000/api/auth/subadmins/${editingAdmin._id}/password`, 
                { password: newPassword }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(`Password for ${editingAdmin.name} updated successfully`);
            setEditingAdmin(null);
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <UserPlus className="text-primary" /> Sub-Admin Management
                </h2>
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    {showForm ? 'Cancel' : 'Create New Sub-Admin'}
                </button>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3 border border-destructive/20">
                    <AlertCircle size={20} /> {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-500/20">
                    <CheckCircle size={20} /> {success}
                </div>
            )}

            {/* Creation Form */}
            {showForm && (
                <section className="bg-card p-8 rounded-2xl shadow-xl border border-primary/10 animate-in slide-in-from-top duration-300">
                    <h3 className="text-xl font-bold mb-6 text-primary">New Account Details</h3>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                className="w-full p-3 rounded-xl border bg-secondary/30 focus:ring-2 ring-primary/50 outline-none transition-all"
                                placeholder="Enter full name"
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Username (ID)</label>
                            <input 
                                type="text" 
                                required
                                autoComplete="off"
                                className="w-full p-3 rounded-xl border bg-secondary/30 focus:ring-2 ring-primary/50 outline-none transition-all font-mono"
                                placeholder="Unique user ID"
                                value={newAdmin.username}
                                onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Password</label>
                            <div className="relative">
                                <input 
                                    type={showNewPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    className="w-full p-3 rounded-xl border bg-secondary/30 focus:ring-2 ring-primary/50 outline-none transition-all pr-12"
                                    placeholder="Initial password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                            <button type="submit" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all">
                                Create Account
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Password Reset Section */}
            {editingAdmin && (
                <section className="bg-card p-8 rounded-2xl shadow-xl border border-destructive/10 animate-pulse-subtle">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Key className="text-primary" /> Update Password for <span className="text-primary underline">{editingAdmin.name}</span>
                    </h3>
                    <form onSubmit={handleUpdatePassword} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-semibold ml-1">New Password</label>
                            <div className="relative">
                                <input 
                                    type={showUpdatePassword ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    className="w-full p-3 rounded-xl border bg-secondary/30 focus:ring-2 ring-primary/50 outline-none transition-all pr-12"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowUpdatePassword(!showUpdatePassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showUpdatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-md">
                            Update
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setEditingAdmin(null)}
                            className="bg-secondary p-3 rounded-xl font-bold hover:bg-secondary/80 transition-all"
                        >
                            Cancel
                        </button>
                    </form>
                </section>
            )}

            {/* Users List */}
            <section className="bg-card p-8 rounded-2xl shadow-sm border space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Info className="text-primary" /> Active Sub-Admins
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b bg-secondary/50 text-muted-foreground uppercase text-xs font-bold tracking-wider">
                                <th className="p-4">Name</th>
                                <th className="p-4">Username (ID)</th>
                                <th className="p-4">Created At</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subadmins.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-muted-foreground italic">
                                        No sub-admins found. Create one above.
                                    </td>
                                </tr>
                            ) : (
                                subadmins.map((admin) => (
                                    <tr key={admin._id} className="border-b hover:bg-secondary/30 transition-all group">
                                        <td className="p-4 font-semibold">{admin.name}</td>
                                        <td className="p-4 font-mono text-primary">{admin.username}</td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {new Date(admin.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => {
                                                    setEditingAdmin(admin);
                                                    setNewPassword('');
                                                    setSuccess('');
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                                            >
                                                <Key size={14} /> Change Password
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

export default SubAdminManagement;
