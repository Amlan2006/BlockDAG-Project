<div align="center">	
    <p>	
	    <a href="(https://www.morphl2.io/)">	
            <div>	
	           <img width="400px" src="https://blockdag.network/images/presskit/Logo.svg" align="center" alt="BlockDAG" />	
		    </div>
	    </a>
            <br>
    </p>
      
</div>


# BlockDAG Freelance Platform  

A Decentralized Marketplace for Secure Client-Freelancer Interactions on the Blockchain.  

![License](https://img.shields.io/badge/License-MIT-yellow.svg)  
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)  
![Powered by Wagmi](https://img.shields.io/badge/Powered%20by-Wagmi-blueviolet)  

---

## Table of Contents
- [About The Project](#about-the-project)  
- [Key Features](#key-features)  
- [Architecture Overview](#architecture-overview)  
- [How It Works: Core Concepts](#how-it-works-core-concepts)  
  - [User Profiles & Roles](#1-user-profiles--roles)  
  - [Projects](#2-projects)  
  - [Milestones](#3-milestones)  
- [Technology Stack](#technology-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
- [Platform Walkthrough](#platform-walkthrough)  
  - [The Client Journey](#the-client-journey)  
  - [The Freelancer Journey](#the-freelancer-journey)  
- [Smart Contract Deep Dive](#smart-contract-deep-dive)  
  - [UserRegistry Contract](#userregistry-contract)  
  - [FreelanceEscrow Contract](#freelanceescrow-contract)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

---

## About The Project  

Traditional freelance platforms act as centralized middlemen. They charge fees, delay payments, and often enforce opaque rules. Disputes lack transparency, and users depend entirely on the platform’s control.  

The **BlockDAG Freelance Platform** eliminates this dependency by shifting everything on-chain:  

- **Trustless Agreements** – Smart contracts enforce project terms automatically.  
- **Secure Escrow** – Funds are locked in escrow and only released upon approval.  
- **Transparent Identity** – Immutable on-chain record of profiles and reputations.  
- **Decentralized Control** – No company controlling funds or rules. The code is the law.  

This creates a fair marketplace where your wallet is your identity, your work is verified, and your payment is guaranteed.  

---

## Key Features  

- **Decentralized User Profiles**: Manage professional identity on-chain.  
- **Role-Based Access Control**: Register as Client, Freelancer, or Both.  
- **On-Chain Project Management**: Post jobs and manage them directly on blockchain.  
- **Secure Escrow Payments**: Funds locked in smart contracts at project start.  
- **Milestone-Based Workflow**: Smaller, individually payable tasks.  
- **Public Reputation System**: Immutable on-chain rating system.  

---

## Architecture Overview  

The system is built on three layers:  

```mermaid
graph TD
    subgraph Browser
        A[Frontend App <br> (Next.js, React, Wagmi)]
    end

    subgraph Blockchain (EVM)
        C[UserRegistry Contract <br> (Manages User Identities & Roles)]
        D[FreelanceEscrow Contract <br> (Manages Projects, Milestones, Payments)]
    end

    A -- "Read/Write via Wagmi Hooks" --> B{Contract Interaction Layer};
    B -- "Calls Functions on" --> C;
    B -- "Calls Functions on" --> D;
    D -- "Verifies User Role" --> C;

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px


## Features


- **Streamlined Setup**: Create a complete BlockDAG application with a single command
- **Modern Stack**: Next.js frontend with Web3 integration
- **Dual Smart Contract Development**: Includes both Hardhat and Foundry environments
- **Production Ready**: Follows best practices for BlockDAG development
- **Lightweight**: Fast project creation with minimal dependencies


## Project Structure

```
your-app/
├── contracts/
│   ├── hardhat/
│   │   ├── contracts/     # Solidity smart contracts
│   │   ├── scripts/       # Deployment scripts
│   │   └── test/          # Contract tests
│   └── foundry/
│       ├── src/           # Solidity smart contracts
│       ├── test/          # Contract tests
│       └── script/        # Deployment scripts
└── frontend/
    ├── app/               # Next.js application
    ├── components/        # React components
    └── public/            # Static assets
```


## Environment Setup


After creating your project, you'll need to set up your environment:

### Frontend (.env.local)

```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

Get your WalletConnect Project ID at https://cloud.walletconnect.com/

### Smart Contracts (.env)

```
PRIVATE_KEY=your_private_key_here
RPC_URL=your_rpc_url_here
```


## Development Workflow

1. **Create your project**:
   ```bash
   npx @blockdag/create-blockdag-app@latest
   cd my-blockdag-app
   ```
   
2. **Set up the frontend**:
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your WalletConnect Project ID
   yarn install
   yarn dev
   ```
   
3. **Set up Foundry**:
   ```bash
   cd ../contracts/foundry
   cp .env.example .env
   # Edit .env with your private key and RPC URL
   forge build
   ```
   
4. **Set up Hardhat**:
   ```bash
   cd ../hardhat
   yarn install
   npx hardhat compile
   ```

5. **Add Foundry submodules** (optional but recommended):
   ```bash
   # From project root
   git submodule add https://github.com/OpenZeppelin/openzeppelin-contracts.git contracts/foundry/lib/openzeppelin-contracts
   git submodule add https://github.com/foundry-rs/forge-std contracts/foundry/lib/forge-std
   ```

## Smart Contract Development

### Using Hardhat

```bash
cd contracts/hardhat
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network primordial
```

### Using Foundry

```bash
cd contracts/foundry
forge build
forge test
forge script script/Deployer.s.sol --rpc-url $RPC_URL --broadcast --legacy --private-key $PRIVATE_KEY
```

## Frontend Development

```bash
cd frontend
yarn dev
```
