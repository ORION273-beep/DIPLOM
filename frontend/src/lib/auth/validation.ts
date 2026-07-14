const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getEmailError(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return 'Введите email';
  if (!EMAIL_PATTERN.test(trimmed)) return 'Введите корректный email, например name@mail.ru';
  return undefined;
}

export function getPasswordError(password: string): string | undefined {
  if (!password) return 'Введите пароль';
  if (password.length < 6) return 'Пароль должен быть не менее 6 символов';
  return undefined;
}

export function getLoginPasswordError(password: string): string | undefined {
  if (!password) return 'Введите пароль';
  return undefined;
}

export function getConfirmPasswordError(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) return 'Подтвердите пароль';
  if (password !== confirmPassword) return 'Пароли не совпадают';
  return undefined;
}
