'use client';

import type { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouterProvider } from 'react-aria-components';

export function RouteProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  return <RouterProvider navigate={navigate}>{children}</RouterProvider>;
}
