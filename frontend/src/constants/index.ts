import { FreelanceEscrowABI } from "./abi";

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Anvil local network (Chain ID: 31337)
  31337: {
    FreelanceEscrow: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    UserRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  },
  // Add other networks as needed
  // 1: { // Ethereum Mainnet
  //   FreelanceEscrow: "0x...",
  //   UserRegistry: "0x..."
  // }
} as const;

// Default to Anvil network for testing
export const CURRENT_NETWORK = 31337;
export const contractAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].FreelanceEscrow;
export const userRegistryAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].UserRegistry;

// Export ABI for compatibility
export const abi = FreelanceEscrowABI;
export { FreelanceEscrowABI };
