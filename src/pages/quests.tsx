// src/pages/quests.tsx
"use client";

import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircleIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// Typ dla Questu (bez zmian)
interface Quest {
  id: number;
  title: string;
  description: string;
  rewardAmount: number;
  rewardToken: 'PHNX';
  imageUrl: string;
  points: number;
  slug: string;
  status: 'active' | 'completed' | 'upcoming';
}

// --- ZMIANA: Poprawiono i zaktualizowano statusy dla demonstracji ---
const QUESTS_DATA: Quest[] = [
    { id: 0, title: 'Rise Together', description: 'Join The Phoenix World in its first year of launch!', points: 10, rewardAmount: 100, rewardToken: 'PHNX', imageUrl: '/images/quests/0.webp', slug: 'rise-together', status: 'upcoming' },
    { id: 1, title: 'Spread the Flame', description: 'Join a tribe to unite with the community.', points: 5, rewardAmount: 50, rewardToken: 'PHNX', imageUrl: '/images/quests/1.webp', slug: 'spread-the-flame', status: 'upcoming' },
    { id: 2, title: 'Ancient Archives', description: 'Read The Phoenix World storyline.', points: 5, rewardAmount: 50, rewardToken: 'PHNX', imageUrl: '/images/quests/2.webp', slug: 'ancient-archives', status: 'upcoming' },
    { id: 3, title: 'Social Phoenix', description: 'Follow The Phoenix World on X.', points: 5, rewardAmount: 50, rewardToken: 'PHNX', imageUrl: '/images/quests/3.webp', slug: 'social-phoenix', status: 'upcoming' },
    { id: 4, title: 'Echoing Flames', description: 'Retweet the announcement of The Phoenix World.', points: 5, rewardAmount: 50, rewardToken: 'PHNX', imageUrl: '/images/quests/4.webp', slug: 'echoing-flames', status: 'upcoming' },
    { id: 5, title: 'Community Beacon', description: 'Join The Phoenix World Telegram.', points: 5, rewardAmount: 50, rewardToken: 'PHNX', imageUrl: '/images/quests/5.webp', slug: 'community-beacon', status: 'upcoming' },
    { id: 6, title: 'A New World', description: 'Connect your wallet to The Phoenix World.', points: 10, rewardAmount: 100, rewardToken: 'PHNX', imageUrl: '/images/quests/6.webp', slug: 'a-new-world', status: 'upcoming' },
    { id: 7, title: 'First Flight', description: 'Buy $PHNX token.', points: 15, rewardAmount: 150, rewardToken: 'PHNX', imageUrl: '/images/quests/7.webp', slug: 'first-flight', status: 'upcoming' },
    { id: 8, title: 'Phoenix Guardian', description: 'Hold more than 10,000 $PHNX tokens.', points: 15, rewardAmount: 150, rewardToken: 'PHNX', imageUrl: '/images/quests/8.webp', slug: 'phoenix-guardian', status: 'upcoming' },
    { id: 9, title: 'Sacred Fire', description: 'Burn $PHNX tokens.', points: 10, rewardAmount: 100, rewardToken: 'PHNX', imageUrl: '/images/quests/9.webp', slug: 'sacred-fire', status: 'upcoming' },
    { id: 10, title: 'The Oracle’s Wisdom', description: 'Try The Phoenix AI Chat.', points: 10, rewardAmount: 100, rewardToken: 'PHNX', imageUrl: '/images/quests/10.webp', slug: 'oracles-wisdom', status: 'upcoming' },
    { id: 11, title: 'The Alchemist', description: 'Use PhoenixSwap to swap tokens.', points: 15, rewardAmount: 150, rewardToken: 'PHNX', imageUrl: '/images/quests/11.webp', slug: 'the-alchemist', status: 'upcoming' },
    { id: 12, title: 'Master of Elements', description: 'Use the Smart Swap feature.', points: 10, rewardAmount: 100, rewardToken: 'PHNX', imageUrl: '/images/quests/12.webp', slug: 'master-of-elements', status: 'upcoming' },
    { id: 13, title: 'The Provider', description: 'Add liquidity to any pool.', points: 20, rewardAmount: 200, rewardToken: 'PHNX', imageUrl: '/images/quests/13.webp', slug: 'the-provider', status: 'upcoming' },
    { id: 14, title: 'The Harvester', description: 'Stake your LP tokens in PhoenixFarm.', points: 20, rewardAmount: 200, rewardToken: 'PHNX', imageUrl: '/images/quests/14.webp', slug: 'the-harvester', status: 'upcoming' },
    { id: 15, title: 'The Banker', description: 'Stake your $PHNX tokens in PhoenixBank.', points: 20, rewardAmount: 200, rewardToken: 'PHNX', imageUrl: '/images/quests/15.webp', slug: 'the-banker', status: 'upcoming' },
    { id: 16, title: 'The Creator', description: 'Create your own SPL token in the Token Factory.', points: 10, rewardAmount: 100, rewardToken: 'PHNX', imageUrl: '/images/quests/16.webp', slug: 'the-creator', status: 'upcoming' },
    { id: 17, title: 'The Visionary', description: 'Participate in a presale on the Launchpad.', points: 15, rewardAmount: 150, rewardToken: 'PHNX', imageUrl: '/images/quests/17.webp', slug: 'the-visionary', status: 'upcoming' },
    { id: 18, title: 'The Messenger', description: 'Invite friends to The Phoenix World.', points: 15, rewardAmount: 150, rewardToken: 'PHNX', imageUrl: '/images/quests/18.webp', slug: 'the-messenger', status: 'upcoming' },
    { id: 19, title: 'Tribe Champion', description: 'Become one of the top 100 in your tribe.', points: 25, rewardAmount: 250, rewardToken: 'PHNX', imageUrl: '/images/quests/19.webp', slug: 'tribe-champion', status: 'upcoming' },
    { id: 20, title: 'Top Phoenix', description: 'Become one of the top 100 users overall.', points: 30, rewardAmount: 300, rewardToken: 'PHNX', imageUrl: '/images/quests/20.webp', slug: 'top-phoenix', status: 'upcoming' },
    { id: 21, title: 'The Collector', description: 'Collect 10 NFT Badges from completed quests.', points: 20, rewardAmount: 200, rewardToken: 'PHNX', imageUrl: '/images/quests/21.webp', slug: 'the-collector', status: 'upcoming' },
    { id: 22, title: 'The Grandmaster', description: 'Collect all 25 NFT Badges.', points: 50, rewardAmount: 500, rewardToken: 'PHNX', imageUrl: '/images/quests/22.webp', slug: 'the-grandmaster', status: 'upcoming' },
    { id: 23, title: 'Loyalty emblem', description: 'Log in to The Phoenix World 7 days in a row.', points: 10, rewardAmount: 100, rewardToken: 'PHNX', imageUrl: '/images/quests/23.webp', slug: 'loyalty-emblem', status: 'upcoming' },
    { id: 24, title: 'The Elder', description: 'Be an active user for over 3 months.', points: 25, rewardAmount: 250, rewardToken: 'PHNX', imageUrl: '/images/quests/24.webp', slug: 'the-elder', status: 'upcoming' },
    { id: 25, title: 'The Billionaire', description: 'Hold more than 1 billion $PHNX tokens.', points: 100, rewardAmount: 1000, rewardToken: 'PHNX', imageUrl: '/images/quests/25.webp', slug: 'the-billionaire', status: 'upcoming' },
];

