import { z } from 'zod';

/**
 * Validation schemas for common fields across the application
 */

// Phone validation (Brazilian format)
export const phoneSchema = z
  .string()
  .min(1, 'Telefone é obrigatório')
  .refine(
    (phone) => {
      const digitsOnly = phone.replace(/\D/g, '');
      return digitsOnly.length === 10 || digitsOnly.length === 11;
    },
    { message: 'Telefone deve ter 10 ou 11 dígitos' }
  );

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido');

// Notes validation (limited to 500 characters)
export const notesSchema = z
  .string()
  .max(500, 'Notas devem ter no máximo 500 caracteres')
  .optional()
  .nullable();

// Date validation (must be today or future)
export const futureDateSchema = z
  .string()
  .refine(
    (date) => {
      // Compare as strings to avoid timezone issues
      const pad = (n: number) => n.toString().padStart(2, '0');
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      return date >= todayStr;
    },
    { message: 'Data deve ser hoje ou no futuro' }
  );

// Time validation (HH:MM format)
export const timeSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres');

// Password validation
export const passwordSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(72, 'Senha muito longa'); // bcrypt limit

// Combined appointment booking schema
export const appointmentBookingSchema = z.object({
  client_name: nameSchema,
  client_phone: phoneSchema,
  client_email: emailSchema.optional().or(z.literal('')),
  appointment_date: futureDateSchema,
  appointment_time: timeSchema,
  notes: notesSchema,
});

// Client schema
export const clientSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal('')),
  notes: notesSchema,
});
