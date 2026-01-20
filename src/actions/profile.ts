'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { handleApiError, DatabaseError, ValidationError, AuthenticationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { UpdateProfileInput, UpdateProfileInputSchema, ProfileResponse, ApiResponse } from '@/services/dto';
import { ErrorCodes } from '@/lib/errors';

/**
 * Server Action: Updates user profile settings
 * 
 * SECURITY:
 * - Validates active session
 * - Ensures ownership (user can only update their own profile)
 * - Validates input with Zod schema
 */
export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<ApiResponse<ProfileResponse>> {
  try {
    // 1. SECURITY: Validate session
    const cookieStore = await cookies();
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
      logger.warn('Unauthorized profile update attempt', {
        context: 'updateProfileAction',
        metadata: { authError: authError?.message },
      });
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_ERROR,
          message: 'Não autorizado. Faça login para continuar.',
        },
      };
    }

    // 2. Validate input
    const validated = UpdateProfileInputSchema.parse(input);

    // 3. SECURITY: Validate ownership - ensure profile belongs to authenticated user
    const { data: profileOwnership, error: ownershipError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', validated.profileId)
      .single();

    if (ownershipError || !profileOwnership || profileOwnership.user_id !== user.id) {
      logger.warn('Profile update ownership violation', {
        context: 'updateProfileAction',
        metadata: {
          profileId: validated.profileId,
          userId: user.id,
          profileOwnerId: profileOwnership?.user_id,
        },
      });
      return {
        success: false,
        error: {
          code: ErrorCodes.AUTH_ERROR,
          message: 'Você não tem permissão para atualizar este perfil.',
        },
      };
    }

    logger.info('Updating profile', {
      context: 'updateProfileAction',
      metadata: { profileId: validated.profileId },
    });

    // 4. Build update object from validated input
    const updateData: any = {};
    
    if (validated.fullName !== undefined) updateData.full_name = validated.fullName;
    if (validated.businessName !== undefined) updateData.business_name = validated.businessName;
    if (validated.profileSlug !== undefined) updateData.profile_slug = validated.profileSlug;
    if (validated.bio !== undefined) updateData.bio = validated.bio;
    if (validated.phone !== undefined) updateData.phone = validated.phone;
    if (validated.email !== undefined) updateData.email = validated.email;
    if (validated.avatarUrl !== undefined) updateData.avatar_url = validated.avatarUrl;
    if (validated.category !== undefined) updateData.category = validated.category;
    if (validated.instagramUrl !== undefined) updateData.instagram_url = validated.instagramUrl;
    if (validated.whatsappNumber !== undefined) updateData.whatsapp_number = validated.whatsappNumber;
    if (validated.acceptsOnlinePayment !== undefined) updateData.accepts_online_payment = validated.acceptsOnlinePayment;
    if (validated.bookingIntervalMinutes !== undefined) updateData.booking_interval_minutes = validated.bookingIntervalMinutes;

    // 5. Check if profile_slug is unique (if being updated)
    if (validated.profileSlug) {
      const { data: existingSlug, error: slugError } = await supabase
        .from('profiles')
        .select('id')
        .eq('profile_slug', validated.profileSlug)
        .neq('id', validated.profileId)
        .maybeSingle();

      if (slugError) {
        throw new DatabaseError('Erro ao verificar disponibilidade do link', slugError);
      }

      if (existingSlug) {
        throw new ValidationError('Este link já está em uso', {
          profileSlug: ['Este link já está em uso por outro profissional'],
        });
      }
    }

    // 6. Update profile
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', validated.profileId)
      .select(
        `
        id,
        full_name,
        business_name,
        profile_slug,
        bio,
        phone,
        email,
        avatar_url,
        category,
        instagram_url,
        whatsapp_number,
        accepts_online_payment,
        booking_interval_minutes,
        subscription_tier,
        subscription_status,
        created_at
      `
      )
      .single();

    if (updateError || !updated) {
      throw new DatabaseError('Erro ao atualizar perfil', updateError);
    }

    logger.info('Profile updated successfully', {
      context: 'updateProfileAction',
      metadata: { profileId: validated.profileId },
    });

    // Transform to DTO
    const response: ProfileResponse = {
      id: updated.id,
      fullName: updated.full_name,
      businessName: updated.business_name,
      profileSlug: updated.profile_slug,
      bio: updated.bio,
      phone: updated.phone,
      email: updated.email,
      avatarUrl: updated.avatar_url,
      category: updated.category,
      instagramUrl: updated.instagram_url,
      whatsappNumber: updated.whatsapp_number,
      acceptsOnlinePayment: updated.accepts_online_payment,
      bookingIntervalMinutes: updated.booking_interval_minutes,
      subscriptionTier: updated.subscription_tier,
      subscriptionStatus: updated.subscription_status,
      createdAt: updated.created_at,
    };

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const handledError = handleApiError(error, 'updateProfileAction');
    return {
      success: false,
      error: handledError,
    };
  }
}

