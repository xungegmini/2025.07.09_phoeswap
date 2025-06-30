## Viewing Your Assets on Devnet and Mainnet
Once you've connected your Solana wallet to the application, you can seamlessly view all your tokens and NFTs on either the Solana Devnet or Mainnet. This feature allows you to:

- Explore Your Holdings: Get a comprehensive overview of your digital assets.
- Switch Networks: Easily toggle between Devnet and Mainnet to view assets across different clusters.
- Stay Organized: Manage and monitor your tokens and NFTs in one place.
This functionality ensures that you always have full visibility into your Solana ecosystem, empowering you to make informed decisions about your digital assets.


## Environment Variables
**Important:** To use Mainnet without any error, please use a custom rpc endpoint

Also to use the uplaod function im using [FileBase](filebase.com)

sign up and fill up the info
```bash
NEXT_PUBLIC_SOLANA_MAINNET_RPC=YOUR CUSTOM RPC
NEXT_PUBLIC_FILEBASE_KEY=YOUR FILEBASE KEY
NEXT_PUBLIC_FILEBASE_SECRET=YOUR FILEBASE SECRET
NEXT_PUBLIC_FILEBASE_BUCKETNAME=YOUR FILEBASE BUCKETNAME
NEXT_PUBLIC_FILEBASE_GATEWAY=https://YOURFIREBASEGATEWAY/ipfs
```

## Local Environment File

Place any private keys or other sensitive environment variables in a file named
`.env.local`. This file is ignored by Git thanks to the rules in `.gitignore`, so
your secrets stay out of version control. Use the variables above as a guide for
the keys you need.

## Prerequisites

Before running this project locally, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or above)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- A Solana wallet (e.g., [Phantom Wallet](https://phantom.app/)) for testing

## Getting Started

Follow these steps to set up the project on your local machine:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/solana-token-creator.git
cd solana-token-creator
```

### 2. Install Dependencies

Using Yarn:

```bash
yarn install