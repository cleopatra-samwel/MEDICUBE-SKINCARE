import { useState } from 'react';
import { Link } from 'react-router-dom';
import { App } from 'antd';
import { catalogService } from '@/services/catalogService';

export default function Newsletter() {
  const { message } = App.useApp();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    setBusy(true);
    try {
      const res = await catalogService.subscribe(email);
      message.success(res.message);
      setEmail('');
    } catch (err) {
      setError(err.errors?.email?.[0] || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[32px] bg-blush px-6 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="arch absolute -left-16 top-10 hidden h-72 w-56 bg-white/35 md:block" />
          <div aria-hidden className="arch absolute -right-10 -top-24 hidden h-80 w-60 bg-rose-300/30 md:block" />
          <div className="relative mx-auto max-w-xl">
            <h2 className="section-title">Join the glow list</h2>
            <p className="mt-3 text-mauve/80">New launches, skin tips and member-only offers. One or two emails a month, never more.</p>
            <form onSubmit={submit} noValidate className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <input id="nl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address"
                className="field !rounded-full !bg-white/90" aria-invalid={!!error} aria-describedby={error ? 'nl-err' : undefined} />
              <button type="submit" disabled={busy} className="btn-primary shrink-0">{busy ? 'Joining…' : 'Subscribe'}</button>
            </form>
            {error && <p id="nl-err" className="field-error">{error}</p>}
            <p className="mt-6 text-sm text-mauve/70">Questions? <Link to="/contact" className="link-underline">Contact us</Link></p>
          </div>
        </div>
      </div>
    </section>
  );
}
