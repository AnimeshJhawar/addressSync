/**
 * validator.test.js
 * Tests for pin code and address field validation.
 */

const {
  validatePinCode,
  validateAddressFields,
  normaliseAddressString,
} = require('../src/validator');

describe('validatePinCode', () => {
  test('returns serviceable for valid Delhi NCR pin', () => {
    expect(validatePinCode('110001').serviceable).toBe(true);
    expect(validatePinCode('110048').serviceable).toBe(true);
    expect(validatePinCode('110096').serviceable).toBe(true);
  });

  test('returns not serviceable for out-of-range pins', () => {
    expect(validatePinCode('110099').serviceable).toBe(false);
    expect(validatePinCode('999999').serviceable).toBe(false);
  });

  test('returns not serviceable for invalid format', () => {
    expect(validatePinCode('12345').serviceable).toBe(false);   // 5 digits
    expect(validatePinCode('abcdef').serviceable).toBe(false);  // letters
    expect(validatePinCode('').serviceable).toBe(false);        // empty
  });

  test('returns serviceable for valid Bengaluru pin', () => {
    expect(validatePinCode('560001').serviceable).toBe(true);
  });
});

describe('validateAddressFields', () => {
  const validAddress = {
    line1: 'Flat 5, Metric Drop Apartments',
    line2: '',   // intentionally empty — line2 is optional
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110048',
  };

  test('returns no errors for a valid address', () => {
    expect(validateAddressFields(validAddress)).toHaveLength(0);
  });

  test('returns error when line1 is too short', () => {
    const errors = validateAddressFields({ ...validAddress, line1: 'A1' });
    expect(errors.some(e => e.field === 'line1')).toBe(true);
  });

  test('does NOT return error when line2 is empty', () => {
    // line2 is optional — this was the bug in the old version
    const errors = validateAddressFields({ ...validAddress, line2: '' });
    expect(errors.some(e => e.field === 'line2')).toBe(false);
  });

  test('returns error for unserviceable pin code', () => {
    const errors = validateAddressFields({ ...validAddress, pinCode: '999999' });
    expect(errors.some(e => e.field === 'pinCode')).toBe(true);
  });

  test('returns error when city is missing', () => {
    const errors = validateAddressFields({ ...validAddress, city: '' });
    expect(errors.some(e => e.field === 'city')).toBe(true);
  });
});

describe('normaliseAddressString', () => {
  test('trims whitespace', () => {
    expect(normaliseAddressString('  hello  ')).toBe('hello');
  });

  test('collapses multiple spaces', () => {
    expect(normaliseAddressString('flat   5   B')).toBe('flat 5 B');
  });

  test('handles null/undefined gracefully', () => {
    expect(normaliseAddressString(null)).toBe('');
    expect(normaliseAddressString(undefined)).toBe('');
  });
});
