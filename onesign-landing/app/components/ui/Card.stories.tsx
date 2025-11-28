import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the card content. You can put any content here.</p>
        </CardContent>
        <CardFooter>
          <button className="text-blue-600 hover:text-blue-800">Learn More</button>
        </CardFooter>
      </>
    ),
  },
};

export const WithoutFooter: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Simple Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A simple card without a footer.</p>
        </CardContent>
      </>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: (
      <>
        <CardTitle>Large Padding</CardTitle>
        <p className="mt-2">This card has large padding.</p>
      </>
    ),
  },
};

export const WithHover: Story = {
  args: {
    hover: true,
    children: (
      <>
        <CardTitle>Hover Effect</CardTitle>
        <p className="mt-2">Hover over this card to see the effect.</p>
      </>
    ),
  },
};
