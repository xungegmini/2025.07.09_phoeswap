// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        {/* POPRAWKA: Użycie komponentu Script z odpowiednią strategią */}
        <Script src="https://terminal.jup.ag/main-v2.js" strategy="afterInteractive" />
      </body>
    </Html>
  )
}