/**
 * Server Action: Gets profile by ID or slug
 */
export async function getProfileAction(
  identifier: string,
  bySlug: boolean = false
): Promise<ApiResponse<ProfileResponse>> {
  try {
    logger.debug('Fetching profile', {
      context: 'getProfileAction',
      metadata: { identifier, bySlug },
    });

    // Create anon client for public profile fetching
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      }
    );

    let query = supabase
      .from('profiles')
      .select(
        `
        id,
        full_name,
        business_name,
        profile_slug,
        bio,
        phone,
        email,
        avatar_url,
        category,
        instagram_url,
        whatsapp_number,
        accepts_online_payment,
        booking_interval_minutes,
        subscription_tier,
        subscription_status,
        created_at
      `
      );

    if (bySlug) {
      query = query.eq('profile_slug', identifier);
    } else {
      query = query.eq('id', identifier);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      throw new DatabaseError('Perfil não encontrado', error);
    }

    const response: ProfileResponse = {
      id: data.id,
      fullName: data.full_name,
      businessName: data.business_name,
      profileSlug: data.profile_slug,
      bio: data.bio,
      phone: data.phone,
      email: data.email,
      avatarUrl: data.avatar_url,
      category: data.category,
      instagramUrl: data.instagram_url,
      whatsappNumber: data.whatsapp_number,
      acceptsOnlinePayment: data.accepts_online_payment,
      bookingIntervalMinutes: data.booking_interval_minutes,
      subscriptionTier: data.subscription_tier,
      subscriptionStatus: data.subscription_status,
      createdAt: data.created_at,
    };

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const handledError = handleApiError(error, 'getProfileAction');
    return {
      success: false,
      error: handledError,
    };
  }
}

export async function rescheduleAppointmentAction(
  agendamentoId: string,
  novaData: string | Date,
  telefoneCliente: string
): Promise<ApiResponse<any>> {
  try {
    const cookieStore = await cookies();
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

    const { data, error } = await (supabase.rpc as any)('remarcar_agendamento', {
      p_agendamento_id: agendamentoId,
      p_novo_horario:
        novaData instanceof Date ? novaData.toISOString() : new Date(novaData).toISOString(),
      p_telefone_cliente: telefoneCliente,
    });

    if (error) {
      logger.warn('Falha ao remarcar agendamento', {
        context: 'rescheduleAppointmentAction',
        metadata: { agendamentoId, error: error.message },
      });

      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Erro ao remarcar: telefone inválido ou agendamento não encontrado.',
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    const handledError = handleApiError(error, 'rescheduleAppointmentAction');
    return {
      success: false,
      error: handledError,
    };
  }
}

export async function criarAppointmentAction(
  nome: string,
  telefone: string,
  servicoId: string,
  profissionalId: string,
  dataHorario: string | Date
): Promise<ApiResponse<any>> {
  try {
    const cookieStore = await cookies();
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

    const { data, error } = await (supabase.rpc as any)('criar_agendamento', {
      p_cliente_nome: nome,
      p_cliente_telefone: telefone,
      p_servico_id: servicoId,
      p_profissional_id: profissionalId,
      p_data_horario: dataHorario instanceof Date ? dataHorario.toISOString() : new Date(dataHorario).toISOString(),
    });

    if (error) {
      logger.warn('Falha ao criar agendamento', {
        context: 'criarAppointmentAction',
        metadata: { telefone, servicoId, profissionalId, error: error.message },
      });

      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: error.message || 'Erro ao criar agendamento.',
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    const handledError = handleApiError(error, 'criarAppointmentAction');
    return {
      success: false,
      error: handledError,
    };
  }
}
