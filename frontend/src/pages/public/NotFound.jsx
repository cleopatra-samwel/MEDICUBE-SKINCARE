import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-8xl text-blush">404</p>
      <h1 className="mt-4 font-display text-[2.5rem]">This page has wandered off</h1>
      <p className="mt-3 max-w-md text-stone">The link may be old or mistyped. Let us take you somewhere lovely instead.</p>
      <div className="mt-8 flex gap-3"><Link to="/" className="btn-primary">Go home</Link><Link to="/products" className="btn-outline">Shop products</Link></div>
    </div>
  );
}
