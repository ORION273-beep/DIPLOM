import { Suspense } from 'react';
import ResetPasswordPage from './ResetPasswordContent';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-tertiary">Загрузка...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
