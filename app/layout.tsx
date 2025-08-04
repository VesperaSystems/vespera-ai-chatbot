import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { HelpScoutBeacon } from '@/components/helpscout-beacon';
import { cn } from '@/lib/utils';

import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'Vespera Systems',
  description: 'Quantitative Trading and Research',
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

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
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
  // Suppress console errors and warnings to prevent cursor errors in browser
  if (typeof window !== 'undefined') {
    var originalConsoleError = console.error;
    var originalConsoleWarn = console.warn;
    
    console.error = function() {
      // Only log critical errors, suppress most console errors
      var args = Array.prototype.slice.call(arguments);
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('Critical') || args[0].includes('Fatal'))) {
        originalConsoleError.apply(console, args);
      }
      // Silently ignore other errors
    };
    
    console.warn = function() {
      // Only log critical warnings, suppress most console warnings
      var args = Array.prototype.slice.call(arguments);
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('Critical') || args[0].includes('Security'))) {
        originalConsoleWarn.apply(console, args);
      }
      // Silently ignore other warnings
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
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <SessionProvider>
            <main className="flex min-h-screen flex-col">{children}</main>
            <HelpScoutBeacon />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
