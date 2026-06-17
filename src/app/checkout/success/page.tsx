import { Suspense } from 'react';
import CheckoutSuccessContent from './CheckoutSuccessContent';
import { PageLoader } from '@/components/ui/PageLoader';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<PageLoader label="Загрузка..." />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
