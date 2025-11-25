import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '@/components/common/Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(
      <Input
        type="text"
        value=""
        onChange={() => {}}
        label="Username"
      />
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('displays input value', () => {
    render(
      <Input
        type="text"
        value="test value"
        onChange={() => {}}
        label="Username"
      />
    );

    const input = screen.getByLabelText('Username') as HTMLInputElement;
    expect(input.value).toBe('test value');
  });

  it('calls onChange when input value changes', () => {
    const handleChange = vi.fn();
    render(
      <Input
        type="text"
        value=""
        onChange={handleChange}
        label="Username"
      />
    );

    const input = screen.getByLabelText('Username');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <Input
        type="text"
        value=""
        onChange={() => {}}
        label="Username"
        error="Username is required"
      />
    );

    expect(screen.getByText('Username is required')).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <Input
        type="text"
        value=""
        onChange={() => {}}
        label="Username"
        disabled
      />
    );

    const input = screen.getByLabelText('Username');
    expect(input).toBeDisabled();
  });

  it('shows placeholder text', () => {
    render(
      <Input
        type="text"
        value=""
        onChange={() => {}}
        label="Username"
        placeholder="Enter your username"
      />
    );

    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
  });

  it('applies required attribute when required prop is true', () => {
    render(
      <Input
        type="text"
        value=""
        onChange={() => {}}
        label="Username"
        required
      />
    );

    const input = screen.getByLabelText('Username');
    expect(input).toBeRequired();
  });

  it('handles password type input', () => {
    render(
      <Input
        type="password"
        value="secret"
        onChange={() => {}}
        label="Password"
      />
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('handles email type input', () => {
    render(
      <Input
        type="email"
        value="test@example.com"
        onChange={() => {}}
        label="Email"
      />
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('handles number type input', () => {
    render(
      <Input
        type="number"
        value="42"
        onChange={() => {}}
        label="Age"
      />
    );

    const input = screen.getByLabelText('Age');
    expect(input).toHaveAttribute('type', 'number');
  });
});
