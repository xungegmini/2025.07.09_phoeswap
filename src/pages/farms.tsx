// src/pages/farms.tsx
"use client";

import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArchiveBoxXMarkIcon, MagnifyingGlassIcon, SparklesIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import MyMultiButton from '../components/MyMultiButton'; // Poprawiony import

// Typ dla Farmy
interface Farm {
  id: string;
  lpTokenName: string;
  tokenA_logo: string;
  tokenB_logo: string;
  apr: string;
  earned: number;
  stakedLpAmount: number;
  totalLiquidity: string;
  rewardsTokenSymbol: string;
  getLpLink: string;
}

// Przykładowe dane Farm, aby zapełnić UI
const FARMS_DATA: Farm[] = [
  { id: 'phnx-sol-lp', lpTokenName: 'PHNX-SOL LP', tokenA_logo: '/images/logo_feniks.png', tokenB_logo: '/images/tokens/sol.png', apr: '150.25%', earned: 0, stakedLpAmount: 0, totalLiquidity: '$250,000', rewardsTokenSymbol: 'PHNX', getLpLink: '/liquidity?tokenA=phnx&tokenB=sol', },
  { id: 'usdc-sol-lp', lpTokenName: 'USDC-SOL LP', tokenA_logo: '/images/tokens/usdc.png', tokenB_logo: '/images/tokens/sol.png', apr: '85.60%', earned: 0, stakedLpAmount: 0, totalLiquidity: '$1,200,000', rewardsTokenSymbol: 'PHNX', getLpLink: '/liquidity?tokenA=usdc&tokenB=sol', },
];

const FarmCard: React.FC<{ farm: Farm; connected: boolean }> = ({ farm, connected }) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStake = () => { alert(`Staking ${stakeAmount} ${farm.lpTokenName} (simulation)`); };
  const handleUnstake = () => { alert(`Unstaking all ${farm.lpTokenName} (simulation)`); };
  const handleHarvest = () => { alert(`Harvesting ${farm.earned} ${farm.rewardsTokenSymbol} (simulation)`); };

  return (
    <div className="bg-phoenix-bg p-4 rounded-lg shadow-md border border-phoenix-border transition-all duration-300">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className="flex -space-x-2 mr-3">
            <Image src={farm.tokenA_logo} alt="Token A" width={32} height={32} className="rounded-full border-2 border-phoenix-container-bg object-cover" />
            <Image src={farm.tokenB_logo} alt="Token B" width={32} height={32} className="rounded-full border-2 border-phoenix-container-bg object-cover" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-phoenix-text-primary">{farm.lpTokenName}</h3>
            <Link href={farm.getLpLink} className="text-xs text-phoenix-accent hover:underline">
              Get LP Tokens
            </Link>
          </div>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} aria-expanded={isExpanded}>
          <ChevronDownIcon className={`w-5 h-5 text-phoenix-text-secondary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
        <div className="text-phoenix-text-secondary">APR:</div>
        <div className="text-phoenix-highlight font-medium text-right">{farm.apr}</div>
        <div className="text-phoenix-text-secondary">Earn:</div>
        <div className="text-phoenix-text-primary font-medium text-right">{farm.rewardsTokenSymbol}</div>
        <div className="text-phoenix-text-secondary">Total Liquidity:</div>
        <div className="text-phoenix-text-primary font-medium text-right">{farm.totalLiquidity}</div>
      </div>

      {isExpanded && (
        <div className="border-t border-phoenix-border pt-4 mt-3 space-y-4">
          {connected ? (
            <>
              <div>
                <div className="flex justify-between text-xs text-phoenix-text-secondary mb-1">
                  <span>{farm.rewardsTokenSymbol} Earned</span>
                  <span>{farm.earned.toFixed(4)}</span>
                </div>
                <button onClick={handleHarvest} disabled={farm.earned <= 0} className="w-full btn-secondary-phoenix py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                  Harvest
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs text-phoenix-text-secondary mb-1">
                   <span>Your Staked LP</span>
                   <span>{farm.stakedLpAmount.toFixed(4)}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number" 
                    placeholder="Amount to stake" 
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full bg-phoenix-container-bg border border-phoenix-border rounded-md p-1.5 text-xs text-phoenix-text-primary outline-none focus:border-phoenix-accent"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={handleStake} className="flex-1 btn-primary-phoenix py-1.5 text-xs">Stake</button>
                  <button onClick={handleUnstake} disabled={farm.stakedLpAmount <= 0} className="flex-1 btn-secondary-phoenix py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Unstake All</button>
                </div>
              </div>
            </>
          ) : (
             <MyMultiButton className="w-full !h-10 !text-sm btn-primary-phoenix" />
          )}
        </div>
      )}
    </div>
  );
};

const FarmsPage: NextPage = () => {
    const { connected } = useWallet();
    const [searchTerm, setSearchTerm] = useState('');
    const [stakedOnly, setStakedOnly] = useState(false);
    
    const filteredFarms = FARMS_DATA.filter(farm => {
        const matchesSearch = farm.lpTokenName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStaked = stakedOnly ? farm.stakedLpAmount > 0 : true;
        return matchesSearch && matchesStaked;
    });

    return (
        <div>
            <Head>
                <title>Phoenix Swap - Farms</title>
                <meta name="description" content="Stake LP tokens to earn rewards on Phoenix Swap." />
            </Head>
            <div className="flex-1 w-full py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    
                    <div className="text-center mb-8 md:mb-10">
                        <SparklesIcon className="h-12 w-12 text-phoenix-accent mx-auto mb-3" />
                        <h1 className="text-3xl md:text-4xl font-bold text-phoenix-text-primary mb-2">
                            Phoenix Farms
                        </h1>
                        <p className="text-md text-phoenix-text-secondary max-w-lg mx-auto">
                            Stake your LP (Liquidity Provider) tokens to earn $PHNX and other rewards.
                        </p>
                    </div>
                    
                    <>
                        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative flex-grow w-full sm:w-auto">
                                <MagnifyingGlassIcon className="h-5 w-5 text-phoenix-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search Farms (e.g., PHNX-SOL)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-2.5 pl-10 text-phoenix-text-primary outline-none focus:border-phoenix-accent placeholder-phoenix-text-secondary"
                                />
                            </div>
                            <div className="flex items-center">
                                <label htmlFor="stakedOnly" className="text-sm text-phoenix-text-secondary mr-2">Staked only:</label>
                                <button
                                    onClick={() => setStakedOnly(!stakedOnly)}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${stakedOnly ? 'bg-phoenix-accent' : 'bg-phoenix-border'}`}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${stakedOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {filteredFarms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredFarms.map(farm => (
                                    <FarmCard key={farm.id} farm={farm} connected={connected} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-phoenix-text-secondary bg-phoenix-container-bg rounded-lg border border-phoenix-border">
                                <ArchiveBoxXMarkIcon className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                                <p>No farms match your criteria.</p>
                            </div>
                        )}
                    </>
                </div>
            </div>
        </div>
    );
};

export default FarmsPage;