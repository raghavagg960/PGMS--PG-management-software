import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Building2, 
    Bed, 
    Users, 
    ShieldCheck, 
    Settings 
} from 'lucide-react';

export default function Sidebar() {
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Properties', path: '/properties', icon: Building2 },
        { name: 'Rooms & Layouts', path: '/rooms', icon: Bed },
        { name: 'Guests & Tenants', path: '/guests', icon: Users },
        { name: 'Staff Management', path: '/staff', icon: ShieldCheck },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between font-sans">
            {/* Top Section: Navigation Links */}
            <div className="p-4 flex-1">
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer
                                    ${isActive 
                                        ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section: Sidebar Settings Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer
                        ${isActive 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                    `}
                >
                    <Settings className="w-5 h-5 text-slate-400" />
                    <span>System Settings</span>
                </NavLink>
            </div>
        </aside>
    );
}

