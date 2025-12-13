# Form Validation Hook

## Overview

The `useFormValidation` hook provides real-time form validation with visual feedback, password strength meters, and RTL support for the OneSign login portal.

## Features

- **Real-time validation** with debouncing (300ms default)
- **Email validation** with RFC 5322 compliant regex
- **Password strength meter** with 5 levels (0-4)
- **Visual feedback** with green checkmarks and red error states
- **Smooth animations** for error messages and validation states
- **RTL support** for right-to-left languages
- **TypeScript** fully typed for better developer experience

## Usage

### Basic Example

```tsx
import { useFormValidation } from '@/hooks/useFormValidation';
import ValidationIcon from '@/app/components/ValidationIcon';
import PasswordStrengthMeter from '@/app/components/PasswordStrengthMeter';

function LoginForm() {
  const {
    fields,
    registerField,
    updateField,
    touchField,
    validateEmail,
    validatePassword,
    calculatePasswordStrength,
    isFormValid,
  } = useFormValidation({
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
  });

  // Register fields on mount
  useEffect(() => {
    registerField('email', '');
    registerField('password', '');
  }, [registerField]);

  return (
    <form>
      <input
        type="email"
        value={fields.email?.value || ''}
        onChange={(e) => updateField('email', e.target.value, validateEmail)}
        onBlur={() => touchField('email', validateEmail)}
      />
      <ValidationIcon
        isValid={fields.email?.isValid || false}
        show={fields.email?.touched || false}
      />

      <input
        type="password"
        value={fields.password?.value || ''}
        onChange={(e) => {
          const value = e.target.value;
          updateField('password', value, validatePassword);
        }}
        onBlur={() => touchField('password', validatePassword)}
      />
      <PasswordStrengthMeter
        strength={calculatePasswordStrength(fields.password?.value || '')}
        show={!!fields.password?.value}
      />
    </form>
  );
}
```

## API Reference

### `useFormValidation(options)`

#### Options

- `validateOnChange` (boolean, default: true) - Enable validation on input change
- `validateOnBlur` (boolean, default: true) - Enable validation when field loses focus
- `debounceMs` (number, default: 300) - Debounce delay for real-time validation

#### Returns

- `fields` - Object containing field states
- `registerField(name, initialValue)` - Register a new field
- `updateField(name, value, validator)` - Update field value with validation
- `touchField(name, validator)` - Mark field as touched (triggered on blur)
- `validateEmail(email)` - Email validation function
- `validatePassword(password)` - Password validation function
- `validateField(value, rules)` - Custom validation with rules
- `calculatePasswordStrength(password)` - Calculate password strength (0-4)
- `isFormValid()` - Check if all fields are valid
- `resetForm()` - Reset all fields

### Password Strength Levels

- **0**: Empty (no color, no label)
- **1**: Weak (red, #ef4444)
- **2**: Fair (orange, #f59e0b)
- **3**: Good (blue, #3b82f6)
- **4**: Strong (green, #10b981)

### Validation Rules

#### Email Validation
- RFC 5322 compliant email format
- Shows error immediately on blur if invalid

#### Password Validation
- Minimum 8 characters required
- Strength calculated based on:
  - Length (8+ chars = 1 point, 12+ chars = additional point)
  - Mixed case (uppercase + lowercase = 1 point)
  - Contains numbers (1 point)
  - Contains special characters (1 point)

## Components

### ValidationIcon

Displays a green checkmark for valid fields or a red X for invalid fields.

**Props:**
- `isValid` (boolean) - Whether the field is valid
- `show` (boolean) - Whether to show the icon
- `isRTL` (boolean, optional) - RTL layout support

### PasswordStrengthMeter

Displays a visual password strength indicator with a colored progress bar and requirement indicators.

**Props:**
- `strength` (PasswordStrength) - Strength object from calculatePasswordStrength
- `show` (boolean) - Whether to show the meter

## RTL Support

The validation components automatically adapt to RTL layouts:

- Icon positioning flips based on `isRTL` prop
- All animations and transitions work in both directions
- Text alignment follows the locale direction

## TypeScript Types

```typescript
interface FieldValidation {
  value: string;
  error: string;
  touched: boolean;
  isValid: boolean;
  isValidating?: boolean;
}

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  percentage: number;
}

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}
```

## Implementation Details

### Login Page Integration

The login page at `/onesign-login-portal/app/[locale]/login/page.tsx` implements:

1. **Email validation** - Shows error on blur, green checkmark when valid
2. **Password validation** - Real-time strength meter, minimum length check
3. **Visual feedback** - Animated borders (red for error, green for valid)
4. **Form submission** - Validates all fields before submitting

### File Structure

```
/onesign-login-portal/
  ├── hooks/
  │   ├── useFormValidation.ts
  │   └── README.md
  ├── app/
  │   └── components/
  │       ├── ValidationIcon.tsx
  │       └── PasswordStrengthMeter.tsx
```

## Performance

- Debounced validation (300ms default) prevents excessive re-renders
- Cleanup on unmount prevents memory leaks
- Optimized animations with Framer Motion
- Minimal re-renders with proper state management
