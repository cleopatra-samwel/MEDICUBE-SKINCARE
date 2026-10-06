import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Alert, App, Form, Input } from 'antd';
import AuthShell from './AuthShell';
import { login } from '@/features/auth/authSlice';
import { toFormErrors } from '@/services/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** Only same-site paths are allowed as ?next= targets (no open redirects). */
const safeNext = (n) => (n && n.startsWith('/') && !n.startsWith('//') && !n.startsWith('/admin') ? n : null);

export default function Login() {
  useDocumentTitle('Sign in');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (values) => {
    setBusy(true);
    setError('');
    try {
      const res = await dispatch(login(values)).unwrap();
      message.success(`Welcome back, ${res.user.name.split(' ')[0]}.`);
      // The backend says where each role belongs. Customers never land in admin.
      const dest = res.user.is_staff ? '/admin/dashboard' : safeNext(params.get('next')) || '/profile';
      navigate(dest, { replace: true });
    } catch (e) {
      form.setFields(toFormErrors(e.errors));
      if (!e.errors?.email) setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Sign in" lede="Welcome back. Sign in to see your orders and saved items."
      footer={<>New here? <Link to="/register" className="link-underline">Create an account</Link> · or <Link to="/products" className="link-underline">continue as a guest</Link></>}>
      <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} size="large">
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter your email address.' }]}>
          <Input autoComplete="email" inputMode="email" autoFocus />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password.' }]}>
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        {error && <Alert type="error" showIcon className="mb-5" message={error} />}
        <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
      </Form>
    </AuthShell>
  );
}
