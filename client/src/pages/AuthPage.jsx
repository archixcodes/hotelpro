import { useState } from 'react';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const account = isRegister ? await register(values) : await login({ email: values.email, password: values.password });
      const from = location.state?.from;
      const destination = from?.pathname ? from.pathname + (from.search || '') : account.role === 'admin' ? '/admin' : '/dashboard';
      navigate(destination, { replace: true, state: location.state?.bookingDates ? { bookingDates: location.state.bookingDates } : undefined });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-visual">
        <div className="auth-photo" />
        <div className="auth-visual-overlay" />
        <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white sm:p-12">
          <Link to="/" className="brand brand-light"><span className="brand-mark"><Compass size={19} /></span><span>hotel<span className="font-normal text-[#e4c7a8]">pro</span></span></Link>
          <div className="max-w-md pb-6">
            <p className="hero-kicker"><span className="h-1.5 w-1.5 rounded-full bg-[#e4c7a8]" /> Your next good morning</p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Make room for a stay that feels like yours.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">Thoughtful spaces, easy planning, and a little more time to enjoy the journey.</p>
          </div>
          <p className="text-xs text-white/50">A more considered way to stay.</p>
        </div>
      </div>
      <section className="auth-form-side">
        <Link to="/" className="mb-12 inline-flex items-center gap-2 text-sm text-moss hover:text-forest"><ArrowLeft size={15} /> Back to HotelPro</Link>
        <div className="w-full max-w-[410px]">
          <p className="eyebrow">{isRegister ? 'A good place to begin' : 'Welcome back'}</p>
          <h2 className="mt-3 font-display text-4xl text-ink">{isRegister ? 'Create your account.' : 'Good to see you again.'}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{isRegister ? 'Save your plans and keep every stay in one place.' : 'Sign in to pick up where your next trip begins.'}</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {isRegister && <label className="form-label">Your name<input className="form-input" autoComplete="name" required minLength="2" maxLength="80" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} /></label>}
            <label className="form-label">Email address<input className="form-input" type="email" autoComplete="email" required value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} /></label>
            <label className="form-label">Password<input className="form-input" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength="10" required value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} /><span className="mt-1 block font-normal text-slate-400">{isRegister ? 'Use at least 10 characters.' : 'At least 10 characters.'}</span></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
            <button className="button button-primary mt-2 w-full justify-center" type="submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}<ArrowRight size={16} /></button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">{isRegister ? 'Already have an account?' : 'New to HotelPro?'}{' '}
            <Link className="font-semibold text-forest hover:text-clay" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
