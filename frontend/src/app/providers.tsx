'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { blockdagPrimordial } from '../chains';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'a1df65d9fe53b0a3d9ddc9d1cf61b32c';

const metadata = {
  name: 'BlockDAG Starter Kit',
  description: 'BlockDAG Starter Kit Web3 App',
  url: 'https://blockdag.network', 
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [blockdagPrimordial] as const;
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({ wagmiConfig: config, projectId });

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 