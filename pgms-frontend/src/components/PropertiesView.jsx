import { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Layers, BedDouble, Users, Edit3, X, Trash2, Shield } from 'lucide-react';
import API from '../api/axios';

export default function PropertiesView() {
    const [properties, setProperties] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal states: Create vs Edit
    const [showModal, setShowModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);

    const [propForm, setPropForm] = useState({ 
        name: '', 
        address: '', 
        total_floors: '1', 
        total_rooms: '0', 
        total_beds: '0' 
    });

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                // Fetch logged-in user role & property data concurrently
                const [userRes, propRes] = await Promise.all([
                    API.get('auth/me/'),
                    API.get('properties/')
                ]);

                if (isMounted) {
                    setCurrentUser(userRes.data);
                    setProperties(propRes.data);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to retrieve managed properties from the database.');
                    console.error('Error fetching data:', err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Check if the current user is a staff member / warden
    const isOwner = currentUser?.is_owner ?? true;

    const handleOpenCreate = () => {
        if (!isOwner) return;
        setEditingProperty(null);
        setPropForm({ name: '', address: '', total_floors: '1', total_rooms: '0', total_beds: '0' });
        setShowModal(true);
    };

    const handleOpenEdit = (property) => {
        if (!isOwner) return; // Prevent staff from opening edit modal
        setEditingProperty(property);
        setPropForm({
            name: property.name || '',
            address: property.address || '',
            total_floors: String(property.total_floors ?? 1),
            total_rooms: String(property.total_rooms ?? 0),
            total_beds: String(property.total_beds ?? 0)
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isOwner || !propForm.name || !propForm.address) return;
        
        try {
            const payload = {
                name: propForm.name,
                address: propForm.address,
                total_floors: parseInt(propForm.total_floors) || 1,
                total_rooms: parseInt(propForm.total_rooms) || 0,
                total_beds: parseInt(propForm.total_beds) || 0
            };

            if (editingProperty) {
                await API.put(`properties/${editingProperty.id}/`, payload);
            } else {
                await API.post('properties/', payload);
            }

            const response = await API.get('properties/');
            setProperties(response.data);
            setShowModal(false);
        } catch (err) {
            console.error('Error saving property asset:', err);
            alert(err.response?.data?.detail || err.response?.data?.message || 'Could not save property asset.');
        }
    };

    const handleDelete = async () => {
        if (!isOwner || !editingProperty) return;
        if (!window.confirm(`Are you sure you want to delete ${editingProperty.name}? This will affect associated rooms and guests.`)) return;

        try {
            await API.delete(`properties/${editingProperty.id}/`);
            const response = await API.get('properties/');
            setProperties(response.data);
            setShowModal(false);
        } catch (err) {
            console.error('Error deleting property:', err);
            alert('Failed to delete property.');
        }
    };

    if (loading) return <div className="p-6 text-slate-500 font-medium font-sans">Querying real estate assets...</div>;
    if (error) return <div className="p-6 text-rose-500 font-medium font-sans">{error}</div>;

    return (
        <div className="space-y-6 font-sans">
            {/* Action Header Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-800">Properties Workspace</h1>
                        {!isOwner && (
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                <Shield className="w-3 h-3" /> {currentUser?.role_display || 'Staff View'}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {isOwner 
                            ? 'Click any property card to update structure, add floors, or modify asset details.'
                            : 'Assigned PG Property scope for your account.'
                        }
                    </p>
                </div>

                {/* Only display "Add Property" button if user is an Owner */}
                {isOwner && (
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Property</span>
                    </button>
                )}
            </div>

            {/* Dynamic Real Estate Grid */}
            {properties.length === 0 ? (
                <div className="text-center bg-white border border-slate-200 rounded-xl p-12">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">No properties provisioned yet</h3>
                    <p className="text-slate-400 text-sm mt-1">
                        {isOwner ? 'Click the button above to add your first building asset.' : 'No property has been assigned to your account.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => {
                        const occupancyRate = property.total_beds > 0 
                            ? Math.round((property.occupied_beds / property.total_beds) * 100) 
                            : 0;

                        return (
                            <div 
                                key={property.id} 
                                onClick={() => isOwner && handleOpenEdit(property)}
                                className={`bg-white rounded-xl border border-slate-200 shadow-xs transition-all flex flex-col justify-between overflow-hidden group ${
                                    isOwner ? 'hover:shadow-md hover:border-indigo-200 cursor-pointer' : 'cursor-default'
                                }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                                            {property.status || 'Active'}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                {property.name}
                                            </h3>
                                            {isOwner && (
                                                <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
                                            <MapPin className="w-4 h-4 shrink-0" />
                                            <span className="line-clamp-1">{property.address}</span>
                                        </div>
                                    </div>

                                    {/* Core Metrics Columns */}
                                    <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 text-center">
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium flex justify-center gap-1 items-center">
                                                <Layers className="w-3 h-3" /> Floors
                                            </p>
                                            <p className="text-sm font-semibold text-slate-700 mt-0.5">{property.total_floors}</p>
                                        </div>
                                        <div className="border-x border-slate-100">
                                            <p className="text-xs text-slate-400 font-medium flex justify-center gap-1 items-center">
                                                <BedDouble className="w-3 h-3" /> Rooms
                                            </p>
                                            <p className="text-sm font-semibold text-slate-700 mt-0.5">{property.total_rooms}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium flex justify-center gap-1 items-center">
                                                <Users className="w-3 h-3" /> Beds
                                            </p>
                                            <p className="text-sm font-semibold text-slate-700 mt-0.5">
                                                {property.occupied_beds || 0}/{property.total_beds}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${Math.min(occupancyRate, 100)}%` }} 
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                        {occupancyRate}% Filled
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Shell (Only accessible to Owners) */}
            {showModal && isOwner && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 text-lg">
                                {editingProperty ? `Edit ${editingProperty.name}` : 'Add New Building'}
                            </h2>
                            <div className="flex items-center gap-2">
                                {editingProperty && (
                                    <button 
                                        type="button" 
                                        onClick={handleDelete}
                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Property Asset"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-medium text-sm cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Property Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Royal Living Hub"
                                    required
                                    value={propForm.name}
                                    onChange={e => setPropForm({...propForm, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Operational Address</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Sector 3, Rewari"
                                    required
                                    value={propForm.address}
                                    onChange={e => setPropForm({...propForm, address: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Floors</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        value={propForm.total_floors}
                                        onChange={e => setPropForm({...propForm, total_floors: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Rooms</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={propForm.total_rooms}
                                        onChange={e => setPropForm({...propForm, total_rooms: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Beds</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={propForm.total_beds}
                                        onChange={e => setPropForm({...propForm, total_beds: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer">
                                    {editingProperty ? 'Save Changes' : 'Provision Asset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}