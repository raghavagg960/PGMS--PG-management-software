import React from 'react';
import { Utensils, Brush, ShieldAlert, LogOut } from 'lucide-react';

export default function RoleDashboard({ user, onLogout }) {
    const role = user?.role;
    const propertyName = user?.assigned_property_name || 'Assigned PG';

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6">
            {/* Header */}
            <header className="max-w-4xl mx-auto flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{propertyName}</h1>
                    <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">
                        Role: <span className="font-semibold text-indigo-600">{role} Dashboard</span>
                    </p>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg border border-rose-100 font-medium text-xs transition-colors cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                </button>
            </header>

            {/* Dedicated View Content */}
            <main className="max-w-4xl mx-auto">
                {role === 'cook' && <CookDashboard propertyId={user?.assigned_property_id} />}
                {role === 'cleaner' && <CleanerDashboard propertyId={user?.assigned_property_id} />}
                {role === 'security' && <SecurityDashboard propertyId={user?.assigned_property_id} />}
            </main>
        </div>
    );
}

//  COOK VIEW
function CookDashboard() {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <Utensils className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Kitchen & Meal Summary</h2>
                    <p className="text-xs text-slate-500">Daily headcount for meal preparation</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Total Guests Staying</p>
                    <p className="text-3xl font-extrabold text-slate-800 mt-1">24</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                    <p className="text-xs text-emerald-700 font-semibold uppercase">Vegetarian Meals</p>
                    <p className="text-3xl font-extrabold text-emerald-800 mt-1">24</p>
                </div>
            </div>
        </div>
    );
}

//  CLEANING STAFF VIEW
function CleanerDashboard() {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                    <Brush className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Housekeeping Schedule</h2>
                    <p className="text-xs text-slate-500">Rooms assigned for daily cleaning</p>
                </div>
            </div>

            <div className="divide-y divide-slate-100 pt-2">
                {['101', '102', '103', '201'].map((room, idx) => (
                    <div key={room} className="py-3 flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-700">Room #{room}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            idx % 2 === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                            {idx % 2 === 0 ? 'Cleaned ✅' : 'Needs Cleaning 🧹'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

//  SECURITY GUARD VIEW
function SecurityDashboard() {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Gate & Entry Register</h2>
                    <p className="text-xs text-slate-500">Log guest entry & exit activity</p>
                </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-500">
                Gate log active. Mark entry/exit for visitors and residents.
            </div>
        </div>
    );
}