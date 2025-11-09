import { describe, it, expect } from 'vitest';
import { validatePassword } from '../passwordValidation';

describe('Password Validation', () => {
  it('validates minimum length', () => {
    const result = validatePassword('short');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validates uppercase requirement', () => {
    const result = validatePassword('lowercase123!');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validates lowercase requirement', () => {
    const result = validatePassword('UPPERCASE123!');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validates number requirement', () => {
    const result = validatePassword('Password!');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validates special character requirement', () => {
    const result = validatePassword('Password123');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('accepts valid password', () => {
    const result = validatePassword('ValidP@ss123');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates password correctly', () => {
    // Test weak password
    expect(validatePassword('weak').valid).toBe(false);
    // Test medium password  
    expect(validatePassword('Medium1!').valid).toBe(false); // Still fails min length
    // Test strong password
    expect(validatePassword('StrongP@ssw0rd!').valid).toBe(true);
  });
});
