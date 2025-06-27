// src/pages/b2m.tsx
"use client";

import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { ChevronDownIcon, QuestionMarkCircleIcon, FireIcon } from '@heroicons/react/24/outline';

// Typ dla poprzedniego projektu B2M
interface PreviousB2MProject {
  id: string;
  name: string;
  tokenSymbol: string;
  imageUrl: string;
  phnxBurned: number;
  tokensMinted: number;
  date: string;
  description?: string;
}

// Typ dla pytania FAQ
interface FaqItem {
  question: string;
  answer: string;
}

// Przykładowe dane
const PREVIOUS_PROJECTS: PreviousB2MProject[] = [
  { id: 'project-gamma', name: 'Project Gamma', tokenSymbol: 'GAMMA', imageUrl: '/images/tokens/placeholder-logo-alpha.png', phnxBurned: 500000, tokensMinted: 1000000, date: 'Jan 15, 2025', description: 'A successful launch of the Gamma yield aggregation protocol.' },
];

const FAQ_ITEMS: FaqItem[] = [
  { question: "What is Burn to Mint (B2M)?", answer: "Burn to Mint is an innovative mechanism where users burn (permanently destroy) $PHNX tokens to receive new tokens from participating projects launching on PhoenixSwap. This helps create a deflationary aspect for $PHNX and provides a fair launch method for new tokens." },
  { question: "How do I participate in a B2M event?", answer: "During an active B2M event, you'll need to connect your wallet, ensure you have sufficient $PHNX, specify the amount of $PHNX you wish to burn, and confirm the transaction. The new tokens will then be claimable according to the event's schedule." },
  { question: "What are the benefits of participating in B2M?", answer: "Participants get early access to new project tokens, often at a favorable rate. Burning $PHNX also contributes to the overall health and scarcity of the Phoenix Token." },
  { question: "Is there a limit to how much $PHNX I can burn?", answer: "Each B2M event may have its own specific limits (minimum/maximum burn amount per wallet) or overall cap. Please refer to the details of each specific event." },
];

const FaqAccordionItem: React.FC<{ item: FaqItem; isOpen: boolean; onClick: () => void }> = ({ item, isOpen, onClick }) => {
  return (
    <div className="border-b border-phoenix-border">
      <button onClick={onClick} className="flex justify-between items-center w-full py-4 text-left text-phoenix-text-primary hover:text-phoenix-accent transition">
        <span className="font-medium">{item.question}</span>
        <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && ( <div className="pb-4 text-sm text-phoenix-text-secondary"><p>{item.answer}</p></div> )}
    </div>
  );
};

const BurnToMintPage: NextPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const toggleFaq = (index: number) => { setOpenFaqIndex(openFaqIndex === index ? null : index); };

  return (
    <div>
        <Head>
            <title>Phoenix Swap - Burn to Mint</title>
            <meta name="description" content="Discover new token launches by burning $PHNX." />
        </Head>
        <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-phoenix-text-primary mb-3">Burn to Mint</h1>
            <p className="text-lg text-phoenix-text-secondary max-w-2xl mx-auto">Discover new token launches on PhoenixSwap by burning $PHNX. A unique way to get early access and support the ecosystem.</p>
            </div>

            <div className="bg-phoenix-container-bg p-6 rounded-xl shadow-xl border border-phoenix-border mb-10 text-center">
                <h2 className="text-2xl font-semibold text-phoenix-text-primary mb-3">Upcoming B2M Events</h2>
                <p className="text-phoenix-text-secondary mb-4">No active Burn to Mint events at the moment. Follow our announcements for the next launch!</p>
            </div>

            {PREVIOUS_PROJECTS.length > 0 && (
            <div className="mb-10">
                <h2 className="text-2xl font-semibold text-phoenix-text-primary mb-6">Previous Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PREVIOUS_PROJECTS.map(project => (
                    <div key={project.id} className="bg-phoenix-bg p-5 rounded-lg shadow-lg border border-phoenix-border">
                    <Image src={project.imageUrl} alt={project.name} width={64} height={64} className="rounded-full mx-auto mb-3 object-cover" />
                    <h3 className="text-xl font-bold text-phoenix-accent text-center mb-1">{project.name} ({project.tokenSymbol})</h3>
                    <p className="text-xs text-phoenix-text-secondary text-center mb-3">{project.date}</p>
                    {project.description && <p className="text-sm text-phoenix-text-secondary mb-2 text-center line-clamp-2">{project.description}</p>}
                    <div className="text-xs text-phoenix-text-secondary space-y-0.5">
                        <p><strong>$PHNX Burned:</strong> {project.phnxBurned.toLocaleString()}</p>
                        <p><strong>{project.tokenSymbol} Minted:</strong> {project.tokensMinted.toLocaleString()}</p>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
            
            <div className="bg-phoenix-container-bg p-6 rounded-xl shadow-xl border border-phoenix-border mb-10">
                <h2 className="text-2xl font-semibold text-phoenix-text-primary mb-6 text-center">How B2M Works - The Steps</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    {[ { step: 1, title: "Connect Wallet", description: "Link your Solana wallet." }, { step: 2, title: "Get $PHNX", description: "Acquire $PHNX tokens." }, { step: 3, title: "Burn to Mint", description: "During an active event, burn your $PHNX." }, { step: 4, title: "Claim Rewards", description: "Claim your newly minted tokens." }, ].map(item => ( <div key={item.step} className="flex flex-col items-center"> <div className="w-12 h-12 rounded-full bg-phoenix-accent text-black flex items-center justify-center font-bold text-xl mb-3">{item.step}</div><h4 className="font-semibold text-phoenix-text-primary mb-1">{item.title}</h4><p className="text-xs text-phoenix-text-secondary">{item.description}</p></div> ))}
                </div>
            </div>

            <div className="bg-phoenix-container-bg p-6 rounded-xl shadow-xl border border-phoenix-border">
            <h2 className="text-2xl font-semibold text-phoenix-text-primary mb-4 flex items-center"><QuestionMarkCircleIcon className="h-7 w-7 text-phoenix-accent mr-3" />Frequently Asked Questions</h2>
            <div className="divide-y divide-phoenix-border">
                {FAQ_ITEMS.map((item, index) => ( <FaqAccordionItem key={index} item={item} isOpen={openFaqIndex === index} onClick={() => toggleFaq(index)} /> ))}
            </div>
            </div>
        </div>
        </div>
    </div>
  );
};

export default BurnToMintPage;