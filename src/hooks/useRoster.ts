import { useCallback, useEffect, useRef, useState } from 'react';
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

async function readApiError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body === 'object') {
      const err = (body as { error?: string }).error;
      const msg = (body as { message?: string }).message;
      if (err && msg) return `${err}: ${msg}`;
      if (err) return err;
      if (msg) return msg;
    }
  } catch {
    // body wasn't JSON
  }
  return `HTTP ${res.status}`;
}

function useRosterReal(): UseRoster {
  // Destructure stable primitives + the getToken function. Whole `auth`
  // object is a fresh reference each render, so depending on it would
  // re-create authedFetch every render -> infinite useEffect loop.
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [status, setStatus] = useState<RosterStatus>('loading');
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  const authedFetch = useCallback(async (path: string, init?: RequestInit) => {
    const token = await getTokenRef.current();
    if (!token) throw new Error('Not signed in');
    return fetch(path, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
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
      if (!res.ok) {
        throw new Error(await readApiError(res));
      }
      const data = await res.json();
      setRoster(data.roster || []);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roster');
      setStatus('error');
    }
  }, [isLoaded, isSignedIn, authedFetch]);

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
      if (!res.ok) throw new Error(await readApiError(res));
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
      if (!res.ok) throw new Error(await readApiError(res));
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
      if (!res.ok) throw new Error(await readApiError(res));
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
