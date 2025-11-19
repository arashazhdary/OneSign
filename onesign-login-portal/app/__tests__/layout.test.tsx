import React from 'react';
import { render } from '@testing-library/react';
import RootLayout, { metadata } from '../layout';

describe('RootLayout', () => {
  it('should render children directly', () => {
    const TestChild = () => <div>Test Child Content</div>;

    const { getByText } = render(
      <RootLayout>
        <TestChild />
      </RootLayout>
    );

    expect(getByText('Test Child Content')).toBeInTheDocument();
  });

  it('should pass through any children', () => {
    const { container } = render(
      <RootLayout>
        <span data-testid="test">Hello World</span>
      </RootLayout>
    );

    expect(container.querySelector('[data-testid="test"]')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    const { getByText } = render(
      <RootLayout>
        <div>First</div>
        <div>Second</div>
      </RootLayout>
    );

    expect(getByText('First')).toBeInTheDocument();
    expect(getByText('Second')).toBeInTheDocument();
  });
});

describe('RootLayout metadata', () => {
  it('should have correct title', () => {
    expect(metadata.title).toBe('Onesign Login Portal');
  });

  it('should have correct description', () => {
    expect(metadata.description).toBe('Sign in to your account');
  });
});
