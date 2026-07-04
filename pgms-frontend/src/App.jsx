import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Navbar from './components/Navbar';

// Higher-Order Guard Component to lock down secure dashboard sub-routes
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth(); // Cleanly checks user state without 'loading'
    return user ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Flows */}
                    <Route path="/login" element={<Login />} />

                    {/* Secure Operational Framework Dashboard */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <div className="min-h-screen bg-slate-50 font-sans">
                                {/* 1. Mount Top Control Bar */}
                                <Navbar />

                                {/* 2. Main Body Content Space Container */}
                                <main className="p-6 max-w-7xl mx-auto">
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/80">
                                        <h1 className="text-2xl font-bold text-slate-800">Welcome to your PGMS Dashboard!</h1>
                                        <p className="text-slate-500 mt-1 text-sm">Your secure multi-property management layout is live and fully active.</p>
                                    </div>
                                </main>
                            </div>

                            <div className="p-8 font-sans max-w-4xl mx-auto">
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                                    <h1 className="text-2xl font-bold text-slate-800">Welcome to your PGMS Dashboard!</h1>
                                    <p className="text-slate-600 mt-2">Your multi-tenant network security layers are active.</p>
                                </div>
                            </div>


                        </ProtectedRoute>
                    } />

                    {/* Catch-all redirector */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;