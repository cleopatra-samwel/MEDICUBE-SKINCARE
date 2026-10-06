import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'antd';
import { ArrowRight, Search } from 'lucide-react';
import { closeSearch } from '@/features/ui/uiSlice';
import { catalogService } from '@/services/catalogService';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/utils/format';

const SUGGESTIONS = ['Vitamin C', 'Hyaluronic', 'Cleanser', 'Sunscreen', 'Rose'];

/** Live search with debounced suggestions; Enter goes to the full results page. */
export default function SearchOverlay() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const open = useSelector((s) => s.ui.searchOpen);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
    else { setQ(''); setResults([]); }
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults([]); return undefined; }
    setLoading(true);
    const t = setTimeout(() => {
      catalogService.products({ q: term, per_page: 5 })
        .then((r) => setResults(r.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const close = () => dispatch(closeSearch());
  const submit = (term) => {
    close();
    navigate(`/products?q=${encodeURIComponent(term)}`);
  };

  return (
    <Modal open={open} onCancel={close} footer={null} closable={false} width={680} style={{ top: 64 }}
      styles={{ content: { padding: 0, borderRadius: 24, overflow: 'hidden' } }} destroyOnClose>
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) submit(q.trim()); }} className="flex items-center gap-3 border-b border-line px-6">
        <Search size={20} className="text-stone" />
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search serums, cleansers, ingredients…"
          aria-label="Search products" className="h-16 flex-1 bg-transparent text-lg text-mauve placeholder:text-stone/60 focus:outline-none" />
        <button type="button" onClick={close} className="text-sm text-stone hover:text-mauve">Close</button>
      </form>

      <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
        {q.trim().length < 2 ? (
          <div>
            <p className="mb-3 text-sm text-stone">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => submit(s)} className="rounded-full border border-line px-4 py-1.5 text-sm text-mauve transition hover:border-rosewood hover:text-rosewood">{s}</button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16" />)}</div>
        ) : results.length ? (
          <ul className="divide-y divide-line">
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/products/${p.slug}`} onClick={close} className="flex items-center gap-4 py-3 transition hover:opacity-80">
                  <SmartImage src={p.image} alt="" className="h-16 w-14 rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold text-mauve">{p.name}</p>
                    <p className="text-sm text-stone">{p.category?.name}</p>
                  </div>
                  <span className="text-sm tabular-nums">{formatPrice(p.price)}</span>
                </Link>
              </li>
            ))}
            <li className="pt-4">
              <button type="button" onClick={() => submit(q.trim())} className="inline-flex items-center gap-2 text-sm font-medium text-rosewood">
                See all results for “{q.trim()}” <ArrowRight size={15} />
              </button>
            </li>
          </ul>
        ) : (
          <p className="py-6 text-center text-stone">No products match “{q.trim()}”. Try another word.</p>
        )}
      </div>
    </Modal>
  );
}
