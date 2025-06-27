// src/pages/tokenfactory.tsx
"use client";

import React, { useState, useMemo, ChangeEvent, useCallback } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import MyMultiButton from '../components/MyMultiButton';
import { Cog8ToothIcon, InformationCircleIcon, PhotoIcon, SparklesIcon, TrashIcon, PlusIcon, LinkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Image from 'next/image';

// Typ dla linków społecznościowych
interface SocialLink {
  id: number;
  url: string;
}

const TokenFactoryPage: NextPage = () => {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  // --- State Hooks ---
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState<string>('9');
  const [totalSupply, setTotalSupply] = useState('');
  const [description, setDescription] = useState('');
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([{ id: 1, url: '' }]);
  const [revokeFreeze, setRevokeFreeze] = useState(false);
  const [revokeMint, setRevokeMint] = useState(false);
  const [revokeUpdate, setRevokeUpdate] = useState(false);
  const [addDexTools, setAddDexTools] = useState(false);

  // --- Memos and Callbacks ---
  const isFormValid = useMemo(() => {
    return tokenName.trim() !== '' && 
           tokenSymbol.trim() !== '' && 
           parseInt(decimals) >= 0 && 
           parseInt(totalSupply) > 0;
  }, [tokenName, tokenSymbol, decimals, totalSupply]);
  
  const totalCost = useMemo(() => {
    let cost = 0.1; // Base Fee
    if (revokeFreeze) cost += 0.05;
    if (revokeMint) cost += 0.05;
    if (revokeUpdate) cost += 0.05;
    if (addDexTools) cost += 3.0;
    return cost;
  }, [revokeFreeze, revokeMint, revokeUpdate, addDexTools]);

  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSocialLink = () => { setSocialLinks([...socialLinks, { id: Date.now(), url: '' }]); };
  const handleRemoveSocialLink = (id: number) => { setSocialLinks(socialLinks.filter(link => link.id !== id)); };
  const handleSocialLinkChange = (id: number, value: string) => { setSocialLinks(socialLinks.map(link => link.id === id ? { ...link, url: value } : link)); };

  const handleCreateToken = useCallback(() => {
    if (!connected) {
      setVisible(true);
      return;
    }
    if (!isFormValid) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }
    
    // Na razie tylko symulacja
    toast.success(`Token creation simulated!`, {
      description: `Total cost: ${totalCost.toFixed(2)} SOL`,
    });
  }, [connected, isFormValid, totalCost, setVisible]);

  return (
    <div>
      <Head>
        <title>Phoenix Swap - Token Factory</title>
        <meta name="description" content="Create your own professional SPL Token." />
      </Head>
      <div className="flex-1 w-full py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-phoenix-container-bg p-6 rounded-2xl shadow-2xl border border-phoenix-border">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-phoenix-text-primary border-b border-phoenix-border pb-2">Basic Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tokenName" className="block text-sm font-medium text-phoenix-text-secondary mb-1">Name</label>
                      <input type="text" id="tokenName" value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder="Max 32 characters" maxLength={32} className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-3 text-phoenix-text-primary outline-none focus:border-phoenix-accent placeholder-phoenix-text-secondary/70"/>
                    </div>
                    <div>
                      <label htmlFor="tokenSymbol" className="block text-sm font-medium text-phoenix-text-secondary mb-1">Symbol</label>
                      <input type="text" id="tokenSymbol" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())} placeholder="Max 8 characters" maxLength={8} className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-3 text-phoenix-text-primary outline-none focus:border-phoenix-accent placeholder-phoenix-text-secondary/70"/>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="decimals" className="block text-sm font-medium text-phoenix-text-secondary mb-1">Decimals</label>
                      <input type="number" id="decimals" value={decimals} onChange={(e) => setDecimals(e.target.value)} placeholder="Most use 6 or 9" className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-3 text-phoenix-text-primary outline-none focus:border-phoenix-accent placeholder-phoenix-text-secondary/70"/>
                    </div>
                    <div>
                      <label htmlFor="totalSupply" className="block text-sm font-medium text-phoenix-text-secondary mb-1">Supply</label>
                      <input type="number" id="totalSupply" value={totalSupply} onChange={(e) => setTotalSupply(e.target.value)} placeholder="Most use 10B" className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-3 text-phoenix-text-primary outline-none focus:border-phoenix-accent placeholder-phoenix-text-secondary/70"/>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-phoenix-text-secondary mb-1">Description</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Tell us about your token (max 500 characters)" maxLength={500} className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-3 text-phoenix-text-primary outline-none focus:border-phoenix-accent placeholder-phoenix-text-secondary/70"></textarea>
                    <p className="text-right text-xs text-phoenix-text-secondary/80">{description.length}/500</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-phoenix-text-secondary mb-2">Image</label>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="h-16 w-16 rounded-full bg-phoenix-bg overflow-hidden flex items-center justify-center border-2 border-dashed border-phoenix-border">
                        {iconPreview ? <Image src={iconPreview} alt="Icon preview" width={64} height={64} className="object-cover h-full w-full" /> : <PhotoIcon className="h-8 w-8 text-phoenix-text-secondary" />}
                      </span>
                      <label htmlFor="icon-upload" className="relative cursor-pointer rounded-md bg-phoenix-bg px-4 py-2 text-sm font-semibold text-phoenix-text-primary shadow-sm border border-phoenix-border hover:bg-phoenix-border/50">
                        <span>Upload Image</span>
                        <input id="icon-upload" type="file" className="sr-only" onChange={handleIconChange} accept=".png, .jpg, .jpeg"/>
                      </label>
                    </div>
                     <p className="text-xs text-phoenix-text-secondary/80 mt-1">.png, .jpg, .jpeg. </p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-phoenix-border">
                   <h3 className="text-lg font-semibold text-phoenix-text-primary">Add Social Links & Tags</h3>
                   {socialLinks.map((link) => (
                      <div key={link.id} className="flex items-center gap-2">
                          <LinkIcon className="h-5 w-5 text-phoenix-text-secondary flex-shrink-0" />
                          <input type="url" value={link.url} onChange={(e) => handleSocialLinkChange(link.id, e.target.value)} placeholder="https://twitter.com/your_handle" className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-2 text-sm text-phoenix-text-primary outline-none focus:border-phoenix-accent placeholder-phoenix-text-secondary/70"/>
                          {socialLinks.length > 1 && <button onClick={() => handleRemoveSocialLink(link.id)} className="p-2 text-red-500 hover:text-red-400 rounded-md hover:bg-red-500/10"><TrashIcon className="h-5 w-5"/></button>}
                      </div>
                   ))}
                   <button onClick={handleAddSocialLink} className="flex items-center gap-2 text-sm text-phoenix-accent hover:text-phoenix-highlight">
                      <PlusIcon className="h-4 w-4"/> Add another link
                   </button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-phoenix-container-bg p-6 rounded-2xl shadow-2xl border border-phoenix-border">
                  <h3 className="text-lg font-semibold text-phoenix-text-primary mb-4">Revoke Authorities</h3>
                  <p className="text-sm text-phoenix-text-secondary mb-4">Increase investor trust by revoking authorities.</p>
                  <div className="space-y-3">
                      <label className="flex justify-between items-center cursor-pointer">
                          <div><span className="font-medium text-phoenix-text-primary">Revoke Mint</span><p className="text-xs text-phoenix-text-secondary">No one can create more tokens.</p></div>
                          <div className="flex items-center gap-2"><span className="text-xs font-mono text-phoenix-highlight">+0.05 SOL</span><input type="checkbox" checked={revokeMint} onChange={() => setRevokeMint(!revokeMint)} className="h-4 w-4 rounded bg-phoenix-bg border-phoenix-border text-phoenix-accent focus:ring-phoenix-accent"/></div>
                      </label>
                       <label className="flex justify-between items-center cursor-pointer">
                          <div><span className="font-medium text-phoenix-text-primary">Revoke Freeze</span><p className="text-xs text-phoenix-text-secondary">No one can freeze token accounts.</p></div>
                          <div className="flex items-center gap-2"><span className="text-xs font-mono text-phoenix-highlight">+0.05 SOL</span><input type="checkbox" checked={revokeFreeze} onChange={() => setRevokeFreeze(!revokeFreeze)} className="h-4 w-4 rounded bg-phoenix-bg border-phoenix-border text-phoenix-accent focus:ring-phoenix-accent"/></div>
                      </label>
                       <label className="flex justify-between items-center cursor-pointer">
                          <div><span className="font-medium text-phoenix-text-primary">Revoke Update</span><p className="text-xs text-phoenix-text-secondary">Metadata becomes immutable.</p></div>
                          <div className="flex items-center gap-2"><span className="text-xs font-mono text-phoenix-highlight">+0.05 SOL</span><input type="checkbox" checked={revokeUpdate} onChange={() => setRevokeUpdate(!revokeUpdate)} className="h-4 w-4 rounded bg-phoenix-bg border-phoenix-border text-phoenix-accent focus:ring-phoenix-accent"/></div>
                      </label>
                  </div>
                </div>

                <div className="bg-phoenix-container-bg p-6 rounded-2xl shadow-2xl border border-phoenix-border">
                  <h3 className="text-lg font-semibold text-phoenix-text-primary mb-4">Summary</h3>
                  <div className="space-y-2 border-b border-phoenix-border pb-3 mb-3 text-sm">
                      <div className="flex justify-between"><span className="text-phoenix-text-secondary">Base Fee:</span><span className="font-mono">0.1 SOL</span></div>
                      {revokeMint && <div className="flex justify-between"><span className="text-phoenix-text-secondary">Revoke Mint:</span><span className="font-mono">+0.05 SOL</span></div>}
                      {revokeFreeze && <div className="flex justify-between"><span className="text-phoenix-text-secondary">Revoke Freeze:</span><span className="font-mono">+0.05 SOL</span></div>}
                      {revokeUpdate && <div className="flex justify-between"><span className="text-phoenix-text-secondary">Revoke Update:</span><span className="font-mono">+0.05 SOL</span></div>}
                  </div>
                   <div className="flex justify-between font-bold text-lg mb-4">
                      <span className="text-phoenix-text-primary">Total Cost:</span>
                      <span className="text-phoenix-highlight">{totalCost.toFixed(2)} SOL</span>
                   </div>
                   {connected ? (
                      <button onClick={handleCreateToken} className="w-full btn-primary-phoenix py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isFormValid}>
                          Create Token
                      </button>
                      ) : (
                      <div className="flex justify-center">
                      </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenFactoryPage;