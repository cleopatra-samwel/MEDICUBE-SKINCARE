import { useState } from 'react';
import { App, Form, Input } from 'antd';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SocialLinks from '@/components/layout/SocialLinks';
import { catalogService } from '@/services/catalogService';
import { toFormErrors } from '@/services/api';
import { brand } from '@/config/brand';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function Contact() {
  useDocumentTitle('Contact');
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);

  const submit = async (values) => {
    setBusy(true);
    try {
      const res = await catalogService.contact(values);
      message.success(res.message);
      form.resetFields();
    } catch (e) {
      form.setFields(toFormErrors(e.errors));
      if (!Object.keys(e.errors || {}).length) message.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const details = [
    { Icon: Phone, label: 'Phone', value: brand.phone, href: `tel:${brand.phone.replace(/\s/g, '')}` },
    { Icon: Mail, label: 'Email', value: brand.email, href: `mailto:${brand.email}` },
    { Icon: MapPin, label: 'Location', value: brand.location },
    { Icon: Clock, label: 'Hours', value: 'Mon–Sat, 9:00–18:00 EAT' },
  ];

  return (
    <>
      <PageHeader title="Contact us" crumbs={[[null, 'Contact']]} lede="Questions about a product, your skin or an order? We reply within one working day." />
      <div className="shell grid gap-12 py-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:py-16">
        <div>
          <ul className="space-y-6">
            {details.map(({ Icon, label, value, href }) => (
              <li key={label} className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-petal text-rosewood"><Icon size={19} strokeWidth={1.6} /></span>
                <div>
                  <p className="text-sm text-stone">{label}</p>
                  {href ? <a href={href} className="text-lg text-mauve hover:text-rosewood">{value}</a> : <p className="text-lg text-mauve">{value}</p>}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 border-t border-line pt-8">
            <h2 className="font-display text-[1.75rem]">Follow along</h2>
            <p className="mt-2 text-stone">Routines, launches and behind-the-scenes from our studio.</p>
            <div className="mt-5"><SocialLinks withLabels /></div>
          </div>
        </div>

        <div className="card p-6 sm:p-10">
          <h2 className="font-display text-[2.125rem]">Send a message</h2>
          <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} className="mt-6" size="large">
            <div className="grid gap-x-5 sm:grid-cols-2">
              <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter your name.' }]}><Input autoComplete="name" /></Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email.' }]}><Input autoComplete="email" /></Form.Item>
              <Form.Item name="phone" label="Phone (optional)"><Input autoComplete="tel" inputMode="tel" /></Form.Item>
              <Form.Item name="subject" label="Subject (optional)"><Input maxLength={150} /></Form.Item>
            </div>
            <Form.Item name="message" label="Message" rules={[{ required: true, min: 10, message: 'Write at least 10 characters.' }]}>
              <Input.TextArea rows={5} maxLength={3000} showCount />
            </Form.Item>
            <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">{busy ? 'Sending…' : 'Send message'}</button>
          </Form>
        </div>
      </div>
    </>
  );
}
