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
Table of Contents
About The Project
Key Features
Architecture Overview
How It Works: Core Concepts
1. User Profiles & Roles
2. Projects
3. Milestones
Technology Stack
Getting Started
Prerequisites
Installation
Platform Walkthrough
The Client Journey
The Freelancer Journey
Smart Contract Deep Dive
UserRegistry Contract
FreelanceEscrow Contract
Contributing
License
Contact
About The Project
Traditional freelance platforms act as centralized middlemen, introducing fees, payment delays, and a fundamental lack of transparency. Disputes are often handled opaquely, and both clients and freelancers are subject to the platform's arbitrary rules.
The BlockDAG Freelance Platform solves this by building the entire workflow on-chain.
Trustless Agreements: Smart contracts enforce the terms of the project automatically.
Secure Escrow: Client funds are locked in the FreelanceEscrow smart contract, visible to all, and are only released when the client approves the work.
Transparent Identity: The UserRegistry contract provides an immutable, on-chain record of user profiles and reputations.
Decentralized Control: No single entity controls the funds or the rules. The code is the law.
This project creates a fair and efficient marketplace where your wallet is your identity, your work is verifiably delivered, and your payments are guaranteed by code.
Key Features
Decentralized User Profiles: Create and manage your on-chain professional identity.
Role-Based Access Control: Register as a Client, Freelancer, or Both, unlocking specific platform features.
On-Chain Project Management: Post jobs with detailed descriptions and budgets directly to the blockchain.
Secure Escrow Payments: Funds are locked in a smart contract at the start of a project, guaranteeing payment upon successful completion.
Milestone-Based Workflow: Break down large projects into smaller, manageable, and individually payable tasks.
Public Reputation System: Rate users after project completion to build a transparent and immutable reputation score.
Architecture Overview
The platform is composed of three main layers that work in concert:
code
Mermaid
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
Smart Contracts (Solidity):
UserRegistry.sol: The source of truth for user identity. It handles registration and stores profile data and roles.
FreelanceEscrow.sol: The core engine for project management. It holds funds, tracks project/milestone status, processes payments, and records ratings.
Frontend Contract Interaction Layer (Wagmi):
A set of custom React hooks that wrap wagmi's useReadContract and useWriteContract. This layer provides a simple, type-safe API for the frontend to communicate with the smart contracts, abstracting away the complexities of blockchain interaction.
Frontend Application (Next.js & React):
The user-facing web application that provides the UI for registering, creating projects, applying for jobs, and managing work.
How It Works: Core Concepts
1. User Profiles & Roles
Before interacting with the platform, a user must register their wallet address with the UserRegistry contract. This creates their on-chain profile and assigns them a role:
Client: Can create projects and approve milestones.
Freelancer: Can apply for projects and submit work.
Both: Can perform both client and freelancer actions.
This on-chain identity is crucial for role-based access control throughout the platform.
2. Projects
A Project is the foundational on-chain record for a work agreement. Created by a client, it contains all essential details:
Client & Freelancer Addresses: Who is involved.
Total Amount & Payment Token: The budget and currency.
Description: The scope of work.
Status: The current state (e.g., Active, Completed).
When a project is created, the total budget is transferred from the client's wallet and locked in the FreelanceEscrow contract.
3. Milestones
Large projects are broken down into Milestones. Each milestone is a sub-task within the project with its own:
Description: Specific task to be completed.
Amount: Payment for this specific task.
Deadline: Expected completion date.
Status: The current state (Pending, Submitted, Approved).
When a client approves a milestone, the FreelanceEscrow contract automatically transfers the milestone's payment from the locked funds to the freelancer's wallet. This step-by-step process reduces risk for both parties.
Technology Stack
Frontend:
Next.js
React
TypeScript
Wagmi (for React Hooks interacting with Ethereum)
Viem (as the Ethereum interface)
Tailwind CSS
Smart Contracts:
Solidity
Development Environment:
Hardhat (for compiling, deploying, and testing contracts)
Node.js
Getting Started
Follow these instructions to set up a local development environment.
Prerequisites
Node.js (v18 or later)
Git
A crypto wallet like MetaMask
Installation
Clone the repository:
code
Bash
git clone https://github.com/your-username/blockdag-freelance-platform.git
cd blockdag-freelance-platform
Set up the Smart Contracts:
code
Bash
# Navigate to the contracts directory
cd contracts

