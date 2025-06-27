// src/components/Notification.tsx
"use client";

import { useEffect } from 'react';
import useNotificationStore from '../stores/useNotificationStore';
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const NotificationList = () => {
  const { notifications, dismissNotification } = useNotificationStore((state) => ({
    notifications: state.notifications,
    dismissNotification: state.dismissNotification, // Używamy naszej nowej akcji
  }));

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
      {notifications.map((notification, i) => (
        <Notification key={i} notification={notification} onDismiss={() => dismissNotification(i)} />
      ))}
    </div>
  );
};

const Notification = ({ notification, onDismiss }) => {
  const { type, message, description, txid } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Automatycznie zamykaj po 5 sekundach
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icon =
    type === 'success' ? (
      <CheckCircleIcon className="h-6 w-6 text-green-500" />
    ) : type === 'info' ? (
      <InformationCircleIcon className="h-6 w-6 text-blue-500" />
    ) : (
      <XCircleIcon className="h-6 w-6 text-red-500" />
    );
  
  const solscanLink = txid ? `https://solscan.io/tx/${txid}` : null;

  return (
    <div className="max-w-sm w-full bg-phoenix-container-bg shadow-lg rounded-lg pointer-events-auto ring-1 ring-phoenix-border overflow-hidden">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-phoenix-text-primary">{message}</p>
            {description && <p className="mt-1 text-sm text-phoenix-text-secondary">{description}</p>}
            {solscanLink && (
              <div className="mt-2">
                <a href={solscanLink} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-phoenix-accent hover:underline">
                  View on Solscan
                </a>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md bg-phoenix-container-bg text-phoenix-text-secondary hover:text-phoenix-text-primary focus:outline-none focus:ring-2 focus:ring-phoenix-accent"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationList;