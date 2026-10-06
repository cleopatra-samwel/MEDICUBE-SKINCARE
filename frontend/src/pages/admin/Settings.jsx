import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Alert, App, Button, Card, Form, Input, InputNumber, Select } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import PageLoader from '@/components/ui/PageLoader';
import ErrorState from '@/components/ui/ErrorState';
import { adminService } from '@/services/adminService';
import { toFormErrors } from '@/services/api';
import { fetchShopConfig } from '@/features/ui/uiSlice';
import { useAsync } from '@/hooks/useAsync';

const tsh = { formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','), parser: (v) => v.replace(/[^\d]/g, '') };

/** Store details and delivery pricing. Viewable by all staff, editable by super admins. */
export default function Settings() {
  const dispatch = useDispatch();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useAsync(() => adminService.settings(), []);

  useEffect(() => {
    if (!data) return;
    const s = data.settings;
    form.setFieldsValue({ ...s, fees: Object.entries(s.delivery_fees_by_region || {}).map(([region, fee]) => ({ region, fee })) });
  }, [data, form]);

  const save = async ({ fees = [], ...values }) => {
    setBusy(true);
    try {
      const delivery_fees_by_region = Object.fromEntries(fees.filter((f) => f?.region).map((f) => [f.region, f.fee || 0]));
      const res = await adminService.updateSettings({ ...values, delivery_fees_by_region });
      message.success(res.message || 'Settings saved.');
      dispatch(fetchShopConfig());
    } catch (e) {
      form.setFields(toFormErrors(e.errors));
      message.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader full={false} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const canEdit = data.can_edit;

  return (
    <AdminPage title="Settings" subtitle="Store details and delivery fees shown at checkout.">
      {!canEdit && <Alert className="mb-6" type="info" showIcon message="Only super admins can change settings. You can view them here." />}
      <Form form={form} layout="vertical" requiredMark={false} onFinish={save} disabled={!canEdit} className="grid gap-6 xl:grid-cols-2">
        <Card title="Store details">
          <Form.Item name="store_name" label="Store name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="store_email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="store_phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="store_address" label="Address" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="low_stock_threshold" label="Default low-stock threshold" rules={[{ required: true }]}><InputNumber min={0} className="!w-full" /></Form.Item>
        </Card>
        <Card title="Delivery fees">
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="delivery_fee_default" label="Default fee (TSh)" rules={[{ required: true }]} extra="Used for regions not listed below.">
              <InputNumber min={0} step={500} className="!w-full" {...tsh} />
            </Form.Item>
            <Form.Item name="free_delivery_threshold" label="Free delivery over (TSh)" rules={[{ required: true }]} extra="Set 0 to turn off.">
              <InputNumber min={0} step={1000} className="!w-full" {...tsh} />
            </Form.Item>
          </div>
          <p className="mb-2 text-sm font-medium text-mauve">Fees by region</p>
          <Form.List name="fees">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div key={key} className="mb-2 flex gap-2">
                    <Form.Item name={[name, 'region']} className="!mb-0 flex-1" rules={[{ required: true, message: 'Region' }]}>
                      <Select showSearch placeholder="Region" options={(data.regions || []).map((r) => ({ value: r, label: r }))} />
                    </Form.Item>
                    <Form.Item name={[name, 'fee']} className="!mb-0 w-40" rules={[{ required: true, message: 'Fee' }]}>
                      <InputNumber min={0} step={500} className="!w-full" {...tsh} />
                    </Form.Item>
                    <Button type="text" danger icon={<Trash2 size={15} />} onClick={() => remove(name)} aria-label="Remove region fee" />
                  </div>
                ))}
                <Button type="dashed" block icon={<Plus size={15} />} onClick={() => add()} className="mt-2">Add region fee</Button>
              </>
            )}
          </Form.List>
        </Card>
        {canEdit && <div className="xl:col-span-2"><Button type="primary" htmlType="submit" size="large" loading={busy}>Save settings</Button></div>}
      </Form>
    </AdminPage>
  );
}
