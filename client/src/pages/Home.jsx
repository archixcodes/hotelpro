import { useEffect, useState } from 'react';
import { ArrowDown, CalendarDays, ChevronDown, MapPin, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import RoomCard from '../components/RoomCard.jsx';
import { todayInputValue } from '../utils/format.js';

const initialFilters = { checkIn: '', checkOut: '', capacity: '', minPrice: '', maxPrice: '' };

export default function Home() {
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');
    const params = Object.fromEntries(Object.entries(applied).filter(([, value]) => value !== ''));
    api.get('/rooms', { params }).then(({ data }) => {
      if (current) setRooms(data.rooms);
    }).catch((err) => {
      if (current) setError(err.message);
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [applied]);

  function submitSearch(event) {
    event.preventDefault();
    setFormError('');
    if (filters.checkIn && filters.checkOut && filters.checkOut <= filters.checkIn) {
      setFormError('Choose a check-out date after check-in.');
      return;
    }
    if (Boolean(filters.checkIn) !== Boolean(filters.checkOut)) {
      setFormError('Choose both check-in and check-out dates to check availability.');
      return;
    }
    setApplied({ ...filters });
  }

  function resetFilters() {
    setFilters(initialFilters);
    setApplied(initialFilters);
    setFormError('');
  }

  return (
    <>
      <section className="hero-section">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-shade" />
        <div className="page-shell relative z-10 flex min-h-[555px] flex-col justify-center pb-28 pt-20 sm:min-h-[620px]">
          <div className="max-w-[740px]">
            <p className="hero-kicker"><Sparkles size={14} /> Thoughtful places. Unhurried stays.</p>
            <h1 className="mt-5 font-display text-5xl leading-[1.04] text-white sm:text-6xl lg:text-[76px]">Stay somewhere<br /><em className="font-normal text-[#e4c7a8]">that stays with you.</em></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">Find a little more room to breathe. Browse considered spaces for the way you want to travel.</p>
            <a href="#rooms" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#e4c7a8]">Explore the collection <ArrowDown size={16} /></a>
          </div>
          <div className="absolute bottom-0 left-0 right-0 translate-y-1/2">
            <form onSubmit={submitSearch} className="search-panel">
              <label className="search-field">
                <span className="search-label"><CalendarDays size={15} /> Check in</span>
                <input type="date" min={todayInputValue()} value={filters.checkIn}
                  onChange={(event) => setFilters({ ...filters, checkIn: event.target.value })} />
              </label>
              <label className="search-field">
                <span className="search-label"><CalendarDays size={15} /> Check out</span>
                <input type="date" min={filters.checkIn || todayInputValue()} value={filters.checkOut}
                  onChange={(event) => setFilters({ ...filters, checkOut: event.target.value })} />
              </label>
              <label className="search-field">
                <span className="search-label"><MapPin size={15} /> Guests</span>
                <select value={filters.capacity} onChange={(event) => setFilters({ ...filters, capacity: event.target.value })}>
                  <option value="">Any capacity</option>
                  {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}+</option>)}
                </select>
              </label>
              <label className="search-field search-price">
                <span className="search-label">Nightly budget</span>
                <div className="flex items-center gap-2">
                  <input className="min-w-0" type="number" min="0" placeholder="Min $" value={filters.minPrice}
                    onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })} />
                  <span className="text-stone-400">—</span>
                  <input className="min-w-0" type="number" min="0" placeholder="Max $" value={filters.maxPrice}
                    onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} />
                </div>
              </label>
              <button className="button button-primary search-submit" type="submit"><Search size={17} /> Search stays</button>
            </form>
            {formError && <p className="absolute top-full mt-2 rounded-lg bg-white px-3 py-2 text-sm text-red-700 shadow">{formError}</p>}
          </div>
        </div>
      </section>

      <section id="rooms" className="page-shell pb-24 pt-40 sm:pt-36">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A stay for every kind of away</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-[46px]">Find your room to exhale.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Each space is chosen for its character, comfort, and thoughtful details.</p>
          </div>
          <div className="hidden items-center gap-2 text-sm text-moss sm:flex"><span className="h-2 w-2 rounded-full bg-clay" /> Curated collection</div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div className="skeleton-card" key={item} />)}</div>
        ) : error ? (
          <div className="message-card"><p className="font-semibold text-ink">We couldn’t load rooms.</p><p className="mt-1 text-sm text-slate-500">{error}</p><button className="button button-outline mt-4" onClick={() => setApplied({ ...applied })}>Try again</button></div>
        ) : rooms.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{rooms.map((room) => <RoomCard key={room._id} room={room} />)}</div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><Search size={22} /></div>
            <h3 className="font-display text-2xl text-ink">No rooms match those dates.</h3>
            <p className="mt-2 text-sm text-slate-500">Try another date range or loosen your filters.</p>
            <button className="button button-outline mt-5" onClick={resetFilters}>Clear filters</button>
          </div>
        )}
        <div className="mt-20 flex flex-col items-start justify-between gap-5 rounded-[26px] bg-forest px-7 py-8 text-white sm:flex-row sm:items-center sm:px-10 sm:py-9">
          <div>
            <p className="eyebrow text-[#b8c7b5]">Your next chapter</p>
            <h3 className="mt-2 font-display text-3xl">A good stay changes the pace.</h3>
          </div>
          <Link to="/register" className="button button-light">Join HotelPro <ChevronDown size={16} className="-rotate-90" /></Link>
        </div>
      </section>
    </>
  );
}
