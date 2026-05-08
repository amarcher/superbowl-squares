import React, { lazy, Suspense } from 'react';

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

export function isAuthConfigured(): boolean {
  return !!PUBLISHABLE_KEY;
}

// Dynamic import: Clerk's runtime + the SignInBadge UI live in this chunk.
// Free users (no publishable key at build time) skip the import entirely
// because AuthProvider returns children directly without rendering
// PremiumChunk. Premium users load it once on first page render.
const PremiumChunk = lazy(() => import('./PremiumChunk'));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<>{children}</>}>
      <PremiumChunk publishableKey={PUBLISHABLE_KEY}>{children}</PremiumChunk>
    </Suspense>
  );
}
