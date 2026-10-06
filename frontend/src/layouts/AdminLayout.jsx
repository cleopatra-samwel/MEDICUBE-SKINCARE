import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Drawer, Dropdown, Grid, Layout, Menu, Tag } from 'antd';
import {
  BarChart3, ExternalLink, LayoutDashboard, LogOut, Menu as MenuIcon, Package, Receipt, Settings, ShoppingCart,
  Star, Tags, Truck, Users, Wallet,
} from 'lucide-react';
import Logo from '@/assets/brand/Logo';
import { logout, selectUser } from '@/features/auth/authSlice';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { humanize } from '@/utils/format';

const { Sider, Header, Content } = Layout;
const ic = (Icon) => <Icon size={17} strokeWidth={1.7} />;

const ITEMS = [
  { key: '/admin/dashboard', icon: ic(LayoutDashboard), label: 'Dashboard' },
  { key: '/admin/products', icon: ic(Package), label: 'Products' },
  { key: '/admin/categories', icon: ic(Tags), label: 'Categories' },
  { key: '/admin/orders', icon: ic(ShoppingCart), label: 'Orders' },
  { key: '/admin/payments', icon: ic(Wallet), label: 'Payments' },
  { key: '/admin/customers', icon: ic(Users), label: 'Customers' },
  { key: '/admin/deliveries', icon: ic(Truck), label: 'Deliveries' },
  { key: '/admin/reviews', icon: ic(Star), label: 'Reviews' },
  { key: '/admin/analytics', icon: ic(BarChart3), label: 'Analytics' },
  { key: '/admin/settings', icon: ic(Settings), label: 'Settings' },
  { type: 'divider' },
  { key: 'logout', icon: ic(LogOut), label: 'Logout', danger: true },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector(selectUser);
  const screens = Grid.useBreakpoint();
  const mobile = !screens.lg;
  const [drawer, setDrawer] = useState(false);
  const selected = ITEMS.find((i) => i.key && pathname.startsWith(i.key))?.key;
  useDocumentTitle(`Admin · ${ITEMS.find((i) => i.key === selected)?.label || 'Dashboard'}`);

  useEffect(() => setDrawer(false), [pathname]);

  const onMenu = async ({ key }) => {
    if (key === 'logout') {
      await dispatch(logout());
      navigate('/admin/login', { replace: true });
    } else navigate(key);
  };

  const menu = (
    <>
      <div className="flex h-16 items-center px-6"><Link to="/admin/dashboard"><Logo compact /></Link></div>
      <Menu mode="inline" selectedKeys={[selected]} items={ITEMS} onClick={onMenu} className="!border-0 pb-6" />
    </>
  );

  return (
    <Layout className="min-h-screen">
      {!mobile && (
        <Sider width={248} className="!fixed inset-y-0 left-0 overflow-y-auto border-r border-line">{menu}</Sider>
      )}
      <Drawer open={mobile && drawer} onClose={() => setDrawer(false)} placement="left" width={264} closable={false} styles={{ body: { padding: 0 } }}>
        {menu}
      </Drawer>
      <Layout style={{ marginLeft: mobile ? 0 : 248 }}>
        <Header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line !px-4 sm:!px-8" style={{ height: 64, lineHeight: 'normal' }}>
          <div className="flex items-center gap-3">
            {mobile && (
              <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-lg text-mauve hover:bg-petal">
                <MenuIcon size={20} />
              </button>
            )}
            <span className="hidden text-sm text-stone sm:inline">Store administration</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 text-sm text-stone hover:text-rosewood sm:inline-flex">
              View store <ExternalLink size={14} />
            </a>
            <Dropdown trigger={['click']} menu={{ items: [
              { key: 'orders', icon: <Receipt size={15} />, label: 'Orders', onClick: () => navigate('/admin/orders') },
              { type: 'divider' },
              { key: 'logout', icon: <LogOut size={15} />, label: 'Logout', onClick: () => onMenu({ key: 'logout' }) },
            ] }}>
              <button type="button" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-petal">
                <Avatar style={{ background: '#EFD5D1', color: '#8F4A55' }}>{user?.name?.[0]}</Avatar>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm text-mauve">{user?.name}</span>
                  <Tag bordered={false} color={user?.role === 'super_admin' ? 'magenta' : 'default'} className="!m-0 !text-[13px]">{humanize(user?.role)}</Tag>
                </span>
              </button>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-4 sm:p-8">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
