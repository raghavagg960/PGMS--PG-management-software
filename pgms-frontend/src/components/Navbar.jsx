import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, ChevronDown, LogOut, User, Building, Bell } from 'lucide-react';
import API from '../api/axios'; // Import our Axios interceptor client

export default function Navbar() {
    const { user, logout } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const [propertyOpen, setPropertyOpen] = useState(false);
    
    // Switch from mock arrays to dynamic database states
    const [properties, setProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [loadingProperties, setLoadingProperties] = useState(true);
    
    const profileRef = useRef(null);
    const propertyRef = useRef(null);

    // Fetch real property assets registered under this active owner
    useEffect(() => {
        async function fetchOwnerProperties() {
            try {
                // Hits your PGPropertyViewSet endpoint (which automatically filters by request.user)
                const response = await API.get('properties/'); 
                setProperties(response.data);
                if (response.data.length > 0) {
                    setSelectedProperty(response.data[0]); // Default to first PG found
                }
            } catch (err) {
                console.error("Failed to load property listings:", err);
            } finally {
                setLoadingProperties(false);
            }
        }
        fetchOwnerProperties();
    }, []);

    // Close overlays automatically if clicking anywhere outside of them
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
            if (propertyRef.current && !propertyRef.current.contains(event.target)) {
                setPropertyOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white border-b border-slate-200/80 h-16 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-between">
            
            {/* Left Section: Real-Time Multi-Property Workspace Selector */}
            <div className="flex items-center gap-4">
                <div className="relative" ref={propertyRef}>
                    <button 
                        onClick={() => setPropertyOpen(!propertyOpen)}
                        disabled={loadingProperties || properties.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        <Building className="w-4 h-4 text-indigo-600" />
                        <span className="max-w-[180px] sm:max-w-[240px] truncate">
                            {loadingProperties ? "Loading PGs..." : (selectedProperty?.name || "No PGs Registered")}
                        </span>
                        {properties.length > 1 && (
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${propertyOpen ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {/* Property Dropdown Overlay Menu — Only displays if multiple PGs exist */}
                    {propertyOpen && properties.length > 1 && (
                        <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                            <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 tracking-wider uppercase">
                                Switch Property
                            </div>
                            {properties.map((prop) => (
                                <button
                                    key={prop.id}
                                    onClick={() => {
                                        setSelectedProperty(prop);
                                        setPropertyOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors ${selectedProperty?.id === prop.id ? 'text-indigo-600 font-medium bg-indigo-50/40' : 'text-slate-600'}`}
                                >
                                    <Building className="w-3.5 h-3.5" />
                                    <span className="truncate">{prop.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Section: Global Fluid Search bar Layout */}
            <div className="flex-1 max-w-md mx-8 hidden md:block">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Search guests, rooms, transactions..."
                    />
                </div>
            </div>

            {/* Right Section: Alerts + Interactive User Avatar */}
            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <button className="p-1.5 text-slate-400 hover:text-slate-500 relative rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                    <Bell className="w-5 h-5" />
                </button>

                <hr className="w-px h-6 bg-slate-200 hidden sm:block" />

                {/* Profile Toggle Button */}
                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 focus:outline-none cursor-pointer group"
                    >
                        <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:opacity-95 transition-opacity">
                            {user?.first_name ? user.first_name[0].toUpperCase() : 'O'}
                        </div>
                        <div className="hidden sm:block text-left max-w-[100px]">
                            <p className="text-sm font-semibold text-slate-700 truncate leading-tight">
                                {user?.first_name || 'Owner'}
                            </p>
                            <p className="text-xs text-slate-400 truncate uppercase tracking-tight">Admin</p>
                        </div>
                    </button>

                    {/* Dropdown Menu popover element */}
                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                                <p className="text-xs text-slate-400">Signed in as</p>
                                <p className="text-sm font-semibold text-slate-700 truncate">{user?.email || 'N/A'}</p>
                            </div>

                            <a href="#profile" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                <User className="w-4 h-4 text-slate-400" /> My Profile
                            </a>

                            <hr className="border-slate-100 my-1" />

                            <button 
                                onClick={logout}
                                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50/60 flex items-center gap-2 font-medium transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}