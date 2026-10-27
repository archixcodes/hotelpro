import { BrowserRouter, Link, Outlet, Route, Routes } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import RoomDetails from './pages/RoomDetails.jsx';

function SiteLayout() {
  return (
    <div className="min-h-screen bg-sand">
      <Navbar />
      <Outlet />
      <footer className="site-footer">
        <div className="page-shell flex flex-col justify-between gap-5 py-8 sm:flex-row sm:items-center">
          <Link to="/" className="brand text-white"><span className="brand-mark"><Compass size={17} /></span><span>hotel<span className="font-normal text-[#c7d1c2]">pro</span></span></Link>
          <p className="text-xs text-white/50">Thoughtful places. Unhurried stays.</p>
          <p className="text-xs text-white/50">© {new Date().getFullYear()} HotelPro</p>
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return <main className="page-shell flex min-h-[65vh] flex-col items-center justify-center text-center">
    <p className="eyebrow">A small detour</p><h1 className="mt-3 font-display text-5xl text-ink">We can’t find that page.</h1>
    <Link to="/" className="button button-primary mt-6">Back to the collection</Link>
  </main>;
}

function AppRoutes() {
  return <Routes>
    <Route element={<SiteLayout />}>
      <Route index element={<Home />} />
      <Route path="rooms/:id" element={<RoomDetails />} />
      <Route element={<ProtectedRoute roles={['customer']} />}><Route path="dashboard" element={<Dashboard />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="admin" element={<AdminPanel />} /></Route>
      <Route path="*" element={<NotFound />} />
    </Route>
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
  </Routes>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>;
}
