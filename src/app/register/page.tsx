'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { LoginSplitQuoteImage01 } from '@/components/shared-assets/login/login-split-quote-image-01';
import { useAuthStore } from '@/lib/auth/store';
import { parseApiErrorBody } from '@/lib/api/errors';
import { buildLoginUrl, getPostLoginPath } from '@/lib/auth/redirect';
import {
  getConfirmPasswordError,
  getEmailError,
  getPasswordError,
} from '@/lib/auth/validation';

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const postLoginPath = getPostLoginPath(searchParams.get('next'));
  const loginHref = buildLoginUrl(searchParams.get('next'));
  const setSession = useAuthStore((s) => s.setSession);
  const setAuthReady = useAuthStore((s) => s.setAuthReady);

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
        message = getPasswordError(password);
        break;
      case 'confirmPassword':
        message = getConfirmPasswordError(password, confirmPassword);
        break;
    }
    setFieldError(field, message);
    return !message;
  };

  const validateAll = () => {
    const errors: FieldErrors = {};
    const emailError = getEmailError(email);
    const passwordError = getPasswordError(password);
    const confirmPasswordError = getConfirmPasswordError(password, confirmPassword);

    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateAll()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSuccess(true);
        toast.success('Регистрация успешна! Выполняется вход...');

        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const loginData = await loginRes.json().catch(() => ({}));

        if (loginRes.ok && loginData.accessToken && loginData.user) {
          setSession(loginData.user, loginData.accessToken);
          setAuthReady(true);
          router.replace(postLoginPath);
        } else {
          setError('Ошибка при автоматическом входе');
        }
      } else {
        setError(parseApiErrorBody(data, 'Ошибка при регистрации'));
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginSplitQuoteImage01
      title="Регистрация"
      subtitle="Создайте аккаунт для покупок на OneSec"
      footer={
        <p className="text-center text-sm text-tertiary">
          Уже есть аккаунт?{' '}
          <Link href={loginHref} className="font-medium text-brand-secondary hover:underline">
            Войти
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <div className="rounded-lg border border-error-secondary bg-error-primary px-4 py-3 text-sm text-error-primary">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-brand/30 bg-brand-primary px-4 py-3 text-sm text-brand-secondary">
            Регистрация прошла успешно! Выполняется вход в аккаунт...
          </div>
        )}
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
          isDisabled={success}
          isInvalid={Boolean(fieldErrors.email)}
          hint={fieldErrors.email}
        />
        <Input
          label="Пароль"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setFieldError('password');
            if (fieldErrors.confirmPassword) validateField('confirmPassword');
          }}
          onBlur={() => validateField('password')}
          isRequired
          isDisabled={success}
          isInvalid={Boolean(fieldErrors.password)}
          hint={fieldErrors.password}
        />
        <Input
          label="Подтверждение пароля"
          type="password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            setFieldError('confirmPassword');
          }}
          onBlur={() => validateField('confirmPassword')}
          isRequired
          isDisabled={success}
          isInvalid={Boolean(fieldErrors.confirmPassword)}
          hint={fieldErrors.confirmPassword}
        />
        <Button type="submit" color="primary" size="lg" className="w-full" isDisabled={isLoading || success}>
          {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
        </Button>
      </form>
    </LoginSplitQuoteImage01>
  );
}
