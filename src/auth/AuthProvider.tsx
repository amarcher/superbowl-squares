import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

export function isAuthConfigured(): boolean {
  return !!PUBLISHABLE_KEY;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{children}</ClerkProvider>
  );
}
