import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/components/ui/Card';

describe('Card Component', () => {
  it('renders correctly with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies different padding sizes', () => {
    const { container, rerender } = render(<Card padding="sm">Content</Card>);
    expect(container.firstChild).toHaveClass('p-4');

    rerender(<Card padding="md">Content</Card>);
    expect(container.firstChild).toHaveClass('p-6');

    rerender(<Card padding="lg">Content</Card>);
    expect(container.firstChild).toHaveClass('p-8');

    rerender(<Card padding="none">Content</Card>);
    expect(container.firstChild).toHaveClass('p-0');
  });

  it('applies different shadow sizes', () => {
    const { container, rerender } = render(<Card shadow="sm">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-sm');

    rerender(<Card shadow="md">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-md');

    rerender(<Card shadow="lg">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-lg');

    rerender(<Card shadow="none">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-none');
  });

  it('applies hover effect when enabled', () => {
    const { container } = render(<Card hover>Content</Card>);
    expect(container.firstChild).toHaveClass('hover:shadow-xl');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders CardHeader correctly', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('renders CardTitle correctly', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText('Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3');
  });

  it('renders CardContent correctly', () => {
    render(<CardContent>Content</CardContent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders CardFooter correctly', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('renders complete card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card body content</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Card body content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });
});
