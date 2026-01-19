# 🧪 Testing Infrastructure - AgendaFlow

## Overview

Enterprise-level testing setup with Jest achieving **99.19% code coverage** on critical business logic.

## Quick Start

```bash
# Run all tests
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Results

### ✅ Current Test Suite

```
Test Suites: 1 passed, 1 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        ~1.2s
```

### 📊 Coverage Report

**Core Business Logic (`src/core/booking/booking-rules.ts`):**

| Metric | Coverage | Status |
|--------|----------|--------|
| **Statements** | 99.19% | ✅ EXCELLENT |
| **Branches** | 100% | ✅ PERFECT |
| **Functions** | 90% | ✅ GREAT |
| **Lines** | 99.19% | ✅ EXCELLENT |

## Test Suite Breakdown

### `booking-rules.spec.ts` - 24 Test Cases

#### ✅ validateNotPastDate (3 tests)
- Should throw error for past dates
- Should not throw for today
- Should not throw for future dates

#### ✅ detectTimeSlotConflict (6 tests)
- Should detect exact overlap
- Should detect partial overlap - new starts before existing ends
- Should detect partial overlap - new ends after existing starts
- Should not detect conflict for back-to-back appointments
- Should not detect conflict for different dates
- Should not detect conflict for non-overlapping time on same date

#### ✅ validateWithinBusinessHours (5 tests)
- Should validate appointment within business hours
- Should throw error for appointment on day with no availability
- Should throw error for appointment starting before business hours
- Should throw error for appointment ending after business hours
- Should validate appointment in afternoon slot

#### ✅ isTimeSlotBlocked (5 tests)
- Should detect block for exact time match
- Should detect block for partial overlap
- Should detect block for entire day
- Should not detect block for non-blocked time
- Should not detect block for back-to-back time slots

#### ✅ calculateAvailableTimeSlots (3 tests)
- Should generate available slots excluding existing appointments and blocks
- Should return empty array for day with no availability
- Should respect service duration when generating slots

#### ✅ calculateAppointmentEndTime (1 test)
- Should calculate end time correctly (including midnight crossing)

#### ✅ formatTimeSlotRange (1 test)
- Should format time range correctly

## Testing Philosophy

### Why Pure Functions?

All business logic in `src/core/` is implemented as **pure functions**:

✅ **No mocking required** - Tests pass actual data, get predictable results
✅ **Fast execution** - No database, no network, no React rendering
✅ **100% deterministic** - Same inputs always produce same outputs
✅ **Easy debugging** - Stack traces point directly to the issue

### Test Structure

```typescript
describe('Feature Name', () => {
  describe('functionName', () => {
    it('should handle the happy path', () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe(expectedValue);
    });
    
    it('should handle edge cases', () => {
      // Test boundaries, errors, special conditions
    });
  });
});
```

## What's NOT Tested (Yet)

These are integration/E2E tests that require additional setup:

- [ ] UI Components (requires React Testing Library setup)
- [ ] API Routes (requires API test setup)
- [ ] Database operations (requires test database)
- [ ] Server Actions (requires Next.js test environment)

**Current Focus**: Core business logic has 99%+ coverage. This is where bugs cost the most.

## Adding New Tests

### 1. Create test file next to source file

```
src/core/booking/
  ├── booking-rules.ts
  └── booking-rules.spec.ts  ← Test file
```

### 2. Follow the naming convention

- Unit tests: `*.spec.ts`
- Integration tests: `*.test.ts`
- E2E tests: `*.e2e.ts`

### 3. Use descriptive test names

❌ Bad:
```typescript
it('test 1', () => { /* ... */ });
```

✅ Good:
```typescript
it('should throw BusinessRuleError when booking date is in the past', () => {
  // Test implementation
});
```

### 4. Test edge cases

For every function, test:
- ✅ Happy path (valid inputs)
- ✅ Boundary conditions (min/max values)
- ✅ Error cases (invalid inputs)
- ✅ Edge cases (midnight crossing, timezone issues, etc.)

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

## Configuration Files

### `jest.config.ts`
- Uses Next.js Jest plugin for seamless integration
- Maps `@/` aliases from `tsconfig.json`
- Configured for jsdom environment (React testing)
- Coverage thresholds enforce 90%+ on core logic

### `jest.setup.ts`
- Imports `@testing-library/jest-dom` matchers
- Can be extended with global test utilities

## Best Practices

### ✅ DO

- Write tests BEFORE fixing bugs (TDD Red-Green-Refactor)
- Test business logic independently of frameworks
- Use descriptive test names that explain the scenario
- Group related tests with `describe` blocks
- Test error messages, not just that errors are thrown
- Keep tests simple and focused (one assertion per test when possible)

### ❌ DON'T

- Don't test third-party libraries (Jest, React, Supabase)
- Don't test implementation details (test behavior, not internals)
- Don't skip edge cases ("it works on my machine")
- Don't use `any` or disable type checking in tests
- Don't commit commented-out tests (fix or delete them)

## Troubleshooting

### Tests fail with "Cannot find module '@/...'"

**Solution**: Check `moduleNameMapper` in `jest.config.ts` matches `tsconfig.json` paths.

### "ReferenceError: window is not defined"

**Solution**: Code is trying to use browser APIs. Either:
1. Mock the browser API in `jest.setup.ts`
2. Move code to a client component
3. Use `testEnvironment: 'jsdom'` (already configured)

### Coverage not matching expectations

**Solution**: Run `npm run test:coverage -- --verbose` to see which lines are uncovered.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Built with ❤️ by a Principal Software Engineer who believes tests are documentation that never lies.**
