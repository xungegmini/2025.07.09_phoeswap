import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';

export interface WalletAdapter {
  publicKey: PublicKey | null;
  sendTransaction: (transaction: Transaction, connection: Connection, options?: any) => Promise<string>;
}

export interface CreateTokenInput {
  connection: Connection;
  wallet: WalletAdapter;
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  totalSupply: bigint;
  revokeMint: boolean;
  revokeFreeze: boolean;
  revokeUpdate: boolean;
}

const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export async function createToken(options: CreateTokenInput): Promise<PublicKey> {
  const { connection, wallet, name, symbol, decimals, totalSupply, revokeMint, revokeFreeze, revokeUpdate } = options;

  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const payer = wallet.publicKey;
  const mint = Keypair.generate();

  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  const createMintAccountIx = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: mint.publicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });

  const initMintIx = createInitializeMintInstruction(
    mint.publicKey,
    decimals,
    payer,
    revokeFreeze ? null : payer
  );

  const ata = await getAssociatedTokenAddress(mint.publicKey, payer);
  const createAtaIx = createAssociatedTokenAccountInstruction(
    payer,
    ata,
    payer,
    mint.publicKey
  );

  const mintToIx = createMintToInstruction(mint.publicKey, ata, payer, totalSupply);

  const tx = new Transaction().add(createMintAccountIx, initMintIx, createAtaIx, mintToIx);

  if (revokeMint) {
    tx.add(
      createSetAuthorityInstruction(mint.publicKey, payer, AuthorityType.MintTokens, null)
    );
  }

  if (revokeFreeze) {
    tx.add(
      createSetAuthorityInstruction(mint.publicKey, payer, AuthorityType.FreezeAccount, null)
    );
  }

  tx.feePayer = payer;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.partialSign(mint);

  const sig = await wallet.sendTransaction(tx, connection, { signers: [mint] });
  await connection.confirmTransaction(sig, 'confirmed');

  const metadataPda = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  )[0];

  const metadataIx = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPda,
      mint: mint.publicKey,
      mintAuthority: payer,
      payer,
      updateAuthority: payer,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name,
          symbol,
          uri: '',
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: !revokeUpdate,
        collectionDetails: null,
      },
    }
  );

  const tx2 = new Transaction().add(metadataIx);
  tx2.feePayer = payer;
  tx2.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const sig2 = await wallet.sendTransaction(tx2, connection, { signers: [mint] });
  await connection.confirmTransaction(sig2, 'confirmed');

  return mint.publicKey;
}