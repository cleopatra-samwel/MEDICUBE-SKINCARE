import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Alert, App, Form, Input } from 'antd';
import AuthShell from './AuthShell';
import { register } from '@/features/auth/authSlice';
import { toFormErrors } from '@/services/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cleanPhone, TZ_PHONE } from '@/utils/format';

export default function Register() {
  useDocumentTitle('Create account');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (values) => {
    setBusy(true);
    setError('');
    try {
      await dispatch(register({ ...values, phone: values.phone ? cleanPhone(values.phone) : undefined })).unwrap();
      message.success('Your account is ready.');
      navigate('/profile', { replace: true });
    } catch (e) {
      form.setFields(toFormErrors(e.errors));
      if (!Object.keys(e.errors || {}).length) setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create account" lede="Save addresses, keep a wishlist and see every order in one place."
      footer={<>Already have an account? <Link to="/login" className="link-underline">Sign in</Link></>}>
      <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} size="large">
        <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Enter your name.' }]}><Input autoComplete="name" /></Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address.' }]}><Input autoComplete="email" inputMode="email" /></Form.Item>
        <Form.Item name="phone" label="Phone (optional)"
          rules={[{ validator: (_, v) => (!v || TZ_PHONE.test(cleanPhone(v)) ? Promise.resolve() : Promise.reject(new Error('Enter a Tanzanian number, e.g. 0712 345 678.'))) }]}>
          <Input autoComplete="tel" inputMode="tel" placeholder="07XX XXX XXX" />
        </Form.Item>
        <Form.Item name="password" label="Password" extra="At least 8 characters, with letters and numbers."
          rules={[{ required: true, message: 'Choose a password.' }, { min: 8, message: 'Use at least 8 characters.' }, { pattern: /(?=.*[A-Za-z])(?=.*\d)/, message: 'Include letters and numbers.' }]}>
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item name="password_confirmation" label="Confirm password" dependencies={['password']}
          rules={[{ required: true, message: 'Confirm your password.' }, ({ getFieldValue }) => ({ validator: (_, v) => (!v || v === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match.'))) })]}>
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        {error && <Alert type="error" showIcon className="mb-5" message={error} />}
        <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="mt-4 text-xs text-stone">By creating an account you agree to our <Link to="/terms" className="underline">terms</Link> and <Link to="/privacy-policy" className="underline">privacy policy</Link>.</p>
      </Form>
    </AuthShell>
  );
}
