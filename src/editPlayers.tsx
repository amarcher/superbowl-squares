import React, { useCallback, useMemo, useRef, useState } from 'react';
import type Player from './types/player';
import type RosterPlayer from './types/rosterPlayer';
import Modal from './modal';
import { PLAYER_COLORS } from './colors';
import { useRoster } from './hooks/useRoster';

interface Props {
  setPlayers: (players: Record<string, Player>) => void;
  players: Record<string, Player>;
  onClose: () => void;
  isOpen: boolean;
}

export default function EditPlayers({
  setPlayers,
  players,
  onClose,
  isOpen,
}: Props) {
  const { status, roster, generateAvatar, upsert } = useRoster();
  const isPremium = status === 'ready';
  const [rowError, setRowError] = useState<Record<string, string | undefined>>({});
  const [busyRow, setBusyRow] = useState<string | null>(null);
  const [typeaheadFor, setTypeaheadFor] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const slotRosterMatch = useCallback(
    (id: string): RosterPlayer | undefined => {
      const p = players[id];
      if (!p?.name) return undefined;
      const slotAvatar = p.avatarUrl || undefined;
      return roster.find(
        (r) =>
          r.name === p.name &&
          (r.avatarUrl || undefined) === slotAvatar,
      );
    },
    [players, roster],
  );

  const usedRosterIds = useMemo(() => {
    const used = new Set<string>();
    for (const id of Object.keys(players)) {
      const match = slotRosterMatch(id);
      if (match) used.add(match.id);
    }
    return used;
  }, [players, slotRosterMatch]);

  const setName = useCallback(
    (id: string, name: string) => {
      setPlayers({ ...players, [id]: { ...players[id], name } });
    },
    [players, setPlayers],
  );

  const applyRosterEntry = useCallback(
    (id: string, r: RosterPlayer) => {
      setPlayers({
        ...players,
        [id]: {
          ...players[id],
          name: r.name,
          color: r.color,
          avatarUrl: r.avatarUrl,
        },
      });
      setTypeaheadFor(null);
    },
    [players, setPlayers],
  );

  const onPickFromStrip = useCallback(
    (r: RosterPlayer) => {
      const nextEmpty = Object.keys(players).find((id) => !players[id].name);
      if (nextEmpty) applyRosterEntry(nextEmpty, r);
    },
    [players, applyRosterEntry],
  );

  const onAvatarClick = useCallback(
    (id: string) => {
      if (!players[id]?.name?.trim()) {
        setRowError((prev) => ({ ...prev, [id]: 'Add a name first' }));
        return;
      }
      if (!isPremium) {
        setRowError((prev) => ({ ...prev, [id]: 'Premium unlocks photos' }));
        return;
      }
      setRowError((prev) => ({ ...prev, [id]: undefined }));
      fileInputs.current[id]?.click();
    },
    [isPremium, players],
  );

  const onFileChange = useCallback(
    async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setBusyRow(id);
      setRowError((prev) => ({ ...prev, [id]: undefined }));
      try {
        const { avatarUrl } = await generateAvatar(file);
        setPlayers({
          ...players,
          [id]: { ...players[id], avatarUrl },
        });
      } catch (err) {
        setRowError((prev) => ({
          ...prev,
          [id]: err instanceof Error ? err.message : 'Generation failed',
        }));
      } finally {
        setBusyRow(null);
      }
    },
    [generateAvatar, players, setPlayers],
  );

  const onSaveToRoster = useCallback(
    async (id: string) => {
      const player = players[id];
      if (!player.name?.trim()) return;
      setBusyRow(id);
      setRowError((prev) => ({ ...prev, [id]: undefined }));
      try {
        await upsert({
          name: player.name,
          color: player.color || '#1f2937',
          avatarUrl: player.avatarUrl,
        });
      } catch (err) {
        setRowError((prev) => ({
          ...prev,
          [id]: err instanceof Error ? err.message : 'Save failed',
        }));
      } finally {
        setBusyRow(null);
      }
    },
    [players, upsert],
  );

  const typeaheadMatches = useCallback(
    (id: string) => {
      const query = (players[id]?.name || '').trim().toLowerCase();
      return roster.filter((r) => {
        if (usedRosterIds.has(r.id)) return false;
        if (!query) return true;
        return r.name.toLowerCase().includes(query);
      });
    },
    [players, roster, usedRosterIds],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isPremium && roster.length > 0 && (
        <div className="ep-roster-strip">
          <div className="ep-roster-strip-label">Your roster</div>
          <div className="ep-roster-strip-scroll">
            {roster.map((r) => {
              const used = usedRosterIds.has(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`ep-roster-chip${used ? ' used' : ''}`}
                  disabled={used}
                  onClick={() => onPickFromStrip(r)}
                  title={used ? `${r.name} already added` : `Add ${r.name}`}
                >
                  <div
                    className="ep-roster-chip-avatar"
                    style={{ background: r.avatarUrl ? 'transparent' : r.color }}
                  >
                    {r.avatarUrl ? (
                      <img src={r.avatarUrl} alt="" />
                    ) : (
                      <span>{r.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="ep-roster-chip-name">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <form className="ep-form">
        {Object.entries(players).map(([id, player]) => {
          const matches = typeaheadFor === id ? typeaheadMatches(id) : [];
          const showTypeahead = typeaheadFor === id && matches.length > 0;
          const error = rowError[id];
          const isInRoster = !!slotRosterMatch(id);
          const fallbackBg = player.color || PLAYER_COLORS[id]?.bg || '#1f2937';
          const fallbackText = PLAYER_COLORS[id]?.text || '#ffffff';
          const showLock = !isPremium && !player.avatarUrl && !!player.name;

          return (
            <div key={id} className="ep-row">
              <div className="ep-row-main">
                <button
                  type="button"
                  className="ep-avatar"
                  style={{
                    background: player.avatarUrl ? 'transparent' : fallbackBg,
                    color: fallbackText,
                  }}
                  onClick={() => onAvatarClick(id)}
                  title={
                    !player.name?.trim()
                      ? 'Add a name first'
                      : !isPremium
                        ? 'Premium unlocks photos'
                        : player.avatarUrl
                          ? 'Replace photo'
                          : 'Add a photo'
                  }
                  disabled={busyRow === id}
                >
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt="" />
                  ) : (
                    <span>{(player.name || '?').charAt(0).toUpperCase()}</span>
                  )}
                  {showLock && <span className="ep-avatar-lock">🔒</span>}
                  {busyRow === id && <span className="ep-avatar-spinner" />}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => {
                    fileInputs.current[id] = el;
                  }}
                  className="ep-file-input"
                  onChange={(e) => onFileChange(id, e)}
                />
                <div className="ep-name-wrap">
                  <input
                    type="text"
                    id={id}
                    value={player.name ?? ''}
                    className="ep-name"
                    placeholder="Add a player…"
                    onChange={(e) => setName(id, e.target.value)}
                    onFocus={() => setTypeaheadFor(id)}
                    onBlur={() =>
                      setTimeout(
                        () => setTypeaheadFor((cur) => (cur === id ? null : cur)),
                        150,
                      )
                    }
                  />
                  {showTypeahead && (
                    <div className="ep-typeahead">
                      {matches.slice(0, 6).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className="ep-typeahead-item"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyRosterEntry(id, r)}
                        >
                          <div
                            className="ep-typeahead-avatar"
                            style={{
                              background: r.avatarUrl ? 'transparent' : r.color,
                            }}
                          >
                            {r.avatarUrl ? (
                              <img src={r.avatarUrl} alt="" />
                            ) : (
                              <span>{r.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span>{r.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isPremium && player.name?.trim() && (
                  <button
                    type="button"
                    className={`ep-save-btn${isInRoster ? ' saved' : ''}`}
                    onClick={() => onSaveToRoster(id)}
                    disabled={busyRow === id || isInRoster}
                    title={
                      isInRoster ? 'In your roster' : 'Save to your roster'
                    }
                    aria-label={
                      isInRoster ? 'Already in roster' : 'Save to roster'
                    }
                  >
                    {isInRoster ? '★' : '☆'}
                  </button>
                )}
              </div>
              {error && <div className="ep-row-error">{error}</div>}
            </div>
          );
        })}
      </form>
    </Modal>
  );
}