# Install dependencies
npm install

# Compile the smart contracts
npx hardhat compile
Run a local blockchain node:
Open a new terminal in the contracts directory and run:
code
Bash
npx hardhat node
This will start a local Hardhat network and provide you with several test accounts and their private keys.
Deploy the contracts to the local node:
In another terminal, from the contracts directory, run:
code
Bash
npx hardhat run scripts/deploy.js --network localhost
Take note of the deployed contract addresses printed in the console.
Set up the Frontend:
code
Bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install
Configure environment variables:
Create a .env.local file in the frontend directory by copying .env.local.example.
Update the contract addresses in .env.local with the addresses you got from the deployment step.
Run the development server:
code
Bash
npm run dev
Open http://localhost:3000 in your browser to see the application running. Configure MetaMask to connect to the local Hardhat network (http://127.0.0.1:8545/) and import one of the test accounts using its private key.
Platform Walkthrough
The Client Journey
Connect Wallet & Register: Connect your wallet and register as a Client or Both.
Create Project: Fill out the project creation form, defining the overall scope and breaking it down into detailed milestones, each with a budget and deadline.
Fund Escrow: Submit the project. The total amount for all milestones is transferred from your wallet and locked in the FreelanceEscrow contract.
Assign Freelancer: Review applications from freelancers and assign the best candidate to the project.
Review & Approve Milestones: As the freelancer submits completed milestones, review their work. If satisfied, click "Approve." This instantly releases the payment for that milestone to the freelancer.
Rate Freelancer: Once the project is complete, leave a rating and comment to contribute to the freelancer's on-chain reputation.
The Freelancer Journey
Connect Wallet & Register: Connect your wallet and register as a Freelancer or Both, filling out your profile with your skills and bio.
Browse & Apply for Projects: View all open projects on the platform. Submit a proposal for jobs that match your skills.
Get Assigned: If a client selects you, you will be formally assigned to the project.
Complete & Submit Milestones: Work on the project one milestone at a time. When a task is complete, submit the deliverable (e.g., a GitHub link) through the platform.
Get Paid Instantly: Once the client approves your submitted milestone, payment is automatically and instantly transferred to your wallet. No delays, no platform fees withheld from the milestone amount.
Rate Client: After the project, rate the client to build a transparent ecosystem.
Smart Contract Deep Dive
UserRegistry Contract
This contract serves as the platform's identity layer.
Write Functions:
registerUser(userType, name, email, ...): Creates a new user profile linked to the caller's address.
View Functions:
getUserProfile(address): Returns the complete public profile of a user.
isRegistered(address): Returns true if the user has a profile.
isClient(address) / isFreelancer(address): Checks if a user has a specific role.
FreelanceEscrow Contract
This is the core business logic contract that orchestrates the entire project lifecycle.
Write Functions (State-Changing & Cost Gas):
createProject(...) payable: Creates a new project, defines its milestones, and receives the total project funds into escrow.
applyToProject(projectId, proposal, ...): Allows a registered freelancer to apply for an open project.
assignFreelancer(projectId, freelancerAddress): Allows the client to officially hire a freelancer.
submitMilestone(projectId, milestoneIndex, deliverable): Called by the assigned freelancer to submit work for review.
approveMilestone(projectId, milestoneIndex): Called by the client to approve work, which triggers the automatic payment for that milestone.
rateUser(userAddress, score, comment): Records a rating for a user after a project is completed.
View Functions (Read-Only & Free):
getProject(projectId): Returns all details for a specific project.
getMilestone(projectId, milestoneIndex): Returns details for a specific milestone.
getAvailableProjects(): Returns a list of all projects open for applications.
getUserRatings(userAddress): Fetches all ratings for a specific user.
Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.
Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your Changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request
License
Distributed under the MIT License. See LICENSE for more information.
Contact
Your Name - @your_twitter - email@example.com
Project Link: https://github.com/your-username/blockdag-freelance-platform
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
