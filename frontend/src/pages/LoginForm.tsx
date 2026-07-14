import { Link } from 'react-router-dom';
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from '@/lib/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { LoginSplitQuoteImage01 } from '@/components/shared-assets/login/login-split-quote-image-01';
import { useAuthStore } from '@/lib/auth/store';
import { syncFavoritesFromServer } from '@/lib/favoritesSync';
import { mergeLocalCartToServer } from '@/lib/cartSync';
import { parseApiErrorBody } from '@/lib/api/errors';
import { getPostLoginPath, LOGIN_REASON_MESSAGES, parseLoginReason } from '@/lib/auth/redirect';
import { getEmailError, getLoginPasswordError } from '@/lib/auth/validation';

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const loginReason = parseLoginReason(searchParams.get('reason'));
  const reasonMessage = loginReason ? LOGIN_REASON_MESSAGES[loginReason] : null;
  const postLoginPath = getPostLoginPath(nextParam);
  const registerHref = nextParam ? `/register?next=${encodeURIComponent(postLoginPath)}` : '/register';
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady);
  const setSession = useAuthStore((s) => s.setSession);
  const setAuthReady = useAuthStore((s) => s.setAuthReady);
  const hasNavigatedRef = useRef(false);
  const [redirecting, setRedirecting] = useState(false);

  const navigateAfterAuth = useCallback(
    (path: string) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      setRedirecting(true);
      router.replace(path);
    },
    [router],
  );

  useEffect(() => {
    if (!authReady || !user) return;
    navigateAfterAuth(postLoginPath);
  }, [authReady, user, navigateAfterAuth, postLoginPath]);

  useEffect(() => {
    if (!redirecting) return;
    const timer = window.setTimeout(() => {
      if (window.location.pathname.startsWith('/login')) {
        window.location.assign(postLoginPath);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [redirecting, postLoginPath]);

  const setFieldError = (field: keyof FieldErrors, message?: string) => {
    setFieldErrors((prev) => {
      if (!message) {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: message };
    });
  };

  const validateField = (field: keyof FieldErrors) => {
    let message: string | undefined;
    switch (field) {
      case 'email':
        message = getEmailError(email);
        break;
      case 'password':
        message = getLoginPasswordError(password);
        break;
    }
    setFieldError(field, message);
    return !message;
  };

  const validateAll = () => {
    const errors: FieldErrors = {};
    const emailError = getEmailError(email);
    const passwordError = getLoginPasswordError(password);

    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateAll()) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(parseApiErrorBody(data, 'Неверный email или пароль'));
      } else if (data.accessToken && data.user) {
        setSession(data.user, data.accessToken);
        setAuthReady(true);
        void syncFavoritesFromServer();
        void mergeLocalCartToServer();
        toast.success('Вы успешно вошли в аккаунт');
        navigateAfterAuth(postLoginPath);
      } else {
        setError('Неверный ответ сервера');
      }
    } catch (err) {
      setError('Ошибка при входе. Попробуйте позже.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (redirecting || (authReady && user)) {
    return (
      <LoginSplitQuoteImage01 title="Вход в аккаунт" subtitle="Перенаправление...">
        <div className="flex min-h-32 items-center justify-center text-tertiary">Загрузка...</div>
      </LoginSplitQuoteImage01>
    );
  }

  return (
    <LoginSplitQuoteImage01
      title="Вход в аккаунт"
      subtitle="Введите email и пароль для входа"
      footer={
        <p className="text-center text-sm text-tertiary">
          Нет аккаунта?{' '}
          <Link to={registerHref} className="font-medium text-brand-secondary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {reasonMessage && (
          <div className="rounded-lg border border-brand-secondary/30 bg-brand-solid/10 px-4 py-3 text-sm text-brand-secondary">
            {reasonMessage}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-error-secondary bg-error-primary px-4 py-3 text-sm text-error-primary">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(value) => {
              setEmail(value);
              setFieldError('email');
            }}
            onBlur={() => validateField('email')}
            isRequired
            size="lg"
            isInvalid={Boolean(fieldErrors.email)}
            hint={fieldErrors.email}
          />
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className={`text-sm font-medium ${fieldErrors.password ? 'text-error-primary' : 'text-secondary'}`}
              >
                Пароль
              </span>
              <Link to="/forgot-password" className="text-sm font-medium text-brand-secondary hover:underline">
                Забыли пароль?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setFieldError('password');
              }}
              onBlur={() => validateField('password')}
              isRequired
              size="lg"
              aria-label="Пароль"
              isInvalid={Boolean(fieldErrors.password)}
              hint={fieldErrors.password}
            />
          </div>
        </div>
        <Button type="submit" color="primary" size="lg" className="w-full" isDisabled={isLoading}>
          {isLoading ? 'Входим...' : 'Войти'}
        </Button>
      </form>
    </LoginSplitQuoteImage01>
  );
}
