import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App, Button, Card, Form, Input, InputNumber, Popconfirm, Select, Switch, Upload } from 'antd';
import { ArrowLeft, Star, Trash2, UploadCloud } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import PageLoader from '@/components/ui/PageLoader';
import ErrorState from '@/components/ui/ErrorState';
import SmartImage from '@/components/ui/SmartImage';
import { adminService } from '@/services/adminService';
import { toFormErrors } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { PRODUCT_STATUSES, SKIN_TYPES } from '@/utils/constants';
import { humanize } from '@/utils/format';

const asList = (r) => (Array.isArray(r) ? r : r?.data || []);
const tsh = { formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','), parser: (v) => v.replace(/[^\d]/g, '') };

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const categories = useAsync(() => adminService.categories().then(asList), []);
  const product = useAsync(() => (editing ? adminService.product(id) : Promise.resolve(null)), [id]);

  useEffect(() => {
    const p = product.data;
    if (!p) return;
    form.setFieldsValue({ ...p, category_id: p.category?.id, benefits: p.benefits || [], skin_types: p.skin_types || [] });
    setImages(p.images || []);
  }, [product.data, form]);

  const save = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, compare_at_price: values.compare_at_price || null, benefits: (values.benefits || []).filter(Boolean) };
      const saved = editing ? await adminService.updateProduct(id, payload) : await adminService.createProduct(payload);
      message.success(editing ? 'Product updated.' : 'Product created. You can add images now.');
      if (!editing) navigate(`/admin/products/${saved.id}/edit`, { replace: true });
    } catch (e) {
      form.setFields(toFormErrors(e.errors));
      message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const upload = async (files) => {
    setUploading(true);
    try {
      const res = await adminService.uploadProductImages(id, files);
      setImages(asList(res));
      message.success('Images uploaded.');
    } catch (e) { message.error(e.errors?.['images.0']?.[0] || e.message); } finally { setUploading(false); }
  };
  const makePrimary = async (img) => {
    await adminService.setPrimaryImage(id, img.id);
    setImages((list) => list.map((i) => ({ ...i, is_primary: i.id === img.id })));
  };
  const removeImage = async (img) => {
    await adminService.deleteProductImage(id, img.id);
    product.reload();
  };

  if (product.loading) return <PageLoader full={false} />;
  if (product.error) return <ErrorState error={product.error} onRetry={product.reload} />;

  return (
    <AdminPage title={editing ? `Edit ${product.data?.name}` : 'New product'}
      extra={<Button icon={<ArrowLeft size={15} />} onClick={() => navigate('/admin/products')}>All products</Button>}>
      <Form form={form} layout="vertical" requiredMark="optional" onFinish={save} scrollToFirstError
        initialValues={{ status: 'ACTIVE', stock: 0, low_stock_threshold: 5, is_featured: false, benefits: [], skin_types: [] }}
        className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="Details">
            <div className="grid gap-x-4 md:grid-cols-2">
              <Form.Item name="name" label="Name" rules={[{ required: true }]} className="md:col-span-2"><Input maxLength={150} /></Form.Item>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}><Input maxLength={64} /></Form.Item>
              <Form.Item name="slug" label="URL slug" extra="Leave blank to generate from the name."><Input maxLength={160} /></Form.Item>
              <Form.Item name="short_description" label="Short description" className="md:col-span-2"><Input.TextArea rows={2} maxLength={500} showCount /></Form.Item>
              <Form.Item name="description" label="Description" className="md:col-span-2"><Input.TextArea rows={5} maxLength={10000} /></Form.Item>
              <Form.Item name="ingredients" label="Ingredients" className="md:col-span-2"><Input.TextArea rows={3} maxLength={5000} /></Form.Item>
              <Form.Item name="how_to_use" label="How to use" className="md:col-span-2"><Input.TextArea rows={3} maxLength={3000} /></Form.Item>
              <Form.Item name="benefits" label="Benefits" extra="Type a benefit and press Enter." className="md:col-span-2">
                <Select mode="tags" tokenSeparators={[',']} open={false} placeholder="e.g. Brightens dull skin" />
              </Form.Item>
              <Form.Item name="skin_types" label="Skin type" className="md:col-span-2">
                <Select mode="multiple" options={SKIN_TYPES.map((s) => ({ value: s, label: s }))} />
              </Form.Item>
            </div>
          </Card>

          <Card title="Images" extra={editing && <span className="text-xs text-stone">JPG, PNG or WebP up to 4 MB</span>}>
            {!editing ? (
              <p className="text-stone">Save the product first, then upload images here.</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {images.map((img) => (
                    <div key={img.id} className={`group relative overflow-hidden rounded-xl ${img.is_primary ? 'ring-2 ring-rosewood' : 'ring-1 ring-line'}`}>
                      <SmartImage src={img.url} alt="" className="aspect-[4/5]" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-white/90 p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                        <Button size="small" type="text" icon={<Star size={14} fill={img.is_primary ? 'currentColor' : 'none'} />} onClick={() => makePrimary(img)} aria-label="Set as main image" />
                        <Popconfirm title="Remove image?" onConfirm={() => removeImage(img)}><Button size="small" type="text" danger icon={<Trash2 size={14} />} aria-label="Remove image" /></Popconfirm>
                      </div>
                    </div>
                  ))}
                </div>
                <Upload.Dragger multiple accept="image/jpeg,image/png,image/webp" showUploadList={false} disabled={uploading} className="mt-4 block"
                  beforeUpload={(file, fileList) => { if (file === fileList[fileList.length - 1]) upload(fileList); return false; }}>
                  <UploadCloud className="mx-auto text-rose" size={28} strokeWidth={1.4} />
                  <p className="mt-2 text-mauve">{uploading ? 'Uploading…' : 'Click or drop images to upload'}</p>
                  <p className="text-xs text-stone">The starred image is shown on product cards.</p>
                </Upload.Dragger>
              </>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Pricing & stock">
            <Form.Item name="price" label="Price (TSh)" rules={[{ required: true }]}><InputNumber min={0} step={500} className="!w-full" {...tsh} /></Form.Item>
            <Form.Item name="compare_at_price" label="Compare-at price (TSh)" extra="Optional original price, shown struck through."><InputNumber min={0} step={500} className="!w-full" {...tsh} /></Form.Item>
            <div className="grid grid-cols-2 gap-3">
              <Form.Item name="stock" label="Stock" rules={[{ required: true }]}><InputNumber min={0} className="!w-full" /></Form.Item>
              <Form.Item name="low_stock_threshold" label="Low stock at"><InputNumber min={0} className="!w-full" /></Form.Item>
            </div>
            <Form.Item name="size" label="Size"><Input placeholder="30 ml" maxLength={50} /></Form.Item>
          </Card>
          <Card title="Organisation">
            <Form.Item name="category_id" label="Category"><Select allowClear options={(categories.data || []).map((c) => ({ value: c.id, label: c.name }))} /></Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}><Select options={PRODUCT_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} /></Form.Item>
            <Form.Item name="is_featured" label="Featured on home page" valuePropName="checked"><Switch /></Form.Item>
          </Card>
          <Button type="primary" htmlType="submit" size="large" block loading={saving}>{editing ? 'Save changes' : 'Create product'}</Button>
        </div>
      </Form>
    </AdminPage>
  );
}
