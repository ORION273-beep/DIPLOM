import { Suspense, lazy, type ComponentType, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ClientProvider } from '@/components/layout/ClientProvider';
import { OneSecHeader } from '@/components/layout/OneSecHeader';
import { Footer } from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/PageLoader';
import AdminLayout from '@/pages/admin/AdminLayout';

function lazyPage(factory: () => Promise<{ default: ComponentType }>) {
  return lazy(factory);
}

const HomePage = lazyPage(() => import('@/pages/HomePage'));
const CatalogPage = lazyPage(() => import('@/pages/CatalogPage'));
const CatalogCategoryPage = lazyPage(() => import('@/pages/CatalogCategoryPage'));
const CurrencyPage = lazyPage(() => import('@/pages/CurrencyPage'));
const SubscriptionsPage = lazyPage(() => import('@/pages/SubscriptionsPage'));
const GamesPage = lazyPage(() => import('@/pages/GamesPage'));
const GameSlugPage = lazyPage(() => import('@/pages/GameSlugPage'));
const ProductPage = lazyPage(() => import('@/pages/ProductPage'));
const CartPage = lazyPage(() => import('@/pages/CartPage'));
const FavoritesPage = lazyPage(() => import('@/pages/FavoritesPage'));
const LoginPage = lazyPage(() => import('@/pages/LoginPage'));
const RegisterPage = lazyPage(() => import('@/pages/RegisterPage'));
const CheckoutPage = lazyPage(() => import('@/pages/CheckoutPage'));
const CheckoutSuccessPage = lazyPage(() => import('@/pages/CheckoutSuccessPage'));
const ProfilePage = lazyPage(() => import('@/pages/ProfilePage'));
const ProfileOrdersPage = lazyPage(() => import('@/pages/ProfileOrdersPage'));
const ProfileOrderDetailPage = lazyPage(() => import('@/pages/ProfileOrderDetailPage'));
const OrdersPage = lazyPage(() => import('@/pages/OrdersPage'));
const FaqPage = lazyPage(() => import('@/pages/FaqPage'));
const ReviewsPage = lazyPage(() => import('@/pages/ReviewsPage'));
const PromotionsPage = lazyPage(() => import('@/pages/PromotionsPage'));
const ContactsPage = lazyPage(() => import('@/pages/ContactsPage'));
const RulesPage = lazyPage(() => import('@/pages/RulesPage'));
const RefundPolicyPage = lazyPage(() => import('@/pages/RefundPolicyPage'));
const UserAgreementPage = lazyPage(() => import('@/pages/UserAgreementPage'));
const ForgotPasswordPage = lazyPage(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazyPage(() => import('@/pages/ResetPasswordPage'));
const AdminHomePage = lazyPage(() => import('@/pages/admin/AdminHomePage'));
const AdminOrdersPage = lazyPage(() => import('@/pages/admin/AdminOrdersPage'));
const AdminProductsPage = lazyPage(() => import('@/pages/admin/AdminProductsPage'));
const AdminGamesPage = lazyPage(() => import('@/pages/admin/AdminGamesPage'));
const AdminUsersPage = lazyPage(() => import('@/pages/admin/AdminUsersPage'));
const AdminReviewsPage = lazyPage(() => import('@/pages/admin/AdminReviewsPage'));
const AdminFaqPage = lazyPage(() => import('@/pages/admin/AdminFaqPage'));

function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <OneSecHeader />}
      <main className="min-h-screen bg-primary">{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}

function AppRoutes() {
  return (
    <Shell>
      <Suspense fallback={<PageLoader label="Загрузка..." />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/currency" element={<CurrencyPage />} />
          <Route path="/catalog/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/catalog/:category" element={<CatalogCategoryPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:slug" element={<GameSlugPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/orders" element={<ProfileOrdersPage />} />
          <Route path="/profile/orders/:id" element={<ProfileOrderDetailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/user-agreement" element={<UserAgreementPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="games" element={<AdminGamesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="faq" element={<AdminFaqPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ClientProvider>
        <AppRoutes />
      </ClientProvider>
    </BrowserRouter>
  );
}
