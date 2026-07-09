import Image from 'next/image';

export function ChatAccessGate() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <Image
          src="/logos/vespera-mark-dark.svg"
          alt="Vespera Systems"
          width={48}
          height={48}
          priority
          className="mx-auto size-12"
        />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">
          Chat access is by invitation
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          The Vespera research chat is currently limited to invited users.
          Email us and we&apos;ll set you up.
        </p>
        <a
          href="mailto:access@vesperasystems.com?subject=Vespera%20chat%20access"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-950 transition hover:bg-neutral-200"
        >
          Request access
        </a>
        <p className="mt-4 text-xs text-neutral-500">access@vesperasystems.com</p>
      </div>
    </div>
  );
}
