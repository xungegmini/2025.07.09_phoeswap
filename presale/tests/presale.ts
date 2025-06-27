import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { expect } from "chai";
import { Presale } from "../target/types/presale";

describe("presale", () => {
  // --- Konfiguracja klienta ---
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Presale as Program<Presale>;

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
        endTime
      )
      .accounts({
        sale: salePda,
        vault: vaultPda,
        authority: authority.publicKey,
        treasury: treasury.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    const saleAccount = await program.account.sale.fetch(salePda);
    expect(saleAccount.authority.toString()).to.equal(authority.publicKey.toString());
    expect(saleAccount.treasury.toString()).to.equal(treasury.publicKey.toString());
    expect(saleAccount.vault.toString()).to.equal(vaultPda.toString());
    expect(saleAccount.priceLamports.toNumber()).to.equal(priceSol * oneSol);
    expect(saleAccount.hardCapLamports.toNumber()).to.equal(hardCapSol * oneSol);
    expect(saleAccount.isActive).to.be.true;
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
    const saleAccount = await program.account.sale.fetch(salePda);
    const purchaseRecordAccount = await program.account.purchaseRecord.fetch(purchaseRecordPda);

    // Sprawdź, czy środki trafiły do sejfu
    expect(vaultBalanceAfter).to.equal(vaultBalanceBefore + (purchaseAmountSol * oneSol));
    // Sprawdź, czy stan kontraktu został zaktualizowany
    expect(saleAccount.totalRaised.toNumber()).to.equal(purchaseAmountSol * oneSol);
    // Sprawdź, czy rekord zakupu został poprawnie utworzony
    expect(purchaseRecordAccount.purchaser.toString()).to.equal(purchaser.publicKey.toString());
    expect(purchaseRecordAccount.amountSpent.toNumber()).to.equal(purchaseAmountSol * oneSol);
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
        expect.fail("Transaction should have failed but did not.");
      } catch (err) {
        expect(err.error.errorCode.code).to.equal("SaleNotStarted");
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

    expect(treasuryBalanceAfter).to.equal(treasuryBalanceBefore + vaultBalanceBefore);
    expect(vaultBalanceAfter).to.equal(0);
  });
  
});