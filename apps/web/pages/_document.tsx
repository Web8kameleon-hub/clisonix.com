import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Minimal custom Document ensures the Next.js runtime always emits the compiled
 * `pages/_document.js` artifact expected by the server boot logic. Without an
 * explicit document file, the production build on Windows skipped generating
 * the asset, leading to an ENOENT during `next start`.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
