import React, { useCallback } from 'react';
import type Game from './types/game';
import Modal from './modal';

interface Props {
  setGameId: (gameId?: string) => void;
  gameId?: string;
  onClose: () => void;
  isOpen: boolean;
  games: Game[];
}

export default function EditGame({
  setGameId,
  gameId,
  onClose,
  isOpen,
  games,
}: Props) {
  const setGame = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.preventDefault();

      const {
        target: { value },
      } = e;

      setGameId(value);
    },
    [setGameId],
  );

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
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
    </Modal>
  );
}
