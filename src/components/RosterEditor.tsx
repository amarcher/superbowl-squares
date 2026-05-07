import React, { useCallback, useRef, useState } from 'react';
import Modal from '../modal';
import COLORS from '../colors';
import { useRoster } from '../hooks/useRoster';
import type RosterPlayer from '../types/rosterPlayer';
import './RosterEditor.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RosterEditor({ isOpen, onClose }: Props) {
  const { status, roster, error, upsert, remove, generateAvatar } = useRoster();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="roster-editor">
        <header className="roster-editor-header">
          <h2>My Roster</h2>
          <p className="roster-editor-sub">
            Save your regular crew with avatars. Pull them into any game.
          </p>
        </header>

        {status === 'unconfigured' && (
          <p className="roster-editor-empty">Premium not configured.</p>
        )}
        {status === 'signed-out' && (
          <p className="roster-editor-empty">Sign in to manage your roster.</p>
        )}
        {status === 'forbidden' && (
          <p className="roster-editor-empty">
            This account isn't on the premium allowlist yet.
          </p>
        )}
        {status === 'loading' && (
          <p className="roster-editor-empty">Loading…</p>
        )}
        {status === 'error' && (
          <p className="roster-editor-empty roster-error">
            {error || 'Failed to load roster.'}
          </p>
        )}

        {status === 'ready' && (
          <>
            <div className="roster-list">
              {roster.map((p) => (
                <RosterRow
                  key={p.id}
                  entry={p}
                  onSave={upsert}
                  onRemove={remove}
                  onGenerate={generateAvatar}
                />
              ))}
            </div>
            <RosterRow
              isNew
              entry={{
                id: '',
                name: '',
                color: COLORS[roster.length % COLORS.length],
              }}
              onSave={upsert}
              onRemove={async () => {}}
              onGenerate={generateAvatar}
            />
          </>
        )}
      </div>
    </Modal>
  );
}

interface RowProps {
  entry: RosterPlayer;
  isNew?: boolean;
  onSave: (entry: Omit<RosterPlayer, 'id'> & { id?: string }) => Promise<RosterPlayer>;
  onRemove: (id: string) => Promise<void>;
  onGenerate: (file: File) => Promise<{ avatarUrl: string; remaining: number }>;
}

function RosterRow({ entry, isNew, onSave, onRemove, onGenerate }: RowProps) {
  const [name, setName] = useState(entry.name);
  const [color, setColor] = useState(entry.color);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(entry.avatarUrl);
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colorIndex = COLORS.indexOf(color);

  const cycleColor = useCallback(() => {
    const next = COLORS[(colorIndex + 1) % COLORS.length];
    setColor(next);
  }, [colorIndex]);

  const save = useCallback(
    async (overrides?: Partial<RosterPlayer>) => {
      const payload = {
        ...(isNew ? {} : { id: entry.id }),
        name: overrides?.name ?? name,
        color: overrides?.color ?? color,
        avatarUrl: overrides?.avatarUrl ?? avatarUrl,
      };
      if (!payload.name.trim()) {
        setRowError('Name required');
        return;
      }
      setBusy(true);
      setRowError(undefined);
      try {
        await onSave(payload);
        if (isNew) {
          setName('');
          setAvatarUrl(undefined);
        }
      } catch (err) {
        setRowError(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setBusy(false);
      }
    },
    [avatarUrl, color, entry.id, isNew, name, onSave],
  );

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      if (!name.trim()) {
        setRowError('Add a name first');
        return;
      }
      setBusy(true);
      setRowError(undefined);
      try {
        const { avatarUrl: newUrl } = await onGenerate(file);
        setAvatarUrl(newUrl);
        await save({ avatarUrl: newUrl });
      } catch (err) {
        setRowError(err instanceof Error ? err.message : 'Generation failed');
      } finally {
        setBusy(false);
      }
    },
    [name, onGenerate, save],
  );

  return (
    <div className="roster-row">
      <button
        type="button"
        className="roster-color-swatch"
        style={{ background: color }}
        aria-label="Cycle color"
        onClick={cycleColor}
        disabled={busy}
      />
      <div
        className="roster-avatar-slot"
        style={{ background: avatarUrl ? 'transparent' : color }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="roster-avatar-img" />
        ) : (
          <span className="roster-avatar-initial">
            {(name || '?').charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <input
        type="text"
        className="roster-name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={isNew ? 'Add a player…' : 'Name'}
        disabled={busy}
        onBlur={() => {
          if (!isNew && name !== entry.name) save();
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="roster-file-input"
        onChange={handleFile}
        disabled={busy}
      />
      <div className="roster-row-actions">
        {isNew ? (
          <button
            type="button"
            className="roster-action-btn primary"
            onClick={() => save()}
            disabled={busy || !name.trim()}
          >
            Add
          </button>
        ) : (
          <>
            <button
              type="button"
              className="roster-action-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              title="Generate caricature from photo"
            >
              {avatarUrl ? '↻ Photo' : '📷 Photo'}
            </button>
            <button
              type="button"
              className="roster-action-btn danger"
              onClick={() => onRemove(entry.id)}
              disabled={busy}
            >
              Delete
            </button>
          </>
        )}
        {isNew && (
          <button
            type="button"
            className="roster-action-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy || !name.trim()}
            title="Generate caricature from photo"
          >
            📷
          </button>
        )}
      </div>
      {rowError && <span className="roster-row-error">{rowError}</span>}
    </div>
  );
}
