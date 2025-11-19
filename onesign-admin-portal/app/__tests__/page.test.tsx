import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  }
}));

describe('Home Page', () => {
  it('should render the main content', () => {
    render(<Home />);

    expect(screen.getByText('To get started, edit the page.tsx file.')).toBeInTheDocument();
  });

  it('should render the Next.js logo', () => {
    render(<Home />);

    const logo = screen.getByAltText('Next.js logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/next.svg');
  });

  it('should render the Vercel logo', () => {
    render(<Home />);

    const logo = screen.getByAltText('Vercel logomark');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/vercel.svg');
  });

  it('should render Templates link', () => {
    render(<Home />);

    const templatesLink = screen.getByText('Templates');
    expect(templatesLink).toBeInTheDocument();
    expect(templatesLink).toHaveAttribute('href', expect.stringContaining('vercel.com/templates'));
  });

  it('should render Learning link', () => {
    render(<Home />);

    const learningLink = screen.getByText('Learning');
    expect(learningLink).toBeInTheDocument();
    expect(learningLink).toHaveAttribute('href', expect.stringContaining('nextjs.org/learn'));
  });

  it('should render Deploy Now button', () => {
    render(<Home />);

    const deployLink = screen.getByText('Deploy Now');
    expect(deployLink).toBeInTheDocument();
    expect(deployLink).toHaveAttribute('href', expect.stringContaining('vercel.com/new'));
    expect(deployLink).toHaveAttribute('target', '_blank');
    expect(deployLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render Documentation button', () => {
    render(<Home />);

    const docsLink = screen.getByText('Documentation');
    expect(docsLink).toBeInTheDocument();
    expect(docsLink).toHaveAttribute('href', expect.stringContaining('nextjs.org/docs'));
    expect(docsLink).toHaveAttribute('target', '_blank');
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