const QuestCard: React.FC<{ quest: Quest; connected: boolean }> = ({ quest, connected }) => {
  const isButtonDisabled = !connected || quest.status !== 'active';
  
  return (
    <div className="border border-phoenix-border bg-phoenix-container-bg rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col group">
      <div className="relative w-full h-64"> 
        <Image 
            src={quest.imageUrl} 
            alt={quest.title} 
            layout="fill" 
            objectFit="cover" 
            className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-phoenix-text-primary mb-2">{quest.title}</h3>
        <p className="text-sm text-phoenix-text-secondary mb-4 flex-grow h-10 line-clamp-2">{quest.description}</p>
        <div className="flex justify-between items-center text-xs text-phoenix-text-secondary mb-5 pt-4 border-t border-phoenix-border">
            <span className="font-semibold text-phoenix-highlight">Reward: {quest.rewardAmount} ${quest.rewardToken}</span>
            <span className="font-semibold text-phoenix-text-primary">{quest.points} Points</span>
        </div>
        <button
            disabled={isButtonDisabled}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phoenix-accent focus-visible:ring-offset-phoenix-bg h-9 px-4 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ 
                backgroundColor: quest.status === 'active' ? 'var(--phoenix-accent)' : '#27272A',
                color: quest.status === 'active' ? 'black' : 'var(--phoenix-text-secondary)'
            }}
        >
          {quest.status === 'completed' ? 'Completed' : quest.status === 'upcoming' ? 'Coming Soon' : 'Start Quest'}
        </button>
      </div>
    </div>
  );
};

const QuestsPage: NextPage = () => {
    const { connected } = useWallet();
    const [filter, setFilter] = useState<'active' | 'upcoming' | 'completed'>('active');

    const filteredQuests = QUESTS_DATA.filter(quest => quest.status === filter);

    return (
        <div>
            <Head>
                <title>Phoenix Swap - Quests</title>
                <meta name="description" content="Complete quests and earn rewards on Phoenix Swap." />
            </Head>
            <div className="flex-1 w-full py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <section className="text-center mb-10 md:mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-phoenix-text-primary mb-3">Quest Board</h1>
                        <p className="text-lg text-phoenix-text-secondary max-w-2xl mx-auto">Engage with the Phoenix ecosystem, complete tasks, and earn exclusive rewards and points.</p>
                    </section>

                    <section className="mb-8">
                        <div className="flex justify-center items-center bg-phoenix-container-bg p-1.5 rounded-lg max-w-xs mx-auto">
                            <button onClick={() => setFilter('active')} className={`px-6 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'active' ? 'bg-phoenix-accent text-black shadow-md' : 'text-phoenix-text-secondary hover:bg-phoenix-bg'}`}>
                                Active
                            </button>
                            <button onClick={() => setFilter('upcoming')} className={`px-6 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'upcoming' ? 'bg-phoenix-accent text-black shadow-md' : 'text-phoenix-text-secondary hover:bg-phoenix-bg'}`}>
                                Upcoming
                            </button>
                            <button onClick={() => setFilter('completed')} className={`px-6 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-phoenix-accent text-black shadow-md' : 'text-phoenix-text-secondary hover:bg-phoenix-bg'}`}>
                                Completed
                            </button>
                        </div>
                    </section>

                    <section>
                        {filteredQuests.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredQuests.map(quest => (
                                    <QuestCard key={quest.id} quest={quest} connected={connected} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-phoenix-text-secondary bg-phoenix-container-bg rounded-lg border border-phoenix-border">
                                <ArchiveBoxXMarkIcon className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                                <p className="text-lg">No {filter} quests to display at this time.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default QuestsPage;