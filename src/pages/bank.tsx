// src/pages/bank.tsx
"use client";

import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import MyMultiButton from '../components/MyMultiButton';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface StakingToken {
  symbol: string;
  balance: number;
  stakedAmount: number;
  earnedRewards: number;
  logoURI: string;
}

interface StakingOption {
  type: 'auto' | 'manual';
  apy: string | null;
  staked: boolean;
  details?: string;
}

const BankPage: NextPage = () => {
  const { connected, publicKey } = useWallet();
  const [stakeAmount, setStakeAmount] = useState<string>('');

  const [phnxData, setPhnxData] = useState<StakingToken>({
    symbol: 'PHNX',
    balance: 0,
    stakedAmount: 0,
    earnedRewards: 0,
    logoURI: '/images/logo_feniks.png', 
  });

  const [stakingOptions, setStakingOptions] = useState<StakingOption[]>([
    { type: 'auto', apy: '120.5%', staked: false, details: "Your staked PHNX is automatically compounded for higher returns." },
    { type: 'manual', apy: '85.2%', staked: false, details: "Manually claim your rewards and re-stake as you wish." },
  ]);

  const [selectedStakingType, setSelectedStakingType] = useState<'auto' | 'manual' | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      setPhnxData(prev => ({
         ...prev,
        balance: Math.random() * 10000,
        stakedAmount: Math.random() * 5000,
        earnedRewards: Math.random() * 100,
      }));
    } else {
      setPhnxData(prev => ({ ...prev, balance: 0, stakedAmount: 0, earnedRewards: 0 }));
      setStakingOptions(prevOptions => prevOptions.map(opt => ({...opt, staked: false})));
      setSelectedStakingType(null);
    }
  }, [connected, publicKey]);

  const handleStake = () => {
    if (!connected) { alert("Please connect your wallet."); return; }
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount to stake."); return;
    }
    if (amount > phnxData.balance) {
      alert("Insufficient PHNX balance."); return;
    }
    alert(`Staking ${amount} ${phnxData.symbol} (simulation).`);
    setStakeAmount('');
  };

  const handleUnstake = () => {
    if (!connected) { alert("Please connect your wallet."); return; }
    alert(`Unstaking all PHNX (simulation).`);
  };

  const handleClaimRewards = () => {
    if (!connected) { alert("Please connect your wallet."); return; }
    if (phnxData.earnedRewards <=0) { alert("No rewards to claim."); return;}
    alert(`Claiming ${phnxData.earnedRewards.toFixed(4)} ${phnxData.symbol} rewards (simulation).`);
  };

  const autoCompoundBounty = 200;

  return (
    <div>
        <Head>
            <title>Phoenix Swap - Bank</title>
            <meta name="description" content="Stake your tokens and earn rewards in the Phoenix Bank." />
        </Head>
        <div className="flex-1 w-full py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8 md:mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-phoenix-text-primary mb-2">
                        Phoenix Bank
                    </h1>
                    <p className="text-md text-phoenix-text-secondary max-w-lg mx-auto">
                        Stake {phnxData.symbol} tokens to earn rewards and participate in the ecosystem.
                    </p>
                </div>

                <div className="bg-phoenix-container-bg p-4 rounded-xl shadow-lg border border-phoenix-border mb-8 text-center">
                    <h3 className="text-lg font-semibold text-phoenix-accent mb-1">Auto Compound Bounty</h3>
                    <p className="text-xs text-phoenix-text-secondary mb-2">
                        Claim this bounty to trigger auto-compounding for all users in the auto-pool. You&apos;ll receive a small percentage as a reward.
                    </p>
                    <button className="btn-secondary-phoenix py-1.5 px-4 text-sm">
                        Claim Bounty: {autoCompoundBounty.toFixed(2)} {phnxData.symbol}
                    </button>
                </div>

                <div className="bg-phoenix-container-bg p-6 rounded-xl shadow-xl border border-phoenix-border">
                    <div className="flex items-center mb-6">
                        {phnxData.logoURI && 
                            <Image
                                src={phnxData.logoURI} 
                                alt={phnxData.symbol} 
                                width={32} 
                                height={32} 
                                className="rounded-full mr-3" 
                            />
                        }
                        <h2 className="text-2xl font-semibold text-phoenix-text-primary">Stake {phnxData.symbol}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {stakingOptions.map(option => (
                        <div 
                            key={option.type} 
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedStakingType === option.type ? 'border-phoenix-accent ring-2 ring-phoenix-accent bg-phoenix-bg' : 'border-phoenix-border hover:border-phoenix-accent/70 bg-phoenix-bg/50'}`}
                            onClick={() => setSelectedStakingType(option.type)}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-lg font-semibold text-phoenix-text-primary">
                                    {option.type === 'auto' ? 'Automatic' : 'Manual'} Staking
                                </h4>
                                {option.staked && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Staked</span>}
                            </div>
                            <p className="text-xs text-phoenix-text-secondary mb-2">{option.details}</p>
                            <p className="text-sm font-medium">
                                APY: <span className={option.apy ? "text-phoenix-highlight" : "text-phoenix-text-secondary"}>{option.apy || "Not Voted"}</span>
                            </p>
                        </div>
                        ))}
                    </div>

                    {selectedStakingType && (
                        <div className="border-t border-phoenix-border pt-6">
                            {connected ? (
                                <>
                                    <div className="mb-4">
                                        <label htmlFor="stakeAmount" className="block text-sm font-medium text-phoenix-text-secondary mb-1">
                                        Amount to Stake
                                        </label>
                                        <input type="number" id="stakeAmount" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="0.0" className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-3 text-phoenix-text-primary outline-none focus:border-phoenix-accent placeholder-phoenix-text-secondary/70" />
                                        <p className="text-xs text-phoenix-text-secondary mt-1">Wallet Balance: {phnxData.balance.toFixed(4)} {phnxData.symbol}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                        <button onClick={handleStake} className="w-full btn-primary-phoenix py-2.5 text-sm font-semibold" disabled={!connected || !stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > phnxData.balance}>
                                            Stake {phnxData.symbol}
                                        </button>
                                        <button onClick={handleUnstake} className="w-full btn-secondary-phoenix py-2.5 text-sm font-semibold" disabled={!connected || phnxData.stakedAmount <= 0}>
                                            Unstake All
                                        </button>
                                    </div>
                                    <div className="bg-phoenix-bg p-4 rounded-lg border border-phoenix-border">
                                        <p className="text-sm text-phoenix-text-secondary mb-1">Your Staked {phnxData.symbol}:</p>
                                        <p className="text-xl font-semibold text-phoenix-text-primary mb-3">{phnxData.stakedAmount.toFixed(4)}</p>
                                        <p className="text-sm text-phoenix-text-secondary mb-1">{phnxData.symbol} Earned:</p>
                                        <p className="text-xl font-semibold text-phoenix-highlight mb-3">{phnxData.earnedRewards.toFixed(4)}</p>
                                        <button onClick={handleClaimRewards} className="w-full btn-primary-phoenix py-2 text-sm bg-opacity-80 hover:bg-opacity-100" disabled={!connected || phnxData.earnedRewards <= 0}>
                                            Claim Rewards
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <MyMultiButton className="btn-primary-phoenix !h-12 !text-base" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default BankPage;