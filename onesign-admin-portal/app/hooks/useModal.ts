'use client';

import { useState, useCallback } from 'react';

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  data: any;
  setData: (data: any) => void;
}

/**
 * Hook for managing modal state
 *
 * @example
 * const modal = useModal();
 * <button onClick={modal.open}>Open</button>
 * <Modal isOpen={modal.isOpen} onClose={modal.close} />
 */
export function useModal(defaultOpen = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [data, setData] = useState<any>(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear data when closing
    setTimeout(() => setData(null), 300);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    data,
    setData,
  };
}
