import React from 'react';
import { render } from '@testing-library/react';
import RootLayout from '../layout';

describe('RootLayout', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should pass children through without modification', () => {
    const { container } = render(
      <RootLayout>
        <main>Main Content</main>
      </RootLayout>
    );

    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Child 1</div>
        <div>Child 2</div>
      </RootLayout>
    );

    expect(getByText('Child 1')).toBeInTheDocument();
    expect(getByText('Child 2')).toBeInTheDocument();
  });
});
