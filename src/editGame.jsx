import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

export default function EditGame({
  setGameId,
  gameId,
  onClose,
  isOpen,
  games,
}) {
  const setGame = useCallback(
    (e) => {
      e.preventDefault();

      const {
        target: { value },
      } = e;

      setGameId(value);
    },
    [setGameId]
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
          <select className="game-input" onChange={setGame} value={gameId}>
            <option disabled>Select a game</option>
            {games?.map(({ gameId: id, awayTeam, homeTeam }) => (
              <option key={id} value={id}>
                {awayTeam} {homeTeam}
              </option>
            ))}
          </select>
        </form>
      </div>
    </>,
    document.body
  );
}
