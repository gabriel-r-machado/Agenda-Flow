import { PostgrestError } from '@supabase/supabase-js';
import { ZodError } from 'zod';
import { logger } from './logger';

/**
 * Base application error class with error codes for support tracking
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when user input fails validation
 */
export class ValidationError extends AppError {
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Thrown when database operations fail
 */
export class DatabaseError extends AppError {
  public readonly originalError?: PostgrestError;

  constructor(message: string, originalError?: PostgrestError) {
    super(message, 'DATABASE_ERROR', 500);
    this.originalError = originalError;
  }
}

/**
 * Thrown when authentication or authorization fails
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 'AUTH_ERROR', 401);
  }
}

/**
 * Thrown when business rules are violated (e.g., booking in the past, double-booking)
 */
export class BusinessRuleError extends AppError {
  constructor(message: string, code: string = 'BUSINESS_RULE_VIOLATION') {
    super(message, code, 422);
  }
}

/**
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} não encontrado`, 'NOT_FOUND', 404);
  }
}

/**
 * Error codes for specific business scenarios
 */
export const ErrorCodes = {
  // Booking errors
  BOOKING_PAST_DATE: 'BOOKING_001',
  BOOKING_TIME_CONFLICT: 'BOOKING_002',
  BOOKING_OUTSIDE_BUSINESS_HOURS: 'BOOKING_003',
  BOOKING_SLOT_UNAVAILABLE: 'BOOKING_004',
  
  // Client errors
  CLIENT_DUPLICATE_PHONE: 'CLIENT_001',
  CLIENT_INVALID_PHONE: 'CLIENT_002',
  
  // Service errors
  SERVICE_NOT_ACTIVE: 'SERVICE_001',
  SERVICE_PRICE_INVALID: 'SERVICE_002',
  
  // Profile errors
  PROFILE_INCOMPLETE: 'PROFILE_001',
  PROFILE_SLUG_TAKEN: 'PROFILE_002',
  
  // Subscription errors
  SUBSCRIPTION_LIMIT_REACHED: 'SUBS_001',
  SUBSCRIPTION_FEATURE_LOCKED: 'SUBS_002',
  
  // Auth errors
  AUTH_ERROR: 'AUTH_001',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_001',
  
  // Generic errors
  UNKNOWN_ERROR: 'ERR_UNKNOWN',
} as const;

/**
 * User-friendly error messages mapped to error codes
 * These are shown in toasts - never expose technical details to users
 */
const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCodes.BOOKING_PAST_DATE]: 'Não é possível agendar em datas passadas',
  [ErrorCodes.BOOKING_TIME_CONFLICT]: 'Este horário já está ocupado',
  [ErrorCodes.BOOKING_OUTSIDE_BUSINESS_HOURS]: 'Horário fora do expediente',
  [ErrorCodes.BOOKING_SLOT_UNAVAILABLE]: 'Horário indisponível',
  
  [ErrorCodes.CLIENT_DUPLICATE_PHONE]: 'Já existe um cliente com este telefone',
  [ErrorCodes.CLIENT_INVALID_PHONE]: 'Telefone inválido',
  
  [ErrorCodes.SERVICE_NOT_ACTIVE]: 'Este serviço não está mais disponível',
  [ErrorCodes.SERVICE_PRICE_INVALID]: 'Valor do serviço inválido',
  
  [ErrorCodes.PROFILE_INCOMPLETE]: 'Complete seu perfil antes de continuar',
  [ErrorCodes.PROFILE_SLUG_TAKEN]: 'Este link já está em uso',
  
  [ErrorCodes.SUBSCRIPTION_LIMIT_REACHED]: 'Você atingiu o limite do seu plano. Faça upgrade!',
  [ErrorCodes.SUBSCRIPTION_FEATURE_LOCKED]: 'Esta funcionalidade está disponível apenas em planos superiores',
  
  [ErrorCodes.AUTH_ERROR]: 'Erro de autenticação. Faça login novamente.',
  [ErrorCodes.VALIDATION_ERROR]: 'Dados inválidos. Verifique as informações e tente novamente.',
  
  [ErrorCodes.UNKNOWN_ERROR]: 'Ocorreu um erro inesperado. Tente novamente.',
};

/**
 * Categorizes and handles different error types
 * Returns a user-friendly message and logs technical details
 */
export function handleApiError(error: unknown, context?: string): {
  message: string;
  code: string;
} {
  // AppError - our custom errors with codes
  if (error instanceof AppError) {
    logger.error(`${error.name}: ${error.message}`, {
      context,
      metadata: { code: error.code, statusCode: error.statusCode },
    });
    
    return {
      message: ERROR_MESSAGES[error.code] || error.message,
      code: error.code,
    };
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.reduce((acc, err) => {
      const field = err.path.join('.');
      if (!acc[field]) acc[field] = [];
      acc[field].push(err.message);
      return acc;
    }, {} as Record<string, string[]>);

    logger.warn('Validation error', { context, metadata: { fieldErrors } });

    const firstError = error.errors[0];
    return {
      message: firstError?.message || 'Dados inválidos',
      code: 'VALIDATION_ERROR',
    };
  }

  // Supabase/PostgreSQL errors
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const pgError = error as PostgrestError;
    
    logger.error('Database error', {
      context,
      metadata: { 
        code: pgError.code, 
        message: pgError.message,
        details: pgError.details,
        hint: pgError.hint,
      },
    });

    // Map common PostgreSQL errors to user-friendly messages
    if (pgError.code === '23505') { // unique_violation
      return {
        message: 'Este registro já existe',
        code: 'DATABASE_DUPLICATE',
      };
    }
    
    if (pgError.code === '23503') { // foreign_key_violation
      return {
        message: 'Não é possível excluir este registro pois está sendo usado',
        code: 'DATABASE_CONSTRAINT',
      };
    }
    
    if (pgError.code === 'PGRST116') { // Row not found
      return {
        message: 'Registro não encontrado',
        code: 'NOT_FOUND',
      };
    }

    return {
      message: 'Erro ao processar sua solicitação',
      code: 'DATABASE_ERROR',
    };
  }

  // Unexpected errors
  logger.error('Unexpected error', {
    context,
    metadata: { error: error instanceof Error ? error.message : String(error) },
  });

  return {
    message: ERROR_MESSAGES[ErrorCodes.UNKNOWN_ERROR],
    code: ErrorCodes.UNKNOWN_ERROR,
  };
}

/**
 * Type guard to check if an error is operational (expected) or programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
