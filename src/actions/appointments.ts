'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { appointmentService } from '@/services/appointmentService';
import { CreateAppointmentInput, CreateAppointmentInputSchema } from '@/services/dto';
import { logger } from '@/lib/logger';
import { ErrorCodes } from '@/lib/errors';

/**
 * Server Action: Creates a new appointment (PUBLIC - for clients)
 * 
 * SECURITY:
 * - NO authentication required (clients book without login)
 * - Strict input validation with Zod schema
 * - Rate limiting recommended (implement via Vercel/Upstash)
 * - Business rules enforced in appointmentService
 */
export async function createAppointmentAction(
  professionalId: string,
  input: CreateAppointmentInput
) {
  try {
    // 1. SECURITY: Strict input validation (prevent injection attacks)
    const validated = CreateAppointmentInputSchema.parse(input);

    logger.info('Public appointment creation attempt', {
      context: 'createAppointmentAction',
      metadata: {
        professionalId,
        date: validated.appointmentDate,
        clientPhone: validated.clientPhone,
      },
    });

    // 2. Delegate to service layer (business rules + RLS policies apply)
    return await appointmentService.createAppointment(professionalId, validated);
  } catch (error) {
    // Log validation errors for monitoring potential attacks
    logger.warn('Invalid appointment creation attempt', {
      context: 'createAppointmentAction',
      metadata: { error, professionalId },
    });

    // Return sanitized error to client
    return {
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Dados inválidos. Verifique as informações e tente novamente.',
      },
    };
  }
}

/**
 * Server Action: Updates an existing appointment (PRIVATE - professional only)
 * 
 * SECURITY:
 * - Requires authentication
 * - Validates ownership (professional can only update their own appointments)
 */
export async function updateAppointmentAction(
  professionalId: string,
  appointmentId: string,
  input: Partial<CreateAppointmentInput> & { status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' }
) {
  try {
    // 1. SECURITY: Validate session
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_ERROR,
          message: 'Não autorizado. Faça login para continuar.',
        },
      };
    }

    // 2. SECURITY: Validate ownership
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', professionalId)
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      logger.warn('Appointment update ownership violation', {
        context: 'updateAppointmentAction',
        metadata: { professionalId, userId: user.id },
      });
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_ERROR,
          message: 'Você não tem permissão para atualizar este agendamento.',
        },
      };
    }

    // 3. Proceed with update
    return await appointmentService.updateAppointment(professionalId, {
      appointmentId,
      ...input,
    });
  } catch (error) {
    logger.error('Error updating appointment', {
      context: 'updateAppointmentAction',
      metadata: { error, professionalId, appointmentId },
    });
    return {
      success: false,
      error: {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Erro ao atualizar agendamento.',
      },
    };
  }
}

/**
 * Server Action: Deletes an appointment (PRIVATE - professional only)
 * 
 * SECURITY:
 * - Requires authentication
 * - Validates ownership
 */
export async function deleteAppointmentAction(
  professionalId: string,
  appointmentId: string
) {
  try {
    // 1. SECURITY: Validate session
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_ERROR,
          message: 'Não autorizado. Faça login para continuar.',
        },
      };
    }

    // 2. SECURITY: Validate ownership
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', professionalId)
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_ERROR,
          message: 'Você não tem permissão para deletar este agendamento.',
        },
      };
    }

    // 3. Proceed with deletion
    return await appointmentService.deleteAppointment(professionalId, appointmentId);
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Erro ao deletar agendamento.',
      },
    };
  }
}

/**
 * Server Action: Gets appointments with filters (PRIVATE - professional only)
 * 
 * SECURITY:
 * - Requires authentication
 * - Validates ownership
 */
export async function getAppointmentsAction(professionalId: string, filters?: {
  startDate?: string;
  endDate?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  clientPhone?: string;
}) {
  try {
    // 1. SECURITY: Validate session
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_ERROR,
          message: 'Não autorizado. Faça login para continuar.',
        },
      };
    }

    // 2. SECURITY: Validate ownership
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', professionalId)
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_ERROR,
          message: 'Você não tem permissão para visualizar esses agendamentos.',
        },
      };
    }

    // 3. Proceed with query
    return await appointmentService.getAppointments({
      professionalId,
      ...filters,
    });
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Erro ao buscar agendamentos.',
      },
    };
  }
}
