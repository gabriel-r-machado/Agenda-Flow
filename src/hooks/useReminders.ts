import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import {
  Reminder,
  Notification,
  NotificationPriority,
  shouldSendNotification,
  generateNotificationMessage,
  getNotificationInterval,
  generateAppointmentNotification,
} from '@/lib/notificationManager';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useReminders = () => {
  const { profile } = useProfile();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const notificationTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastNotificationTimeRef = useRef<Map<string, Date>>(new Map());

  // Add or update a reminder
  const addReminder = useCallback((reminder: Reminder) => {
    setReminders((prev) => {
      const exists = prev.findIndex((r) => r.id === reminder.id) !== -1;
      if (exists) {
        return prev.map((r) => (r.id === reminder.id ? reminder : r));
      }
      return [...prev, reminder];
    });
  }, []);

  // Mark reminder as completed
  const completeReminder = useCallback((reminderId: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminderId ? { ...r, completed: true } : r
      )
    );

    // Clear its timer
    const timer = notificationTimersRef.current.get(reminderId);
    if (timer) {
      clearTimeout(timer);
      notificationTimersRef.current.delete(reminderId);
    }

    lastNotificationTimeRef.current.delete(reminderId);
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  // Toggle mute/silence
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Add appointment notification
  const addAppointmentNotification = useCallback((
    appointmentId: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string
  ) => {
    console.log('[useReminders] addAppointmentNotification called with:', {
      appointmentId,
      clientName,
      serviceName,
      date,
      time,
      isMuted
    });

    if (isMuted) {
      console.log('[useReminders] Notification blocked - system is muted');
      return;
    }

    const formattedDate = format(new Date(date + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR });
    const notification: Notification = {
      id: `appointment-${appointmentId}-${Date.now()}`,
      appointmentId,
      type: 'appointment',
      message: generateAppointmentNotification(clientName, serviceName, formattedDate, time.slice(0, 5)),
      priority: 'info',
      timestamp: new Date(),
      read: false,
    };

    console.log('[useReminders] Notification created:', notification);

    setNotifications((prev) => {
      console.log('[useReminders] Previous notifications:', prev.length);
      const updated = [notification, ...prev];
      console.log('[useReminders] Updated notifications:', updated.length);
      return updated;
    });
  }, [isMuted]);

  // Persist notifications to localStorage per profile so they survive reload/navigation
  useEffect(() => {
    const pid = profile?.id;
    if (!pid || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(`notifications:${pid}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Notification[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications((prev) => {
            // merge without duplicates (by id), keep newest first
            const map = new Map<string, Notification>();
            [...parsed.reverse(), ...prev.reverse()].forEach((n) => map.set(n.id, n));
            return Array.from(map.values()).reverse().slice(0, 200);
          });
        }
      }
    } catch (err) {
      console.debug('[useReminders] Failed to load persisted notifications', err);
    }
  }, [profile?.id]);

  useEffect(() => {
    const pid = profile?.id;
    if (!pid || typeof window === 'undefined') return;
    try {
      // cap stored notifications to last 200
      localStorage.setItem(`notifications:${pid}`, JSON.stringify(notifications.slice(0, 200)));
    } catch (err) {
      console.debug('[useReminders] Failed to persist notifications', err);
    }
  }, [notifications, profile?.id]);

  // Send notification and schedule next one
  const scheduleNextNotification = useCallback(
    (reminder: Reminder) => {
      if (reminder.completed) return;
      
      // Don't schedule if no due date and no interval
      if (!reminder.dueDate && !reminder.reminderIntervalHours) return;

      const lastTime = lastNotificationTimeRef.current.get(reminder.id);
      if (!shouldSendNotification(reminder, lastTime)) return;

      // Create notification
      const notification: Notification = {
        id: `${reminder.id}-${Date.now()}`,
        reminderId: reminder.id,
        type: 'reminder',
        message: generateNotificationMessage(reminder),
        priority: reminder.priority,
        timestamp: new Date(),
        read: false,
      };

      // Only add to list if not muted
      if (!isMuted) {
        setNotifications((prev) => [notification, ...prev]);
      }
      lastNotificationTimeRef.current.set(reminder.id, new Date());

      // Schedule next notification if has interval
      if (reminder.reminderIntervalHours || reminder.dueDate) {
        const interval = getNotificationInterval(reminder.priority, reminder.reminderIntervalHours);
        const timer = setTimeout(() => {
          scheduleNextNotification(reminder);
        }, interval);

        notificationTimersRef.current.set(reminder.id, timer);
      }
    },
    [isMuted]
  );

  // Initialize notification scheduling whenever reminders change
  useEffect(() => {
    reminders.forEach((reminder) => {
      if (!reminder.completed) {
        scheduleNextNotification(reminder);
      }
    });

    return () => {
      // Cleanup on unmount
      notificationTimersRef.current.forEach((timer) => clearTimeout(timer));
      notificationTimersRef.current.clear();
    };
  }, [reminders, scheduleNextNotification]);

  // Listen for new appointments in realtime
  useEffect(() => {
    if (!profile?.id) return;

    console.log('[useReminders] Setting up realtime subscription for professional:', profile.id);

    // Use a unique channel name per hook instance to avoid cross-instance removal issues
    const uniqueChannelName = `appointment-notifications-${profile.id}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `professional_id=eq.${profile.id}`,
        },
        async (payload) => {
          console.log('[useReminders] New appointment detected:', payload);
          
          const newAppointment = payload.new as {
            id: string;
            client_name: string;
            service_id: string;
            appointment_date: string;
            appointment_time: string;
          };

          // Fetch service name
          const { data: service } = await supabase
            .from('services')
            .select('name')
            .eq('id', newAppointment.service_id)
            .single();

          console.log('[useReminders] Service fetched:', service);
          console.log('[useReminders] Calling addAppointmentNotification');

          addAppointmentNotification(
            newAppointment.id,
            newAppointment.client_name,
            service?.name || 'Serviço',
            newAppointment.appointment_date,
            newAppointment.appointment_time
          );
        }
      )
      .subscribe((status) => {
        console.log('[useReminders] Subscription status:', status);
        try {
          const s = typeof status === 'string' ? status : (status as any)?.status || (status as any)?.type;
          const sStr = String(s || '').toLowerCase();
          if (sStr.includes('subscribed') || sStr.includes('ok')) {
            setRealtimeConnected(true);
          } else {
            // treat any non-subscribed status as disconnected
            setRealtimeConnected(false);
          }
        } catch (e) {
          console.error('[useReminders] Error parsing subscription status', e);
          setRealtimeConnected(false);
        }
      });

    return () => {
      console.log('[useReminders] Cleaning up realtime subscription');
      setRealtimeConnected(false);
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.error('[useReminders] Error removing channel', err);
      }
    };
  }, [profile?.id, addAppointmentNotification]);

  return {
    reminders,
    notifications,
    isMuted,
    addReminder,
    completeReminder,
    removeNotification,
    markNotificationAsRead,
    toggleMute,
    addAppointmentNotification,
    realtimeConnected,
  };
};
