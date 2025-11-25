import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '@/components/common/Modal';

describe('Modal Component', () => {
  it('renders when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const closeButton = screen.getAllByRole('button')[0];
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const backdrop = container.querySelector('.fixed.inset-0');
    if (backdrop) fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalled();
  });

  it('renders footer buttons', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
        footer={
          <>
            <button>Cancel</button>
            <button>Confirm</button>
          </>
        }
      >
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('applies custom size', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" size="lg">
        <p>Modal content</p>
      </Modal>
    );

    const modal = container.querySelector('.max-w-4xl');
    expect(modal).toBeInTheDocument();
  });
});
