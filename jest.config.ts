import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Caminho para o app Next.js (raiz do projeto)
  dir: './',
});

// Configurações personalizadas do Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  
  // Adiciona suporte ao jest-dom (matchers como .toBeInTheDocument())
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Ignora pastas que não precisam de testes
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
  
  // Mapeia os aliases (@/...) igual ao tsconfig.json
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Padrões de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  
  // Coleta de cobertura
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
  ],
  
  // Limite de cobertura para módulos específicos (core business logic)
  coverageThreshold: {
    'src/core/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};

export default createJestConfig(config);
