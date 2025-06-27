// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        {/* Ładujemy skrypt Jupiter na końcu body dla optymalnej wydajności */}
        <script src="https://terminal.jup.ag/main-v2.js" data-preload></script>
      </body>
    </Html>
  )
}