// src/utils/notifications.tsx

import useNotificationStore from '../stores/useNotificationStore';

export function notify(newNotification: { type?: 'success' | 'info' | 'error', message: string, description?: string, txid?: string }) {
  const { addNotification } = useNotificationStore.getState();

  // Używamy naszej nowej, dedykowanej akcji
  addNotification({
    type: newNotification.type || 'info',
    message: newNotification.message,
    description: newNotification.description,
    txid: newNotification.txid,
  });
}