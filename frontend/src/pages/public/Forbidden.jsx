import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** Shown when a signed-in customer opens an admin URL. The API would answer 403 as well. */
export default function Forbidden() {
  useDocumentTitle('Access denied');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-porcelain px-6 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-petal text-rosewood"><ShieldAlert size={28} strokeWidth={1.5} /></span>
      <p className="mt-6 text-sm font-medium tracking-[0.02em] text-rosewood">Error 403</p>
      <h1 className="mt-2 font-display text-[2.5rem] sm:text-[3.25rem]">Unauthorized · Access denied</h1>
      <p className="mt-4 max-w-md text-stone">Your account does not have permission to view the admin area. If you work here, sign in with your staff account.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">Back to the store</Link>
        <Link to="/profile" className="btn-outline">My account</Link>
      </div>
    </div>
  );
}
