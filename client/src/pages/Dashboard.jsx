import { useEffect, useState } from 'react';
import { CalendarDays, CircleCheck, Clock3, MapPin, ReceiptText, X } from 'lucide-react';
import api from '../services/api.js';
import { dateLabel, money } from '../utils/format.js';
import { useLocation } from 'react-router-dom';

export default function Dashboard() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [cancelling, setCancelling] = useState('');

  async function loadBookings() {
    try {
      const { data } = await api.get('/bookings/mine');
      setBookings(data.bookings);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookings(); }, []);

  async function cancelBooking(id) {
    if (!window.confirm('Cancel this reservation? The room will become available for these dates.')) return;
    setCancelling(id);
    setNotice('');
    try {
      await api.patch('/bookings/' + id + '/cancel');
      setNotice('Your reservation has been cancelled.');
      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling('');
    }
  }

  const activeCount = bookings.filter((booking) => booking.status === 'confirmed').length;

  return (
    <main className="page-shell min-h-[75vh] pb-24 pt-12 sm:pt-16">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Your HotelPro account</p><h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Your stays, all here.</h1><p className="mt-3 text-sm text-slate-500">Everything you need for the trips you’re looking forward to.</p></div>
        <div className="flex gap-3">
          <div className="stat-card"><span className="stat-icon"><ReceiptText size={18} /></span><div><p className="stat-number">{bookings.length}</p><p className="stat-caption">Total stays</p></div></div>
          <div className="stat-card"><span className="stat-icon"><CircleCheck size={18} /></span><div><p className="stat-number">{activeCount}</p><p className="stat-caption">Confirmed</p></div></div>
        </div>
      </div>

      {notice && <div className="mt-8 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><X size={16} /></button></div>}
      <div className="mt-9 flex items-center justify-between border-b border-stone-200 pb-4"><h2 className="font-display text-2xl text-ink">Reservation history</h2><span className="text-xs text-moss">{bookings.length} {bookings.length === 1 ? 'reservation' : 'reservations'}</span></div>

      {loading ? <p className="py-16 text-center text-sm text-moss">Loading your stays…</p> :
        error ? <div className="message-card mt-7 text-sm text-red-700">{error}</div> :
        !bookings.length ? (
          <div className="empty-state mt-7">
            <div className="empty-icon"><CalendarDays size={22} /></div>
            <h3 className="font-display text-2xl text-ink">Your next stay starts here.</h3>
            <p className="mt-2 text-sm text-slate-500">When you reserve a room, it will show up here.</p>
            <a href="/" className="button button-primary mt-5">Explore rooms</a>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {bookings.map((booking) => {
              const isConfirmed = booking.status === 'confirmed';
              const canCancel = isConfirmed && new Date(booking.checkIn) > new Date();
              return (
                <article key={booking._id} className="booking-row">
                  <div className="booking-row-image">
                    {booking.room?.imageUrl ? <img src={booking.room.imageUrl} alt="" /> : <MapPin size={22} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-xl text-ink">{booking.room?.name || 'Room'}</h3><span className={isConfirmed ? 'status-pill status-confirmed' : 'status-pill status-cancelled'}>{isConfirmed ? 'Confirmed' : 'Cancelled'}</span></div>
                    <p className="mt-1 text-sm text-slate-500">{booking.room?.type || 'HotelPro room'} · {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {dateLabel(booking.checkIn)} – {dateLabel(booking.checkOut)}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-3">
                    <div className="text-right"><p className="font-display text-xl text-forest">{money(booking.totalPrice)}</p><p className="text-xs text-slate-400">total stay</p></div>
                    {canCancel && <button className="button button-quiet button-small text-red-700 hover:bg-red-50" onClick={() => cancelBooking(booking._id)} disabled={cancelling === booking._id}>{cancelling === booking._id ? 'Cancelling…' : 'Cancel booking'}</button>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
    </main>
  );
}
