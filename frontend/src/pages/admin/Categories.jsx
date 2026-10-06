import { useState } from 'react';
import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Upload } from 'antd';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import SmartImage from '@/components/ui/SmartImage';
import ErrorState from '@/components/ui/ErrorState';
import { adminService } from '@/services/adminService';
import { toFormErrors } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';

const asList = (r) => (Array.isArray(r) ? r : r?.data || []);

export default function Categories() {
  const { message } = App.useApp();
  const { data, loading, error, reload } = useAsync(() => adminService.categories().then(asList), []);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();

  const open = (cat) => {
    setEditing(cat);
    form.resetFields();
    form.setFieldsValue(cat === 'new' ? { is_active: true, sort_order: (data?.length || 0) + 1 } : { ...cat, image: cat.image_path });
  };
  const save = async (values) => {
    setBusy(true);
    try {
      if (editing === 'new') await adminService.createCategory(values);
      else await adminService.updateCategory(editing.id, values);
      message.success('Category saved.');
      setEditing(null);
      reload();
    } catch (e) { form.setFields(toFormErrors(e.errors)); } finally { setBusy(false); }
  };
  const remove = async (c) => {
    try { await adminService.deleteCategory(c.id); message.success('Category deleted.'); reload(); } catch (e) { message.error(e.message); }
  };
  const upload = async (c, file) => {
    try { await adminService.uploadCategoryImage(c.id, file); message.success('Image updated.'); reload(); } catch (e) { message.error(e.errors?.image?.[0] || e.message); }
    return false;
  };

  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <AdminPage title="Categories" subtitle="Organise products and power the Shop by category section."
      extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => open('new')}>New category</Button>}>
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table rowKey="id" loading={loading} dataSource={data || []} pagination={false} scroll={{ x: 760 }}
          columns={[
            { title: 'Category', render: (_, c) => (
              <div className="flex items-center gap-3">
                <SmartImage src={c.image} alt="" className="h-14 w-11 shrink-0 rounded-t-full rounded-b-lg" />
                <div><p className="font-semibold text-mauve">{c.name}</p><p className="text-xs text-stone">/{c.slug}</p></div>
              </div>
            ) },
            { title: 'Products', dataIndex: 'products_count', align: 'right' },
            { title: 'Order', dataIndex: 'sort_order', align: 'right' },
            { title: 'Visible', dataIndex: 'is_active', render: (v, c) => (
              <Switch size="small" checked={v} onChange={async (on) => { await adminService.updateCategory(c.id, { name: c.name, is_active: on, sort_order: c.sort_order, description: c.description, image: c.image_path }); reload(); }} />
            ) },
            { title: '', align: 'right', render: (_, c) => (
              <Space>
                <Upload accept="image/jpeg,image/png,image/webp" showUploadList={false} beforeUpload={(f) => upload(c, f)}>
                  <Button type="text" icon={<ImagePlus size={15} />} aria-label="Upload image" />
                </Upload>
                <Button type="text" icon={<Pencil size={15} />} onClick={() => open(c)} aria-label="Edit" />
                <Popconfirm title="Delete this category?" onConfirm={() => remove(c)} okText="Delete" okButtonProps={{ danger: true }}>
                  <Button type="text" danger icon={<Trash2 size={15} />} aria-label="Delete" />
                </Popconfirm>
              </Space>
            ) },
          ]} />
      </div>
      <Modal open={!!editing} title={editing === 'new' ? 'New category' : 'Edit category'} onCancel={() => setEditing(null)} onOk={() => form.submit()} confirmLoading={busy} okText="Save" destroyOnClose>
        <Form form={form} layout="vertical" onFinish={save} className="mt-4">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="slug" label="Slug" extra="Leave blank to generate."><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="image" hidden><Input /></Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="sort_order" label="Display order"><InputNumber min={0} className="!w-full" /></Form.Item>
            <Form.Item name="is_active" label="Visible in store" valuePropName="checked"><Switch /></Form.Item>
          </div>
        </Form>
      </Modal>
    </AdminPage>
  );
}
