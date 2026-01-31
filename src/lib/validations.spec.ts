import {
  appointmentBookingSchema,
  clientSchema,
  emailSchema,
  nameSchema,
  phoneSchema,
  notesSchema,
  futureDateSchema,
  timeSchema,
} from './validations';

describe('Validation Schemas', () => {
  describe('nameSchema', () => {
    it('should accept valid names', () => {
      expect(() => nameSchema.parse('João Silva')).not.toThrow();
      expect(() => nameSchema.parse('Maria')).not.toThrow();
    });

    it('should reject empty names', () => {
      expect(() => nameSchema.parse('')).toThrow();
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(101);
      expect(() => nameSchema.parse(longName)).toThrow();
    });
  });

  describe('emailSchema', () => {
    it('should accept valid emails', () => {
      expect(() => emailSchema.parse('user@example.com')).not.toThrow();
      expect(() => emailSchema.parse('test.user@domain.co.uk')).not.toThrow();
    });

    it('should reject invalid emails', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow();
      expect(() => emailSchema.parse('user@')).toThrow();
      expect(() => emailSchema.parse('@domain.com')).toThrow();
    });
  });

  describe('phoneSchema', () => {
    it('should accept valid Brazilian phone numbers', () => {
      expect(() => phoneSchema.parse('11987654321')).not.toThrow();
      expect(() => phoneSchema.parse('21912345678')).not.toThrow();
    });

    it('should reject invalid phone numbers', () => {
      expect(() => phoneSchema.parse('123')).toThrow();
      expect(() => phoneSchema.parse('abc123')).toThrow();
    });
  });

  describe('timeSchema', () => {
    it('should accept valid time formats', () => {
      expect(() => timeSchema.parse('09:00')).not.toThrow();
      expect(() => timeSchema.parse('14:30')).not.toThrow();
      expect(() => timeSchema.parse('23:59')).not.toThrow();
    });

    it('should reject invalid time formats', () => {
      expect(() => timeSchema.parse('25:00')).toThrow();
      expect(() => timeSchema.parse('12:60')).toThrow();
      expect(() => timeSchema.parse('9:00')).toThrow();
      expect(() => timeSchema.parse('invalid')).toThrow();
    });
  });

  describe('futureDateSchema', () => {
    it('should accept today\'s date', () => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      expect(() => futureDateSchema.parse(todayStr)).not.toThrow();
    });

    it('should accept future dates in YYYY-MM-DD format', () => {
      const futureDate = '2026-12-31';
      expect(() => futureDateSchema.parse(futureDate)).not.toThrow();
    });

    it('should reject past dates', () => {
      const pastDate = '2020-01-01';
      expect(() => futureDateSchema.parse(pastDate)).toThrow();
    });
  });

  describe('notesSchema', () => {
    it('should accept valid notes', () => {
      expect(() => notesSchema.parse('Primeira consulta')).not.toThrow();
      expect(() => notesSchema.parse('')).not.toThrow();
    });

    it('should reject notes that are too long', () => {
      const longNotes = 'a'.repeat(1001);
      expect(() => notesSchema.parse(longNotes)).toThrow();
    });
  });

  describe('clientSchema', () => {
    it('should accept valid client data', () => {
      const validClient = {
        name: 'João Silva',
        phone: '11987654321',
        email: 'joao@example.com',
      };

      expect(() => clientSchema.parse(validClient)).not.toThrow();
    });

    it('should accept client without email', () => {
      const clientWithoutEmail = {
        name: 'Maria Santos',
        phone: '21912345678',
      };

      expect(() => clientSchema.parse(clientWithoutEmail)).not.toThrow();
    });

    it('should reject client with invalid data', () => {
      const invalidClient = {
        name: 'Jo',
        phone: '123',
        email: 'invalid',
      };

      expect(() => clientSchema.parse(invalidClient)).toThrow();
    });
  });

  describe('appointmentBookingSchema', () => {
    it('should accept valid appointment booking data', () => {
      const validBooking = {
        client_name: 'João Silva',
        client_phone: '11987654321',
        client_email: 'joao@example.com',
        appointment_date: '2026-12-31',
        appointment_time: '14:30',
        service_id: '123e4567-e89b-12d3-a456-426614174000',
        notes: 'Primeira consulta',
      };

      expect(() => appointmentBookingSchema.parse(validBooking)).not.toThrow();
    });

    it('should accept booking with required fields', () => {
      const booking = {
        client_name: 'João Silva',
        client_phone: '11987654321',
        appointment_date: '2026-12-31',
        appointment_time: '14:30',
        service_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      expect(() => appointmentBookingSchema.parse(booking)).not.toThrow();
    });
  });
});
