import { z } from 'zod';
import { 
  appointmentBookingSchema, 
  clientSchema, 
  emailSchema, 
  nameSchema, 
  phoneSchema,
  notesSchema,
  futureDateSchema,
  timeSchema 
} from '@/lib/validations';

/**
 * Data Transfer Objects (DTOs)
 * 
 * DTOs provide a clean contract between layers (UI <-> Services <-> Database)
 * Benefits:
 * - Database schema changes don't break the UI
 * - Clear API surface for each operation
 * - Type safety across the entire application
 * - Easy to validate and transform data
 */

// ============================================================================
// APPOINTMENT DTOs
// ============================================================================

/**
 * Input DTO for creating a new appointment
 */
export const CreateAppointmentInputSchema = z.object({
  clientName: nameSchema,
  clientPhone: phoneSchema,
  clientEmail: emailSchema.optional(),
  appointmentDate: futureDateSchema,
  appointmentTime: timeSchema,
  serviceId: z.string().uuid('ID do serviço inválido'),
  notes: notesSchema,
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentInputSchema>;

/**
 * Input DTO for updating an appointment
 */
export const UpdateAppointmentInputSchema = z.object({
  appointmentId: z.string().uuid('ID do agendamento inválido'),
  clientName: nameSchema.optional(),
  clientPhone: phoneSchema.optional(),
  clientEmail: emailSchema.optional(),
  appointmentDate: futureDateSchema.optional(),
  appointmentTime: timeSchema.optional(),
  serviceId: z.string().uuid('ID do serviço inválido').optional(),
  notes: notesSchema.optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
});

export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentInputSchema>;

/**
 * Output DTO for appointment responses
 * Clean representation isolated from database schema
 */
export interface AppointmentResponse {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
    color?: string;
  };
}

/**
 * Input for querying appointments with filters
 */
export const GetAppointmentsFilterSchema = z.object({
  professionalId: z.string().uuid(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  clientPhone: z.string().optional(),
});

export type GetAppointmentsFilter = z.infer<typeof GetAppointmentsFilterSchema>;

// ============================================================================
// CLIENT DTOs
// ============================================================================

/**
 * Input DTO for creating a new client
 */
export const CreateClientInputSchema = clientSchema.extend({
  professionalId: z.string().uuid('ID do profissional inválido'),
});

export type CreateClientInput = z.infer<typeof CreateClientInputSchema>;

/**
 * Input DTO for updating a client
 */
export const UpdateClientInputSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  notes: notesSchema.optional(),
});

export type UpdateClientInput = z.infer<typeof UpdateClientInputSchema>;

/**
 * Output DTO for client responses
 */
export interface ClientResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  createdAt: string;
  stats?: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    lastAppointmentDate: string | null;
  };
}

// ============================================================================
// PROFILE DTOs
// ============================================================================

/**
 * Input DTO for updating profile settings
 */
export const UpdateProfileInputSchema = z.object({
  profileId: z.string().uuid('ID do perfil inválido'),
  fullName: nameSchema.optional(),
  businessName: z.string().min(2).max(100).optional(),
  profileSlug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens').optional(),
  bio: z.string().max(500).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  avatarUrl: z.string().url('URL inválida').optional().nullable(),
  category: z.string().optional(),
  instagramUrl: z.string().url('URL inválida').optional().nullable(),
  whatsappNumber: phoneSchema.optional().nullable(),
  acceptsOnlinePayment: z.boolean().optional(),
  bookingIntervalMinutes: z.number().int().min(5).max(120).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

/**
 * Output DTO for profile responses
 */
export interface ProfileResponse {
  id: string;
  fullName: string;
  businessName: string | null;
  profileSlug: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  category: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
  acceptsOnlinePayment: boolean;
  bookingIntervalMinutes: number;
  subscriptionTier: 'free' | 'basic' | 'professional' | null;
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | null;
  createdAt: string;
}

// ============================================================================
// SERVICE DTOs
// ============================================================================

/**
 * Input DTO for creating a new service offering
 */
export const CreateServiceInputSchema = z.object({
  professionalId: z.string().uuid('ID do profissional inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional().nullable(),
  durationMinutes: z.number().int().min(5, 'Duração mínima: 5 minutos').max(480, 'Duração máxima: 8 horas'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal').optional(),
  isActive: z.boolean().default(true),
});

export type CreateServiceInput = z.infer<typeof CreateServiceInputSchema>;

/**
 * Input DTO for updating a service
 */
export const UpdateServiceInputSchema = z.object({
  serviceId: z.string().uuid('ID do serviço inválido'),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  price: z.number().min(0).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateServiceInput = z.infer<typeof UpdateServiceInputSchema>;

/**
 * Output DTO for service responses
 */
export interface ServiceResponse {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  color: string | null;
  isActive: boolean;
  createdAt: string;
}

// ============================================================================
// AVAILABILITY DTOs
// ============================================================================

/**
 * Input DTO for updating availability slots
 */
export const UpdateAvailabilityInputSchema = z.object({
  professionalId: z.string().uuid(),
  slots: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: timeSchema,
    endTime: timeSchema,
    isActive: z.boolean(),
  })),
});

export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilityInputSchema>;

/**
 * Output DTO for availability slot responses
 */
export interface AvailabilitySlotResponse {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// ============================================================================
// COMMON RESPONSE WRAPPERS
// ============================================================================

/**
 * Standard API response wrapper for success
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Standard API response wrapper for errors
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
