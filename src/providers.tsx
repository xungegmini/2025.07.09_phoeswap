// src/providers.tsx
"use client";

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// ZMIANA: Usunęliśmy import PhantomWalletAdapter
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

import '@solana/wallet-adapter-react-ui/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;
  
  const endpoint = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST;
    if (!url) {
      console.error("CRITICAL: NEXT_PUBLIC_SOLANA_RPC_HOST not set!");
      return 'https://api.mainnet-beta.solana.com';
    }
    return url;
  }, []);

  const wallets = useMemo(
    () => [
      // ZMIANA: Usunęliśmy `new PhantomWalletAdapter()`.
      // Biblioteka sama wykryje Phantoma jako "Standard Wallet".
      // Zostawiamy Solflare jako przykład drugiego portfela.
      new SolflareWalletAdapter({ network }),
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