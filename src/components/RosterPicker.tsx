import React from 'react';
import Modal from '../modal';
import type RosterPlayer from '../types/rosterPlayer';
import './RosterPicker.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roster: RosterPlayer[];
  onPick: (player: RosterPlayer) => void;
}

export default function RosterPicker({ isOpen, onClose, roster, onPick }: Props) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="roster-picker">
        <h3>Pick from your roster</h3>
        {roster.length === 0 ? (
          <p className="roster-picker-empty">
            Your roster is empty. Add players in the Roster tab first.
          </p>
        ) : (
          <div className="roster-picker-grid">
            {roster.map((p) => (
              <button
                key={p.id}
                type="button"
                className="roster-picker-card"
                onClick={() => {
                  onPick(p);
                  onClose();
                }}
              >
                <div
                  className="roster-picker-avatar"
                  style={{ background: p.avatarUrl ? 'transparent' : p.color }}
                >
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt="" />
                  ) : (
                    <span>{p.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="roster-picker-name">{p.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
