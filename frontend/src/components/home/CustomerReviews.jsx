import { Link } from 'react-router-dom';
import { Quote } from 'lucide-react';
import { catalogService } from '@/services/catalogService';
import { useAsync } from '@/hooks/useAsync';
import RatingStars from '@/components/ui/RatingStars';
import Reveal from '@/components/ui/Reveal';

const asList = (r) => (Array.isArray(r) ? r : r?.data || []);

export default function CustomerReviews() {
  const { data, loading } = useAsync(() => catalogService.featuredReviews().then(asList), []);
  const reviews = (data || []).slice(0, 3);
  if (!loading && reviews.length === 0) return null;

  return (
    <section className="section bg-petal/70">
      <div className="shell">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="section-title">Loved by our customers</h2>
          <p className="section-lede mx-auto">Real words from people across Tanzania who made us part of their routine.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {(loading ? [0, 1, 2] : reviews).map((r, i) => (
            <Reveal key={r?.id ?? i} delay={i * 100} className="flex flex-col rounded-2xl bg-white p-8 shadow-soft">
              {r ? (
                <>
                  <Quote size={28} className="text-blush" fill="currentColor" strokeWidth={0} />
                  <RatingStars value={r.rating} className="mt-4" />
                  {r.title && <h3 className="mt-3 font-display text-[1.5rem]">{r.title}</h3>}
                  <p className="mt-3 flex-1 leading-[1.7] text-stone">{r.body}</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-blush font-medium text-rosewood">{r.name?.[0]}</span>
                    <div className="text-sm">
                      <p className="font-semibold text-mauve">{r.name}</p>
                      {r.product && <Link to={`/products/${r.product.slug}`} className="text-stone hover:text-rosewood">{r.product.name}</Link>}
                    </div>
                    {r.is_verified_purchase && <span className="ml-auto rounded-full bg-petal px-2.5 py-1 text-[13px] text-rosewood">Verified buyer</span>}
                  </div>
                </>
              ) : <div className="space-y-3"><div className="skeleton h-4 w-24" /><div className="skeleton h-20" /><div className="skeleton h-10 w-1/2" /></div>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
