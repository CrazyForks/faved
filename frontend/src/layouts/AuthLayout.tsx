import React from 'react';
import { Logo } from '@/layouts/Logo.tsx';

export const AuthLayout = ({ children }) => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-8 p-3 md:p-10">
      <Logo />
      {children}
    </div>
  );
};
