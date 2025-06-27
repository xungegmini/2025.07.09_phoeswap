// src/components/MyMultiButton.tsx
"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamicznie importujemy WalletMultiButton z biblioteki UI,
// z całkowitym wyłączeniem renderowania po stronie serwera (ssr: false).
// To jest nasze ostateczne, "pancerne" rozwiązanie problemu z portfelem.
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// Nasz komponent MyMultiButton po prostu renderuje tę dynamiczną wersję,
// przekazując dalej wszystkie klasy stylów, które zdefiniowaliśmy w innych miejscach.
const MyMultiButton = ({ className = "" }) => {
  return (
    <WalletMultiButtonDynamic className={className} />
  );
};

export default MyMultiButton;