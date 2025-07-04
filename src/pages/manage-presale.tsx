// src/pages/manage-presale.tsx
"use client";

import { NextPage } from "next";
import Head from "next/head";
import { useState, useCallback } from "react";
import { Program, AnchorProvider, web3, Idl } from "@coral-xyz/anchor";
import { useConnection, useAnchorWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import rawIdl from "../idl/phoenix_presale.json";
import { toast } from "sonner";

const programIdl = {
  ...(rawIdl as any),
  address: (rawIdl as any).metadata.address,
} as Idl;
const programID = new web3.PublicKey(programIdl.address);

const ManagePresalePage: NextPage = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [presaleId, setPresaleId] = useState("");
  const [status, setStatus] = useState("");
  const [saleInfo, setSaleInfo] = useState<any>(null);

  const fetchSaleInfo = useCallback(async () => {
    if (!presaleId) return toast.error("Please enter a Presale ID");
    setStatus("Loading sale data...");
    try {
      const provider = new AnchorProvider(connection, (wallet || {}) as AnchorWallet, {});
      const program = new Program(programIdl, provider);
      const [salePda] = web3.PublicKey.findProgramAddressSync([Buffer.from("sale"), Buffer.from(presaleId)], programID);
      const data = await (program.account as any).sale.fetch(salePda);
      setSaleInfo(data);
      setStatus("Sale data loaded successfully.");
      toast.success("Sale data loaded!");
    } catch (err) {
      console.error(err);
      setStatus(`Could not fetch sale data for ID: ${presaleId}`);
      setSaleInfo(null);
    }
  }, [presaleId, connection, wallet]);

  const withdrawSol = async () => {
    if (!wallet?.publicKey || !presaleId) {
      return setStatus("Connect wallet and enter Presale ID");
    }
    if (!saleInfo) {
      return setStatus("Load sale data first.");
    }

    setStatus("Withdrawing SOL...");
    try {
      const provider = new AnchorProvider(connection, wallet as AnchorWallet, {});
      const program = new Program(programIdl, provider);
      const [salePda] = web3.PublicKey.findProgramAddressSync([Buffer.from("sale"), Buffer.from(presaleId)], programID);
      const [vaultPda] = web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), Buffer.from(presaleId)], programID);

      await program.methods
        .withdrawSol(presaleId)
        .accounts({
          sale: salePda,
          vault: vaultPda,
          authority: wallet.publicKey,
          treasury: saleInfo.treasury,
        })
        .rpc();

      toast.success("SOL withdrawn successfully!");
      setStatus("SOL withdrawn successfully");
      fetchSaleInfo();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to withdraw SOL", { description: err.message });
      setStatus("Failed to withdraw SOL");
    }
  };

  return (
    <div>
      <Head>
        <title>Manage Presale</title>
      </Head>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl mb-4 font-bold text-phoenix-text-primary">Manage Presale</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Presale ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full border px-3 py-2 rounded bg-phoenix-container-bg"
                value={presaleId}
                onChange={(e) => setPresaleId(e.target.value)}
                placeholder="Enter the unique presale ID"
              />
              <button onClick={fetchSaleInfo} className="px-4 py-2 bg-blue-500 text-white rounded">Load Info</button>
            </div>
          </div>
          
          {saleInfo && (
            <div className="p-4 bg-phoenix-bg rounded-lg border border-phoenix-border text-sm space-y-2">
                {/* POPRAWKA: Użyto apostrofów, aby uniknąć błędu */}
                <h3 className="font-bold text-lg">Sale: &apos;{saleInfo.presale_id}&apos;</h3>
                <p><strong>Total Raised:</strong> {(saleInfo.totalRaised.toNumber() / web3.LAMPORTS_PER_SOL).toFixed(4)} SOL</p>
                <p><strong>Treasury:</strong> {saleInfo.treasury.toBase58()}</p>
                <p><strong>End Time:</strong> {new Date(saleInfo.endTime.toNumber() * 1000).toLocaleString()}</p>
                <button 
                    onClick={withdrawSol} 
                    className="mt-4 px-4 py-2 bg-phoenix-accent text-white rounded w-full disabled:bg-gray-500 disabled:cursor-not-allowed" 
                    disabled={Date.now() / 1000 < saleInfo.endTime.toNumber()}
                >
                    {Date.now() / 1000 < saleInfo.endTime.toNumber() ? `Cannot withdraw before end time` : "Withdraw All SOL"}
                </button>
            </div>
          )}

        </div>
        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </div>
  );
};

export default ManagePresalePage;