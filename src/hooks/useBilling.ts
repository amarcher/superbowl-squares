import { useCallback, useRef } from 'react';
import { useAuthBridge } from '../auth/AuthBridgeContext';
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
  const { getToken } = useAuthBridge();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const authedPost = useCallback(async (path: string) => {
    const token = await getTokenRef.current();
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
  }, []);

  const openCheckout = useCallback(async () => {
    const { url } = await authedPost('/api/billing/checkout');
    if (typeof url === 'string') {
      window.location.href = url;
    }
  }, [authedPost]);

  const openPortal = useCallback(async () => {
    const { url } = await authedPost('/api/billing/portal');
    if (typeof url === 'string') {
      window.location.href = url;
    }
  }, [authedPost]);

  return { openCheckout, openPortal };
}

export const useBilling: () => UseBilling = isAuthConfigured()
  ? useBillingReal
  : useBillingNoop;
