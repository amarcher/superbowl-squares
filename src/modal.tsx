import React, { useCallback } from "react";
import { createPortal } from "react-dom";
import type Player from "./types/player";
import "./Modal.css";

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
      <div className="modal-content">{children}</div>
    </>,
    document.body
  );
}
