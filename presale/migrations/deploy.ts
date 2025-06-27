// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

const anchor = require("@coral-xyz/anchor");

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  // Get the program ID from the workspace.
  const program = anchor.workspace.Presale;

  console.log("🚀 Starting deployment...");
  console.log("   Program: presale");
  console.log("   Provider Endpoint:", provider.connection.rpcEndpoint);
  console.log("   Wallet Pubkey:", provider.wallet.publicKey.toBase58());

  // Log the program ID after deployment.
  // The actual deployment happens when you run `anchor deploy` or `anchor migrate`.
  // This script simply runs in that context.
  console.log("✅ Deployment script finished.");
  console.log("   Program ID:", program.programId.toBase58());
  console.log("   To update the Program ID in Anchor.toml, use the following command:");
  console.log(`   anchor keys set -p ${program.programId.toBase58()} presale`);
  console.log("====================================================================");
};