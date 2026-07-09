import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { HelpScoutBeacon } from '@/components/helpscout-beacon';
import { cn } from '@/lib/utils';

import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vesperasystems.com'),
  title: 'Vespera Systems | Intelligence Displays',
  description:
    'Vespera Systems delivers AI research chat, spatial market graphs, and large-format intelligence displays for private markets and asset management.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

const LIGHT_THEME_COLOR = '#ffffff';
const DARK_THEME_COLOR = '#ffffff';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

const SUPPRESS_ERRORS_SCRIPT = `\
(function() {
  if (typeof window !== 'undefined') {
    var originalConsoleError = console.error;
    var originalConsoleWarn = console.warn;

    console.error = function() {
      var args = Array.prototype.slice.call(arguments);
      if (args[0] && typeof args[0] === 'string' &&
          (args[0].includes('Critical') || args[0].includes('Fatal'))) {
        originalConsoleError.apply(console, args);
      }
    };

    console.warn = function() {
      var args = Array.prototype.slice.call(arguments);
      if (args[0] && typeof args[0] === 'string' &&
          (args[0].includes('Critical') || args[0].includes('Security'))) {
        originalConsoleWarn.apply(console, args);
      }
    };
  }
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: SUPPRESS_ERRORS_SCRIPT,
          }}
        />
      </head>
      <body
        className={cn(
          'min-h-dvh bg-background font-sans antialiased',
          geist.variable,
          geistMono.variable,
        )}
      >
        <Toaster position="top-center" />
        <SessionProvider>
          <main className="flex min-h-screen flex-col">{children}</main>
          <HelpScoutBeacon />
        </SessionProvider>
      </body>
    </html>
  );
}
