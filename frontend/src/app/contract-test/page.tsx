"use client";

import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { 
  useAvailableProjects, 
  useContractAddress, 
  useFreelanceEscrowWrite,
  formatProjectStatus 
} from '../../utils/contracts';
import { FreelanceEscrowABI } from '../../constants';
import { parseEther, formatEther } from 'viem';

export default function ContractTest() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { freelanceEscrow, userRegistry, chainId } = useContractAddress();
  const { data: availableProjects, isLoading, error } = useAvailableProjects();
  const { applyToProject } = useFreelanceEscrowWrite();

  const [testApplication, setTestApplication] = useState({
    projectId: '',
    proposal: '',
    proposedRate: ''
  });

  // Test reading contract data
  const { data: projectCounter } = useReadContract({
    address: freelanceEscrow as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'projectCounter',
  });

  const handleTestApplication = async () => {
    if (!testApplication.projectId || !testApplication.proposal || !testApplication.proposedRate) {
      alert('Please fill all fields');
      return;
    }

    try {
      const proposedRateInWei = parseEther(testApplication.proposedRate);
      
      await applyToProject(
        parseInt(testApplication.projectId),
        testApplication.proposal,
        proposedRateInWei
      );
      
      alert('Test application submitted successfully!');
      setTestApplication({ projectId: '', proposal: '', proposedRate: '' });
    } catch (error) {
      console.error('Error submitting test application:', error);
      alert('Failed to submit test application.');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Wallet</h1>
          <p className="text-gray-400">Please connect your wallet to test the smart contract.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070E1B] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Smart Contract Test</h1>
            <p className="text-gray-400">Test the deployed FreelanceEscrow contract</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Home
          </button>
        </div>

        {/* Contract Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Contract Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Network Chain ID:</p>
              <p className="text-white font-mono">{chainId}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">FreelanceEscrow Address:</p>
              <p className="text-white font-mono text-sm">{freelanceEscrow}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">UserRegistry Address:</p>
              <p className="text-white font-mono text-sm">{userRegistry}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Connected Account:</p>
              <p className="text-white font-mono text-sm">{address}</p>
            </div>
          </div>
        </div>

        {/* Contract State */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Contract State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Project Counter:</p>
              <p className="text-white">{projectCounter?.toString() || 'Loading...'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Available Projects:</p>
              {isLoading ? (
                <p className="text-white">Loading...</p>
              ) : error ? (
                <p className="text-red-400">Error: {error.message}</p>
              ) : (
                <p className="text-white">
                  {availableProjects ? `${availableProjects.length} projects` : 'No projects'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Available Projects */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Available Projects</h2>
          {isLoading ? (
            <p className="text-gray-400">Loading available projects...</p>
          ) : error ? (
            <p className="text-red-400">Error loading projects: {error.message}</p>
          ) : availableProjects && availableProjects.length > 0 ? (
            <div className="space-y-2">
              {availableProjects.map((projectId, index) => (
                <div key={index} className="bg-gray-700 rounded p-3">
                  <p className="text-white">Project ID: {projectId.toString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No available projects found. You may need to create some projects first.</p>
          )}
        </div>

        {/* Test Application Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Test Application Submission</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Project ID
              </label>
              <input 
                type="number"
                value={testApplication.projectId}
                onChange={(e) => setTestApplication({...testApplication, projectId: e.target.value})}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter project ID (e.g., 0, 1, 2...)"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Proposal
              </label>
              <textarea 
                value={testApplication.proposal}
                onChange={(e) => setTestApplication({...testApplication, proposal: e.target.value})}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                rows={3}
                placeholder="Enter your proposal..."
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Proposed Rate (ETH)
              </label>
              <input 
                type="number"
                step="0.01"
                value={testApplication.proposedRate}
                onChange={(e) => setTestApplication({...testApplication, proposedRate: e.target.value})}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter proposed rate in ETH"
              />
            </div>
            <button 
              onClick={handleTestApplication}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Submit Test Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}