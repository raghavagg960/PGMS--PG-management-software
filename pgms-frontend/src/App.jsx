import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PropertiesView from './components/PropertiesView';
import RoomsView from './components/RoomsView';
import GuestsView from './components/GuestsView';
import StaffView from './components/StaffView';

// Basic Login Guard
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
};

//  Blocks Cook, Cleaner, Security from accessing Admin pages
const AdminOnly = ({ children }) => {
    const { user } = useAuth();
    const isAllowed = !user?.role || ['owner', 'warden'].includes(user.role);
    return isAllowed ? children : <Navigate to="/dashboard" replace />;
};

const DashboardLayout = () => {
    const { user } = useAuth();
    const showSidebar = !user?.role || ['owner', 'warden'].includes(user.role);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {showSidebar && <Sidebar />}
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="p-6 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const MainDashboardView = () => {
    const { user } = useAuth();

    if (user?.role === 'cook') return <div className="bg-white p-6 rounded-xl border border-slate-200 font-semibold">👨‍🍳 Kitchen Headcount Dashboard</div>;
    if (user?.role === 'cleaner') return <div className="bg-white p-6 rounded-xl border border-slate-200 font-semibold">🧹 Housekeeping Dashboard</div>;
    if (user?.role === 'security') return <div className="bg-white p-6 rounded-xl border border-slate-200 font-semibold">🛡️ Gate Attendance Dashboard</div>;

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800">Welcome to your PGMS Dashboard!</h1>
            <p className="text-slate-500 mt-1 text-sm">Your management dashboard is active.</p>
        </div>
    );
};

const SettingsView = () => <div className="bg-white rounded-xl p-6 border border-slate-200 font-semibold text-slate-700">Settings</div>;

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<MainDashboardView />} />

                        {/* Protected with <AdminOnly> */}
                        <Route path="properties" element={<AdminOnly><PropertiesView /></AdminOnly>} />
                        <Route path="rooms" element={<AdminOnly><RoomsView /></AdminOnly>} />
                        <Route path="guests" element={<AdminOnly><GuestsView /></AdminOnly>} />
                        <Route path="staff" element={<AdminOnly><StaffView /></AdminOnly>} />
                        <Route path="settings" element={<AdminOnly><SettingsView /></AdminOnly>} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;