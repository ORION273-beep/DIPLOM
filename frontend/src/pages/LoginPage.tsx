import { Suspense } from 'react';
import LoginForm from '@/pages/LoginForm';
import { PageLoader } from '@/components/ui/PageLoader';

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader label="Загрузка..." />}>
      <LoginForm />
    </Suspense>
  );
}
