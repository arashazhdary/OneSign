import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('Home Page', () => {
  it('should render the Next.js logo', () => {
    render(<Home />);

    const logo = screen.getByAltText('Next.js logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/next.svg');
  });

  it('should render the main heading', () => {
    render(<Home />);

    expect(screen.getByText('To get started, edit the page.tsx file.')).toBeInTheDocument();
  });

  it('should render Templates link', () => {
    render(<Home />);

    const templatesLink = screen.getByText('Templates');
    expect(templatesLink).toHaveAttribute('href', expect.stringContaining('vercel.com/templates'));
  });

  it('should render Learning link', () => {
    render(<Home />);

    const learningLink = screen.getByText('Learning');
    expect(learningLink).toHaveAttribute('href', expect.stringContaining('nextjs.org/learn'));
  });

  it('should render Deploy Now button', () => {
    render(<Home />);

    const deployButton = screen.getByText('Deploy Now');
    expect(deployButton).toHaveAttribute('href', expect.stringContaining('vercel.com/new'));
    expect(deployButton).toHaveAttribute('target', '_blank');
    expect(deployButton).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render Documentation link', () => {
    render(<Home />);

    const docsLink = screen.getByText('Documentation');
    expect(docsLink).toHaveAttribute('href', expect.stringContaining('nextjs.org/docs'));
    expect(docsLink).toHaveAttribute('target', '_blank');
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render Vercel logomark', () => {
    render(<Home />);

    const vercelLogo = screen.getByAltText('Vercel logomark');
    expect(vercelLogo).toBeInTheDocument();
    expect(vercelLogo).toHaveAttribute('src', '/vercel.svg');
  });

  it('should have proper container styling', () => {
    const { container } = render(<Home />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center');
  });
});
