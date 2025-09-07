"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { 
  useProject, 
  useMilestoneCount,
  useMilestone,
  useFreelanceEscrowWrite,
  useIsFreelancer,
  formatProjectStatus 
} from '@/utils/contracts';
import { formatEther } from 'viem';

// Milestone status enum mapping
const MilestoneStatus = {
  0: 'Pending',
  1: 'Submitted', 
  2: 'Approved',
  3: 'Disputed'
} as const;

export default function ProjectMilestonesPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const projectId = parseInt(params.projectId as string);
  
  // Check if user is registered as freelancer
  const { data: isFreelancer, isLoading: isCheckingFreelancer } = useIsFreelancer();
  
  // Get project data and milestone count
  const { data: projectData, isLoading: isLoadingProject } = useProject(projectId);
  const { data: milestoneCount, isLoading: isLoadingCount } = useMilestoneCount(projectId);
  
  // Smart contract functions
  const { submitMilestone, isPending: isSubmitting } = useFreelanceEscrowWrite();
  
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [deliverableUrl, setDeliverableUrl] = useState('');

  const handleSubmitMilestone = async (milestoneIndex: number) => {
    if (!deliverableUrl.trim()) {
      alert('Please provide a deliverable URL');
      return;
    }

    try {
      await submitMilestone(projectId, milestoneIndex, deliverableUrl);
      
      alert('Milestone submitted successfully!');
      setShowSubmitModal(false);
      setDeliverableUrl('');
      setSelectedMilestone(null);
      
      // Refresh page after submission
      await new Promise(resolve => setTimeout(resolve, 3000));
      window.location.reload();
    } catch (error) {
      console.error('Error submitting milestone:', error);
      alert('Failed to submit milestone. Please try again.');
    }
  };

  // Component to display individual milestone
  const MilestoneCard = ({ milestoneIndex }: { milestoneIndex: number }) => {
    const { data: milestoneData, isLoading } = useMilestone(projectId, milestoneIndex);
    
    if (isLoading || !milestoneData) {
      return (
        <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033] animate-pulse">
          <div className="h-6 bg-[#660033] rounded mb-4"></div>
          <div className="h-4 bg-[#660033] rounded mb-2"></div>
          <div className="h-4 bg-[#660033] rounded"></div>
        </div>
      );
    }
    
    const [description, amount, deadline, status, deliverable, submittedAt] = milestoneData;
    const milestoneStatus = MilestoneStatus[status as keyof typeof MilestoneStatus] || 'Unknown';
    const isSubmitted = status >= 1;
    const isApproved = status === 2;
    const canSubmit = status === 0 && projectData && projectData[1].toLowerCase() === address?.toLowerCase();
    
    return (
      <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-[#f8f0f5] font-bold text-lg">Milestone #{milestoneIndex + 1}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 0 ? 'bg-yellow-600 text-white' : 
                status === 1 ? 'bg-[#ff69b4] text-white' : 
                status === 2 ? 'bg-green-600 text-white' : 
                status === 3 ? 'bg-red-600 text-white' : 'bg-[#660033] text-white'
              }`}>
                {milestoneStatus}
              </span>
            </div>
            <p className="text-[#f0d0e0] mb-3">{description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[#f0d0e0]">Amount:</span>
                <span className="text-[#ff69b4] font-bold ml-2">{formatEther(amount)} ETH</span>
              </div>
              <div>
                <span className="text-[#f0d0e0]">Deadline:</span>
                <span className="text-[#f8f0f5] ml-2">
                  {new Date(Number(deadline) * 1000).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-[#f0d0e0]">Status:</span>
                <span className={`ml-2 ${
                  status === 0 ? 'text-[#ffb6c1]' : 
                  status === 1 ? 'text-[#ff69b4]' : 
                  status === 2 ? 'text-green-400' : 
                  status === 3 ? 'text-red-400' : 'text-[#f0d0e0]'
                }`}>
                  {milestoneStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Deliverable Information */}
        {isSubmitted && (
          <div className="mb-4 bg-[#660033] rounded-lg p-4 border border-[#800040]">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-[#f8f0f5] font-medium">Deliverable</h4>
              <span className="text-[#f0d0e0] text-sm">
                Submitted: {new Date(Number(submittedAt) * 1000).toLocaleDateString()}
              </span>
            </div>
            {deliverable ? (
              <div className="bg-[#800040] rounded p-3">
                <p className="text-[#f8f0f5] break-all">{deliverable}</p>
                {deliverable.startsWith('http') && (
                  <a 
                    href={deliverable} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#ff69b4] hover:text-[#ff1493] text-sm mt-2 inline-block"
                  >
                    🔗 View Deliverable
                  </a>
                )}
              </div>
            ) : (
              <p className="text-[#f0d0e0] italic">No deliverable URL provided</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {canSubmit && (
            <button
              onClick={() => {
                setSelectedMilestone(milestoneIndex);
                setShowSubmitModal(true);
              }}
              disabled={isSubmitting}
              className="bg-[#ff1493] text-white px-6 py-2 rounded-lg hover:bg-[#cc1076] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Work'}
            </button>
          )}
          
          {isSubmitted && !isApproved && (
            <div className="bg-[#660033] bg-opacity-20 border border-[#ff69b4] rounded-lg px-4 py-2">
              <span className="text-[#ff69b4] text-sm">⏳ Awaiting client approval</span>
            </div>
          )}
          
          {isApproved && (
            <div className="bg-green-600 bg-opacity-20 border border-green-600 rounded-lg px-4 py-2">
              <span className="text-green-400 text-sm">✅ Approved & Paid</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Submit Modal Component
  const SubmitModal = () => {
    if (!showSubmitModal || selectedMilestone === null) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#4d0026] rounded-lg p-6 w-full max-w-2xl mx-4 border border-[#660033]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-[#f8f0f5]">Submit Milestone #{selectedMilestone + 1}</h3>
            <button 
              onClick={() => {
                setShowSubmitModal(false);
                setDeliverableUrl('');
                setSelectedMilestone(null);
              }}
              className="text-[#f0d0e0] hover:text-[#f8f0f5] text-xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[#f0d0e0] text-sm font-medium mb-2">
                Deliverable URL *
              </label>
              <input
                type="url"
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                className="w-full bg-[#660033] text-[#f8f0f5] px-4 py-3 rounded-lg border border-[#800040] focus:border-[#ff1493] focus:outline-none"
                placeholder="https://github.com/your-repo or https://drive.google.com/file/..."
              />
              <p className="text-[#f0d0e0] text-sm mt-1">
                Provide a link to your completed work (GitHub repo, Google Drive, etc.)
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleSubmitMilestone(selectedMilestone)}
                disabled={isSubmitting || !deliverableUrl.trim()}
                className={`flex-1 ${
                  isSubmitting || !deliverableUrl.trim()
                    ? 'bg-[#33001a] text-[#f0d0e0] cursor-not-allowed' 
                    : 'bg-[#ff1493] hover:bg-[#cc1076] text-white'
                } py-3 rounded-lg font-medium transition-colors`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Milestone'}
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setDeliverableUrl('');
                  setSelectedMilestone(null);
                }}
                className="flex-1 bg-[#660033] text-[#f8f0f5] py-3 rounded-lg hover:bg-[#800040] font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Security checks
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f8f0f5] mb-4">Access Denied</h1>
          <p className="text-[#f0d0e0]">Please connect your wallet to view milestones.</p>
        </div>
      </div>
    );
  }

  if (isCheckingFreelancer) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff1493] mx-auto mb-4"></div>
          <p className="text-[#f0d0e0]">Verifying freelancer status...</p>
        </div>
      </div>
    );
  }

  if (!isFreelancer) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f8f0f5] mb-4">Access Denied</h1>
          <p className="text-[#f0d0e0] mb-6">You must be registered as a freelancer to view milestones.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-[#ff1493] text-white px-6 py-3 rounded-lg hover:bg-[#cc1076]"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Loading states
  if (isLoadingProject || isLoadingCount) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff1493] mx-auto mb-4"></div>
          <p className="text-[#f0d0e0]">Loading project milestones...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f8f0f5] mb-4">Project Not Found</h1>
          <p className="text-[#f0d0e0] mb-6">The requested project could not be found.</p>
          <button 
            onClick={() => router.push('/freelancer')}
            className="bg-[#ff1493] text-white px-6 py-3 rounded-lg hover:bg-[#cc1076]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Parse project data
  const [client, freelancer, paymentToken, totalAmount, platformFee, status, createdAt, description] = projectData;
  const projectStatus = formatProjectStatus(status);
  const hasFreelancer = freelancer !== '0x0000000000000000000000000000000000000000';
  
  // Check if current user is the assigned freelancer
  const isAssignedFreelancer = freelancer.toLowerCase() === address?.toLowerCase();

  if (!isAssignedFreelancer) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f8f0f5] mb-4">Access Denied</h1>
          <p className="text-[#f0d0e0] mb-6">You can only view milestones for projects assigned to you.</p>
          <button 
            onClick={() => router.push('/freelancer')}
            className="bg-[#ff1493] text-white px-6 py-3 rounded-lg hover:bg-[#cc1076]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a000d] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <button 
              onClick={() => router.push('/freelancer')}
              className="text-[#ff69b4] hover:text-[#ff1493] mb-4 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-[#f8f0f5] mb-2">Project Milestones</h1>
            <p className="text-[#f0d0e0]">Submit your work and track milestone progress</p>
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-[#4d0026] rounded-lg p-6 mb-8 border border-[#660033]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#f8f0f5] mb-2">Project #{projectId}</h2>
              <p className="text-[#f0d0e0] mb-2">{description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-[#f0d0e0]">
                  Budget: <span className="text-[#f8f0f5] font-medium">{formatEther(totalAmount)} ETH</span>
                </span>
                <span className="text-[#f0d0e0]">
                  Created: <span className="text-[#f8f0f5]">{new Date(Number(createdAt) * 1000).toLocaleDateString()}</span>
                </span>
                <span className="text-[#f0d0e0]">
                  Milestones: <span className="text-[#f8f0f5] font-medium">{milestoneCount?.toString() || '0'}</span>
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              projectStatus === 'Active' ? 'bg-yellow-600 text-white' : 
              projectStatus === 'Completed' ? 'bg-green-600 text-white' : 
              projectStatus === 'Cancelled' ? 'bg-red-600 text-white' : 'bg-[#660033] text-white'
            }`}>
              {projectStatus}
            </span>
          </div>
          
          <div className="bg-[#ff1493] bg-opacity-20 border border-[#ff69b4] rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-[#ff69b4] font-medium">👤 Client:</span>
              <span className="text-[#f8f0f5] font-mono">
                {client.slice(0, 6)}...{client.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Milestones List */}
        <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
          <h2 className="text-2xl font-bold text-[#f8f0f5] mb-6">
            Milestones ({milestoneCount?.toString() || '0'})
          </h2>
          
          {!milestoneCount || milestoneCount === 0n ? (
            <div className="text-center py-12">
              <div className="text-[#ffb6c1] text-6xl mb-4">📋</div>
              <h3 className="text-[#f8f0f5] text-xl font-bold mb-2">No Milestones Created</h3>
              <p className="text-[#f0d0e0] text-lg">
                This project doesn't have any milestones yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from({ length: Number(milestoneCount) }, (_, index) => (
                <MilestoneCard key={index} milestoneIndex={index} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Submit Modal */}
      <SubmitModal />
    </div>
  );
}
