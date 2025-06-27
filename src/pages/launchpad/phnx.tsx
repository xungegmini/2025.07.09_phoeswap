// src/pages/phnx.tsx

"use client";

import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const PhnxLaunchpadPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>PHNX Presale - Phoenix Swap</title>
        <meta name="description" content="Details of the PHNX token presale." />
      </Head>
      <div className="flex-1 w-full py-8 px-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-phoenix-text-primary mb-4">Phoenix Token Presale</h1>
        <p className="text-phoenix-text-secondary mb-6">
          Welcome to the official presale of the PHNX token. Below you can find basic information about the event.
        </p>
        <ul className="list-disc list-inside space-y-1 text-phoenix-text-secondary mb-8">
          <li>Price per token: 0.005 SOL</li>
          <li>Soft cap: 5,000 SOL</li>
          <li>Hard cap: 10,000 SOL</li>
        </ul>
        <Link href="/launchpad" className="text-phoenix-accent hover:underline">
          Back to Launchpad
        </Link>
      </div>
    </div>
  );
};

export default PhnxLaunchpadPage;
