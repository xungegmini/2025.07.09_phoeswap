"use client";

import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { BN, Program, AnchorProvider, web3, Idl } from '@coral-xyz/anchor';
import { useConnection, useAnchorWallet, AnchorWallet } from '@solana/wallet-adapter-react';
import rawIdl from '../idl/phoenix_presale.json';
import { toast } from 'sonner';

const programIdl = rawIdl as Idl;
const programID = new web3.PublicKey((programIdl as any).metadata.address);

const CreatePresalePage: NextPage = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [price, setPrice] = useState('0');
  const [softCap, setSoftCap] = useState('0');
  const [hardCap, setHardCap] = useState('0');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [treasury, setTreasury] = useState('');
  const [tokenMint, setTokenMint] = useState('');
  const [status, setStatus] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.publicKey) {
      toast.error('Connect wallet first');
      return;
    }
    if (!price || !softCap || !hardCap || !startTime || !endTime || !treasury || !tokenMint) {
      toast.error('Please fill all fields');
      return;
    }

    setStatus('Creating presale, please wait...');
    try {
      const provider = new AnchorProvider(connection, wallet as AnchorWallet, {});
      const program = new Program(programIdl, programID, provider);

      const [salePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('sale')],
        programID,
      );
      const [vaultPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('vault')],
        programID,
      );

      const priceLamports = new BN(parseFloat(price) * web3.LAMPORTS_PER_SOL);
      const softCapLamports = new BN(parseFloat(softCap) * web3.LAMPORTS_PER_SOL);
      const hardCapLamports = new BN(parseFloat(hardCap) * web3.LAMPORTS_PER_SOL);

      await program.methods
        .initialize(
          priceLamports,
          softCapLamports,
          hardCapLamports,
          new BN(Math.floor(new Date(startTime).getTime() / 1000)),
          new BN(Math.floor(new Date(endTime).getTime() / 1000)),
        )
        .accounts({
          sale: salePda,
          vault: vaultPda,
          tokenMint: new web3.PublicKey(tokenMint),
          authority: wallet.publicKey!,
          treasury: new web3.PublicKey(treasury),
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      toast.success('Presale created successfully!');
      setStatus(`Presale created successfully! Program ID: ${programID.toBase58()}`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create presale', { description: err.message });
      setStatus(`Failed to create presale: ${err.message}`);
    }
  };

  return (
    <div>
      <Head>
        <title>Create Presale - Phoenix</title>
      </Head>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl mb-4 text-phoenix-text-primary font-bold">Create Presale</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Token Mint Address</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded bg-phoenix-container-bg"
              value={tokenMint}
              onChange={e => setTokenMint(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Price (SOL)</label>
            <input
              type="number"
              step="any"
              className="w-full border px-3 py-2 rounded bg-phoenix-container-bg"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Soft Cap (SOL)</label>
            <input
              type="number"
              step="any"
              className="w-full border px-3 py-2 rounded bg-phoenix-container-bg"
              value={softCap}
              onChange={e => setSoftCap(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Hard Cap (SOL)</label>
            <input
              type="number"
              step="any"
              className="w-full border px-3 py-2 rounded bg-phoenix-container-bg"
              value={hardCap}
              onChange={e => setHardCap(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Start Time</label>
            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded bg-phoenix-container-bg"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">End Time</label>
            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded bg-phoenix-container-bg"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Treasury Address</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded bg-phoenix-container-bg"
              value={treasury}
              onChange={e => setTreasury(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-phoenix-accent text-white rounded"
          >
            Create
          </button>
        </form>
        {status && <p className="mt-4 text-sm break-all">{status}</p>}
      </div>
    </div>
  );
};

export default CreatePresalePage;