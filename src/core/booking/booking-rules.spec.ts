import {
  validateNotPastDate,
  detectTimeSlotConflict,
  validateWithinBusinessHours,
  isTimeSlotBlocked,
  calculateAvailableTimeSlots,
  calculateAppointmentEndTime,
  formatTimeSlotRange,
  Appointment,
  AvailabilitySlot,
  BlockedException,
} from './booking-rules';
import { BusinessRuleError, ErrorCodes } from '@/lib/errors';

describe('Booking Rules - Core Business Logic', () => {
  describe('validateNotPastDate', () => {
    it('should throw error for past dates', () => {
      const pastDate = '2020-01-01';
      expect(() => validateNotPastDate(pastDate)).toThrow(BusinessRuleError);
      expect(() => validateNotPastDate(pastDate)).toThrow('Não é possível agendar em datas passadas');
    });

    it('should not throw for today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(() => validateNotPastDate(today)).not.toThrow();
    });

    it('should not throw for future dates', () => {
      const futureDate = '2030-12-31';
      expect(() => validateNotPastDate(futureDate)).not.toThrow();
    });
  });

  describe('detectTimeSlotConflict', () => {
    const existingAppointments: Appointment[] = [
      { date: '2026-01-20', time: '10:00', durationMinutes: 60 },
      { date: '2026-01-20', time: '14:00', durationMinutes: 30 },
      { date: '2026-01-21', time: '10:00', durationMinutes: 45 },
    ];

    it('should detect exact overlap', () => {
      const newAppointment: Appointment = {
        date: '2026-01-20',
        time: '10:00',
        durationMinutes: 30,
      };
      expect(detectTimeSlotConflict(newAppointment, existingAppointments)).toBe(true);
    });

    it('should detect partial overlap - new starts before existing ends', () => {
      const newAppointment: Appointment = {
        date: '2026-01-20',
        time: '10:30',
        durationMinutes: 45, // Ends at 11:15, overlaps with 10:00-11:00 slot
      };
      expect(detectTimeSlotConflict(newAppointment, existingAppointments)).toBe(true);
    });

    it('should detect partial overlap - new ends after existing starts', () => {
      const newAppointment: Appointment = {
        date: '2026-01-20',
        time: '09:30',
        durationMinutes: 45, // Ends at 10:15, overlaps with 10:00-11:00 slot
      };
      expect(detectTimeSlotConflict(newAppointment, existingAppointments)).toBe(true);
    });

    it('should not detect conflict for back-to-back appointments', () => {
      const newAppointment: Appointment = {
        date: '2026-01-20',
        time: '11:00', // Starts right when previous ends
        durationMinutes: 30,
      };
      expect(detectTimeSlotConflict(newAppointment, existingAppointments)).toBe(false);
    });

    it('should not detect conflict for different dates', () => {
      const newAppointment: Appointment = {
        date: '2026-01-22',
        time: '10:00',
        durationMinutes: 60,
      };
      expect(detectTimeSlotConflict(newAppointment, existingAppointments)).toBe(false);
    });

    it('should not detect conflict for non-overlapping time on same date', () => {
      const newAppointment: Appointment = {
        date: '2026-01-20',
        time: '12:00',
        durationMinutes: 60, // 12:00-13:00, before 14:00 appointment
      };
      expect(detectTimeSlotConflict(newAppointment, existingAppointments)).toBe(false);
    });
  });

  describe('validateWithinBusinessHours', () => {
    const availability: AvailabilitySlot[] = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }, // Monday morning
      { dayOfWeek: 1, startTime: '14:00', endTime: '18:00' }, // Monday afternoon
      { dayOfWeek: 3, startTime: '10:00', endTime: '16:00' }, // Wednesday
    ];

    it('should validate appointment within business hours', () => {
      // Monday 2026-01-19 at 10:00 for 60 minutes (within 09:00-12:00)
      const appointment: Appointment = {
        date: '2026-01-19',
        time: '10:00',
        durationMinutes: 60,
      };
      expect(() => validateWithinBusinessHours(appointment, availability)).not.toThrow();
    });

    it('should throw error for appointment on day with no availability', () => {
      // Sunday 2026-01-18 (no availability configured)
      const appointment: Appointment = {
        date: '2026-01-18',
        time: '10:00',
        durationMinutes: 30,
      };
      expect(() => validateWithinBusinessHours(appointment, availability)).toThrow(BusinessRuleError);
      expect(() => validateWithinBusinessHours(appointment, availability)).toThrow('Sem expediente neste dia da semana');
    });

    it('should throw error for appointment starting before business hours', () => {
      const appointment: Appointment = {
        date: '2026-01-19', // Monday
        time: '08:00', // Before 09:00
        durationMinutes: 30,
      };
      expect(() => validateWithinBusinessHours(appointment, availability)).toThrow(BusinessRuleError);
    });

    it('should throw error for appointment ending after business hours', () => {
      const appointment: Appointment = {
        date: '2026-01-19', // Monday
        time: '11:30',
        durationMinutes: 60, // Ends at 12:30, but business hours end at 12:00
      };
      expect(() => validateWithinBusinessHours(appointment, availability)).toThrow(BusinessRuleError);
    });

    it('should validate appointment in afternoon slot', () => {
      const appointment: Appointment = {
        date: '2026-01-19', // Monday
        time: '15:00',
        durationMinutes: 120, // Ends at 17:00, within 14:00-18:00
      };
      expect(() => validateWithinBusinessHours(appointment, availability)).not.toThrow();
    });
  });

  describe('isTimeSlotBlocked', () => {
    const blockedExceptions: BlockedException[] = [
      { date: '2026-01-20', startTime: '10:00', endTime: '11:00' }, // Specific time blocked
      { date: '2026-01-21' }, // Entire day blocked (holiday)
      { date: '2026-01-22', startTime: '14:00', endTime: '15:00' },
    ];

    it('should detect block for exact time match', () => {
      const appointment: Appointment = {
        date: '2026-01-20',
        time: '10:00',
        durationMinutes: 30,
      };
      expect(isTimeSlotBlocked(appointment, blockedExceptions)).toBe(true);
    });

    it('should detect block for partial overlap', () => {
      const appointment: Appointment = {
        date: '2026-01-20',
        time: '10:30',
        durationMinutes: 60, // Overlaps with 10:00-11:00 block
      };
      expect(isTimeSlotBlocked(appointment, blockedExceptions)).toBe(true);
    });

    it('should detect block for entire day', () => {
      const appointment: Appointment = {
        date: '2026-01-21',
        time: '10:00',
        durationMinutes: 30,
      };
      expect(isTimeSlotBlocked(appointment, blockedExceptions)).toBe(true);
    });

    it('should not detect block for non-blocked time', () => {
      const appointment: Appointment = {
        date: '2026-01-20',
        time: '12:00',
        durationMinutes: 30,
      };
      expect(isTimeSlotBlocked(appointment, blockedExceptions)).toBe(false);
    });

    it('should not detect block for back-to-back time slots', () => {
      const appointment: Appointment = {
        date: '2026-01-20',
        time: '11:00', // Starts when block ends
        durationMinutes: 30,
      };
      expect(isTimeSlotBlocked(appointment, blockedExceptions)).toBe(false);
    });
  });

  describe('calculateAvailableTimeSlots', () => {
    const availability: AvailabilitySlot[] = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }, // Monday
    ];

    const existingAppointments: Appointment[] = [
      { date: '2026-01-19', time: '10:00', durationMinutes: 30 }, // 10:00-10:30 blocked
    ];

    const blockedExceptions: BlockedException[] = [
      { date: '2026-01-19', startTime: '11:00', endTime: '11:30' }, // 11:00-11:30 blocked
    ];

    it('should generate available slots excluding existing appointments and blocks', () => {
      const slots = calculateAvailableTimeSlots(
        '2026-01-19', // Monday
        30, // 30-minute intervals
        30, // 30-minute service duration
        availability,
        existingAppointments,
        blockedExceptions
      );

      expect(slots).toContainEqual({ startTime: '09:00', endTime: '09:30' });
      expect(slots).toContainEqual({ startTime: '09:30', endTime: '10:00' });
      expect(slots).not.toContainEqual({ startTime: '10:00', endTime: '10:30' }); // Existing appointment
      expect(slots).toContainEqual({ startTime: '10:30', endTime: '11:00' });
      expect(slots).not.toContainEqual({ startTime: '11:00', endTime: '11:30' }); // Blocked exception
      expect(slots).toContainEqual({ startTime: '11:30', endTime: '12:00' });
    });

    it('should return empty array for day with no availability', () => {
      const slots = calculateAvailableTimeSlots(
        '2026-01-18', // Sunday - no availability
        30,
        30,
        availability,
        [],
        []
      );

      expect(slots).toEqual([]);
    });

    it('should respect service duration when generating slots', () => {
      const slots = calculateAvailableTimeSlots(
        '2026-01-19',
        30, // 30-minute intervals
        60, // 60-minute service duration
        availability,
        [],
        []
      );

      // With 60-minute duration, last slot should start at 11:00 (ends at 12:00)
      expect(slots).toContainEqual({ startTime: '09:00', endTime: '10:00' });
      expect(slots).toContainEqual({ startTime: '11:00', endTime: '12:00' });
      expect(slots).not.toContainEqual({ startTime: '11:30', endTime: '12:30' }); // Would exceed business hours
    });
  });

  describe('calculateAppointmentEndTime', () => {
    it('should calculate end time correctly', () => {
      expect(calculateAppointmentEndTime('10:00', 30)).toBe('10:30');
      expect(calculateAppointmentEndTime('10:00', 60)).toBe('11:00');
      expect(calculateAppointmentEndTime('14:30', 45)).toBe('15:15');
      expect(calculateAppointmentEndTime('23:00', 90)).toBe('00:30'); // Crosses midnight
    });
  });

  describe('formatTimeSlotRange', () => {
    it('should format time range correctly', () => {
      expect(formatTimeSlotRange('10:00', '11:00')).toBe('10:00 - 11:00');
      expect(formatTimeSlotRange('14:30', '15:15')).toBe('14:30 - 15:15');
    });
  });
});
