import {
  AppError,
  ValidationError,
  DatabaseError,
  NotFoundError,
  BusinessRuleError,
  ErrorCodes,
  handleApiError,
} from './errors';
import { ZodError } from 'zod';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with field errors', () => {
      const fieldErrors = {
        email: ['Email inválido'],
        phone: ['Telefone obrigatório'],
      };

      const error = new ValidationError('Dados inválidos', fieldErrors);

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.fieldErrors).toEqual(fieldErrors);
    });
  });

  describe('DatabaseError', () => {
    it('should create DatabaseError with original error', () => {
      const originalError = { message: 'Connection failed', code: '500' };
      const error = new DatabaseError('Erro no banco', originalError);

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.originalError).toEqual(originalError);
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with resource name', () => {
      const error = new NotFoundError('Usuário');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Usuário não encontrado');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('BusinessRuleError', () => {
    it('should create BusinessRuleError with code', () => {
      const error = new BusinessRuleError(
        'Horário indisponível',
        ErrorCodes.BOOKING_TIME_CONFLICT
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Horário indisponível');
      expect(error.code).toBe('BOOKING_002'); // ErrorCodes.BOOKING_TIME_CONFLICT = 'BOOKING_002'
      expect(error.statusCode).toBe(422);
    });
  });
});

describe('handleApiError', () => {
  it('should handle AppError instances', () => {
    const error = new ValidationError('Dados inválidos');
    const result = handleApiError(error, 'test-context');

    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.message).toBe('Dados inválidos');
  });

  it('should handle ZodError instances', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['email'],
        message: 'Expected string, received number',
      },
    ]);

    const result = handleApiError(zodError, 'test-context');

    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.message).toBeTruthy();
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown error');
    const result = handleApiError(error, 'test-context');

    expect(result.code).toBe('ERR_UNKNOWN');
    expect(result.message).toBeTruthy();
  });

  it('should handle non-Error objects', () => {
    const error = 'String error';
    const result = handleApiError(error, 'test-context');

    expect(result.code).toBe('ERR_UNKNOWN');
    expect(result.message).toBeTruthy();
  });
});
