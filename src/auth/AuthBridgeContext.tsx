import { createContext, useContext } from 'react';

export interface AuthBridge {
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
}

// Default = unauthenticated. PremiumChunk overrides with real Clerk values
// via AuthBridgeContext.Provider once it loads.
const DEFAULT_AUTH: AuthBridge = {
  isLoaded: false,
  isSignedIn: false,
  getToken: async () => null,
};

export const AuthBridgeContext = createContext<AuthBridge>(DEFAULT_AUTH);

export function useAuthBridge(): AuthBridge {
  return useContext(AuthBridgeContext);
}
