"use client";

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useRouter } from 'next/navigation';
import { FreelanceEscrowABI, UserRegistryABI, contractAddress } from '../constants';
import RatingModal from './RatingModal';

export default function FreelanceApp() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState<number | null>(null);

  // Contract interaction for approving milestones
  const { writeContract: approveMilestone, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  // Read user's projects
  const { data: clientProjects } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'getClientProjects',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  const handleViewProfile = (freelancerAddress: string) => {
    router.push(`/freelancer/profile/${freelancerAddress}`);
  };

  const handleApproveMilestone = async (projectId: number, milestoneIndex: number, freelancerAddress: string) => {
    try {
      // First approve the milestone
      await approveMilestone({
        address: contractAddress as `0x${string}`,
        abi: FreelanceEscrowABI,
        functionName: 'approveMilestone',
        args: [BigInt(projectId), BigInt(milestoneIndex)],
      });
      
      // Note: The rating modal will be shown after successful transaction confirmation
      // This is handled by the useEffect hook monitoring transaction status
    } catch (error) {
      console.error('Error approving milestone:', error);
    }
  };

  // Show rating modal after successful milestone approval
  useEffect(() => {
    if (isApproveSuccess && currentProjectId !== null && currentMilestoneIndex !== null) {
      setShowRatingModal(true);
    }
  }, [isApproveSuccess, currentProjectId, currentMilestoneIndex]);

  const handleRatingComplete = () => {
    // Refresh the page or update state as needed
    window.location.reload();
  };

  const Dashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-primary rounded-lg p-4">
        <h3 className="text-primary text-sm font-medium">Active Projects</h3>
        <p className="text-primary text-2xl font-bold">3</p>
      </div>
      <div className="bg-secondary rounded-lg p-4">
        <h3 className="text-primary text-sm font-medium">Completed</h3>
        <p className="text-primary text-2xl font-bold">12</p>
      </div>
      <div className="bg-accent rounded-lg p-4">
        <h3 className="text-primary text-sm font-medium">Total Earned</h3>
        <p className="text-primary text-2xl font-bold">5.2 ETH</p>
      </div>
      <div className="bg-primary-dark rounded-lg p-4">
        <h3 className="text-primary text-sm font-medium">Reputation</h3>
        <p className="text-primary text-2xl font-bold">4.8 ⭐</p>
      </div>
    </div>
  );

  const CreateProject = () => (
    <div className="card">
      <h2 className="text-xl font-bold text-primary mb-6">Create New Project</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none" 
            placeholder="Project Title"
          />
          <input 
            className="bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none" 
            placeholder="Freelancer Address (0x...)"
          />
        </div>
        <textarea 
          className="w-full bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none" 
          placeholder="Project Description"
          rows={3}
        />
        <div className="bg-background-secondary rounded-lg p-4 border border-secondary">
          <h3 className="text-primary font-medium mb-3">Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input placeholder="Description" className="bg-background text-primary px-3 py-2 rounded border border-accent focus:border-primary focus:outline-none" />
            <input placeholder="Amount (ETH)" type="number" className="bg-background text-primary px-3 py-2 rounded border border-accent focus:border-primary focus:outline-none" />
            <input type="date" className="bg-background text-primary px-3 py-2 rounded border border-accent focus:border-primary focus:outline-none" />
          </div>
          <button type="button" className="text-secondary text-sm hover:text-primary">+ Add Another Milestone</button>
        </div>
        <button className="btn-primary w-full">
          Create Project & Deposit Funds
        </button>
      </form>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Welcome to FreelanceDAO</h2>
        <p className="text-muted mb-6">
          The first fully decentralized freelance platform built on BlockDAG
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex space-x-4 mb-6">
        {['dashboard', 'create', 'projects'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold capitalize ${
              activeTab === tab 
                ? 'bg-primary text-primary' 
                : 'bg-background-secondary text-primary hover:bg-background'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'create' && <CreateProject />}
      {activeTab === 'projects' && (
        <div className="card">
          <h2 className="text-xl font-bold text-primary mb-4">My Projects</h2>
          <div className="space-y-4">
            <div className="bg-background-secondary rounded-lg p-4 border border-secondary">
              <h3 className="text-primary font-medium">E-commerce Website</h3>
              <p className="text-muted text-sm mb-2">Freelancer: 0x123...abc</p>
              <p className="text-muted text-sm">Status: Milestone 2 Submitted</p>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => {
                    setCurrentProjectId(1);
                    setCurrentMilestoneIndex(2);
                    handleApproveMilestone(1, 2, "0x123abc");
                  }}
                  className="btn-primary"
                  disabled={isApproving}
                >
                  {isApproving ? 'Approving...' : 'Approve & Rate'}
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                  Dispute
                </button>
                <button 
                  onClick={() => handleViewProfile("0x123abc")}
                  className="btn-outline"
                >
                  View Profile
                </button>
              </div>
            </div>
            
            <div className="bg-background-secondary rounded-lg p-4 border border-secondary">
              <h3 className="text-primary font-medium">Mobile App Development</h3>
              <p className="text-muted text-sm mb-2">Freelancer: 0x456...def</p>
              <p className="text-muted text-sm">Status: Milestone 1 Submitted</p>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => {
                    setCurrentProjectId(2);
                    setCurrentMilestoneIndex(1);
                    handleApproveMilestone(2, 1, "0x456def");
                  }}
                  className="btn-primary"
                  disabled={isApproving}
                >
                  {isApproving ? 'Approving...' : 'Approve & Rate'}
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                  Dispute
                </button>
                <button 
                  onClick={() => handleViewProfile("0x456def")}
                  className="btn-outline"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showRatingModal && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setCurrentProjectId(null);
            setCurrentMilestoneIndex(null);
          }}
          freelancerAddress={""}
          onRatingComplete={handleRatingComplete}
        />
      )}
    </div>
  );
}