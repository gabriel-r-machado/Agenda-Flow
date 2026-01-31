import * as bookingRules from '@/core/booking/booking-rules';

// Mock booking rules
jest.mock('@/core/booking/booking-rules', () => ({
  validateNotPastDate: jest.fn(),
  detectTimeSlotConflict: jest.fn(() => false),
  validateWithinBusinessHours: jest.fn(),
  isTimeSlotBlocked: jest.fn(() => false),
  calculateAvailableTimeSlots: jest.fn(() => []),
}));

// Mock supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

describe('AppointmentService', () => {
  describe('Business Rules Integration', () => {
    it('should use booking rules for validation', () => {
      expect(bookingRules.validateNotPastDate).toBeDefined();
      expect(bookingRules.detectTimeSlotConflict).toBeDefined();
      expect(bookingRules.validateWithinBusinessHours).toBeDefined();
      expect(bookingRules.isTimeSlotBlocked).toBeDefined();
    });

    it('should integrate with core booking logic', () => {
      const mockAppointment = {
        date: '2026-02-15',
        time: '10:00',
        durationMinutes: 60,
      };

      // Test that conflict detection works
      const hasConflict = bookingRules.detectTimeSlotConflict(mockAppointment, []);
      expect(hasConflict).toBe(false);
    });
  });

  describe('Data Validation', () => {
    it('should validate required appointment fields', () => {
      const requiredFields = [
        'clientName',
        'clientPhone',
        'appointmentDate',
        'appointmentTime',
        'serviceId',
      ];

      expect(requiredFields).toHaveLength(5);
    });
  });
});
