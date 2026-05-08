import React, { useEffect, useRef } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { SignInBadge } from './SignInBadge';
import { AuthBridgeContext, type AuthBridge } from './AuthBridgeContext';
import {
  RosterStateContext,
  useRosterReal,
  useRoster,
} from '../hooks/useRoster';

interface Props {
  publishableKey: string;
  children: React.ReactNode;
}

// Reads Clerk's useAuth (only available inside ClerkProvider) and forwards
// the bits we need to the rest of the app via context. This keeps Clerk
// imports out of the main bundle -- the hooks (useRoster, useBilling)
// just consume the context.
function ClerkAuthBridge({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const value: AuthBridge = {
    isLoaded: !!auth.isLoaded,
    isSignedIn: !!auth.isSignedIn,
    getToken: () => auth.getToken(),
  };
  return (
    <AuthBridgeContext.Provider value={value}>
      {children}
    </AuthBridgeContext.Provider>
  );
}

// Hosts the single instance of useRosterReal so all consumers share state.
// Without this, each component calling useRoster() would have its own
// useState, and adding a roster entry in one wouldn't be visible to another.
function RosterStateProvider({ children }: { children: React.ReactNode }) {
  const value = useRosterReal();
  return (
    <RosterStateContext.Provider value={value}>
      {children}
    </RosterStateContext.Provider>
  );
}

// After Stripe Checkout redirects back with ?billing=success, the webhook
// that flips Redis entitlement runs asynchronously. The page may load
// before the webhook completes, so we'd see "forbidden" even though the
// user just paid. Poll refresh() until status flips to 'ready' (or until
// we give up after ~30s), then strip the URL parameter.
function BillingSuccessHandler() {
  const { refresh, status } = useRoster();
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') !== 'success') return;

    let attempts = 0;
    const maxAttempts = 15; // ~30s @ 2s
    intervalRef.current = setInterval(() => {
      attempts++;
      refreshRef.current();
      if (attempts >= maxAttempts && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 2000);

    refreshRef.current(); // kick once immediately

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (status !== 'ready') return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') === 'success') {
      const url = new URL(window.location.href);
      url.searchParams.delete('billing');
      window.history.replaceState({}, '', url.toString());
    }
  }, [status]);

  return null;
}

export default function PremiumChunk({ publishableKey, children }: Props) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkAuthBridge>
        <RosterStateProvider>
          <BillingSuccessHandler />
          <SignInBadge />
          {children}
        </RosterStateProvider>
      </ClerkAuthBridge>
    </ClerkProvider>
  );
}
