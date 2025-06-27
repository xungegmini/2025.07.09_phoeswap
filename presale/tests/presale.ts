import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { createMint, getAssociatedTokenAddress, createAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import assert from "assert";

describe("presale", () => {
  // --- Konfiguracja klienta ---
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Presale as Program;

  // --- Klucze i konta testowe ---
  const authority = provider.wallet as anchor.Wallet;
  const treasury = anchor.web3.Keypair.generate();
  const purchaser = anchor.web3.Keypair.generate();

  // --- PDAs (Adresy Wyprowadzone z Programu) ---
  const [salePda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sale")],
    program.programId
  );
  const [vaultPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId
  );
  const [purchaseRecordPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("purchase"), purchaser.publicKey.toBuffer()],
    program.programId
  );

  let tokenMint: web3.PublicKey;
  let purchaserTokenAccount: web3.PublicKey;
    
  // --- Parametry przedsprzedaży ---
  const priceSol = 0.5;
  const softCapSol = 50;
  const hardCapSol = 100;
  const oneSol = anchor.web3.LAMPORTS_PER_SOL;

  // Funkcja pomocnicza do airdropów
  const airdrop = async (to: web3.PublicKey, amount: number) => {
    const signature = await provider.connection.requestAirdrop(to, amount * oneSol);
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });
  };

  before(async () => {
    // Zasilenie portfeli testowych w SOL
    await airdrop(purchaser.publicKey, 2);
    await airdrop(treasury.publicKey, 1);

    tokenMint = await createMint(
      provider.connection,
      authority.payer,
      salePda,
      null,
      0,
      undefined,
      {},
      TOKEN_PROGRAM_ID
    );

    purchaserTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      purchaser,
      tokenMint,
      purchaser.publicKey
    );
  });

  it("Is initialized!", async () => {
    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now); 
    const endTime = new anchor.BN(now + 3); // Krótki czas na potrzeby testu

    await program.methods
      .initialize(
        priceSol,
        softCapSol,
        hardCapSol,
        startTime,
        endTime,
        tokenMint
      )
      .accounts({
        sale: salePda,
        vault: vaultPda,
        tokenMint: tokenMint,
        authority: authority.publicKey,
        treasury: treasury.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    const saleAccount: any = await program.account.sale.fetch(salePda);
    assert.strictEqual(saleAccount.authority.toString(), authority.publicKey.toString());
    assert.strictEqual(saleAccount.treasury.toString(), treasury.publicKey.toString());
    assert.strictEqual(saleAccount.vault.toString(), vaultPda.toString());
    assert.strictEqual(saleAccount.priceLamports.toNumber(), priceSol * oneSol);
    assert.strictEqual(saleAccount.hardCapLamports.toNumber(), hardCapSol * oneSol);
    assert.strictEqual(saleAccount.isActive, true);
  });
  
  it("Allows a user to purchase tokens", async () => {
    const purchaseAmountSol = 1;
    
    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

    await program.methods
      .purchase(purchaseAmountSol)
      .accounts({
        sale: salePda,
        vault: vaultPda,
        purchaseRecord: purchaseRecordPda,
        purchaser: purchaser.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([purchaser])
      .rpc();

    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
    const saleAccount: any = await program.account.sale.fetch(salePda);
    const purchaseRecordAccount: any = await program.account.purchaseRecord.fetch(purchaseRecordPda);

    // Sprawdź, czy środki trafiły do sejfu
    assert.strictEqual(vaultBalanceAfter, vaultBalanceBefore + (purchaseAmountSol * oneSol));
    // Sprawdź, czy stan kontraktu został zaktualizowany
    assert.strictEqual(saleAccount.totalRaised.toNumber(), purchaseAmountSol * oneSol);
    // Sprawdź, czy rekord zakupu został poprawnie utworzony
    assert.strictEqual(purchaseRecordAccount.purchaser.toString(), purchaser.publicKey.toString());
    assert.strictEqual(purchaseRecordAccount.amountSpent.toNumber(), purchaseAmountSol * oneSol);
  });

  it("Should fail to purchase if sale has not started", async () => {
      // Inicjalizujemy nowy test z datą startu w przyszłości
      const newAuthority = anchor.web3.Keypair.generate();
      await airdrop(newAuthority.publicKey, 2);

      const now = Math.floor(Date.now() / 1000);
      const startTime = new anchor.BN(now + 10); // Start za 10 sekund
      const endTime = new anchor.BN(now + 20);

      try {
        await program.methods.purchase(1).rpc(); // Ta transakcja powinna się nie powieść
        assert.fail("Transaction should have failed but did not.");
      } catch (err: any) {
        assert.strictEqual(err.error.errorCode.code, "SaleNotStarted");
      }
  });

  it("Allows authority to withdraw funds after sale ends", async () => {
    // Czekamy na zakończenie przedsprzedaży (ustawionej na 3 sekundy w pierwszym teście)
    await new Promise(resolve => setTimeout(resolve, 4000));

    const treasuryBalanceBefore = await provider.connection.getBalance(treasury.publicKey);
    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);
    
    await program.methods
      .withdrawSol()
      .accounts({
        sale: salePda,
        vault: vaultPda,
        authority: authority.publicKey,
        treasury: treasury.publicKey,
      })
      .rpc();
    
    const treasuryBalanceAfter = await provider.connection.getBalance(treasury.publicKey);
    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);

    assert.strictEqual(treasuryBalanceAfter, treasuryBalanceBefore + vaultBalanceBefore);
    assert.strictEqual(vaultBalanceAfter, 0);
  });

  it("Allows purchaser to claim tokens after sale", async () => {
    const saleAccount: any = await program.account.sale.fetch(salePda);

    await program.methods
      .claimTokens()
      .accounts({
        sale: salePda,
        purchaseRecord: purchaseRecordPda,
        purchaser: purchaser.publicKey,
        tokenMint: tokenMint,
        purchaserTokenAccount: purchaserTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([purchaser])
      .rpc();

    const tokenAccountInfo = await program.provider.connection.getTokenAccountBalance(purchaserTokenAccount);
    assert.strictEqual(
      tokenAccountInfo.value.uiAmount,
      saleAccount.totalRaised / saleAccount.priceLamports
    );

    const purchaseRecordAccount: any = await program.account.purchaseRecord.fetch(purchaseRecordPda);
    assert.strictEqual(purchaseRecordAccount.claimed, true);
  });
  
});