import type { Offer } from '../types';
import { Link, useParams } from 'react-router-dom';
import { OfferArtwork } from '../components/OfferCard';
import { Loading, ErrorMessage } from '../components/Status';
import useFetch from '../hooks/useFetch';

export default function OfferDetail() {
  const { id } = useParams();
  const { data, loading, error, retry } = useFetch<Offer[]>(import.meta.env.BASE_URL + 'data/offers.json');
  if (loading) return <div className="container page-section"><Loading /></div>;
  if (error) return <div className="container page-section"><ErrorMessage message={error} onRetry={retry} /></div>;
  const offer = data?.find(item => item.id === id);
  if (!offer) return <div className="container page-section"><h1>Không tìm thấy bài viết</h1><Link to="/uu-dai">← Trở về Tin mới</Link></div>;

  const isMember = id === 'the-cung-comeback';
  return (
    <div className="container page-section article-page">
      <div className="breadcrumb"><Link to="/">Trang chủ</Link> / <Link to="/uu-dai">Tin mới & Ưu đãi</Link> / Bài viết</div>
      <div className="article-heading"><span className="eyebrow">{offer.category} · {offer.date}</span><h1>{offer.title}</h1></div>
      <div className="article-layout"><div className="article-image"><OfferArtwork offer={offer} large /></div><article className="article-content">{isMember ? <><p><strong>Gồm có 02 phiên bản: Tiêu Chuẩn và U22.</strong> Thẻ cứng thành viên trở lại trong diện mạo mới, dành cho những khán giả tham gia chương trình thành viên CGV.</p><h2>Đối tượng mở thẻ</h2><p><strong>Thẻ thành viên thân thiết:</strong> Khách hàng đăng ký tham gia chương trình thành viên.</p><p><strong>Thẻ thành viên U22:</strong> Khách hàng trong độ tuổi quy định của chương trình tại thời điểm đăng ký.</p><h2>Hướng dẫn đăng ký</h2><p>Khách hàng có thể đăng ký thành viên tại rạp hoặc qua kênh trực tuyến chính thức của CGV.</p><p>Thông tin trên đây chỉ mô phỏng bố cục từ ảnh tham khảo. Để xem điều kiện, quyền lợi, thời hạn hoặc chương trình thật, vui lòng kiểm tra trực tiếp tại CGV.</p></> : <><p>{offer.short}</p><h2>Thông tin chương trình</h2><p>Bài viết này là nội dung mẫu giúp thực hành React Router, component chi tiết tin tức và giao diện responsive.</p><p>Thông tin khuyến mãi và giá trị ưu đãi thực tế không được cung cấp trong bản demo.</p></>}<Link className="btn btn-primary" to="/uu-dai">← Xem tin khác</Link></article></div>
    </div>
  );
}
