// src/pages/liquidity.tsx
"use client";

import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TokenInfo } from '@solana/spl-token-registry';
import TokenModal from '../components/TokenModal';
import { PlusCircleIcon, ChevronDownIcon as ChevronDownMiniIcon } from '@heroicons/react/24/outline'; 
import { toast } from 'sonner';
import Image from 'next/image'; // POPRAWKA: Import komponentu Image

const JUPITER_STRICT_TOKEN_LIST_URL = 'https://token.jup.ag/strict';

interface LiquidityPosition { id: string; tokenA: TokenInfo; tokenB: TokenInfo; amountA: number; amountB: number; shareOfPool: number; lpTokenBalance?: number; }

const LiquidityPage: NextPage = () => {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();

  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [tokenA, setTokenA] = useState<TokenInfo | undefined>();
  const [tokenB, setTokenB] = useState<TokenInfo | undefined>();
  const [amountA, setAmountA] = useState<string>('');
  const [amountB, setAmountB] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenFieldToUpdate, setTokenFieldToUpdate] = useState<'A' | 'B' | null>(null);
  
  useEffect(() => {
    fetch(JUPITER_STRICT_TOKEN_LIST_URL)
      .then(res => res.json())
      .then((data: TokenInfo[]) => {
        setTokens(data);
        setTokenA(data.find(t => t.symbol === 'SOL'));
        setTokenB(data.find(t => t.symbol === 'USDC'));
      });
  }, []);

  const openModal = (field: 'A' | 'B') => {
    setTokenFieldToUpdate(field);
    setIsModalOpen(true);
  };

  const handleTokenSelect = (token: TokenInfo) => {
    if (tokenFieldToUpdate === 'A') setTokenA(token);
    else if (tokenFieldToUpdate === 'B') setTokenB(token);
    setTokenFieldToUpdate(null);
  };

  const handleAddLiquidity = () => {
    if (!connected) { toast.error("Please connect your wallet first."); return; }
    if (!tokenA || !tokenB || !amountA || !amountB) { toast.error("Please select tokens and enter amounts."); return; }
    toast.info(`Adding liquidity for ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol} (simulation).`);
  };

  return (
    <div>
        <Head>
            <title>Phoenix Swap - Liquidity</title>
            <meta name="description" content="Provide liquidity and earn fees on Phoenix Swap." />
        </Head>
        <div className="flex-1 w-full py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8 md:mb-10"><h1 className="text-3xl md:text-4xl font-bold text-phoenix-text-primary mb-2">Liquidity</h1><p className="text-md text-phoenix-text-secondary max-w-lg mx-auto">Provide liquidity to earn trading fees. Select a pair to get started.</p></div>
                <div className="bg-phoenix-container-bg p-6 rounded-xl shadow-xl border border-phoenix-border mb-10">
                    <h2 className="text-xl font-semibold text-phoenix-text-primary mb-6">Add Liquidity</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-phoenix-text-secondary mb-1">Token A</label>
                        <div className="flex gap-2">
                            <button onClick={() => openModal('A')} disabled={!connected} className="flex-shrink-0 flex items-center bg-phoenix-bg border border-phoenix-border hover:border-phoenix-accent text-phoenix-text-primary py-2.5 px-4 rounded-lg text-sm font-medium min-w-[150px] justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                                {tokenA ? (<>{tokenA.logoURI && <Image src={tokenA.logoURI} alt={tokenA.symbol} width={20} height={20} className="h-5 w-5 mr-2 rounded-full" />}{tokenA.symbol}</>) : 'Select'}<ChevronDownMiniIcon className="h-5 w-5 ml-1 text-phoenix-text-secondary" />
                            </button>
                            <input type="number" placeholder="0.0" value={amountA} onChange={(e) => setAmountA(e.target.value)} className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-2.5 text-phoenix-text-primary outline-none focus:border-phoenix-accent" />
                        </div>
                    </div>
                    <div className="flex justify-center my-4"><PlusCircleIcon className="h-7 w-7 text-phoenix-text-secondary" /></div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-phoenix-text-secondary mb-1">Token B</label>
                        <div className="flex gap-2">
                            <button onClick={() => openModal('B')} disabled={!connected} className="flex-shrink-0 flex items-center bg-phoenix-bg border border-phoenix-border hover:border-phoenix-accent text-phoenix-text-primary py-2.5 px-4 rounded-lg text-sm font-medium min-w-[150px] justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                                {tokenB ? (<>{tokenB.logoURI && <Image src={tokenB.logoURI} alt={tokenB.symbol} width={20} height={20} className="h-5 w-5 mr-2 rounded-full" />}{tokenB.symbol}</>) : 'Select'}<ChevronDownMiniIcon className="h-5 w-5 ml-1 text-phoenix-text-secondary" />
                            </button>
                            <input type="number" placeholder="0.0" value={amountB} onChange={(e) => setAmountB(e.target.value)} className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-2.5 text-phoenix-text-primary outline-none focus:border-phoenix-accent" />
                        </div>
                    </div>
                    
                    {connected ? (
                        <button onClick={handleAddLiquidity} className="w-full btn-primary-phoenix py-3 text-base font-semibold" disabled={!tokenA || !tokenB || !amountA || (parseFloat(amountA) <=0) || !amountB || (parseFloat(amountB) <=0) }>
                            Add Liquidity
                        </button>
                    ) : (
                        <button className="w-full btn-secondary-phoenix py-3 text-base font-semibold opacity-70 cursor-not-allowed" disabled>
                            Connect Wallet to Add Liquidity
                        </button>
                    )}
                </div>
            </div>
        </div>
        <TokenModal tokens={tokens} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelectToken={handleTokenSelect} />
    </div>
  );
};

export default LiquidityPage;