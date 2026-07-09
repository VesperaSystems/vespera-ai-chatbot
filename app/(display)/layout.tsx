import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vespera Systems | The Intelligence Layer for Private Markets',
  description:
    'Vespera Systems designs and delivers intelligence systems for family offices, private equity firms, and asset managers — AI research chat, spatial market graphs, and large-format office displays.',
  alternates: {
    canonical: 'https://www.vesperasystems.com',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.vesperasystems.com',
    siteName: 'Vespera Systems',
    title: 'Vespera Systems | The Intelligence Layer for Private Markets',
    description:
      'AI research chat, spatial market graphs, and large-format office displays for family offices, private equity firms, and asset managers.',
  },
};

export default function DisplayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] text-neutral-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.09),transparent_28%),linear-gradient(180deg,#050505_0%,#0a0a0a_48%,#050505_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:5rem_5rem]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
