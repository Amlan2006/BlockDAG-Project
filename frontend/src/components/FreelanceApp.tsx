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
      <div className="bg-[#ff1493] rounded-lg p-4">
        <h3 className="text-[#f8f0f5] text-sm font-medium">Active Projects</h3>
        <p className="text-[#f8f0f5] text-2xl font-bold">3</p>
      </div>
      <div className="bg-[#ff69b4] rounded-lg p-4">
        <h3 className="text-[#f8f0f5] text-sm font-medium">Completed</h3>
        <p className="text-[#f8f0f5] text-2xl font-bold">12</p>
      </div>
      <div className="bg-[#ffb6c1] rounded-lg p-4">
        <h3 className="text-[#1a000d] text-sm font-medium">Total Earned</h3>
        <p className="text-[#1a000d] text-2xl font-bold">5.2 ETH</p>
      </div>
      <div className="bg-[#cc1076] rounded-lg p-4">
        <h3 className="text-[#f8f0f5] text-sm font-medium">Reputation</h3>
        <p className="text-[#f8f0f5] text-2xl font-bold">4.8 ⭐</p>
      </div>
    </div>
  );

  const CreateProject = () => (
    <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
      <h2 className="text-xl font-bold text-[#f8f0f5] mb-6">Create New Project</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="bg-[#660033] text-[#f8f0f5] px-4 py-3 rounded-lg border border-[#800040] focus:border-[#ff1493] focus:outline-none" 
            placeholder="Project Title"
          />
          <input 
            className="bg-[#660033] text-[#f8f0f5] px-4 py-3 rounded-lg border border-[#800040] focus:border-[#ff1493] focus:outline-none" 
            placeholder="Freelancer Address (0x...)"
          />
        </div>
        <textarea 
          className="w-full bg-[#660033] text-[#f8f0f5] px-4 py-3 rounded-lg border border-[#800040] focus:border-[#ff1493] focus:outline-none" 
          placeholder="Project Description"
          rows={3}
        />
        <div className="bg-[#660033] rounded-lg p-4 border border-[#800040]">
          <h3 className="text-[#f8f0f5] font-medium mb-3">Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input placeholder="Description" className="bg-[#800040] text-[#f8f0f5] px-3 py-2 rounded border border-[#99004d] focus:border-[#ff1493] focus:outline-none" />
            <input placeholder="Amount (ETH)" type="number" className="bg-[#800040] text-[#f8f0f5] px-3 py-2 rounded border border-[#99004d] focus:border-[#ff1493] focus:outline-none" />
            <input type="date" className="bg-[#800040] text-[#f8f0f5] px-3 py-2 rounded border border-[#99004d] focus:border-[#ff1493] focus:outline-none" />
          </div>
          <button type="button" className="text-[#ff69b4] text-sm hover:text-[#ff1493]">+ Add Another Milestone</button>
        </div>
        <button className="w-full bg-[#ff1493] text-white px-6 py-3 rounded-lg hover:bg-[#cc1076] transition-colors">
          Create Project & Deposit Funds
        </button>
      </form>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="bg-[#4d0026] rounded-lg p-12 text-center border border-[#660033]">
        <h2 className="text-2xl font-bold text-[#f8f0f5] mb-4">Welcome to FreelanceDAO</h2>
        <p className="text-[#f0d0e0] mb-6">
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
              activeTab === tab ? 'bg-[#ff1493] text-white' : 'bg-[#4d0026] text-[#f8f0f5] hover:bg-[#660033]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'create' && <CreateProject />}
      {activeTab === 'projects' && (
        <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
          <h2 className="text-xl font-bold text-[#f8f0f5] mb-4">My Projects</h2>
          <div className="space-y-4">
            <div className="bg-[#660033] rounded-lg p-4 border border-[#800040]">
              <h3 className="text-[#f8f0f5] font-medium">E-commerce Website</h3>
              <p className="text-[#f0d0e0] text-sm mb-2">Freelancer: 0x123...abc</p>
              <p className="text-[#f0d0e0] text-sm">Status: Milestone 2 Submitted</p>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => {
                    setCurrentProjectId(1);
                    setCurrentMilestoneIndex(2);
                    handleApproveMilestone(1, 2, "0x123abc");
                  }}
                  className="bg-[#ff1493] text-white px-4 py-2 rounded text-sm hover:bg-[#cc1076]"
                  disabled={isApproving}
                >
                  {isApproving ? 'Approving...' : 'Approve & Rate'}
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                  Dispute
                </button>
                <button 
                  onClick={() => handleViewProfile("0x123abc")}
                  className="bg-[#660033] text-[#f8f0f5] px-4 py-2 rounded text-sm hover:bg-[#800040]"
                >
                  View Profile
                </button>
              </div>
            </div>
            
            <div className="bg-[#660033] rounded-lg p-4 border border-[#800040]">
              <h3 className="text-[#f8f0f5] font-medium">Mobile App Development</h3>
              <p className="text-[#f0d0e0] text-sm mb-2">Freelancer: 0x456...def</p>
              <p className="text-[#f0d0e0] text-sm">Status: Milestone 1 Submitted</p>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => {
                    setCurrentProjectId(2);
                    setCurrentMilestoneIndex(1);
                    handleApproveMilestone(2, 1, "0x456def");
                  }}
                  className="bg-[#ff1493] text-white px-4 py-2 rounded text-sm hover:bg-[#cc1076]"
                  disabled={isApproving}
                >
                  {isApproving ? 'Approving...' : 'Approve & Rate'}
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                  Dispute
                </button>
                <button 
                  onClick={() => handleViewProfile("0x456def")}
                  className="bg-[#660033] text-[#f8f0f5] px-4 py-2 rounded text-sm hover:bg-[#800040]"
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