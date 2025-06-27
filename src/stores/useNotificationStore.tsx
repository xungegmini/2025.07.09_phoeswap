// src/stores/useNotificationStore.tsx

import create from "zustand";

interface Notification {
  type: 'success' | 'info' | 'error';
  message: string;
  description?: string;
  txid?: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  dismissNotification: (index: number) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    set((state) => ({
      notifications: [...state.notifications, notification],
    }));
  },
  dismissNotification: (index) => {
    set((state) => {
      const newNotifications = [...state.notifications];
      newNotifications.splice(index, 1);
      // --- POPRAWKA: Dodano brakującą instrukcję 'return' ---
      return { notifications: newNotifications };
    });
  },
}));

export default useNotificationStore;