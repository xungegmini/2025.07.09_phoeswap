// src/components/Footer.tsx
"use client";
import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTwitter, FaTelegramPlane, FaDiscord, FaMediumM } from 'react-icons/fa';

const SOCIAL_LINKS = [
  { href: "https://twitter.com/phoenix", icon: FaTwitter, label: "Twitter" },
  { href: "https://t.me/phoenix", icon: FaTelegramPlane, label: "Telegram" },
  { href: "https://discord.gg/phoenix", icon: FaDiscord, label: "Discord" },
  { href: "https://medium.com/phoenix", icon: FaMediumM, label: "Medium" },
];

const Footer: FC = () => {
  return (
    <footer className="bg-phoenix-container-bg border-t border-phoenix-border mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/images/logo_feniks.png" alt="Phoenix Swap Logo" width={32} height={32} className="rounded-full" />
            <span className="font-semibold text-phoenix-text-primary">Phoenix Swap</span>
          </Link>
          <div className="flex space-x-6">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-phoenix-text-secondary hover:text-phoenix-highlight transition-colors"
                >
                  <Icon className="h-6 w-6" />
                  <span className="sr-only">{social.label}</span>
                </a>
              );
            })}
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-phoenix-text-secondary">
          <p>&copy; {new Date().getFullYear()} Phoenix Swap. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;