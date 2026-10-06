import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import AccountLayout from '@/layouts/AccountLayout';
import PageLoader from '@/components/ui/PageLoader';
import ScrollToTop from './ScrollToTop';
import { GuestOnly, RequireAuth, RequireStaff } from './guards';

// Public
const Home = lazy(() => import('@/pages/public/Home'));
const About = lazy(() => import('@/pages/public/About'));
const Products = lazy(() => import('@/pages/public/Products'));
const ProductDetail = lazy(() => import('@/pages/public/ProductDetail'));
const Cart = lazy(() => import('@/pages/public/Cart'));
const Checkout = lazy(() => import('@/pages/public/Checkout'));
const Payment = lazy(() => import('@/pages/public/Payment'));
const OrderConfirmation = lazy(() => import('@/pages/public/OrderConfirmation'));
const TrackOrder = lazy(() => import('@/pages/public/TrackOrder'));
const Contact = lazy(() => import('@/pages/public/Contact'));
const Login = lazy(() => import('@/pages/public/Login'));
const Register = lazy(() => import('@/pages/public/Register'));
const Policy = lazy(() => import('@/pages/public/Policy'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));

// Account
const Profile = lazy(() => import('@/pages/account/Profile'));
const Orders = lazy(() => import('@/pages/account/Orders'));
const OrderDetail = lazy(() => import('@/pages/account/OrderDetail'));
const Wishlist = lazy(() => import('@/pages/account/Wishlist'));

// Admin (a separate bundle: customers never download it unless they visit /admin)
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const ProductForm = lazy(() => import('@/pages/admin/ProductForm'));
const Categories = lazy(() => import('@/pages/admin/Categories'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('@/pages/admin/OrderDetail'));
const Payments = lazy(() => import('@/pages/admin/Payments'));
const Customers = lazy(() => import('@/pages/admin/Customers'));
const Deliveries = lazy(() => import('@/pages/admin/Deliveries'));
const Reviews = lazy(() => import('@/pages/admin/Reviews'));
const Analytics = lazy(() => import('@/pages/admin/Analytics'));
const Settings = lazy(() => import('@/pages/admin/Settings'));

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="checkout/payment/:orderNumber" element={<Payment />} />
            <Route path="order-confirmation/:orderNumber" element={<OrderConfirmation />} />
            <Route path="track-order" element={<TrackOrder />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy-policy" element={<Policy page="privacy" />} />
            <Route path="terms" element={<Policy page="terms" />} />
            <Route path="refund-policy" element={<Policy page="refund" />} />
            <Route path="delivery-information" element={<Policy page="delivery" />} />

            <Route element={<GuestOnly />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<AccountLayout />}>
                <Route path="profile" element={<Profile />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:orderNumber" element={<OrderDetail />} />
                <Route path="wishlist" element={<Wishlist />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="admin">
            <Route element={<GuestOnly admin />}>
              <Route path="login" element={<AdminLogin />} />
            </Route>
            <Route element={<RequireStaff />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="categories" element={<Categories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:orderNumber" element={<AdminOrderDetail />} />
                <Route path="payments" element={<Payments />} />
                <Route path="customers" element={<Customers />} />
                <Route path="deliveries" element={<Deliveries />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
