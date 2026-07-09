import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Vespera Mission Control',
  description:
    'Find answers to frequently asked questions about Vespera Mission Control, its capabilities, pricing, and support.',
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
