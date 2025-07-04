// src/pages/launchpad/phnx.tsx

"use client";

import * as anchor from '@coral-xyz/anchor';
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useConnection, useAnchorWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, Idl, BN } from "@coral-xyz/anchor";
import { toast } from "sonner";
import rawIdl from '../../idl/phoenix_presale.json';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import MyMultiButton from "../../components/MyMultiButton";
import { ClockIcon, FireIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const programIdl = rawIdl as Idl;
const programID = new web3.PublicKey((programIdl as any).metadata.address);

const formatTime = (timestamp: number) => new Date(timestamp * 1000).toLocaleString();

const PhnxLaunchpadPage: NextPage = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [saleData, setSaleData] = useState<any>(null);
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [userPurchaseRecord, setUserPurchaseRecord] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');

    const presaleId = "phnx_initial_sale";

    const fetchSaleData = async () => {
        setIsLoading(true);
        try {
            const provider = new AnchorProvider(connection, (wallet || {}) as AnchorWallet, { commitment: "confirmed" });
            const program = new Program(programIdl, programID, provider);
            
            const [salePda] = web3.PublicKey.findProgramAddressSync(
                [Buffer.from("sale"), Buffer.from(presaleId)],
                programID
            );
            
            const saleAccount = await program.account.sale.fetch(salePda);
            setSaleData(saleAccount);

            if (wallet?.publicKey) {
                const [purchaseRecordPda] = web3.PublicKey.findProgramAddressSync(
                    [Buffer.from("purchase"), Buffer.from(presaleId), wallet.publicKey.toBuffer()],
                    programID
                );
                try {
                    const record = await program.account.purchaseRecord.fetch(purchaseRecordPda);
                    setUserPurchaseRecord(record);
                } catch (error) {
                    console.log("No purchase record found for this user.");
                    setUserPurchaseRecord(null);
                }
            }

        } catch (error) {
            console.error("Failed to fetch sale data:", error);
            setSaleData(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchSaleData();
    }, [connection, wallet?.publicKey]);

    const handlePurchase = async () => {
        if (!wallet?.publicKey) return toast.error("Connect wallet first!");
        const amount = parseFloat(purchaseAmount);
        if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");

        setStatusMessage("Processing purchase...");
        try {
            const provider = new AnchorProvider(connection, wallet, {});
            const program = new Program(programIdl, programID, provider);

            const [salePda] = web3.PublicKey.findProgramAddressSync([Buffer.from("sale"), Buffer.from(presaleId)], programID);
            const [vaultPda] = web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), Buffer.from(presaleId)], programID);
            const [purchaseRecordPda] = web3.PublicKey.findProgramAddressSync([Buffer.from("purchase"), Buffer.from(presaleId), wallet.publicKey.toBuffer()], programID);
            
            const tx = await program.methods
                .purchase(new BN(amount * web3.LAMPORTS_PER_SOL))
                .accounts({
                    sale: salePda,
                    vault: vaultPda,
                    purchaseRecord: purchaseRecordPda,
                    purchaser: wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            toast.success("Purchase successful!", { description: `Transaction: ${tx}` });
            setPurchaseAmount('');
            fetchSaleData();
        } catch (error: any) {
            toast.error("Purchase failed", { description: error.message });
        } finally {
            setStatusMessage("");
        }
    };
    
    const handleClaim = async () => {
        if (!wallet?.publicKey || !saleData) return toast.error("Connect wallet first!");

        setStatusMessage("Claiming tokens...");
        try {
            const provider = new AnchorProvider(connection, wallet, {});
            const program = new Program(programIdl, programID, provider);

            const [salePda] = web3.PublicKey.findProgramAddressSync([Buffer.from("sale"), Buffer.from(presaleId)], programID);
            const [purchaseRecordPda] = web3.PublicKey.findProgramAddressSync([Buffer.from("purchase"), Buffer.from(presaleId), wallet.publicKey.toBuffer()], programID);
            
            const purchaserTokenAccount = await getAssociatedTokenAddress(saleData.tokenMint, wallet.publicKey);

            const tx = await program.methods
                .claimTokens()
                .accounts({
                    sale: salePda,
                    purchaseRecord: purchaseRecordPda,
                    purchaser: wallet.publicKey,
                    tokenMint: saleData.tokenMint,
                    purchaserTokenAccount,
                    saleTokenAccount: saleData.saleTokenAccount,
                    associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            toast.success("Tokens claimed successfully!", { description: `Transaction: ${tx}` });
            fetchSaleData();
        } catch (error: any) {
            toast.error("Claim failed", { description: error.message });
        } finally {
            setStatusMessage("");
        }
    };

    const now = Date.now() / 1000;
    const isSaleActive = saleData && now > saleData.startTime && now < saleData.endTime;
    const isSaleUpcoming = saleData && now < saleData.startTime;
    const isSaleEnded = saleData && now > saleData.endTime;

    const raisedPercentage = saleData ? (saleData.totalRaised.toNumber() / saleData.hardCapLamports.toNumber()) * 100 : 0;

  return (
    <div>
      <Head>
        <title>PHNX Token Presale - Phoenix Swap</title>
        <meta name="description" content="Details of the PHNX token presale." />
      </Head>
      <div className="flex-1 w-full py-8 px-4 max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
            <MyMultiButton />
        </div>
        
        {isLoading && <p className="text-center animate-pulse">Loading presale data...</p>}
        
        {!isLoading && !saleData && (
            <div className="text-center p-8 bg-phoenix-container-bg rounded-lg border border-phoenix-border">
                <h2 className="text-2xl font-bold text-red-500">Presale Not Found</h2>
                <p className="text-phoenix-text-secondary">Could not find a presale with ID: "{presaleId}". Please check if it has been created.</p>
            </div>
        )}

        {saleData && (
            <div className="bg-phoenix-container-bg p-6 rounded-xl shadow-lg border border-phoenix-border space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-phoenix-text-primary">Phoenix Token (PHNX) Presale</h1>
                    <p className="text-phoenix-text-secondary mt-1">Join the official launch of the Phoenix Swap ecosystem token.</p>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-phoenix-text-secondary">Progress</span>
                        <span className="font-bold text-phoenix-text-primary">{(saleData.totalRaised.toNumber() / web3.LAMPORTS_PER_SOL).toFixed(2)} / {(saleData.hardCapLamports.toNumber() / web3.LAMPORTS_PER_SOL).toFixed(0)} SOL</span>
                    </div>
                    <div className="w-full bg-phoenix-bg rounded-full h-4 border border-phoenix-border">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full" style={{ width: `${raisedPercentage}%` }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong className="block text-phoenix-text-secondary">Price:</strong> <span>{saleData.priceLamports.toNumber() / web3.LAMPORTS_PER_SOL} SOL</span></div>
                    <div><strong className="block text-phoenix-text-secondary">Soft Cap:</strong> <span>{saleData.softCapLamports.toNumber() / web3.LAMPORTS_PER_SOL} SOL</span></div>
                    <div><strong className="block text-phoenix-text-secondary">Starts:</strong> <span>{formatTime(saleData.startTime.toNumber())}</span></div>
                    <div><strong className="block text-phoenix-text-secondary">Ends:</strong> <span>{formatTime(saleData.endTime.toNumber())}</span></div>
                </div>

                {wallet?.publicKey && userPurchaseRecord && (
                    <div className="border-t border-phoenix-border pt-4">
                        <h3 className="font-semibold text-lg text-phoenix-accent mb-2">Your Contribution</h3>
                        <p>Amount Spent: {(userPurchaseRecord.amountSpent.toNumber() / web3.LAMPORTS_PER_SOL).toFixed(4)} SOL</p>
                        <p>Claimed: {userPurchaseRecord.claimed ? <span className="text-green-400">Yes</span> : 'No'}</p>
                    </div>
                )}

                <div className="border-t border-phoenix-border pt-6">
                    {isSaleActive && (
                        <div className="space-y-3">
                            <h3 className="text-center font-semibold text-lg">Join the Presale</h3>
                            <input type="number" value={purchaseAmount} onChange={(e) => setPurchaseAmount(e.target.value)} placeholder="Amount in SOL" className="w-full text-center border px-3 py-2 rounded bg-phoenix-bg" />
                            <button onClick={handlePurchase} className="w-full px-4 py-2 bg-phoenix-accent text-black font-bold rounded hover:bg-orange-400 transition" disabled={!wallet || !!statusMessage}>{statusMessage || 'Purchase'}</button>
                        </div>
                    )}
                    {isSaleEnded && userPurchaseRecord && !userPurchaseRecord.claimed && (
                        <div>
                            <h3 className="text-center font-semibold text-lg text-green-400 mb-2">Presale Ended. Claim Your Tokens!</h3>
                            <button onClick={handleClaim} className="w-full px-4 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition" disabled={!wallet || !!statusMessage}>{statusMessage || 'Claim Your PHNX'}</button>
                        </div>
                    )}
                     {isSaleEnded && userPurchaseRecord?.claimed && (
                        <p className="text-center text-green-400 flex items-center justify-center gap-2"><CheckCircleIcon className="h-5 w-5"/> You have already claimed your tokens.</p>
                    )}
                    {isSaleUpcoming && (
                        <p className="text-center text-blue-400 flex items-center justify-center gap-2"><ClockIcon className="h-5 w-5"/> Sale has not started yet. Please check back later.</p>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PhnxLaunchpadPage;