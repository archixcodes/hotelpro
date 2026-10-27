import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Clock3, MapPin, ShieldCheck, UsersRound } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { dateLabel, money, todayInputValue } from '../utils/format.js';

const defaultPhoto = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1800&q=90';

export default function RoomDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '', guests: 1 });

  useEffect(() => {
    if (location.state?.bookingDates) setDates(location.state.bookingDates);
  }, [location.state]);

  useEffect(() => {
    let current = true;
    api.get('/rooms/' + id).then(({ data }) => {
      if (current) setRoom(data.room);
    }).catch((err) => {
      if (current) setError(err.message);
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [id]);

  const nights = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return 0;
    return Math.max(0, Math.round((new Date(dates.checkOut + 'T00:00:00') - new Date(dates.checkIn + 'T00:00:00')) / 86400000));
  }, [dates.checkIn, dates.checkOut]);

  async function submitBooking(event) {
    event.preventDefault();
    setFormError('');
    if (!dates.checkIn || !dates.checkOut || nights < 1) {
      setFormError('Choose a valid check-in and check-out date.');
      return;
    }
    if (!user) {
      navigate('/login', { state: { from: location, bookingDates: dates } });
      return;
    }
    if (user && user.role !== 'customer') { setFormError('A customer account is required to reserve a room.'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        roomId: room._id, checkIn: dates.checkIn, checkOut: dates.checkOut, guests: Number(dates.guests)
      });
      navigate('/dashboard', { replace: true, state: { notice: 'Your stay is confirmed.', bookingId: data.booking._id } });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page-shell py-24 text-sm text-moss">Finding your room…</div>;
  if (error || !room) return <main className="page-shell py-24"><p className="text-sm text-clay">{error || 'Room not found.'}</p><Link to="/" className="mt-5 inline-flex text-sm font-semibold text-forest">Back to stays</Link></main>;

  return (
    <main className="page-shell pb-24 pt-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-moss transition hover:text-forest"><ArrowLeft size={16} /> All stays</Link>
      <div className="mt-6 overflow-hidden rounded-[28px]">
        <img src={room.imageUrl || defaultPhoto} alt={room.name} className="h-[310px] w-full object-cover sm:h-[440px]"
          onError={(event) => { event.currentTarget.src = defaultPhoto; }} />
      </div>
      <div className="mt-9 grid gap-12 lg:grid-cols-[1fr_390px]">
        <section>
          <p className="eyebrow">{room.type} · {room.name}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">{room.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><UsersRound size={16} /> Up to {room.capacity} guests</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={16} /> HotelPro collection</span>
          </div>
          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-600">{room.description}</p>
          <div className="mt-9 border-t border-stone-200 pt-7">
            <h2 className="font-display text-2xl text-ink">Room highlights</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(room.amenities?.length ? room.amenities : ['Thoughtfully furnished', 'Private bathroom']).map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 text-sm text-slate-600"><span className="check-dot"><Check size={13} /></span>{amenity}</div>
              ))}
            </div>
          </div>
          <div className="mt-9 flex gap-4 rounded-2xl bg-[#f1eee5] p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-forest"><Clock3 size={18} /></div>
            <div><h3 className="font-semibold text-ink">A slower kind of stay</h3><p className="mt-1 text-sm leading-6 text-slate-500">Arrive, settle in, and let the details take care of the rest.</p></div>
          </div>
        </section>

        <aside className="self-start lg:sticky lg:top-6">
          <form onSubmit={submitBooking} className="booking-card">
            <div className="flex items-end justify-between border-b border-stone-200 pb-5">
              <div><span className="font-display text-3xl text-forest">{money(room.pricePerNight)}</span><span className="ml-1.5 text-sm text-moss">/ night</span></div>
              <div className="text-right"><p className="eyebrow">Your dates</p><p className="mt-1 text-xs text-slate-400">Flexible arrival</p></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="form-label">Check in<input className="form-input" type="date" min={todayInputValue()} required value={dates.checkIn} onChange={(event) => setDates({ ...dates, checkIn: event.target.value })} /></label>
              <label className="form-label">Check out<input className="form-input" type="date" min={dates.checkIn || todayInputValue()} required value={dates.checkOut} onChange={(event) => setDates({ ...dates, checkOut: event.target.value })} /></label>
            </div>
            <label className="form-label mt-4 block">Guests
              <select className="form-input" value={dates.guests} onChange={(event) => setDates({ ...dates, guests: event.target.value })}>
                {Array.from({ length: room.capacity }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>)}
              </select>
            </label>
            {nights > 0 && <div className="mt-5 space-y-3 border-t border-stone-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-500"><span>{money(room.pricePerNight)} × {nights} nights</span><span>{money(room.pricePerNight * nights)}</span></div>
              <div className="flex justify-between font-semibold text-ink"><span>Total</span><span>{money(room.pricePerNight * nights)}</span></div>
            </div>}
            {formError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{formError}</p>}
            <button className="button button-primary mt-5 w-full justify-center" type="submit" disabled={submitting || (user && user.role !== 'customer')}>{user && user.role !== 'customer' ? 'Customer account required' : submitting ? 'Confirming…' : user ? 'Reserve this room' : 'Sign in to reserve'}<ChevronRight size={17} /></button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck size={14} /> No payment required to request a reservation</p>
          </form>
          <p className="mt-4 text-center text-xs text-slate-400">Dates: {dates.checkIn ? dateLabel(dates.checkIn) : 'select check-in'} — {dates.checkOut ? dateLabel(dates.checkOut) : 'select check-out'}</p>
        </aside>
      </div>
    </main>
  );
}
