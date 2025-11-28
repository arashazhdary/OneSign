import type { Meta, StoryObj } from '@storybook/react';
import { ToastContainer } from './Toast';
import { useToastStore } from '@/app/stores';
import { Button } from './ui';

const meta = {
  title: 'Components/Toast',
  component: ToastContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

function ToastDemo() {
  const { addToast } = useToastStore();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Toast Notifications</h2>
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() =>
            addToast({
              type: 'success',
              message: 'Operation completed successfully!',
            })
          }
        >
          Show Success
        </Button>
        <Button
          onClick={() =>
            addToast({
              type: 'error',
              message: 'An error occurred. Please try again.',
            })
          }
        >
          Show Error
        </Button>
        <Button
          onClick={() =>
            addToast({
              type: 'info',
              message: 'Here is some useful information.',
            })
          }
        >
          Show Info
        </Button>
        <Button
          onClick={() =>
            addToast({
              type: 'warning',
              message: 'Warning: Please review before proceeding.',
            })
          }
        >
          Show Warning
        </Button>
      </div>
      <ToastContainer />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <ToastDemo />,
};
