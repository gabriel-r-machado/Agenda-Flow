'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Info } from 'lucide-react';
import { Notification, NotificationPriority } from '@/lib/notificationManager';

interface NotificationCenterProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  maxVisible?: number;
}

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'alta':
      return 'bg-red-50 border-red-200 text-red-900';
    case 'media':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    case 'baixa':
      return 'bg-blue-50 border-blue-200 text-blue-900';
    case 'info':
      return 'bg-green-50 border-green-200 text-green-900';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900';
  }
};

const getPriorityIcon = (priority: NotificationPriority) => {
  switch (priority) {
    case 'alta':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'media':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'baixa':
      return <Info className="w-5 h-5 text-blue-500" />;
    case 'info':
      return <Info className="w-5 h-5 text-green-500" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

export default function NotificationCenter({
  notifications,
  onRemove,
  maxVisible = 5,
}: NotificationCenterProps) {
  const visibleNotifications = notifications.slice(0, maxVisible);
  const hiddenCount = notifications.length - maxVisible;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 100 }}
            transition={{ duration: 0.3 }}
            className={`border rounded-lg p-4 shadow-lg backdrop-blur-sm ${getPriorityColor(notification.priority)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getPriorityIcon(notification.priority)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{notification.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 ml-2 text-current opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-100 rounded-lg p-3 text-center text-sm text-gray-600"
        >
          +{hiddenCount} notificações adicionais
        </motion.div>
      )}
    </div>
  );
}

