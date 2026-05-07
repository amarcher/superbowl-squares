import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { isAuthConfigured } from '../auth/AuthProvider';

export interface UseBilling {
  openCheckout: () => Promise<void>;
  openPortal: () => Promise<void>;
}

const noopAsync = async () => {
  throw new Error('Auth not configured');
};

function useBillingNoop(): UseBilling {
  return {
    openCheckout: noopAsync,
    openPortal: noopAsync,
  };
}

function useBillingReal(): UseBilling {
  const auth = useAuth();

  const authedFetch = useCallback(
    async (path: string) => {
      const token = await auth.getToken();
      if (!token) throw new Error('Not signed in');
      const res = await fetch(path, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    [auth],
  );

  const openCheckout = useCallback(async () => {
    const { url } = await authedFetch('/api/billing/checkout');
    if (typeof url === 'string') {
      window.location.href = url;
    }
  }, [authedFetch]);

  const openPortal = useCallback(async () => {
    const { url } = await authedFetch('/api/billing/portal');
    if (typeof url === 'string') {
      window.location.href = url;
    }
  }, [authedFetch]);

  return { openCheckout, openPortal };
}

export const useBilling: () => UseBilling = isAuthConfigured()
  ? useBillingReal
  : useBillingNoop;
