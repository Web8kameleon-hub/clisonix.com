import type { AppProps } from 'next/app';

/**
 * Explicit custom App keeps the legacy pages router runtime happy across
 * multi-platform builds while still delegating entirely to the page component.
 */
export default function NeurosonixApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
