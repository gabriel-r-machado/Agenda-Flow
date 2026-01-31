import { logger } from './logger';

describe('Logger', () => {
  describe('info', () => {
    it('should accept info level messages', () => {
      expect(() => {
        logger.info('Test info message', {
          context: 'test',
          metadata: { userId: '123' },
        });
      }).not.toThrow();
    });
  });

  describe('warn', () => {
    it('should accept warning messages', () => {
      expect(() => {
        logger.warn('Test warning', {
          context: 'test',
          metadata: { issue: 'potential problem' },
        });
      }).not.toThrow();
    });
  });

  describe('error', () => {
    it('should accept error messages', () => {
      const testError = new Error('Test error');
      expect(() => {
        logger.error('An error occurred', {
          context: 'test',
          metadata: { error: testError },
        });
      }).not.toThrow();
    });

    it('should handle error objects in metadata', () => {
      const testError = new Error('Test error');
      expect(() => {
        logger.error('Error with object', {
          context: 'test',
          metadata: { error: testError, additionalInfo: 'data' },
        });
      }).not.toThrow();
    });
  });

  describe('debug', () => {
    it('should accept debug messages', () => {
      expect(() => {
        logger.debug('Debug message', {
          context: 'test',
          metadata: { debugData: 'value' },
        });
      }).not.toThrow();
    });
  });
});
