import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { isAuthConfigured } from '../auth/AuthProvider';
import type RosterPlayer from '../types/rosterPlayer';
import { downscaleToWebp, blobToBase64 } from '../utils/imageUtils';

export type RosterStatus =
  | 'unconfigured'
  | 'signed-out'
  | 'loading'
  | 'forbidden'
  | 'ready'
  | 'error';

export interface UseRoster {
  status: RosterStatus;
  roster: RosterPlayer[];
  error?: string;
  refresh: () => Promise<void>;
  upsert: (player: Omit<RosterPlayer, 'id'> & { id?: string }) => Promise<RosterPlayer>;
  remove: (id: string) => Promise<void>;
  generateAvatar: (file: File) => Promise<{ avatarUrl: string; remaining: number }>;
}

const noopUpsert = async (): Promise<RosterPlayer> => {
  throw new Error('Auth not configured');
};
const noopGenerate = async (): Promise<{ avatarUrl: string; remaining: number }> => {
  throw new Error('Auth not configured');
};

function useRosterNoop(): UseRoster {
  return {
    status: 'unconfigured',
    roster: [],
    refresh: async () => {},
    upsert: noopUpsert,
    remove: async () => {},
    generateAvatar: noopGenerate,
  };
}

function useRosterReal(): UseRoster {
  const auth = useAuth();
  const [status, setStatus] = useState<RosterStatus>('loading');
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  const authedFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const token = await auth.getToken();
      if (!token) throw new Error('Not signed in');
      return fetch(path, {
        ...init,
        headers: {
          ...(init?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
    },
    [auth],
  );

  const refresh = useCallback(async () => {
    if (!auth.isLoaded) return;
    if (!auth.isSignedIn) {
      setStatus('signed-out');
      setRoster([]);
      return;
    }
    setStatus('loading');
    setError(undefined);
    try {
      const res = await authedFetch('/api/roster/list');
      if (res.status === 403) {
        setStatus('forbidden');
        setRoster([]);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRoster(data.roster || []);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roster');
      setStatus('error');
    }
  }, [auth.isLoaded, auth.isSignedIn, authedFetch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsert = useCallback(
    async (entry: Omit<RosterPlayer, 'id'> & { id?: string }) => {
      const res = await authedFetch('/api/roster/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const { entry: saved } = await res.json();
      setRoster((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved];
      });
      return saved as RosterPlayer;
    },
    [authedFetch],
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await authedFetch(`/api/roster/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setRoster((prev) => prev.filter((p) => p.id !== id));
    },
    [authedFetch],
  );

  const generateAvatar = useCallback(
    async (file: File) => {
      const downscaled = await downscaleToWebp(file, 512, 0.7);
      const base64 = await blobToBase64(downscaled);
      const res = await authedFetch('/api/roster/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, contentType: 'image/webp' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    [authedFetch],
  );

  return { status, roster, error, refresh, upsert, remove, generateAvatar };
}

// Resolved at module load so each component gets one consistent hook
// implementation for its entire lifetime — preserves rules-of-hooks.
export const useRoster: () => UseRoster = isAuthConfigured()
  ? useRosterReal
  : useRosterNoop;
