import React, { useCallback, useState } from 'react';
import type Player from './types/player';
import Modal from './modal';
import { PLAYER_COLORS } from './colors';
import { useRoster } from './hooks/useRoster';
import RosterPicker from './components/RosterPicker';


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
  const { status, roster } = useRoster();
  const showRosterPicker = status === 'ready' && roster.length > 0;
  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null);

  const setPlayer = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      const {
        target: { id, value: name },
      } = e;

      setPlayers({
        ...players,
        [id]: {
          ...players[id],
          name,
        },
      });
    },
    [players, setPlayers],
  );

  const pickFromRoster = useCallback(
    (slotId: string, rosterPlayer: { name: string; color: string; avatarUrl?: string }) => {
      setPlayers({
        ...players,
        [slotId]: {
          ...players[slotId],
          name: rosterPlayer.name,
          color: rosterPlayer.color,
          avatarUrl: rosterPlayer.avatarUrl,
        },
      });
    },
    [players, setPlayers],
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <form>
          {Object.entries(players).map(([id, player]) => (
            <div key={id} className="player-row">
              <input
                type="text"
                id={id}
                value={player.name ?? ''}
                className="player-input"
                style={{
                  background: player.color,
                  color: PLAYER_COLORS[id]?.text || '#ffffff',
                }}
                onChange={setPlayer}
              />
              {showRosterPicker && (
                <button
                  type="button"
                  className="roster-pick-btn"
                  onClick={() => setPickerSlotId(id)}
                  title="Pick from your roster"
                  aria-label="Pick from roster"
                >
                  ⊕
                </button>
              )}
            </div>
          ))}
        </form>
      </Modal>
      <RosterPicker
        isOpen={pickerSlotId !== null}
        onClose={() => setPickerSlotId(null)}
        roster={roster}
        onPick={(player) => {
          if (pickerSlotId) pickFromRoster(pickerSlotId, player);
        }}
      />
    </>
  );
}
