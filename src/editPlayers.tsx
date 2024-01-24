import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import type Player from './types/player';
import './Modal.css';

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
    [players, setPlayers]
  );

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <>
      <button className="modal-background" onClick={onClose} />
      <div className="modal-content">
        <button onClick={onClose} className="close">
          &times;
        </button>
        <form>
          {Object.entries(players).map(([id, player]) => (
            <input
              type="text"
              key={id}
              id={id}
              value={player.name ?? ''}
              className="player-input"
              style={{ backgroundColor: player.color }}
              onChange={setPlayer}
            />
          ))}
        </form>
      </div>
    </>,
    document.body
  );
}
