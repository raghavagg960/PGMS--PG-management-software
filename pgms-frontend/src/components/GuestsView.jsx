import { useState, useEffect } from 'react';
import { Users, UserPlus, Building2, Phone, MapPin, Briefcase, Calendar, IndianRupee, Bed } from 'lucide-react';
import API from '../api/axios';

export default function GuestsView() {
    const [guests, setGuests] = useState([]);
    const [properties, setProperties] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [newGuest, setNewGuest] = useState({
        property: '',
        room: '',
        name: '',
        phone: '',
        hometown_address: '',
        organization: '',
        monthly_rent: '',
        move_in_date: new Date().toISOString().split('T')[0],
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
                    console.error(err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    // Filter rooms dynamically based on selected property in modal
const selectedPropId = newGuest.property ? String(newGuest.property) : '';

const availableRooms = rooms.filter(room => {
    if (!selectedPropId) return false;
    
    // Extract property ID whether it's an object { id: 1 } or plain integer/string ID 1
    const roomPropId = typeof room.property === 'object' && room.property !== null 
        ? String(room.property.id) 
        : String(room.property);
        
    return roomPropId === selectedPropId;
});

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newGuest.property || !newGuest.name || !newGuest.phone || !newGuest.monthly_rent) return;

        try {
            const payload = {
                property: parseInt(newGuest.property),
                room: newGuest.room ? parseInt(newGuest.room) : null,
                name: newGuest.name,
                phone: newGuest.phone,
                hometown_address: newGuest.hometown_address,
                organization: newGuest.organization,
                monthly_rent: parseFloat(newGuest.monthly_rent),
                move_in_date: newGuest.move_in_date,
                status: newGuest.status
            };

            await API.post('guests/', payload);

            // Re-fetch all data to ensure room current_occupancy updates
            const [updatedGuests, updatedRooms] = await Promise.all([
                API.get('guests/'),
                API.get('rooms/')
            ]);
            
            setGuests(updatedGuests.data);
            setRooms(updatedRooms.data);

            setNewGuest({
                property: '', room: '', name: '', phone: '',
                hometown_address: '', organization: '', monthly_rent: '',
                move_in_date: new Date().toISOString().split('T')[0], status: 'active'
            });
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to check in guest. Please verify form values.');
        }
    };

    if (loading) return <div className="p-6 text-slate-500 font-medium font-sans">Querying tenant roster...</div>;
    if (error) return <div className="p-6 text-rose-500 font-medium font-sans">{error}</div>;

    return (
        <div className="space-y-6 font-sans">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Guests & Tenants Roster</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Onboard new occupants, track room assignments, and manage stay statuses.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Check-In Guest</span>
                </button>
            </div>

            {/* Guest Cards Grid */}
            {guests.length === 0 ? (
                <div className="text-center bg-white border border-slate-200 rounded-xl p-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">No active guests checked in</h3>
                    <p className="text-slate-400 text-sm mt-1">Click the button above to register your first tenant.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guests.map((guest) => {
                        const matchedRoom = rooms.find(r => r.id === guest.room);
                        const matchedProperty = properties.find(p => p.id === guest.property);

                        return (
                            <div key={guest.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{guest.name}</h3>
                                            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                                                <Phone className="w-3 h-3" /> {guest.phone}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                            guest.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            guest.status === 'notice' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                            'bg-slate-100 text-slate-600 border border-slate-200'
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
                                            <span className="flex items-center gap-1.5"><Bed className="w-3.5 h-3.5 text-slate-400" /> Room Assigned:</span>
                                            <span className="font-semibold text-slate-800">{matchedRoom ? `Room ${matchedRoom.room_number}` : 'Unassigned'}</span>
                                        </div>
                                    </div>

                                    {/* Personal Info Details */}
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
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Monthly Rent</p>
                                        <p className="text-sm font-bold text-indigo-600 flex items-center">
                                            <IndianRupee className="w-3.5 h-3.5" />{guest.monthly_rent}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Move-In Date</p>
                                        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1 justify-end">
                                            <Calendar className="w-3 h-3 text-slate-400" /> {guest.move_in_date}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Check-In Modal Shell */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 text-lg">Onboard Guest / Tenant</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-medium text-sm cursor-pointer">✕</button>
                        </div>

                        <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Property & Room Selection */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">PG Building</label>
                                    <select 
                                        required
                                        value={newGuest.property}
                                        onChange={e => setNewGuest({ ...newGuest, property: e.target.value, room: '' })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="">-- Select Property --</option>
                                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
        Assign Room ({availableRooms.length} Available)
    </label>
    <select 
        value={newGuest.room}
        disabled={!newGuest.property}
        onChange={e => setNewGuest({ ...newGuest, room: e.target.value })}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
    >
        <option value="">
            {!newGuest.property 
                ? '-- Select Property First --' 
                : availableRooms.length === 0 
                    ? '-- No Rooms Found for this Property --' 
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
                                        value={newGuest.name}
                                        onChange={e => setNewGuest({ ...newGuest, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Phone Number</label>
                                    <input 
                                        type="text" required placeholder="e.g. 9876543210"
                                        value={newGuest.phone}
                                        onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Organization & Hometown */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Company / College / Organization</label>
                                <input 
                                    type="text" placeholder="e.g. Tech Corp / DU"
                                    value={newGuest.organization}
                                    onChange={e => setNewGuest({ ...newGuest, organization: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Hometown Address</label>
                                <textarea 
                                    rows="2" placeholder="Permanent home address..."
                                    value={newGuest.hometown_address}
                                    onChange={e => setNewGuest({ ...newGuest, hometown_address: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Rent & Dates */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Monthly Rent (₹)</label>
                                    <input 
                                        type="number" required placeholder="7500"
                                        value={newGuest.monthly_rent}
                                        onChange={e => setNewGuest({ ...newGuest, monthly_rent: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Move-In Date</label>
                                    <input 
                                        type="date" required
                                        value={newGuest.move_in_date}
                                        onChange={e => setNewGuest({ ...newGuest, move_in_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Stay Status</label>
                                    <select 
                                        value={newGuest.status}
                                        onChange={e => setNewGuest({ ...newGuest, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="notice">On Notice</option>
                                        <option value="moved_out">Moved Out</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer">Onboard Guest</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}