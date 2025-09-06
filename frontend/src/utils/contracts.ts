import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { FreelanceEscrowABI, CONTRACT_ADDRESSES } from '../constants';

// Hook to get the correct contract address based on current network
export function useContractAddress() {
  const { chain } = useAccount();
  const chainId = chain?.id || 31337; // Default to Anvil
  
  return {
    freelanceEscrow: CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.FreelanceEscrow,
    userRegistry: CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.UserRegistry,
    chainId
  };
}

// Hook for reading available projects
export function useAvailableProjects() {
  const { freelanceEscrow } = useContractAddress();
  
  return useReadContract({
    address: freelanceEscrow as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'getAvailableProjects',
  });
}

// Hook for reading project details
export function useProject(projectId: number) {
  const { freelanceEscrow } = useContractAddress();
  
  return useReadContract({
    address: freelanceEscrow as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'getProject',
    args: [BigInt(projectId)],
  });
}

// Hook for reading project applications
export function useProjectApplications(projectId: number) {
  const { freelanceEscrow } = useContractAddress();
  
  return useReadContract({
    address: freelanceEscrow as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'getProjectApplications',
    args: [BigInt(projectId)],
  });
}

// Hook for writing contract functions
export function useFreelanceEscrowWrite() {
  const { freelanceEscrow } = useContractAddress();
  const { writeContract, ...rest } = useWriteContract();
  
  const applyToProject = (projectId: number, proposal: string, proposedRate: bigint) => {
    return writeContract({
      address: freelanceEscrow as `0x${string}`,
      abi: FreelanceEscrowABI,
      functionName: 'applyToProject',
      args: [BigInt(projectId), proposal, proposedRate],
    });
  };
  
  const createProject = (
    freelancer: string,
    paymentToken: string,
    projectDescription: string,
    milestoneDescriptions: string[],
    milestoneAmounts: bigint[],
    milestoneDeadlines: bigint[],
    value?: bigint
  ) => {
    return writeContract({
      address: freelanceEscrow as `0x${string}`,
      abi: FreelanceEscrowABI,
      functionName: 'createProject',
      args: [
        freelancer as `0x${string}`,
        paymentToken as `0x${string}`,
        projectDescription,
        milestoneDescriptions,
        milestoneAmounts,
        milestoneDeadlines,
      ],
      value,
    });
  };
  
  const assignFreelancer = (projectId: number, freelancerAddress: string) => {
    return writeContract({
      address: freelanceEscrow as `0x${string}`,
      abi: FreelanceEscrowABI,
      functionName: 'assignFreelancer',
      args: [BigInt(projectId), freelancerAddress as `0x${string}`],
    });
  };
  
  const submitMilestone = (projectId: number, milestoneIndex: number, deliverable: string) => {
    return writeContract({
      address: freelanceEscrow as `0x${string}`,
      abi: FreelanceEscrowABI,
      functionName: 'submitMilestone',
      args: [BigInt(projectId), BigInt(milestoneIndex), deliverable],
    });
  };
  
  const approveMilestone = (projectId: number, milestoneIndex: number) => {
    return writeContract({
      address: freelanceEscrow as `0x${string}`,
      abi: FreelanceEscrowABI,
      functionName: 'approveMilestone',
      args: [BigInt(projectId), BigInt(milestoneIndex)],
    });
  };
  
  return {
    writeContract,
    applyToProject,
    createProject,
    assignFreelancer,
    submitMilestone,
    approveMilestone,
    ...rest,
  };
}

// Utility functions for formatting
export function formatProjectStatus(status: number): string {
  const statusMap = {
    0: 'Active',
    1: 'Completed',
    2: 'Disputed',
    3: 'Cancelled'
  };
  return statusMap[status as keyof typeof statusMap] || 'Unknown';
}

export function formatMilestoneStatus(status: number): string {
  const statusMap = {
    0: 'Pending',
    1: 'Submitted',
    2: 'Approved',
    3: 'Disputed',
    4: 'Cancelled'
  };
  return statusMap[status as keyof typeof statusMap] || 'Unknown';
}