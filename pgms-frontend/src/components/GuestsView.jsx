import { useState, useEffect } from 'react';
import { Users, UserPlus, Building2, Phone, MapPin, Briefcase, Calendar, IndianRupee, Bed, Edit3, X, Trash2, Archive, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../api/axios';

export default function GuestsView() {
    const [guests, setGuests] = useState([]);
    const [properties, setProperties] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter tab: 'active' or 'archived'
    const [viewTab, setViewTab] = useState('active');

    // Modal States: Onboarding vs Editing
    const [showModal, setShowModal] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);

    const [guestForm, setGuestForm] = useState({
        property: '',
        room: '',
        name: '',
        phone: '',
        hometown_address: '',
        organization: '',
        monthly_rent: '',
        security_deposit: '',
        deposit_refunded: false,
        move_in_date: new Date().toISOString().split('T')[0],
        move_out_date: '',
        status: 'active'
    });

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [guestsRes, propsRes, roomsRes] = await Promise.all([
                    API.get('guests/'),
                    API.get('properties/'),
                    API.get('rooms/')
                ]);
                if (isMounted) {
                    setGuests(guestsRes.data);
                    setProperties(propsRes.data);
                    setRooms(roomsRes.data);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to fetch guests and property records.');
                    console.error('Error fetching guest data:', err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    // Filter rooms dynamically based on selected property
    const selectedPropId = guestForm.property ? String(guestForm.property) : '';
    const availableRooms = rooms.filter(room => {
        if (!selectedPropId) return false;
        const roomPropId = typeof room.property === 'object' && room.property !== null 
            ? String(room.property.id) 
            : String(room.property);
        return roomPropId === selectedPropId;
    });

    // Display list based on active/archived tab
    const displayedGuests = guests.filter(g => {
        if (viewTab === 'active') return g.status === 'active' || g.status === 'notice';
        return g.status === 'moved_out';
    });

    const handleOpenCreate = () => {
        setEditingGuest(null);
        setGuestForm({
            property: '', room: '', name: '', phone: '',
            hometown_address: '', organization: '', monthly_rent: '',
            security_deposit: '', deposit_refunded: false,
            move_in_date: new Date().toISOString().split('T')[0], move_out_date: '', status: 'active'
        });
        setShowModal(true);
    };

    const handleOpenEdit = (guest) => {
        setEditingGuest(guest);
        const propId = typeof guest.property === 'object' && guest.property !== null ? guest.property.id : guest.property;
        const roomId = typeof guest.room === 'object' && guest.room !== null ? guest.room.id : guest.room;

        setGuestForm({
            property: propId ? String(propId) : '',
            room: roomId ? String(roomId) : '',
            name: guest.name || '',
            phone: guest.phone || '',
            hometown_address: guest.hometown_address || '',
            organization: guest.organization || '',
            monthly_rent: guest.monthly_rent || '',
            security_deposit: guest.security_deposit || '',
            deposit_refunded: guest.deposit_refunded || false,
            move_in_date: guest.move_in_date || new Date().toISOString().split('T')[0],
            move_out_date: guest.move_out_date || '',
            status: guest.status || 'active'
        });
        setShowModal(true);
    };

    const handleStatusChange = (newStatus) => {
        const todayStr = new Date().toISOString().split('T')[0];
        setGuestForm(prev => ({
            ...prev,
            status: newStatus,
            move_out_date: newStatus === 'moved_out' ? (prev.move_out_date || todayStr) : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!guestForm.property || !guestForm.name || !guestForm.phone || !guestForm.monthly_rent) return;

        try {
            const payload = {
                property: parseInt(guestForm.property),
                room: (guestForm.status === 'moved_out' || !guestForm.room) ? null : parseInt(guestForm.room),
                name: guestForm.name,
                phone: guestForm.phone,
                hometown_address: guestForm.hometown_address || '',
                organization: guestForm.organization || '',
                monthly_rent: parseFloat(guestForm.monthly_rent),
                security_deposit: guestForm.security_deposit ? parseFloat(guestForm.security_deposit) : 0.00,
                deposit_refunded: guestForm.deposit_refunded,
                move_in_date: guestForm.move_in_date,
                move_out_date: guestForm.status === 'moved_out' ? (guestForm.move_out_date || new Date().toISOString().split('T')[0]) : null,
                status: guestForm.status
            };

            if (editingGuest) {
                await API.put(`guests/${editingGuest.id}/`, payload);
            } else {
                await API.post('guests/', payload);
            }

            const [updatedGuests, updatedRooms] = await Promise.all([
                API.get('guests/'),
                API.get('rooms/')
            ]);
            
            setGuests(updatedGuests.data);
            setRooms(updatedRooms.data);
            setShowModal(false);
        } catch (err) {
            console.error('Error saving guest record:', err);
            alert(err.response?.data?.message || 'Failed to save guest record.');
        }
    };

    const handleDelete = async () => {
        if (!editingGuest) return;
        if (!window.confirm(`Are you sure you want to permanently delete ${editingGuest.name}? This action cannot be undone.`)) return;

        try {
            await API.delete(`guests/${editingGuest.id}/`);
            const [updatedGuests, updatedRooms] = await Promise.all([
                API.get('guests/'),
                API.get('rooms/')
            ]);
            setGuests(updatedGuests.data);
            setRooms(updatedRooms.data);
            setShowModal(false);
        } catch (err) {
            console.error('Error deleting record:', err);
            alert('Could not delete record.');
        }
    };

    if (loading) return <div className="p-6 text-slate-500 font-medium font-sans">Querying tenant roster...</div>;
    if (error) return <div className="p-6 text-rose-500 font-medium font-sans">{error}</div>;

    return (
        <div className="space-y-6 font-sans">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Guests & Tenants Roster</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage active tenants, security deposits, and move-out records.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setViewTab('active')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                                viewTab === 'active' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Active Tenants ({guests.filter(g => g.status !== 'moved_out').length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewTab('archived')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                                viewTab === 'archived' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Archive className="w-3.5 h-3.5" /> Moved Out ({guests.filter(g => g.status === 'moved_out').length})
                        </button>
                    </div>

                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Check-In Guest</span>
                    </button>
                </div>
            </div>

            {/* Guest Cards Grid */}
            {displayedGuests.length === 0 ? (
                <div className="text-center bg-white border border-slate-200 rounded-xl p-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">No {viewTab === 'active' ? 'active guests' : 'archived move-out records'} found</h3>
                    <p className="text-slate-400 text-sm mt-1">
                        {viewTab === 'active' ? 'Click Check-In Guest to register a tenant.' : 'Tenants marked as Moved Out will appear here for audit history.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedGuests.map((guest) => {
                        const matchedRoom = rooms.find(r => r.id === (typeof guest.room === 'object' ? guest.room?.id : guest.room));
                        const matchedProperty = properties.find(p => p.id === (typeof guest.property === 'object' ? guest.property?.id : guest.property));

                        return (
                            <div 
                                key={guest.id} 
                                onClick={() => handleOpenEdit(guest)}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 flex flex-col justify-between cursor-pointer group relative"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{guest.name}</h3>
                                                <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                                                <Phone className="w-3 h-3" /> {guest.phone}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                            guest.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            guest.status === 'notice' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                            'bg-rose-50 text-rose-700 border border-rose-100'
                                        }`}>
                                            {guest.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Stay Details */}
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-2">
                                        <div className="flex items-center justify-between text-slate-600">
                                            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> Property:</span>
                                            <span className="font-semibold text-slate-800">{matchedProperty ? matchedProperty.name : `Property #${guest.property}`}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-slate-600">
                                            <span className="flex items-center gap-1.5"><Bed className="w-3.5 h-3.5 text-slate-400" /> Room:</span>
                                            <span className="font-semibold text-slate-800">{matchedRoom ? `Room ${matchedRoom.room_number}` : 'Unassigned / Released'}</span>
                                        </div>
                                    </div>

                                    {/* Personal Info */}
                                    <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                                        {guest.organization && (
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="line-clamp-1">{guest.organization}</span>
                                            </div>
                                        )}
                                        {guest.hometown_address && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="line-clamp-1">{guest.hometown_address}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Security Deposit Badge */}
                                    <div className="flex items-center justify-between text-xs bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/60">
                                        <span className="text-indigo-900 font-medium flex items-center gap-1">
                                            Deposit: ₹{guest.security_deposit || 0}
                                        </span>
                                        <span className={`font-semibold flex items-center gap-1 text-[11px] ${guest.deposit_refunded ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {guest.deposit_refunded ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                            {guest.deposit_refunded ? 'Refunded' : 'Held'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Monthly Rent</p>
                                        <p className="text-sm font-bold text-indigo-600 flex items-center">
                                            <IndianRupee className="w-3.5 h-3.5" />{guest.monthly_rent}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                            {guest.status === 'moved_out' ? 'Move-Out Date' : 'Move-In Date'}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1 justify-end">
                                            <Calendar className="w-3 h-3 text-slate-400" /> 
                                            {guest.status === 'moved_out' ? (guest.move_out_date || 'N/A') : guest.move_in_date}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Shell */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 text-lg">
                                {editingGuest ? `Edit Details: ${editingGuest.name}` : 'Onboard Guest / Tenant'}
                            </h2>
                            <div className="flex items-center gap-2">
                                {editingGuest && (
                                    <button 
                                        type="button" 
                                        onClick={handleDelete}
                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="Permanently Delete Record"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-medium text-sm cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Property & Room Selection */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">PG Building</label>
                                    <select 
                                        required
                                        value={guestForm.property}
                                        onChange={e => setGuestForm({ ...guestForm, property: e.target.value, room: '' })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                                    >
                                        <option value="">-- Select Property --</option>
                                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                        Assign Room
                                    </label>
                                    <select 
                                        value={guestForm.room}
                                        disabled={!guestForm.property || guestForm.status === 'moved_out'}
                                        onChange={e => setGuestForm({ ...guestForm, room: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 disabled:bg-slate-100 cursor-pointer"
                                    >
                                        <option value="">
                                            {guestForm.status === 'moved_out' 
                                                ? '-- Room Released on Move-Out --' 
                                                : !guestForm.property 
                                                    ? '-- Select Property First --' 
                                                    : availableRooms.length === 0 
                                                        ? '-- No Rooms in this Property --' 
                                                        : '-- Unassigned --'}
                                        </option>
                                        {availableRooms.map(r => (
                                            <option key={r.id} value={r.id}>
                                                Room {r.room_number} (Floor {r.floor_number})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                                    <input 
                                        type="text" required placeholder="e.g. Rahul Sharma"
                                        value={guestForm.name}
                                        onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Phone Number</label>
                                    <input 
                                        type="text" required placeholder="e.g. 9876543210"
                                        value={guestForm.phone}
                                        onChange={e => setGuestForm({ ...guestForm, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Organization & Hometown Address */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Company / College</label>
                                    <input 
                                        type="text" placeholder="e.g. Tech Corp / DU"
                                        value={guestForm.organization}
                                        onChange={e => setGuestForm({ ...guestForm, organization: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Hometown Address</label>
                                    <input 
                                        type="text" placeholder="e.g. Rewari, Haryana"
                                        value={guestForm.hometown_address}
                                        onChange={e => setGuestForm({ ...guestForm, hometown_address: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Rent & Security Deposit */}
                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Monthly Rent (₹)</label>
                                    <input 
                                        type="number" required placeholder="7500"
                                        value={guestForm.monthly_rent}
                                        onChange={e => setGuestForm({ ...guestForm, monthly_rent: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Security Deposit (₹)</label>
                                    <input 
                                        type="number" placeholder="10000"
                                        value={guestForm.security_deposit}
                                        onChange={e => setGuestForm({ ...guestForm, security_deposit: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Status & Dates */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Stay Status</label>
                                    <select 
                                        value={guestForm.status}
                                        onChange={e => handleStatusChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                                    >
                                        <option value="active">Active</option>
                                        <option value="notice">On Notice</option>
                                        <option value="moved_out">Moved Out</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Move-In Date</label>
                                    <input 
                                        type="date" required
                                        value={guestForm.move_in_date}
                                        onChange={e => setGuestForm({ ...guestForm, move_in_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Move-Out Date</label>
                                    <input 
                                        type="date"
                                        disabled={guestForm.status !== 'moved_out'}
                                        value={guestForm.move_out_date}
                                        onChange={e => setGuestForm({ ...guestForm, move_out_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 disabled:bg-slate-100"
                                    />
                                </div>
                            </div>

                            {/* Security Deposit Refund Status Checkbox */}
                            {guestForm.status === 'moved_out' && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50/60 rounded-lg border border-amber-200/80">
                                    <input 
                                        type="checkbox"
                                        id="refund_check"
                                        checked={guestForm.deposit_refunded}
                                        onChange={e => setGuestForm({ ...guestForm, deposit_refunded: e.target.checked })}
                                        className="rounded text-indigo-600 cursor-pointer w-4 h-4"
                                    />
                                    <label htmlFor="refund_check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                        Security deposit has been refunded / settled with tenant
                                    </label>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer">
                                    {editingGuest ? 'Save Changes' : 'Onboard Guest'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}