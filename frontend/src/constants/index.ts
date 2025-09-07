import { FreelanceEscrowABI, UserRegistryABI } from "./abi";

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Anvil local network (Chain ID: 31337)
  31337: {
    FreelanceEscrow: "0x71C95911E9a5D330f4D621842EC243EE1343292e",
    UserRegistry: "0x8464135c8F25Da09e49BC8782676a84730C318bC"
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
