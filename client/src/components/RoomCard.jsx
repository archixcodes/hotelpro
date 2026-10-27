import { ArrowUpRight, BedDouble, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { money } from '../utils/format.js';

const defaultPhoto = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85';

export default function RoomCard({ room }) {
  return (
    <article className="room-card">
      <Link to={'/rooms/' + room._id} className="room-photo-wrap">
        <img className="room-photo" src={room.imageUrl || defaultPhoto} alt={room.name} loading="lazy"
          onError={(event) => { event.currentTarget.src = defaultPhoto; }} />
        <span className="room-type">{room.type}</span>
        <span className="photo-arrow"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">{room.name}</p>
            <h3 className="font-display text-[22px] leading-tight text-ink">{room.type} room</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-[24px] leading-none text-forest">{money(room.pricePerNight)}</p>
            <p className="mt-1 text-xs text-moss">per night</p>
          </div>
        </div>
        <p className="mt-4 line-clamp-2 min-h-[42px] text-sm leading-6 text-slate-600">{room.description}</p>
        <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><UsersRound size={15} /> Up to {room.capacity}</span>
            <span className="inline-flex items-center gap-1.5"><BedDouble size={15} /> {room.amenities?.[0] || 'Private suite'}</span>
          </div>
          <Link className="text-sm font-semibold text-forest hover:text-clay" to={'/rooms/' + room._id}>View room</Link>
        </div>
      </div>
    </article>
  );
}
