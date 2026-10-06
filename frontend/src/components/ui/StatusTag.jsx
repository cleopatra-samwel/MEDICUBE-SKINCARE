import { Tag } from 'antd';
import { STATUS_COLORS } from '@/utils/constants';
import { humanize } from '@/utils/format';

export default function StatusTag({ status }) {
  if (!status) return null;
  return <Tag color={STATUS_COLORS[status] || 'default'} bordered={false} className="!rounded-full !px-2.5">{humanize(status)}</Tag>;
}
