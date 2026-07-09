import Image from 'next/image';
import Link from 'next/link';

const surfaces = [
  ['AI research chat', 'Conversational intelligence over research, documents, and market data.'],
  ['Market graph', 'A spatial view of companies, investors, sectors, and relationships.'],
  ['Tenant workspaces', 'Private, authenticated client routes with tenant-scoped data.'],
];

const platform = [
  {
    title: 'AI research assistant',
    body: 'A conversational interface over your research, documents, and market data — the working surface of the Vespera product environment.',
  },
  {
    title: 'Market graph',
    body: 'A spatial visualization of companies, investors, sectors, relationships, and signals, tuned per desk and rendered for large-format displays.',
  },
  {
    title: 'Console & configuration',
    body: 'An operator surface for selecting display presets, tuning graph density, and preparing the room-ready display mode.',
  },
  {
    title: 'Tenant workspaces',
    body: 'Dedicated client routes such as /ubs and /sjp with authentication and tenant-scoped data access, separate from the public site.',
  },
];

const audiences = [
  ['Family offices', 'A clear, always-on view of themes, managers, companies, and relationships.'],
  ['Private equity firms', 'Deal context, sector movement, and portfolio signals visible in the room.'],
  ['Asset managers', 'Research priorities, market structure, and conviction signals shared across teams.'],
];

const pricing = [
  ['Platform subscription', 'From GBP 2,950 per month', 'Access to the Vespera product environment, configured dashboards, managed views, and support.'],
  ['Display installation', 'Scoped per office', 'Screen specification, delivery coordination, AV/facilities handoff, installation planning, and commissioning support.'],
  ['Tenant workspace', 'By arrangement', 'Private tenant paths with authentication and data access, configured for your firm.'],
];

const installSteps = [
  ['Discovery', 'We confirm the room, audience, screen size, data sources, security expectations, and the decision-making workflow.'],
  ['Specification', 'We agree the display, media player, mounting approach, connectivity, and whether your AV partner or ours completes the install.'],
  ['Delivery', 'Screens and hardware are scheduled around building access, facilities rules, and office operating hours.'],
  ['Commissioning', 'The system is connected, configured, calibrated, tested, and handed over with launch support.'],
];

