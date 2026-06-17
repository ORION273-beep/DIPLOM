'use client';

import { AlertCircle, CheckCircle, InfoCircle, Loading01 } from '@untitledui/icons';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'dark' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CheckCircle className="size-4 text-success-primary" />,
        info: <InfoCircle className="size-4 text-brand-secondary" />,
        warning: <AlertCircle className="size-4 text-warning-primary" />,
        error: <AlertCircle className="size-4 text-error-primary" />,
        loading: <Loading01 className="size-4 animate-spin text-brand-secondary" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'bg-primary border border-secondary text-primary shadow-lg',
          title: 'text-primary font-medium',
          description: 'text-tertiary',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
