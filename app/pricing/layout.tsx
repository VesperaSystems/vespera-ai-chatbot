import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Vespera AI Chatbot',
  description:
    'Choose the perfect plan for your needs. From small businesses to enterprise solutions, we have you covered.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
