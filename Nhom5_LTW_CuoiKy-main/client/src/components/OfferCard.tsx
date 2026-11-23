import type { Offer } from '../types';
import { Link } from 'react-router-dom';

export function OfferArtwork({ offer, large = false }: { offer: Offer; large?: boolean }) {
  const isCard = offer.id === 'the-cung-comeback';
  return (
    <div className={`offer-art ${offer.style} ${large ? 'offer-art-large' : ''}`}>
      <span className="offer-art-kicker">CGV • ƯU ĐÃI ĐIỆN ẢNH</span>
      <div className="offer-art-center">
        <span className="offer-art-icon">{isCard ? '💳' : offer.id === 'combo-bap-nuoc' ? '🍿' : '🎟️'}</span>
        <strong>{isCard ? 'THẺ CỨNG' : offer.id === 'combo-bap-nuoc' ? 'BẮP & NƯỚC' : 'CINEMA DAY'}</strong>
        <b>{isCard ? 'COME BACK' : 'ƯU ĐÃI MỚI'}</b>
      </div>
      <span className="offer-art-foot">MẪU THIẾT KẾ FRONTEND</span>
    </div>
  );
}

export default function OfferCard({ offer }: { offer: Offer }) {
  return (
    <article className="offer-card">
      <Link to={`/uu-dai/${offer.id}`}><OfferArtwork offer={offer} /></Link>
      <div className="offer-info"><span className="eyebrow">{offer.category} · {offer.date}</span><h3><Link to={`/uu-dai/${offer.id}`}>{offer.title}</Link></h3><p>{offer.short}</p><Link className="read-more" to={`/uu-dai/${offer.id}`}>Xem chi tiết →</Link></div>
    </article>
  );
}
