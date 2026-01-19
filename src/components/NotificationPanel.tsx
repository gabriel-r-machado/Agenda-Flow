'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Volume2, VolumeX, CheckCheck, Trash2 } from 'lucide-react';
import { Notification, NotificationPriority } from '@/lib/notificationManager';
import { Button } from '@/components/ui/button';

interface NotificationPanelProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'alta':
      return 'bg-red-50 border-red-200';
    case 'media':
      return 'bg-yellow-50 border-yellow-200';
    case 'baixa':
      return 'bg-blue-50 border-blue-200';
    case 'info':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getPriorityBadgeColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'alta':
      return 'bg-red-100 text-red-800';
    case 'media':
      return 'bg-yellow-100 text-yellow-800';
    case 'baixa':
      return 'bg-blue-100 text-blue-800';
    case 'info':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityLabel = (priority: NotificationPriority) => {
  switch (priority) {
    case 'alta':
      return 'Alta';
    case 'media':
      return 'Média';
    case 'baixa':
      return 'Baixa';
    case 'info':
      return 'Novo';
    default:
      return 'Normal';
  }
};

export default function NotificationPanel({
  notifications,
  onRemove,
  onMarkAsRead,
  isMuted = false,
  onToggleMute,
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) {
        handleMarkAsRead(n.id);
      }
    });
  };

  const handleClearAll = () => {
    notifications.forEach((n) => {
      onRemove(n.id);
    });
  };

  return (
    <>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {isMuted && (
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
            <VolumeX className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </button>

      {/* Notification Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 right-4 w-96 max-h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Notificações</h2>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Controls */}
              <div className="flex gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={onToggleMute}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      Silenciadas
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Ativar som
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todas
                </Button>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm py-8">
                    Nenhuma notificação
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          notification.read ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Priority Badge */}
                          <div
                            className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${getPriorityBadgeColor(
                              notification.priority
                            )}`}
                          >
                            {getPriorityLabel(notification.priority)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 break-words">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.timestamp).toLocaleString(
                                'pt-BR'
                              )}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 flex-shrink-0">
                            {!notification.read && (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="p-1 hover:bg-blue-100 rounded transition-colors"
                                title="Marcar como lida"
                              >
                                <CheckCheck className="w-4 h-4 text-blue-600" />
                              </button>
                            )}
                            <button
                              onClick={() => onRemove(notification.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <button
                    onClick={handleClearAll}
                    className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2"
                  >
                    Limpar todas as notificações
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

