import { useState } from 'react';
import { useSelector } from 'react-redux';
import { App, Form, Input, Rate } from 'antd';
import { MessageSquareHeart } from 'lucide-react';
import { catalogService } from '@/services/catalogService';
import { toFormErrors } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { selectUser } from '@/features/auth/authSlice';
import RatingStars from '@/components/ui/RatingStars';
import { formatDate } from '@/utils/format';

export default function ReviewsSection({ product }) {
  const { message } = App.useApp();
  const user = useSelector(selectUser);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [writing, setWriting] = useState(false);
  const [busy, setBusy] = useState(false);
  const { data, loading } = useAsync(() => catalogService.reviews(product.id, page), [product.id, page]);
  const reviews = data?.data || [];

  const submit = async (values) => {
    setBusy(true);
    try {
      const res = await catalogService.submitReview(product.id, values);
      message.success(res.message);
      form.resetFields();
      setWriting(false);
    } catch (e) {
      form.setFields(toFormErrors(e.errors));
      message.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="reviews" className="section border-t border-line">
      <div className="shell grid gap-12 lg:grid-cols-[320px_1fr]">
        <div>
          <h2 className="section-title">Reviews</h2>
          <div className="mt-6 flex items-center gap-4">
            <span className="font-display text-[3.75rem] text-mauve">{product.rating_count ? product.rating.toFixed(1) : '—'}</span>
            <div>
              <RatingStars value={product.rating} size={18} />
              <p className="mt-1 text-sm text-stone">{product.rating_count} {product.rating_count === 1 ? 'review' : 'reviews'}</p>
            </div>
          </div>
          <button type="button" onClick={() => setWriting((w) => !w)} className="btn-outline mt-8">{writing ? 'Cancel' : 'Write a review'}</button>
          {writing && (
            <Form form={form} layout="vertical" onFinish={submit} className="mt-6" requiredMark={false} initialValues={{ rating: 5 }}>
              <Form.Item name="rating" label="Your rating" rules={[{ required: true, message: 'Choose a rating.' }]}>
                <Rate style={{ color: '#A45E68' }} />
              </Form.Item>
              {!user && (
                <Form.Item name="name" label="Your name" rules={[{ required: true, message: 'Enter your name.' }]}>
                  <Input maxLength={100} />
                </Form.Item>
              )}
              <Form.Item name="title" label="Title (optional)"><Input maxLength={150} /></Form.Item>
              <Form.Item name="body" label="Your review" rules={[{ required: true, min: 10, message: 'Write at least 10 characters.' }]}>
                <Input.TextArea rows={4} maxLength={2000} showCount />
              </Form.Item>
              <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Sending…' : 'Submit review'}</button>
              <p className="mt-3 text-xs text-stone">Reviews appear once approved by our team.</p>
            </Form>
          )}
        </div>

        <div>
          {loading ? (
            <div className="space-y-6">{[0, 1].map((i) => <div key={i} className="skeleton h-28" />)}</div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-petal/60 py-14 text-center">
              <MessageSquareHeart size={30} strokeWidth={1.4} className="text-rose" />
              <p className="mt-4 font-display text-[1.5rem] text-mauve">No reviews yet</p>
              <p className="mt-1 text-sm text-stone">Tried it? Be the first to share how it felt.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.id} className="py-7 first:pt-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <RatingStars value={r.rating} />
                    {r.is_verified_purchase && <span className="rounded-full bg-petal px-2.5 py-0.5 text-[13px] text-rosewood">Verified buyer</span>}
                  </div>
                  {r.title && <h3 className="mt-3 font-display text-[1.5rem]">{r.title}</h3>}
                  <p className="mt-2 leading-[1.7] text-charcoal/90">{r.body}</p>
                  <p className="mt-3 text-sm text-stone">{r.name} · {formatDate(r.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
          {data?.meta?.last_page > 1 && (
            <div className="mt-6 flex gap-3">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline btn-sm">Newer</button>
              <button type="button" disabled={page >= data.meta.last_page} onClick={() => setPage((p) => p + 1)} className="btn-outline btn-sm">Older</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
