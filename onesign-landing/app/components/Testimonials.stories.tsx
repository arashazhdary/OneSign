import type { Meta, StoryObj } from '@storybook/react';
import { Testimonials } from './Testimonials';

const meta = {
  title: 'Components/Testimonials',
  component: Testimonials,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Testimonials>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
