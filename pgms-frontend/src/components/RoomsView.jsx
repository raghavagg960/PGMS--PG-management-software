import { useState, useEffect } from 'react';
import { Bed, Plus, Layers, CheckSquare, Square, User, Tv, Bath, Sparkles, Trash2 } from 'lucide-react';
import API from '../api/axios'; 

export default function RoomsView() {
    const [rooms, setRooms] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [generationMode, setGenerationMode] = useState('single'); // 'single' or 'bulk'

    // Form inputs state framework
    const [roomForm, setRoomForm] = useState({
        property: '',
        floor_number: '0',
        room_number: '',
        raw_room_input: '', // Holds strings like "101-110, 115"
        sharing_type: 2,
        has_ac: false,
        has_attached_bathroom: true,
        total_beds: 2,
        total_almirahs: 2
    });

    // Holds the preview grid array before building assets
    const [bulkPreviewList, setBulkPreviewList] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [roomsRes, propsRes] = await Promise.all([
                    API.get('rooms/'),
                    API.get('properties/')
                ]);
                if (isMounted) {
                    setRooms(roomsRes.data);
                    setProperties(propsRes.data);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load rooms or properties data.');
                    console.error(err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    // Parses custom text strings like "101-105, 108, 110-112" into individual list items
    const generatePreviewList = () => {
        if (!roomForm.raw_room_input.trim()) return;
        
        const segments = roomForm.raw_room_input.split(',');
        let generatedNumbers = [];

        segments.forEach(segment => {
            const part = segment.trim();
            if (part.includes('-')) {
                const [startStr, endStr] = part.split('-');
                const start = parseInt(startStr);
                const end = parseInt(endStr);
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    for (let i = start; i <= end; i++) {
                        generatedNumbers.push(i.toString());
                    }
                }
            } else if (part) {
                generatedNumbers.push(part);
            }
        });

        // Remove duplicate entry inputs smoothly
        const uniqueNumbers = [...new Set(generatedNumbers)];
        
        // Build the granular table state array
        const previewItems = uniqueNumbers.map(num => ({
            room_number: num,
            floor_number: roomForm.floor_number,
            sharing_type: roomForm.sharing_type,
            has_ac: roomForm.has_ac,
            has_attached_bathroom: roomForm.has_attached_bathroom,
            total_beds: roomForm.total_beds,
            total_almirahs: roomForm.total_almirahs
        }));

        setBulkPreviewList(previewItems);
    };

    // Toggle structural attributes directly inside individual preview grid columns
    const updatePreviewItem = (index, key, value) => {
        const updated = [...bulkPreviewList];
        updated[index][key] = value;
        setBulkPreviewList(updated);
    };

    const removePreviewItem = (index) => {
        setBulkPreviewList(bulkPreviewList.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roomForm.property) return;

        try {
            if (generationMode === 'single') {
                if (!roomForm.room_number) return;
                await API.post('rooms/', {
                    property: parseInt(roomForm.property),
                    floor_number: parseInt(roomForm.floor_number),
                    room_number: roomForm.room_number,
                    sharing_type: parseInt(roomForm.sharing_type),
                    has_ac: roomForm.has_ac,
                    has_attached_bathroom: roomForm.has_attached_bathroom,
                    total_beds: parseInt(roomForm.total_beds),
                    total_almirahs: parseInt(roomForm.total_almirahs)
                });
            } else {
                if (bulkPreviewList.length === 0) {
                    alert('Please generate and configure a configuration preview matrix first.');
                    return;
                }

                // Map granular items into a parallel batch dispatch array
                const creationPromises = bulkPreviewList.map(item => 
                    API.post('rooms/', {
                        property: parseInt(roomForm.property),
                        floor_number: parseInt(item.floor_number),
                        room_number: item.room_number,
                        sharing_type: parseInt(item.sharing_type),
                        has_ac: item.has_ac,
                        has_attached_bathroom: item.has_attached_bathroom,
                        total_beds: parseInt(item.total_beds),
                        total_almirahs: parseInt(item.total_almirahs)
                    })
                );

                await Promise.all(creationPromises);
            }

            const updatedRooms = await API.get('rooms/');
            setRooms(updatedRooms.data);
            
            // Clean out operational contexts
            setRoomForm({
                property: '', floor_number: '0', room_number: '', raw_room_input: '',
                sharing_type: 2, has_ac: false, has_attached_bathroom: true, total_beds: 2, total_almirahs: 2
            });
            setBulkPreviewList([]);
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Error executing configuration mapping instructions.');
        }
    };

    if (loading) return <div className="p-6 text-slate-500 font-medium font-sans">Querying inventory databases...</div>;
    if (error) return <div className="p-6 text-rose-500 font-medium font-sans">{error}</div>;

    return (
        <div className="space-y-6 font-sans">
            {/* Header Control Panel Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Rooms & Inventories</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Configure your sharing setups, map out structural floors, and auto-generate rooms.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Configure Rooms</span>
                </button>
            </div>

            {/* Inventories Display Grid Layout */}
            {rooms.length === 0 ? (
                <div className="text-center bg-white border border-slate-200 rounded-xl p-12">
                    <Bed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">No rooms mapped out yet</h3>
                    <p className="text-slate-400 text-sm mt-1">Click the configuration action launch button above to generate listings.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => {
                        const bedsAvailable = room.total_beds - (room.current_occupancy || 0);

                        return (
                            <div key={room.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                                                <Bed className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">Room {room.room_number}</h3>
                                                <p className="text-slate-400 text-xs flex items-center gap-1">
                                                    <Layers className="w-3 h-3" /> {room.floor_number === 0 ? 'Ground Floor' : `Floor ${room.floor_number}`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            bedsAvailable === 0 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        }`}>
                                            {bedsAvailable === 0 ? 'Fully Booked' : `${bedsAvailable} Beds Left`}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${room.has_ac ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            <Tv className="w-3 h-3" /> AC: {room.has_ac ? 'Yes' : 'No'}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${room.has_attached_bathroom ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            <Bath className="w-3 h-3" /> {room.has_attached_bathroom ? 'Attached Bath' : 'Common Bath'}
                                        </span>
                                        <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100">
                                            {room.sharing_display}
                                        </span>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Live Occupants ({room.current_occupancy || 0} / {room.total_beds})</p>
                                        {room.guests && room.guests.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {room.guests.map((guest, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{guest.name || 'Active Tenant'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No guests checked in yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Blueprint Container */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 text-lg">Provision Property Inventory</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-medium text-sm cursor-pointer">✕</button>
                        </div>
                        
                        {/* Interactive Mode Toggler Panel */}
                        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
                            <button 
                                type="button" onClick={() => setGenerationMode('single')}
                                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${generationMode === 'single' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Single Room
                            </button>
                            <button 
                                type="button" onClick={() => setGenerationMode('bulk')}
                                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${generationMode === 'bulk' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Sparkles className="w-3 h-3" /> Smart Batch Builder
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Target PG Building</label>
                                    <select 
                                        required
                                        value={roomForm.property}
                                        onChange={e => setRoomForm({...roomForm, property: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="">-- Choose PG Building --</option>
                                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Base Floor Number</label>
                                    <input 
                                        type="number" required min="0" placeholder="0 for Ground, 1, 2"
                                        value={roomForm.floor_number}
                                        onChange={e => setRoomForm({...roomForm, floor_number: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {generationMode === 'single' ? (
                                <>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Room No.</label>
                                            <input 
                                                type="text" required placeholder="e.g. 101"
                                                value={roomForm.room_number}
                                                onChange={e => setRoomForm({...roomForm, room_number: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Sharing Type</label>
                                            <select 
                                                value={roomForm.sharing_type}
                                                onChange={e => {
                                                    const type = parseInt(e.target.value);
                                                    setRoomForm({...roomForm, sharing_type: type, total_beds: type, total_almirahs: type});
                                                }}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value={1}>Single</option>
                                                <option value={2}>Double</option>
                                                <option value={3}>Triple</option>
                                                <option value={4}>Four</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Total Beds</label>
                                            <input 
                                                type="number" required min="1"
                                                value={roomForm.total_beds}
                                                onChange={e => setRoomForm({...roomForm, total_beds: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-6 py-1">
                                        <button type="button" onClick={() => setRoomForm({...roomForm, has_ac: !roomForm.has_ac})} className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                                            {roomForm.has_ac ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                                            <span>Air Conditioning (AC)</span>
                                        </button>
                                        <button type="button" onClick={() => setRoomForm({...roomForm, has_attached_bathroom: !roomForm.has_attached_bathroom})} className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                                            {roomForm.has_attached_bathroom ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                                            <span>Attached Bathroom</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Target Room Query (Comma separated list or ranges)</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. 101-110, 115"
                                                value={roomForm.raw_room_input}
                                                onChange={e => setRoomForm({...roomForm, raw_room_input: e.target.value})}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={generatePreviewList}
                                            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-slate-700 transition-colors h-9 cursor-pointer"
                                        >
                                            Parse Entries
                                        </button>
                                    </div>

                                    {/* Granular Table Editor Grid */}
                                    {bulkPreviewList.length > 0 && (
                                        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-60 overflow-y-auto">
                                            <table className="w-full text-left text-xs text-slate-600 border-collapse">
                                                <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 font-bold text-slate-700">
                                                    <tr>
                                                        <th className="p-2.5">Room</th>
                                                        <th className="p-2.5">Sharing Type</th>
                                                        <th className="p-2.5 text-center">AC</th>
                                                        <th className="p-2.5 text-center">Bath</th>
                                                        <th className="p-2.5 text-center">Drop</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 font-medium">
                                                    {bulkPreviewList.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50">
                                                            <td className="p-2.5 font-bold text-slate-800">{item.room_number}</td>
                                                            <td className="p-2.5">
                                                                <select 
                                                                    value={item.sharing_type}
                                                                    onChange={e => {
                                                                        const type = parseInt(e.target.value);
                                                                        updatePreviewItem(idx, 'sharing_type', type);
                                                                        updatePreviewItem(idx, 'total_beds', type);
                                                                    }}
                                                                    className="border border-slate-200 rounded px-1 py-0.5 bg-white text-xs"
                                                                >
                                                                    <option value={1}>Single</option>
                                                                    <option value={2}>Double</option>
                                                                    <option value={3}>Triple</option>
                                                                    <option value={4}>Four</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-2.5 text-center">
                                                                <input 
                                                                    type="checkbox" checked={item.has_ac}
                                                                    onChange={e => updatePreviewItem(idx, 'has_ac', e.target.checked)}
                                                                    className="rounded text-indigo-600 cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="p-2.5 text-center">
                                                                <input 
                                                                    type="checkbox" checked={item.has_attached_bathroom}
                                                                    onChange={e => updatePreviewItem(idx, 'has_attached_bathroom', e.target.checked)}
                                                                    className="rounded text-indigo-600 cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="p-2.5 text-center">
                                                                <button type="button" onClick={() => removePreviewItem(idx)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                                                                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer">
                                    {generationMode === 'single' ? 'Commit Structure' : `Provision All ${bulkPreviewList.length} Rooms`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}