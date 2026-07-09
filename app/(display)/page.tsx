import Link from 'next/link';

const audiences = [
  'Family offices that want a clear, always-on view of themes, managers, companies, and relationships.',
  'Private equity firms that want deal context, sector movement, and portfolio signals visible in the room.',
  'Asset managers that want research priorities, market structure, and conviction signals shared across teams.',
];

const pricing = [
  ['Platform subscription', 'From GBP 2,950 per month', 'Access to the Vespera demo/product environment, configured dashboards, managed views, and support.'],
  ['Display installation', 'Scoped per office', 'Screen specification, delivery coordination, AV/facilities handoff, installation planning, and commissioning support.'],
  ['Tenant workspace', 'By arrangement', 'Private tenant paths such as vespera.systems/ubs or vespera.systems/sjp with Supabase authentication and data access.'],
];

const installSteps = [
  'Discovery: we confirm the room, audience, screen size, data sources, security expectations, and the decision-making workflow.',
  'Specification: we agree the display, media player, mounting approach, connectivity, and whether your AV partner or ours completes the install.',
  'Delivery: screens and hardware are scheduled around building access, facilities rules, and office operating hours.',
  'Commissioning: the system is connected, configured, calibrated, tested, and handed over with launch support.',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.34em]">
          Vespera Systems Limited
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-neutral-600 md:flex">
          <a href="#company" className="hover:text-neutral-950">Company</a>
          <a href="#pricing" className="hover:text-neutral-950">Pricing</a>
          <a href="#installation" className="hover:text-neutral-950">Installation</a>
        </nav>
        <a
          href="https://vespera.systems"
          className="rounded-full border border-neutral-950 px-4 py-2 text-sm font-medium transition hover:bg-neutral-950 hover:text-white"
        >
          View demo
        </a>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-neutral-500">Company brochure site</p>
            <h1 className="mt-8 max-w-5xl text-balance text-6xl font-semibold tracking-[-0.07em] text-neutral-950 sm:text-8xl lg:text-9xl">
              Intelligence displays for private markets.
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-9 text-neutral-600">
              Vespera Systems Limited designs and delivers large-format information displays for family offices, private equity firms, asset managers, and venture capital offices.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://vespera.systems"
                className="rounded-full bg-neutral-950 px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-neutral-800"
              >
                Open vespera.systems
              </a>
              <a
                href="mailto:hello@vespera.systems?subject=Vespera%20Systems%20display%20proposal"
                className="rounded-full border border-neutral-300 px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-neutral-950 transition hover:border-neutral-950"
              >
                Request proposal
              </a>
            </div>
          </div>

          <div className="border border-neutral-950 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-neutral-500">Domain roles</p>
            <div className="mt-8 space-y-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">vesperasystems.com</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Company and sales site</h2>
                <p className="mt-4 leading-7 text-neutral-600">Public brochure, commercial proposition, pricing guidance, installation process, and contact routes for Vespera Systems Limited.</p>
              </div>
              <div className="h-px bg-neutral-200" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">vespera.systems</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Product demo and tenant access</h2>
                <p className="mt-4 leading-7 text-neutral-600">The product environment for demos today, and later the authenticated tenant workspace for paths such as /ubs, /sjp, and other client data rooms.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="company" className="border-y border-neutral-200 bg-neutral-50">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-neutral-500">What we sell</p>
              <h2 className="mt-5 text-5xl font-semibold tracking-[-0.06em]">A physical display layer for investment teams.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {audiences.map((audience) => (
                <div key={audience} className="border border-neutral-200 bg-white p-6">
                  <p className="leading-7 text-neutral-700">{audience}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-neutral-500">Pricing</p>
            <h2 className="mt-5 text-5xl font-semibold tracking-[-0.06em]">Guide pricing for subscription, screens, and tenant access.</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {pricing.map(([name, price, detail]) => (
              <div key={name} className="border border-neutral-200 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">{name}</p>
                <p className="mt-6 text-3xl font-semibold tracking-[-0.05em]">{price}</p>
                <p className="mt-6 leading-7 text-neutral-600">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="installation" className="bg-neutral-950 text-white">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-neutral-400">Delivery and commissioning</p>
              <h2 className="mt-5 text-5xl font-semibold tracking-[-0.06em]">We arrange the screen, installation, and system handover.</h2>
              <p className="mt-6 leading-8 text-neutral-300">Vespera can coordinate with your internal facilities, IT, security, and AV teams, or help manage the practical delivery path end to end.</p>
            </div>
            <div className="space-y-4">
              {installSteps.map((step, index) => (
                <div key={step} className="border border-white/20 p-5">
                  <p className="text-sm font-semibold text-neutral-400">0{index + 1}</p>
                  <p className="mt-3 leading-7 text-neutral-100">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 text-center lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-neutral-500">Next step</p>
          <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">The brochure explains the company. The demo shows the product.</h2>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a href="https://vespera.systems" className="rounded-full bg-neutral-950 px-8 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-neutral-800">Go to demo</a>
            <a href="mailto:hello@vespera.systems?subject=Vespera%20Systems%20brochure%20site" className="rounded-full border border-neutral-300 px-8 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-neutral-950 transition hover:border-neutral-950">Contact Vespera</a>
          </div>
        </section>
      </main>
    </div>
  );
}
