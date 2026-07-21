import { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Layers, BedDouble, Users } from 'lucide-react';
import API from '../api/axios';

export default function PropertiesView() {
    const [properties, setProperties] = useState([]);
    // Initialized to true by default, so no immediate setter call is needed on mount
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [newProp, setNewProp] = useState({ 
        name: '', 
        address: '', 
        total_floors: '1', 
        total_rooms: '0', 
        total_beds: '0' 
    });

    useEffect(() => {
        let isMounted = true;

        const fetchProperties = async () => {
            try {
                const response = await API.get('properties/');
                if (isMounted) {
                    setProperties(response.data);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to retrieve managed properties from the database.');
                    console.error(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProperties();

        // Cleanup function to prevent setting state on an unmounted component
        return () => {
            isMounted = false;
        };
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newProp.name || !newProp.address) return;
        
        try {
            const response = await API.post('properties/', {
                name: newProp.name,
                address: newProp.address,
                total_floors: parseInt(newProp.total_floors) || 1,
                total_rooms: parseInt(newProp.total_rooms) || 0,
                total_beds: parseInt(newProp.total_beds) || 0
            });
            
            setProperties([...properties, response.data]);
            setNewProp({ name: '', address: '', total_floors: '1', total_rooms: '0', total_beds: '0' });
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Could not save property asset to database.');
        }
    };

    if (loading) return <div className="p-6 text-slate-500 font-medium font-sans">Querying real estate assets...</div>;
    if (error) return <div className="p-6 text-rose-500 font-medium font-sans">{error}</div>;

    return (
        <div className="space-y-6 font-sans">
            {/* Action Header Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Properties Workspace</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Oversee, configure, and provision your managed real estate assets.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Property</span>
                </button>
            </div>

            {/* Dynamic Real Estate Grid */}
            {properties.length === 0 ? (
                <div className="text-center bg-white border border-slate-200 rounded-xl p-12">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">No properties provisioned yet</h3>
                    <p className="text-slate-400 text-sm mt-1">Click the button above to add your first building asset.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => {
                        const occupancyRate = property.total_beds > 0 
                            ? Math.round((property.occupied_beds / property.total_beds) * 100) 
                            : 0;

                        return (
                            <div key={property.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden group">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                                            {property.status || 'Active'}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                                            {property.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
                                            {/* 🚨 FIXED: Changed flex-shrink-0 to shrink-0 */}
                                            <MapPin className="w-4 h-4 shrink-0" />
                                            <span className="line-clamp-1">{property.address}</span>
                                        </div>
                                    </div>

                                    {/* 3 Grid Core Columns Layout */}
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
                                                {property.occupied_beds}/{property.total_beds}
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

            {/* Intake Form Modal Shell */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 text-lg">Add New Building</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-medium text-sm cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Property Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Royal Living Hub"
                                    required
                                    value={newProp.name}
                                    onChange={e => setNewProp({...newProp, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Operational Address</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Sector 3, Rewari"
                                    required
                                    value={newProp.address}
                                    onChange={e => setNewProp({...newProp, address: e.target.value})}
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
                                        value={newProp.total_floors}
                                        onChange={e => setNewProp({...newProp, total_floors: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Rooms</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={newProp.total_rooms}
                                        onChange={e => setNewProp({...newProp, total_rooms: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Beds</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={newProp.total_beds}
                                        onChange={e => setNewProp({...newProp, total_beds: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer">Provision Asset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}