export default function HomePage() {
  return (
    <div className="min-h-screen text-neutral-50">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="inline-flex items-center" aria-label="Vespera Systems home">
          <Image
            src="/logos/vespera-lockup-dark.svg"
            alt="Vespera Systems"
            width={229}
            height={80}
            priority
            className="h-auto w-44 sm:w-52"
          />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-neutral-400 md:flex">
          <a href="#platform" className="transition hover:text-white">Platform</a>
          <a href="#displays" className="transition hover:text-white">Displays</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
          <a href="#delivery" className="transition hover:text-white">Delivery</a>
        </nav>
        <a
          href="https://vespera.systems"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-100 transition hover:border-white/40 hover:bg-white/10 sm:px-5 sm:tracking-[0.22em]"
        >
          View demo
        </a>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-24 lg:pt-16">
        <div>
          <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-neutral-300">
            Vespera Systems — London
          </div>
          <h1 className="mt-8 max-w-5xl text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
            The intelligence layer for private markets.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-300 sm:text-xl">
            Vespera designs and delivers intelligence systems for family offices, PE firms, and asset managers — AI research chat, spatial market graphs, and large-format office displays, installed and commissioned end to end.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="https://vespera.systems"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-bold uppercase tracking-[0.22em] text-neutral-950 transition hover:bg-neutral-200"
            >
              Open vespera.systems
            </a>
            <a
              href="mailto:hello@vespera.systems?subject=Vespera%20Systems%20display%20proposal"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Request proposal
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-[56px] bg-white/8 blur-3xl" />
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-neutral-950/90 p-5 shadow-[0_0_130px_rgba(255,255,255,0.08)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />
            <div className="relative rounded-[32px] border border-white/15 bg-black/35 p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-neutral-300">Product system</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">
                    One platform, three surfaces
                  </h2>
                </div>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-200">
                  Live
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {surfaces.map(([title, body]) => (
                  <article key={title} className="rounded-3xl border border-white/[0.08] bg-white/[0.045] p-5">
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">{body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.26em] text-neutral-400">Platform</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            Intelligence in the workflow and in the room.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {platform.map((item) => (
            <article key={item.title} className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Product surface</p>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-neutral-300">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="displays" className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
        <div className="grid gap-6 rounded-[38px] border border-white/10 bg-neutral-950/75 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-neutral-400">Who it&apos;s for</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              A physical display layer for investment teams.
            </h2>
            <p className="mt-5 text-base leading-7 text-neutral-300">
              Large-format office displays bring the platform into the room: always-on, configured for your desk, and commissioned in your office.
            </p>
          </div>
          <div className="grid gap-3">
            {audiences.map(([label, body]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">{label}</p>
                <p className="mt-3 text-lg leading-7 text-neutral-100">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.26em] text-neutral-400">Pricing</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            Guide pricing for subscription, screens, and tenant access.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {pricing.map(([name, price, detail]) => (
            <article key={name} className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">{name}</p>
              <p className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-white">{price}</p>
              <p className="mt-6 text-sm leading-7 text-neutral-300">{detail}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm leading-6 text-neutral-400">
          Pricing is indicative; proposals are scoped per office.{' '}
          <a
            href="mailto:hello@vespera.systems?subject=Vespera%20Systems%20display%20proposal"
            className="text-neutral-200 underline decoration-white/30 underline-offset-4 transition hover:text-white"
          >
            Request a proposal
          </a>
          .
        </p>
      </section>

      <section id="delivery" className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
        <div className="overflow-hidden rounded-[38px] border border-white/15 bg-white/[0.055] p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-neutral-300">Delivery and commissioning</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                We arrange the screen, installation, and system handover.
              </h2>
              <p className="mt-6 text-base leading-8 text-neutral-300">
                Vespera can coordinate with your internal facilities, IT, security, and AV teams, or help manage the practical delivery path end to end.
              </p>
            </div>
            <div className="grid gap-3">
              {installSteps.map(([title, body], index) => (
                <article key={title} className="grid gap-4 rounded-[28px] border border-white/10 bg-black/20 p-5 sm:grid-cols-[4rem_1fr]">
                  <div className="font-mono text-sm text-neutral-300">0{index + 1}</div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-300">{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 text-center lg:px-10">
        <p className="text-xs uppercase tracking-[0.26em] text-neutral-400">Next step</p>
        <h2 className="mx-auto mt-5 max-w-4xl text-balance text-5xl font-semibold tracking-[-0.06em] text-white sm:text-7xl">
          See the product before you see the proposal.
        </h2>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="https://vespera.systems"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.22em] text-neutral-950 transition hover:bg-neutral-200"
          >
            Go to demo
          </a>
          <a
            href="mailto:hello@vespera.systems?subject=Vespera%20Systems%20brochure%20site"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Contact Vespera
          </a>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10">
        <div className="flex flex-col items-center gap-4 border-t border-white/10 pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <Image
              src="/logos/vespera-mark-dark.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <p className="text-sm text-neutral-400">Vespera Systems Ltd</p>
          </div>
          <a href="mailto:hello@vespera.systems" className="text-sm text-neutral-400 transition hover:text-white">
            hello@vespera.systems
          </a>
        </div>
        <p className="mt-8 text-center text-[11px] leading-5 text-neutral-600 sm:text-left">
          Daniel Molloy Technology Due Diligence is a trading name of Daniel Molloy Ltd, a company registered in England and Wales.
          Company number: 15228212. Registered office: 5 Providence Court, Pynes Hill, Exeter, Devon, United Kingdom, EX2 5JL.
          VAT number: GB452010546.
        </p>
      </footer>
    </div>
  );
}
