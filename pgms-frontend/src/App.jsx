import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PropertiesView from './components/PropertiesView';
import RoomsView from './components/RoomsView';
import GuestsView from './components/GuestsView';

// Higher-Order Guard Component to lock down secure dashboard sub-routes
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth(); // Cleanly checks user state without 'loading'
    return user ? children : <Navigate to="/login" replace />;
};

// Layout Component that keeps Sidebar/Navbar fixed and displays the active sub-page
const DashboardLayout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* 1. Static Sidebar Panel on the left */}
            <Sidebar />

            {/* 2. Main Scrollable Panel Framework on the right */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mount Top Control Bar */}
                <Navbar />

                {/* Main Content Space: The <Outlet /> dynamically injects the active view */}
                <main className="p-6 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

// Quick temporary view components for testing your sub-routing paths
const MainDashboardView = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/80">
        <h1 className="text-2xl font-bold text-slate-800">Welcome to your PGMS Dashboard!</h1>
        <p className="text-slate-500 mt-1 text-sm">Your secure multi-property management layout is live and fully active.</p>
    </div>
);




const StaffView = () => <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-xl font-semibold text-slate-700">Staff & Payroll Management (Coming Soon)</div>;
const SettingsView = () => <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-xl font-semibold text-slate-700">System Configuration Layouts (Coming Soon)</div>;

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Flows */}
                    <Route path="/login" element={<Login />} />

                    {/* Secure Operational Dashboard Framework Parent Container */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        {/* If they hit exactly root '/', instantly drop them into dashboard */}
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        
                        {/* Nested Operational Sub-Routes mapping to side panel links */}
                        <Route path="dashboard" element={<MainDashboardView />} />
                        <Route path="properties" element={<PropertiesView />} />
                        <Route path="rooms" element={<RoomsView />} />
                        <Route path="guests" element={<GuestsView />} />
                        <Route path="staff" element={<StaffView />} />
                        <Route path="settings" element={<SettingsView />} />
                    </Route>

                    {/* Catch-all redirector */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;