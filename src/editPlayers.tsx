import React, { useCallback } from 'react';
import type Player from './types/player';
import Modal from './modal';


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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form>
        {Object.entries(players).map(([id, player]) => (
          <input
            type="text"
            key={id}
            id={id}
            value={player.name ?? ''}
            className="player-input"
            style={{
              background: player.color,
            }}
            onChange={setPlayer}
          />
        ))}
      </form>
    </Modal>
  );
}
