// src/pages/swap.tsx
"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

// TypeScript nie wie o obiekcie window.Jupiter, więc musimy go zadeklarować
declare global {
    interface Window { Jupiter: any; }
}

const SwapPage: NextPage = () => {
    // Pobieramy publicKey, aby reagować na jego zmiany (połączenie/rozłączenie)
    const { publicKey } = useWallet();

    useEffect(() => {
        // Ta funkcja będzie się teraz uruchamiać za każdym razem, gdy zmieni się publicKey
        
        // Czekamy na załadowanie globalnego skryptu Jupiter
        const interval = setInterval(() => {
            if (window.Jupiter) {
                window.Jupiter.init({
                    endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_HOST,
                    displayMode: "integrated",
                    integratedTargetId: "integrated-terminal",
                    
                    // Bezpośrednio przekazujemy klucz publiczny.
                    // Jeśli jest null/undefined (rozłączony), widget to uwzględni.
                    userPublicKey: publicKey ? publicKey.toBase58() : null,
                });
                // Kończymy sprawdzanie, gdy widżet zostanie zainicjowany
                clearInterval(interval);
            }
        }, 250);

        // Czyszczenie interwału, gdy komponent zostanie odmontowany
        return () => clearInterval(interval);

    }, [publicKey]); // Efekt zależy teraz od publicKey, co zapewnia synchronizację.

    return (
        <div>
            <Head>
                <title>Phoenix Swap - Swap</title>
                <meta name="description" content="Swap your favorite tokens on Phoenix Swap." />
            </Head>
            <div className="flex-1 w-full flex items-center justify-center py-8 px-4">
                {/* Ten dynamiczny klucz gwarantuje, że Jupiter jest tworzony od nowa po zmianie portfela */}
                <div className="w-full max-w-md min-h-[600px] flex flex-col" key={publicKey?.toBase58() || 'disconnected'}>
                    <div id="integrated-terminal"></div>
                </div>
            </div>
        </div>
    );
};

export default SwapPage;