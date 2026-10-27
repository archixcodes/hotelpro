import { useEffect, useState } from 'react';
import { BedDouble, CalendarDays, Check, CircleDollarSign, DoorOpen, Edit3, Plus, RefreshCw, UsersRound, X } from 'lucide-react';
import api from '../services/api.js';
import { dateLabel, money } from '../utils/format.js';

const blankRoom = { name: '', type: '', description: '', pricePerNight: '', capacity: 2, amenities: '', imageUrl: '' };

export default function AdminPanel() {
  const [tab, setTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(blankRoom);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [roomResult, bookingResult] = await Promise.all([api.get('/rooms/manage'), api.get('/bookings')]);
      setRooms(roomResult.data.rooms);
      setBookings(bookingResult.data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function startCreate() {
    setEditing('new');
    setValues(blankRoom);
    setError('');
    setNotice('');
  }

  function startEdit(room) {
    setEditing(room._id);
    setValues({
      name: room.name, type: room.type, description: room.description,
      pricePerNight: room.pricePerNight, capacity: room.capacity,
      amenities: (room.amenities || []).join(', '), imageUrl: room.imageUrl || ''
    });
    setError('');
    setNotice('');
  }

  async function saveRoom(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...values, pricePerNight: Number(values.pricePerNight), capacity: Number(values.capacity),
      amenities: values.amenities.split(',').map((item) => item.trim()).filter(Boolean) };
    try {
      if (editing === 'new') await api.post('/rooms', payload);
      else await api.patch('/rooms/' + editing, payload);
      setNotice(editing === 'new' ? 'Room added to your inventory.' : 'Room details updated.');
      setEditing(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleRoom(room) {
    setError('');
    setNotice('');
    try {
      await api.patch('/rooms/' + room._id, { isActive: !room.isActive });
      setNotice(room.isActive ? 'Room hidden from the catalog.' : 'Room is available in the catalog again.');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const visibleRooms = filter === 'all' ? rooms : rooms.filter((room) => room.isActive === (filter === 'active'));
  const activeRooms = rooms.filter((room) => room.isActive).length;
  const confirmedBookings = bookings.filter((booking) => booking.status === 'confirmed').length;
  const revenue = bookings.filter((booking) => booking.status === 'confirmed').reduce((total, booking) => total + booking.totalPrice, 0);

  return (
    <main className="page-shell min-h-[75vh] pb-24 pt-12 sm:pt-16">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="eyebrow">HotelPro management</p><h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">The overview.</h1><p className="mt-3 text-sm text-slate-500">Keep your rooms and guest stays running smoothly.</p></div>
        <button className="button button-outline" onClick={loadData} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh data</button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="admin-stat"><span className="stat-icon"><BedDouble size={18} /></span><div><p className="stat-number">{rooms.length}</p><p className="stat-caption">Rooms in inventory</p></div></div>
        <div className="admin-stat"><span className="stat-icon"><DoorOpen size={18} /></span><div><p className="stat-number">{activeRooms}</p><p className="stat-caption">Listed for guests</p></div></div>
        <div className="admin-stat"><span className="stat-icon"><CalendarDays size={18} /></span><div><p className="stat-number">{confirmedBookings}</p><p className="stat-caption">Confirmed bookings</p></div></div>
        <div className="admin-stat"><span className="stat-icon"><CircleDollarSign size={18} /></span><div><p className="stat-number">{money(revenue)}</p><p className="stat-caption">Booked room value</p></div></div>
      </div>

      {(error || notice) && <div className={(error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800') + ' mt-6 flex items-center justify-between rounded-xl border px-4 py-3 text-sm'}><span>{error || notice}</span><button onClick={() => { setError(''); setNotice(''); }} aria-label="Dismiss"><X size={16} /></button></div>}

      <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200">
        <div className="flex gap-6">
          <button onClick={() => setTab('rooms')} className={'admin-tab' + (tab === 'rooms' ? ' admin-tab-active' : '')}>Room inventory <span>{rooms.length}</span></button>
          <button onClick={() => setTab('bookings')} className={'admin-tab' + (tab === 'bookings' ? ' admin-tab-active' : '')}>Guest bookings <span>{bookings.length}</span></button>
        </div>
        {tab === 'rooms' && <button className="button button-primary button-small mb-2" onClick={startCreate}><Plus size={16} /> Add room</button>}
      </div>

      {tab === 'rooms' ? (
        <section className="mt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">Manage descriptions, nightly rates, and guest capacity.</p><div className="filter-tabs">{['all', 'active', 'inactive'].map((item) => <button key={item} className={filter === item ? 'filter-tab-active' : ''} onClick={() => setFilter(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div></div>
          {loading ? <p className="py-12 text-center text-sm text-moss">Loading hotel data…</p> :
            visibleRooms.length ? <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Room</th><th>Rate</th><th>Capacity</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>
              {visibleRooms.map((room) => <tr key={room._id}>
                <td><div className="flex items-center gap-3"><div className="table-room-icon"><BedDouble size={16} /></div><div><p className="font-semibold text-ink">{room.name}</p><p className="mt-0.5 text-xs text-slate-400">{room.type}</p></div></div></td>
                <td className="font-medium text-ink">{money(room.pricePerNight)} <span className="font-normal text-slate-400">/ night</span></td>
                <td><span className="inline-flex items-center gap-1.5 text-slate-600"><UsersRound size={14} /> {room.capacity}</span></td>
                <td><span className={room.isActive ? 'status-pill status-confirmed' : 'status-pill status-cancelled'}>{room.isActive ? 'Listed' : 'Hidden'}</span></td>
                <td><div className="flex justify-end gap-2"><button className="button button-quiet button-small" onClick={() => startEdit(room)}><Edit3 size={14} /> Edit</button><button className="button button-quiet button-small" onClick={() => toggleRoom(room)}>{room.isActive ? 'Hide' : <><Check size={14} /> Relist</>}</button></div></td>
              </tr>)}
            </tbody></table></div></div> : <div className="empty-state"><h3 className="font-display text-2xl text-ink">Nothing in this view.</h3><p className="mt-2 text-sm text-slate-500">Try another status filter or add your first room.</p></div>}
        </section>
      ) : (
        <section className="mt-5">
          <p className="mb-4 text-sm text-slate-500">The latest guest reservations across your property.</p>
          {loading ? <p className="py-12 text-center text-sm text-moss">Loading reservations…</p> :
            bookings.length ? <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Guest</th><th>Room & dates</th><th>Guests</th><th>Total</th><th>Status</th></tr></thead><tbody>
              {bookings.map((booking) => <tr key={booking._id}>
                <td><p className="font-semibold text-ink">{booking.customer?.name || 'Guest'}</p><p className="mt-0.5 text-xs text-slate-400">{booking.customer?.email || '—'}</p></td>
                <td><p className="font-medium text-ink">{booking.room?.name || 'Room'}</p><p className="mt-0.5 text-xs text-slate-400">{dateLabel(booking.checkIn)} – {dateLabel(booking.checkOut)}</p></td>
                <td>{booking.guests}</td><td className="font-medium text-ink">{money(booking.totalPrice)}</td>
                <td><span className={booking.status === 'confirmed' ? 'status-pill status-confirmed' : 'status-pill status-cancelled'}>{booking.status}</span></td>
              </tr>)}
            </tbody></table></div></div> : <div className="empty-state"><h3 className="font-display text-2xl text-ink">No reservations yet.</h3><p className="mt-2 text-sm text-slate-500">Guest bookings will appear here.</p></div>}
        </section>
      )}

      {editing && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="room-modal-title">
          <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4"><div><p className="eyebrow">{editing === 'new' ? 'New listing' : 'Update listing'}</p><h2 id="room-modal-title" className="mt-2 font-display text-2xl text-ink">{editing === 'new' ? 'Add a room' : 'Edit room details'}</h2></div><button className="icon-button" onClick={() => setEditing(null)} aria-label="Close"><X size={18} /></button></div>
          <form onSubmit={saveRoom} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="form-label">Room name<input className="form-input" required maxLength="100" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} /></label>
            <label className="form-label">Room type<input className="form-input" required maxLength="60" placeholder="e.g. Garden suite" value={values.type} onChange={(event) => setValues({ ...values, type: event.target.value })} /></label>
            <label className="form-label">Price per night<input className="form-input" type="number" min="0" step="0.01" required value={values.pricePerNight} onChange={(event) => setValues({ ...values, pricePerNight: event.target.value })} /></label>
            <label className="form-label">Guest capacity<input className="form-input" type="number" min="1" max="20" step="1" required value={values.capacity} onChange={(event) => setValues({ ...values, capacity: event.target.value })} /></label>
            <label className="form-label sm:col-span-2">Description<textarea className="form-input min-h-[94px] resize-y" required maxLength="2000" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} /></label>
            <label className="form-label sm:col-span-2">Amenities <span className="font-normal text-slate-400">(separate with commas)</span><input className="form-input" placeholder="Wi-Fi, Balcony, Breakfast" value={values.amenities} onChange={(event) => setValues({ ...values, amenities: event.target.value })} /></label>
            <label className="form-label sm:col-span-2">Photo URL <span className="font-normal text-slate-400">(HTTPS)</span><input className="form-input" type="url" placeholder="https://" value={values.imageUrl} onChange={(event) => setValues({ ...values, imageUrl: event.target.value })} /></label>
            <div className="mt-2 flex justify-end gap-2 border-t border-stone-200 pt-4 sm:col-span-2"><button type="button" className="button button-outline" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : editing === 'new' ? 'Add room' : 'Save changes'}</button></div>
          </form>
        </section>
      </div>}
    </main>
  );
}
