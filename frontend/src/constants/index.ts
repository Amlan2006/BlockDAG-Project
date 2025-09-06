import { FreelanceEscrowABI, UserRegistryABI } from "./abi";

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Anvil local network (Chain ID: 31337)
  31337: {
    FreelanceEscrow: "0x2E983A1Ba5e8b38AAAeC4B440B9dDcFBf72E15d1",
    UserRegistry: "0x663F3ad617193148711d28f5334eE4Ed07016602"
  },
  // BlockDAG Testnet (Chain ID: 1043)
  1043: {
    FreelanceEscrow: "0x96fe78279FAf7A13aa28Dbf95372C6211DfE5d4a",
    UserRegistry: "0xeCE0f83Ff830FD139665349BA391e2ADE19DcED6"
  },
  // Add other networks as needed
  // 1: { // Ethereum Mainnet
  //   FreelanceEscrow: "0x...",
  //   UserRegistry: "0x..."
  // }
} as const;

// Default to BlockDAG testnet
export const CURRENT_NETWORK = 1043;
export const contractAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].FreelanceEscrow;
export const userRegistryAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].UserRegistry;

// Export ABI for compatibility
export const abi = FreelanceEscrowABI;
export { FreelanceEscrowABI, UserRegistryABI };
