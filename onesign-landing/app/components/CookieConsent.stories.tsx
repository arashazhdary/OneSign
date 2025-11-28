import type { Meta, StoryObj } from '@storybook/react';
import { CookieConsent } from './CookieConsent';
import { useEffect } from 'react';

const meta = {
  title: 'Components/CookieConsent',
  component: CookieConsent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

function CookieConsentDemo() {
  useEffect(() => {
    // Clear localStorage to show the banner
    localStorage.removeItem('cookie-consent');
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-4">Cookie Consent Banner</h2>
      <p className="text-gray-600 mb-4">
        The cookie consent banner will appear at the bottom of the page.
        Clear your localStorage to see it again.
      </p>
      <CookieConsent />
    </div>
  );
}

export const Default: Story = {
  render: () => <CookieConsentDemo />,
};
