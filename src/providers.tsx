// src/providers.tsx
"use client";

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

import '@solana/wallet-adapter-react-ui/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  // UWAGA: Używamy sieci docelowej, np. Devnet do testów.
  // Zmień na Mainnet, gdy będziesz gotowy do wdrożenia produkcyjnego.
  const network = WalletAdapterNetwork.Devnet;
  
  const endpoint = useMemo(() => {
    // ZMIANA: Używamy jednej, spójnej nazwy zmiennej.
    const url = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST;
    if (!url) {
      console.warn("NEXT_PUBLIC_SOLANA_RPC_HOST not set, falling back to public Devnet RPC.");
      return 'https://api.devnet.solana.com';
    }
    return url;
  }, []);

  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter({ network }),
      // Phantom jest wykrywany automatycznie przez WalletStandard
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}