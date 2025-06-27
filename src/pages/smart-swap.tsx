// src/pages/smart-swap.tsx
"use client";

import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

const SmartSwapComingSoonPage: NextPage = () => {
  return (
    <div>
        <Head>
            <title>Phoenix Swap - Smart Swap</title>
            <meta name="description" content="Smart Swap feature coming soon to Phoenix Swap." />
        </Head>
        <div className="flex-1 w-full flex flex-col items-center justify-center text-center py-10 px-4 min-h-[calc(100vh-200px)]">
        <div className="max-w-lg">
            <WrenchScrewdriverIcon className="h-20 w-20 md:h-24 md:w-24 text-phoenix-accent mx-auto mb-6 opacity-70" />

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-phoenix-text-primary mb-4">
            Smart Swap
            </h1>

            <p className="text-3xl sm:text-4xl font-semibold text-phoenix-highlight mb-6 animate-pulse">
            Coming Soon...
            </p>

            <p className="text-md md:text-lg text-phoenix-text-secondary mb-8">
            We&apos;re crafting an intelligent new way to trade your favorite tokens with enhanced features and optimal routing. 
            The Phoenix Smart Swap will bring you even better rates and a smoother experience. Stay tuned!
            </p>

            <div className="flex justify-center">
            <Link href="/swap" className="btn-secondary-phoenix py-2.5 px-6 text-sm">
                Back to Classic Swap
            </Link>
            </div>
        </div>
        </div>
    </div>
  );
};

export default SmartSwapComingSoonPage;