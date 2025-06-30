"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BanknotesIcon,
  ChevronDownIcon,
  FireIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  BoltIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, href }) => (
  <Link
    href={href}
    className="relative group rounded-xl p-6 bg-phoenix-container-bg border border-phoenix-border hover:border-phoenix-accent/70 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
  >
    <div className="absolute -inset-px bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="w-14 h-14 mb-4 rounded-lg bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 flex items-center justify-center border border-phoenix-border group-hover:border-phoenix-accent/50 transition-all duration-300">
        <Icon className="h-7 w-7 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-2 text-phoenix-text-primary">{title}</h3>
      <p className="text-sm text-phoenix-text-secondary leading-relaxed flex-grow">{description}</p>
    </div>
  </Link>
);

interface HowItWorksStepProps {
  stepNumber: string;
  title: string;
  description: string;
}

const HowItWorksStep: React.FC<HowItWorksStepProps> = ({ stepNumber, title, description }) => (
  <div className="relative z-10 flex flex-col items-center text-center">
    <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-phoenix-accent to-orange-500 text-black flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-phoenix-highlight/50">
      {stepNumber}
    </div>
    <h4 className="font-semibold text-phoenix-text-primary text-lg mb-1.5">{title}</h4>
    <p className="text-sm text-phoenix-text-secondary leading-relaxed max-w-xs">{description}</p>
  </div>
);

const HomePage: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      icon: BoltIcon,
      title: "Lightning Fast Swaps",
      description: "Leverage the full power of the Solana network for near-instantaneous trade executions. Our optimized routing ensures your swaps are not only fast but also efficient, providing a seamless trading experience.",
      href: "/v2/swap",
    },
    {
      icon: BanknotesIcon,
      title: "Low Transaction Fees",
      description: "Keep more of your assets with ultra-low transaction costs. Thanks to Solana's efficient consensus mechanism, trading on Phoenix Swap is highly cost-effective for traders of all sizes.",
      href: "/v2/swap",
    },
    {
      icon: CurrencyDollarIcon,
      title: "Yield Farming",
      description: "Become a liquidity provider and earn passive income. Stake your LP tokens in our farms to receive competitive rewards and contribute to the health of our ecosystem.",
      href: "/v2/farms",
    },
    {
      icon: FireIcon,
      title: "Burn to Mint",
      description: "Participate in our innovative token launch model. By burning $PHNX, you gain early access to new project tokens while simultaneously contributing to the deflationary pressure on our native token.",
      href: "/v2/b2m",
    },
    {
      icon: PuzzlePieceIcon,
      title: "Quests",
      description: "Engage with the platform through interactive quests. Complete tasks, achieve milestones, and earn exclusive XP, badges, and token rewards for your contributions to the community.",
      href: "/v2/quests",
    },
    {
      icon: RocketLaunchIcon,
      title: "Launchpad",
      description: "Discover the next wave of innovation on Solana. Our launchpad provides a curated and secure platform to participate in token presales and support promising early-stage projects.",
      href: "/v2/launchpad",
    },
  ];

  return (
    <div className="flex-1 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="hero" className="overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <h3 className="inline-block rounded-full text-base md:text-lg font-semibold text-phoenix-accent">
                Powered by <span className="text-phoenix-highlight">Solana</span>
              </h3>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                <span className="block text-phoenix-text-primary">Rise from the ashes.</span>
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">Trade with Phoenix.</span>
              </h1>
              <p className="text-lg md:text-xl text-phoenix-text-secondary max-w-[600px] mx-auto lg:mx-0">
                Experience the rebirth of DeFi trading with PhoenixSwap.<br/>Fast, secure, and built to soar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
                <Link
                  href="/v2/swap"
                  className="inline-flex items-center justify-center rounded-md bg-phoenix-accent px-6 py-3 text-base font-semibold text-black hover:bg-orange-400 transition"
                >
                  Start Trading <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center rounded-md border border-phoenix-accent px-6 py-3 text-base font-semibold text-phoenix-accent hover:bg-phoenix-accent/10 transition"
                >
                  Learn More <ChevronDownIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center lg:justify-end">
              <Image alt="PhoenixSwap Logo" width={500} height={500} className="object-contain w-[300px] sm:w-[450px] lg:w-[500px] animate-pulse" src="/images/logo_feniks.png" />
            </div>
          </div>
        </section>

        <section id="features" className="py-12 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">Ignite Your Trading</span></h2>
            <p className="text-lg text-phoenix-text-secondary max-w-3xl mx-auto">PhoenixSwap combines the power of Solana with cutting-edge DeFi features to deliver an unmatched trading experience.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{features.map(feature => <FeatureCard key={feature.title} {...feature} />)}</div>
        </section>

        <section id="how-it-works" className="py-12 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">How PhoenixSwap Works</span></h2>
            <p className="text-lg text-phoenix-text-secondary max-w-2xl mx-auto">Simple, secure, and efficient trading in just a few steps.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-phoenix-border" style={{ zIndex: 0 }}>
              <div className="absolute top-1/2 left-1/3 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-phoenix-accent"></div>
              <div className="absolute top-1/2 left-2/3 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-phoenix-accent"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-10 justify-items-center items-start">
              <HowItWorksStep stepNumber="1" title="Connect Your Wallet" description="Link your Solana-compatible wallet to PhoenixSwap with just a few clicks." />
              <HowItWorksStep stepNumber="2" title="Select Tokens to Swap" description="Choose from hundreds of tokens available on the Solana network." />
              <HowItWorksStep stepNumber="3" title="Review & Confirm" description="Check the transaction details, confirm, and watch your trade execute instantly." />
            </div>
          </div>
        </section>

          <section className="py-12 md:py-20">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600"></div>
            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">Ready to Rise with PhoenixSwap?</h2>
                <p className="text-black/80 text-lg max-w-[600px]">Join thousands of traders who have already discovered the power of decentralized trading on Solana.</p>
              </div>
              <div className="flex-shrink-0 mt-4 md:mt-0">
                <Link
                  href="/v2/swap"
                  className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-base font-semibold text-white hover:bg-gray-800 transition"
                >
                  Launch App <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;