import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Vespera AI Chatbot',
  description:
    'Find answers to frequently asked questions about Vespera AI Chatbot, our features, pricing, and support.',
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
