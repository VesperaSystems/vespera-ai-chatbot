import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Vespera Systems',
  description:
    'Find answers to frequently asked questions about Vespera Systems, its capabilities, pricing, and support.',
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
