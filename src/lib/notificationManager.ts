// Notification Priority Manager
// Manages reminders and appointment notifications

export type NotificationPriority = 'alta' | 'media' | 'baixa' | 'info';
export type NotificationType = 'reminder' | 'appointment';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date | null;
  priority: NotificationPriority;
  completed: boolean;
  createdAt: Date;
  reminderIntervalHours?: number | null;
}

export interface Notification {
  id: string;
  reminderId?: string;
  appointmentId?: string;
  type: NotificationType;
  message: string;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
}

// Get notification interval in milliseconds
// If reminderIntervalHours is set, use that. Otherwise, use priority-based defaults.
export const getNotificationInterval = (
  priority: NotificationPriority,
  reminderIntervalHours?: number | null
): number => {
  // If custom interval is set, use it
  if (reminderIntervalHours && reminderIntervalHours > 0) {
    return reminderIntervalHours * 60 * 60 * 1000;
  }
  
  // Default priority-based intervals
  switch (priority) {
    case 'alta':
      return 30 * 60 * 1000; // 30 minutes
    case 'media':
    case 'baixa':
      return 2 * 60 * 60 * 1000; // 2 hours
    default:
      return 2 * 60 * 60 * 1000;
  }
};

// Check if reminder should send notification
export const shouldSendNotification = (
  reminder: Reminder,
  lastNotificationTime: Date | null
): boolean => {
  if (reminder.completed) return false;
  
  // If no due date and no interval, don't send notifications
  if (!reminder.dueDate && !reminder.reminderIntervalHours) return false;

  const now = new Date();
  
  // If has due date, check date-based logic
  if (reminder.dueDate) {
    const dueDate = new Date(reminder.dueDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reminderDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    // Don't send notifications before the reminder date
    if (today < reminderDate) return false;

    // If it's after the reminder date and not completed, mark as missed
    if (today > reminderDate) return true;
  }

  // Check interval based on priority or custom interval
  const interval = getNotificationInterval(reminder.priority, reminder.reminderIntervalHours);
  if (!lastNotificationTime) return true;

  const timeSinceLastNotification = now.getTime() - lastNotificationTime.getTime();
  return timeSinceLastNotification >= interval;
};

// Generate notification for new appointment
export const generateAppointmentNotification = (
  clientName: string,
  serviceName: string,
  date: string,
  time: string
): string => {
  return `📅 Novo agendamento! ${clientName} agendou ${serviceName} para ${date} às ${time}`;
};

// Generate notification message based on priority
export const generateNotificationMessage = (reminder: Reminder): string => {
  const dueDate = new Date(reminder.dueDate);
  const today = new Date();
  const reminderDate = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const daysOverdue = Math.floor(
    (todayDate.getTime() - reminderDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysOverdue > 0) {
    return `⚠️ Lembrete "${reminder.title}" está ${daysOverdue} dia(s) atrasado. Marque como concluído!`;
  }

  return `🔔 Lembrete: ${reminder.title}${
    reminder.description ? ` - ${reminder.description}` : ''
  }`;
};
