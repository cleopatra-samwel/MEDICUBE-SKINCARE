import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Alert, Form, Input } from 'antd';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Logo from '@/assets/brand/Logo';
import { adminLogin } from '@/features/auth/authSlice';
import { toFormErrors } from '@/services/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * Staff sign-in. The backend endpoint (/admin/auth/login) checks the role and
 * refuses customer accounts with 403, so knowing this URL grants nothing.
 */
export default function AdminLogin() {
  useDocumentTitle('Admin login');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (values) => {
    setBusy(true);
    setError('');
    try {
      await dispatch(adminLogin(values)).unwrap();
      const from = location.state?.from;
      navigate(from && from.startsWith('/admin') ? from : '/admin/dashboard', { replace: true });
    } catch (e) {
      form.setFields(toFormErrors(e.errors));
      if (e.status === 403 || !e.errors?.email) setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-petal px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Link to="/"><Logo /></Link></div>
        <div className="rounded-3xl bg-white p-8 shadow-soft sm:p-10">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-petal text-rosewood"><ShieldCheck size={22} strokeWidth={1.6} /></span>
          <h1 className="mt-5 font-display text-[2.125rem]">Admin login</h1>
          <p className="mt-2 text-sm text-stone">For store staff only. Customer accounts cannot access the dashboard.</p>
          <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} size="large" className="mt-7">
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter your staff email.' }]}>
              <Input autoComplete="username" autoFocus />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password.' }]}>
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            {error && <Alert type="error" showIcon className="mb-5" message={error} />}
            <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Verifying…' : 'Sign in to dashboard'}</button>
          </Form>
        </div>
        <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-sm text-stone hover:text-rosewood"><ArrowLeft size={14} /> Back to the store</Link>
      </div>
    </div>
  );
}
