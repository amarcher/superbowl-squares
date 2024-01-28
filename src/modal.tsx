import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface Props {
  onClose: () => void;
  isOpen: boolean;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

export default function Modal({
  onClose,
  isOpen,
  children,
  headerContent,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <>
      <button className="modal-background" onClick={onClose} />
      <div className="modal">
        <div className="modal-header">
          <button onClick={onClose} className="close">
            &times;
          </button>
          {headerContent}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </>,
    document.body,
  );
}
