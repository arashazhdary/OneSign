import type { Meta, StoryObj } from '@storybook/react';
import { Newsletter } from './Newsletter';

const meta = {
  title: 'Components/Newsletter',
  component: Newsletter,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Newsletter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
