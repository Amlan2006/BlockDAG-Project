import { Chain } from 'viem';

export const blockdagPrimordial = {
  id: 1043,
  name: 'BlockDAG Primordial',
  nativeCurrency: {
    decimals: 18,
    name: 'BlockDAG',
    symbol: 'BDAG',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.primordial.bdagscan.com'],
    },
    public: {
      http: ['https://rpc.primordial.bdagscan.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BDAGScan',
      url: 'https://primordial.bdagscan.com',
    },
  },
} as const satisfies Chain;

// Anvil local network for testing
export const anvilLocal = {
  id: 31337,
  name: 'Anvil Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Local Explorer',
      url: 'http://localhost:8545',
    },
  },
} as const satisfies Chain; 