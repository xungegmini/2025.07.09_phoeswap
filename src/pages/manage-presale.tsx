"use client";

import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { Program, AnchorProvider, web3, Idl } from "@coral-xyz/anchor";
import { useConnection, useAnchorWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import rawIdl from "../idl/phoenix_presale.json";

const programIdl = rawIdl as Idl;
const programID = new web3.PublicKey((programIdl as any).metadata.address);

const ManagePresalePage: NextPage = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [treasury, setTreasury] = useState("");
  const [status, setStatus] = useState("");

  const withdrawSol = async () => {
    if (!wallet?.publicKey || !treasury) {
      setStatus("Connect wallet and enter treasury address");
      return;
    }
    try {
      const provider = new AnchorProvider(connection, wallet as AnchorWallet, {});
      const program = new Program(programIdl, programID, provider);
      const [salePda] = web3.PublicKey.findProgramAddressSync([Buffer.from("sale")], programID);
      const [vaultPda] = web3.PublicKey.findProgramAddressSync([Buffer.from("vault")], programID);

      await program.methods
        .withdrawSol()
        .accounts({
          sale: salePda,
          vault: vaultPda,
          authority: wallet.publicKey,
          treasury: new web3.PublicKey(treasury),
        })
        .rpc();

      setStatus("SOL withdrawn successfully");
    } catch (err) {
      console.error(err);
      setStatus("Failed to withdraw SOL");
    }
  };

  const claimTokens = async () => {
    if (!wallet?.publicKey) {
      setStatus("Connect wallet first");
      return;
    }
    try {
      const provider = new AnchorProvider(connection, wallet as AnchorWallet, {});
      const program = new Program(programIdl, programID, provider);
      await program.methods.claimTokens().accounts({}).rpc();
      setStatus("Tokens claimed (if supported)");
    } catch (err) {
      console.error(err);
      setStatus("Failed to claim tokens");
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
            <label className="block text-sm mb-1">Treasury Address</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded bg-phoenix-container-bg"
              value={treasury}
              onChange={(e) => setTreasury(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={withdrawSol} className="px-4 py-2 bg-phoenix-accent text-white rounded">
              Withdraw SOL
            </button>
            <button onClick={claimTokens} className="px-4 py-2 bg-phoenix-accent text-white rounded">
              Claim Tokens
            </button>
          </div>
        </div>
        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </div>
  );
};

export default ManagePresalePage;