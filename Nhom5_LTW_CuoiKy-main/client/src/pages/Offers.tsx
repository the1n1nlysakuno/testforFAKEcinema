import type { Offer } from '../types';
import OfferCard from '../components/OfferCard';
import { Loading, ErrorMessage } from '../components/Status';
import useFetch from '../hooks/useFetch';

export default function Offers() {
  const { data, loading, error, retry } = useFetch<Offer[]>(import.meta.env.BASE_URL + 'data/offers.json');
  return <div className="container page-section"><div className="page-title"><p className="eyebrow">TIN MỚI & ƯU ĐÃI</p><h1>Ưu đãi dành cho bạn</h1><p>Khám phá các bài viết điện ảnh và chương trình thành viên minh họa.</p></div>{loading ? <Loading /> : error ? <ErrorMessage message={error} onRetry={retry} /> : <div className="offer-grid">{data?.map(offer => <OfferCard key={offer.id} offer={offer} />)}</div>}</div>;
}
