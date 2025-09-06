# BlockDAG FreelanceEscrow Smart Contract Integration

## Overview

This setup integrates the deployed FreelanceEscrow smart contract with the frontend application for testing on the Anvil local blockchain.

## Contract Information

- **FreelanceEscrow Address**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **UserRegistry Address**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Network**: Anvil Local (Chain ID: 31337)
- **RPC URL**: `http://127.0.0.1:8545`

## Setup Instructions

### 1. Start Anvil Local Blockchain

```bash
cd contracts/foundry
anvil
```

This will start a local blockchain on `http://127.0.0.1:8545` with Chain ID `31337`.

### 2. Deploy Smart Contracts

```bash
# Deploy the contracts
forge script script/DeployFreelanceEscrow.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 3. Update Contract Addresses

The contract addresses are already configured in the frontend:

- `frontend/src/constants/index.ts` - Contains contract addresses
- `frontend/src/constants/abi.ts` - Contains the FreelanceEscrow ABI
- `frontend/src/chains.ts` - Contains Anvil network configuration

### 4. Start Frontend Application

```bash
cd frontend
npm run dev
```

## Testing the Integration

### Option 1: Use the Contract Test Page

Visit `http://localhost:3000/contract-test` to access a dedicated testing interface that allows you to:

- View contract information and state
- Check available projects
- Submit test applications to projects

### Option 2: Use the Freelancer Dashboard

Visit `http://localhost:3000/freelancer` to test the full freelancer interface:

- Browse available projects
- Apply to projects using the smart contract
- View application status

## Smart Contract Functions Available

### View Functions
- `getAvailableProjects()` - Get list of projects without assigned freelancers
- `getProject(projectId)` - Get detailed project information
- `getProjectApplications(projectId)` - Get all applications for a project
- `projectCounter()` - Get total number of projects

### Write Functions
- `applyToProject(projectId, proposal, proposedRate)` - Apply to a project
- `createProject(...)` - Create a new project (client function)
- `assignFreelancer(projectId, freelancer)` - Assign freelancer to project
- `submitMilestone(...)` - Submit milestone deliverables
- `approveMilestone(...)` - Approve milestone payments

## Network Configuration

The frontend is configured to work with multiple networks:

```typescript
const CONTRACT_ADDRESSES = {
  // Anvil local network (Chain ID: 31337)
  31337: {
    FreelanceEscrow: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    UserRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  }
};
```

## Wallet Connection

1. Connect your wallet to the application
2. Add the Anvil Local network to your wallet:
   - **Network Name**: Anvil Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH

3. Import one of the Anvil test accounts:
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

## Troubleshooting

### Common Issues

1. **Contract not found**: Ensure Anvil is running and contracts are deployed
2. **Wrong network**: Make sure your wallet is connected to Anvil Local (Chain ID: 31337)
3. **Transaction fails**: Check if you have enough ETH and the correct permissions

### Useful Commands

```bash
# Check if contracts are deployed
forge script script/DeployFreelanceEscrow.s.sol --rpc-url http://127.0.0.1:8545

# Check contract state
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "projectCounter()" --rpc-url http://127.0.0.1:8545

# Check available projects
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "getAvailableProjects()" --rpc-url http://127.0.0.1:8545
```

## Next Steps

1. **Create Test Projects**: Use the client interface to create some test projects
2. **Test Full Workflow**: Test the complete freelancer workflow from application to milestone completion
3. **Add More Features**: Integrate additional contract functions like milestone management and ratings
4. **Deploy to Testnet**: Deploy to a public testnet for broader testing

## File Structure

```
frontend/src/
├── constants/
│   ├── abi.ts          # Smart contract ABI
│   └── index.ts        # Contract addresses and configuration
├── utils/
│   └── contracts.ts    # Contract interaction hooks
├── chains.ts           # Network configurations
├── configs/
│   └── index.tsx       # Wagmi configuration
└── app/
    ├── contract-test/  # Contract testing interface
    └── freelancer/     # Freelancer dashboard
```