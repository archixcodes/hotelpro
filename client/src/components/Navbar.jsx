import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Compass, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' nav-link-active' : '');

  function signOut() {
    logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="page-shell flex h-[76px] items-center justify-between">
        <Link to="/" className="brand" aria-label="HotelPro home">
          <span className="brand-mark"><Compass size={19} strokeWidth={1.8} /></span>
          <span>hotel<span className="font-normal text-moss">pro</span></span>
        </Link>
        <button className="icon-button md:hidden" type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={(open ? 'mobile-nav-open ' : '') + 'main-nav'}>
          <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Find a stay</NavLink>
          {user && user.role === 'customer' && <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>My trips</NavLink>}
          {user && user.role === 'admin' && <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>Admin</NavLink>}
          {user ? (
            <div className="nav-account">
              <span className="hidden text-sm text-ink sm:inline">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={signOut} className="button button-quiet button-small"><LogOut size={15} /> Sign out</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="nav-link" onClick={() => setOpen(false)}>Sign in</NavLink>
              <Link to="/register" className="button button-primary button-small">Create account</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
