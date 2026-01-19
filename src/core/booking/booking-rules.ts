import { BusinessRuleError, ErrorCodes } from '@/lib/errors';

/**
 * Pure business logic for booking validations
 * No dependencies on React, Supabase, or UI frameworks
 * All functions are testable with simple inputs/outputs
 */

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export interface Appointment {
  date: string;      // YYYY-MM-DD format
  time: string;      // HH:MM format
  durationMinutes: number;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export interface BlockedException {
  date: string;      // YYYY-MM-DD format
  startTime?: string; // HH:MM format (if undefined, whole day blocked)
  endTime?: string;   // HH:MM format
}

/**
 * Validates that an appointment date is not in the past
 * Business Rule: Cannot book appointments for past dates
 */
export function validateNotPastDate(appointmentDate: string): void {
  const selectedDate = new Date(appointmentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    throw new BusinessRuleError(
      'Não é possível agendar em datas passadas',
      ErrorCodes.BOOKING_PAST_DATE
    );
  }
}

/**
 * Checks if a time slot conflicts with existing appointments
 * Business Rule: No overlapping appointments allowed
 */
export function detectTimeSlotConflict(
  newAppointment: Appointment,
  existingAppointments: Appointment[]
): boolean {
  const newStart = timeToMinutes(newAppointment.time);
  const newEnd = newStart + newAppointment.durationMinutes;

  for (const existing of existingAppointments) {
    // Only check appointments on the same date
    if (existing.date !== newAppointment.date) continue;

    const existingStart = timeToMinutes(existing.time);
    const existingEnd = existingStart + existing.durationMinutes;

    // Check for overlap: new appointment starts before existing ends AND ends after existing starts
    const hasOverlap = newStart < existingEnd && newEnd > existingStart;
    
    if (hasOverlap) {
      return true;
    }
  }

  return false;
}

/**
 * Validates that appointment falls within business hours for the day of week
 * Business Rule: Appointments must be within configured availability
 */
export function validateWithinBusinessHours(
  appointment: Appointment,
  availability: AvailabilitySlot[]
): void {
  const appointmentDate = new Date(appointment.date + 'T00:00:00');
  const dayOfWeek = appointmentDate.getUTCDay();
  
  // Find availability for this day of week
  const dayAvailability = availability.filter(slot => slot.dayOfWeek === dayOfWeek);
  
  if (dayAvailability.length === 0) {
    throw new BusinessRuleError(
      'Sem expediente neste dia da semana',
      ErrorCodes.BOOKING_OUTSIDE_BUSINESS_HOURS
    );
  }

  const appointmentStart = timeToMinutes(appointment.time);
  const appointmentEnd = appointmentStart + appointment.durationMinutes;

  // Check if appointment fits within any availability slot
  const fitsInSlot = dayAvailability.some(slot => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    
    return appointmentStart >= slotStart && appointmentEnd <= slotEnd;
  });

  if (!fitsInSlot) {
    throw new BusinessRuleError(
      'Horário fora do expediente configurado',
      ErrorCodes.BOOKING_OUTSIDE_BUSINESS_HOURS
    );
  }
}

/**
 * Checks if a specific time slot is blocked by manual exceptions
 * Business Rule: Blocked dates/times cannot be booked (holidays, personal time off)
 */
export function isTimeSlotBlocked(
  appointment: Appointment,
  blockedExceptions: BlockedException[]
): boolean {
  for (const exception of blockedExceptions) {
    if (exception.date !== appointment.date) continue;

    // If no specific time range, entire day is blocked
    if (!exception.startTime || !exception.endTime) {
      return true;
    }

    const appointmentStart = timeToMinutes(appointment.time);
    const appointmentEnd = appointmentStart + appointment.durationMinutes;
    const blockedStart = timeToMinutes(exception.startTime);
    const blockedEnd = timeToMinutes(exception.endTime);

    // Check for overlap
    const hasOverlap = appointmentStart < blockedEnd && appointmentEnd > blockedStart;
    
    if (hasOverlap) {
      return true;
    }
  }

  return false;
}

/**
 * Generates all available time slots for a specific date
 * Excludes: existing appointments, blocked times, slots outside business hours
 */
export function calculateAvailableTimeSlots(
  date: string,
  intervalMinutes: number,
  serviceDurationMinutes: number,
  availability: AvailabilitySlot[],
  existingAppointments: Appointment[],
  blockedExceptions: BlockedException[]
): TimeSlot[] {
  const appointmentDate = new Date(date + 'T00:00:00');
  const dayOfWeek = appointmentDate.getUTCDay();
  
  // Get availability slots for this day
  const dayAvailability = availability.filter(slot => slot.dayOfWeek === dayOfWeek);
  
  if (dayAvailability.length === 0) {
    return [];
  }

  const availableSlots: TimeSlot[] = [];

  for (const slot of dayAvailability) {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    // Generate slots at interval boundaries
    for (let currentTime = slotStart; currentTime + serviceDurationMinutes <= slotEnd; currentTime += intervalMinutes) {
      const potentialAppointment: Appointment = {
        date,
        time: minutesToTime(currentTime),
        durationMinutes: serviceDurationMinutes,
      };

      // Check all constraints
      const hasConflict = detectTimeSlotConflict(potentialAppointment, existingAppointments);
      const isBlocked = isTimeSlotBlocked(potentialAppointment, blockedExceptions);

      if (!hasConflict && !isBlocked) {
        availableSlots.push({
          startTime: minutesToTime(currentTime),
          endTime: minutesToTime(currentTime + serviceDurationMinutes),
        });
      }
    }
  }

  return availableSlots;
}

/**
 * Calculates the end time of an appointment based on start time and duration
 */
export function calculateAppointmentEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  // Handle midnight crossing
  return minutesToTime(endMinutes % 1440); // 1440 = 24 hours in minutes
}

/**
 * Formats a time string for display in Brazilian format
 */
export function formatTimeForDisplay(time: string): string {
  return time; // Already in HH:MM format
}

/**
 * Formats a time slot range for display
 */
export function formatTimeSlotRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

// ============================================================================
// Helper Functions (Private)
// ============================================================================

/**
 * Converts HH:MM time string to minutes since midnight
 * Example: "14:30" -> 870 minutes
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts minutes since midnight to HH:MM time string
 * Example: 870 minutes -> "14:30"
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
