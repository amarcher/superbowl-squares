import React from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { SignInBadge } from './SignInBadge';
import { AuthBridgeContext, type AuthBridge } from './AuthBridgeContext';

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

export default function PremiumChunk({ publishableKey, children }: Props) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkAuthBridge>
        <SignInBadge />
        {children}
      </ClerkAuthBridge>
    </ClerkProvider>
  );
}
