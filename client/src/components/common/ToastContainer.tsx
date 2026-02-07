import React from "react";
import { Notification, NotificationType } from "@/contexts/NotificationContext";

interface ToastContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ notifications, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

function Toast({ notification, onRemove }: ToastProps) {
  const colors: Record<NotificationType, string> = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const icons: Record<NotificationType, string> = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-slide-in ${
        colors[notification.type]
      }`}
    >
      <div className="flex-shrink-0 text-lg font-bold">
        {icons[notification.type]}
      </div>
      <div className="flex-1 text-sm font-medium leading-snug">
        {notification.message}
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="flex-shrink-0 text-lg font-bold opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
