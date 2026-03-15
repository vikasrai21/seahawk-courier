// src/hooks/useToast.js
import { useCallback, useState } from 'react';

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const success = useCallback((msg) => toast(msg, 'success'), [toast]);
  const error   = useCallback((msg) => toast(msg, 'error', 5000), [toast]);
  const info    = useCallback((msg) => toast(msg, 'info'), [toast]);
  const warning = useCallback((msg) => toast(msg, 'warning', 5000), [toast]);

  return { toasts, toast, dismiss, success, error, info, warning };
}
