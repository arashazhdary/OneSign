import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export interface SessionManagementOptions {
  timeout?: number; // in minutes
  warningTime?: number; // in minutes before timeout
  onTimeout?: () => void;
  onWarning?: () => void;
}

export const useSessionManagement = (options: SessionManagementOptions = {}) => {
  const {
    timeout = 30,
    warningTime = 5,
    onTimeout,
    onWarning,
  } = options;

  const { logout } = useAuthStore();
  const timeoutMs = timeout * 60 * 1000;
  const warningMs = (timeout - warningTime) * 60 * 1000;

  const resetTimer = useCallback(() => {
    // Clear existing timers
    const existingWarning = localStorage.getItem('sessionWarningTimer');
    const existingTimeout = localStorage.getItem('sessionTimeoutTimer');

    if (existingWarning) clearTimeout(Number(existingWarning));
    if (existingTimeout) clearTimeout(Number(existingTimeout));

    // Set warning timer
    const warningTimer = setTimeout(() => {
      if (onWarning) {
        onWarning();
      } else {
        toast.error(`Your session will expire in ${warningTime} minutes due to inactivity`, {
          duration: 5000,
        });
      }
    }, warningMs);

    // Set timeout timer
    const timeoutTimer = setTimeout(() => {
      if (onTimeout) {
        onTimeout();
      } else {
        logout();
        toast.error('Your session has expired due to inactivity');
      }
    }, timeoutMs);

    localStorage.setItem('sessionWarningTimer', String(warningTimer));
    localStorage.setItem('sessionTimeoutTimer', String(timeoutTimer));
    localStorage.setItem('lastActivity', Date.now().toString());
  }, [logout, onTimeout, onWarning, timeoutMs, warningMs, warningTime]);

  const extendSession = useCallback(() => {
    resetTimer();
    toast.success('Session extended');
  }, [resetTimer]);

  useEffect(() => {
    // Events that should reset the timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    // Initial setup
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });

      const warningTimer = localStorage.getItem('sessionWarningTimer');
      const timeoutTimer = localStorage.getItem('sessionTimeoutTimer');

      if (warningTimer) clearTimeout(Number(warningTimer));
      if (timeoutTimer) clearTimeout(Number(timeoutTimer));
    };
  }, [resetTimer]);

  return {
    extendSession,
    resetTimer,
  };
};
