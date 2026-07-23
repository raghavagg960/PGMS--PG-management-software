import { useState, useEffect } from 'react';
import { UserCheck, UserPlus, Building2, Phone, IndianRupee, Shield, Utensils, Brush, ShieldAlert, User, Check, X } from 'lucide-react';
import API from '../api/axios';

export default function StaffView() {
    const [staffList, setStaffList] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [newStaff, setNewStaff] = useState({
        property: '',
        name: '',
        role: 'warden',
        phone: '',
        salary: '',
        is_active: true
    });

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [staffRes, propsRes] = await Promise.all([
                    API.get('staff/'),
                    API.get('properties/')
                ]);
                if (isMounted) {
                    setStaffList(staffRes.data);
                    setProperties(propsRes.data);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to fetch staff records and properties.');
                    console.error(err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    // Filter staff list by selected property dropdown
    const filteredStaff = staffList.filter(s => {
        if (selectedPropertyFilter === 'all') return true;
        const pId = typeof s.property === 'object' && s.property !== null ? s.property.id : s.property;
        return String(pId) === String(selectedPropertyFilter);
    });

    // Helper icon selector based on role
    const getRoleIcon = (role) => {
        switch (role) {
            case 'warden': return <Shield className="w-4 h-4 text-indigo-600" />;
            case 'cook': return <Utensils className="w-4 h-4 text-amber-600" />;
            case 'cleaner': return <Brush className="w-4 h-4 text-teal-600" />;
            case 'security': return <ShieldAlert className="w-4 h-4 text-rose-600" />;
            default: return <User className="w-4 h-4 text-slate-600" />;
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newStaff.property || !newStaff.name || !newStaff.phone || !newStaff.salary) return;

        try {
            const payload = {
                property: parseInt(newStaff.property),
                name: newStaff.name,
                role: newStaff.role,
                phone: newStaff.phone,
                salary: parseFloat(newStaff.salary),
                is_active: newStaff.is_active
            };

            await API.post('staff/', payload);

            // Re-fetch updated list
            const updatedStaff = await API.get('staff/');
            setStaffList(updatedStaff.data);

            setNewStaff({ property: '', name: '', role: 'warden', phone: '', salary: '', is_active: true });
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to onboard staff member.');
        }
    };

    const toggleStatus = async (staffMember) => {
        try {
            const updatedStatus = !staffMember.is_active;
            await API.patch(`staff/${staffMember.id}/`, { is_active: updatedStatus });
            
            setStaffList(staffList.map(s => s.id === staffMember.id ? { ...s, is_active: updatedStatus } : s));
        } catch (err) {
            console.error('Error updating staff status:', err);
            alert('Could not update staff status.');
        }
    };

    if (loading) return <div className="p-6 text-slate-500 font-medium font-sans">Querying staff database...</div>;
    if (error) return <div className="p-6 text-rose-500 font-medium font-sans">{error}</div>;

    return (
        <div className="space-y-6 font-sans">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Staff Management Portal</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage wardens, kitchen team, housekeeping, and security staff.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Property Filter Dropdown */}
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                            value={selectedPropertyFilter}
                            onChange={e => setSelectedPropertyFilter(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Properties</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Onboard Staff</span>
                    </button>
                </div>
            </div>

            {/* Staff Grid */}
            {filteredStaff.length === 0 ? (
                <div className="text-center bg-white border border-slate-200 rounded-xl p-12">
                    <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">No staff members found</h3>
                    <p className="text-slate-400 text-sm mt-1">Select a different property or click Onboard Staff to register employees.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStaff.map((staff) => {
                        const matchedProperty = properties.find(p => p.id === (typeof staff.property === 'object' ? staff.property?.id : staff.property));

                        return (
                            <div key={staff.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                                {getRoleIcon(staff.role)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">{staff.name}</h3>
                                                <span className="text-xs font-semibold text-slate-500">
                                                    {staff.role_display || staff.role}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleStatus(staff)}
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                                                staff.is_active 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100' 
                                                    : 'bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100'
                                            }`}
                                        >
                                            {staff.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            {staff.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-2">
                                        <div className="flex items-center justify-between text-slate-600">
                                            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> Assigned PG:</span>
                                            <span className="font-semibold text-slate-800">{staff.property_name || matchedProperty?.name || `Property #${staff.property}`}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-slate-600">
                                            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Phone:</span>
                                            <span className="font-semibold text-slate-800">{staff.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Monthly Salary</p>
                                        <p className="text-sm font-bold text-indigo-600 flex items-center">
                                            <IndianRupee className="w-3.5 h-3.5" />{staff.salary}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Onboarding Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 text-lg">Onboard Staff Member</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-medium text-sm cursor-pointer">✕</button>
                        </div>

                        <form onSubmit={handleCreate} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Target PG Building</label>
                                <select 
                                    required
                                    value={newStaff.property}
                                    onChange={e => setNewStaff({ ...newStaff, property: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                                >
                                    <option value="">-- Choose PG Building --</option>
                                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                                    <input 
                                        type="text" required placeholder="e.g. Ramesh Kumar"
                                        value={newStaff.name}
                                        onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Designation / Role</label>
                                    <select 
                                        value={newStaff.role}
                                        onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                                    >
                                        <option value="warden">Warden</option>
                                        <option value="cook">Cook / Kitchen Staff</option>
                                        <option value="cleaner">Cleaning / Housekeeping</option>
                                        <option value="security">Security Guard</option>
                                        <option value="other">Other Support Staff</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Phone Number</label>
                                    <input 
                                        type="text" required placeholder="e.g. 9876543210"
                                        value={newStaff.phone}
                                        onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Monthly Salary (₹)</label>
                                    <input 
                                        type="number" required placeholder="15000"
                                        value={newStaff.salary}
                                        onChange={e => setNewStaff({ ...newStaff, salary: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer">Onboard Staff</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}