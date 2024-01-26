import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface Props {
  onClose: () => void;
  isOpen: boolean;
  children: React.ReactNode;
}

export default function Modal({ onClose, isOpen, children }: Props) {
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
        {children}
      </div>
    </>,
    document.body,
  );
}
