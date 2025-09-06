"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { 
  useProject, 
  useMilestoneCount,
  useMilestone,
  useFreelanceEscrowWrite,
  useIsClient,
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

export default function ClientMilestonesPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const projectId = parseInt(params.projectId as string);
  
  // Check if user is registered as client
  const { data: isClient, isLoading: isCheckingClient } = useIsClient();
  
  // Get project data and milestone count
  const { data: projectData, isLoading: isLoadingProject } = useProject(projectId);
  const { data: milestoneCount, isLoading: isLoadingCount } = useMilestoneCount(projectId);
  
  // Smart contract functions
  const { approveMilestone, isPending: isApproving } = useFreelanceEscrowWrite();
  
  const [approvingMilestone, setApprovingMilestone] = useState<number | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

  const handleApproveMilestone = async (milestoneIndex: number) => {
    try {
      setApprovingMilestone(milestoneIndex);
      
      await approveMilestone(projectId, milestoneIndex);
      
      alert('Milestone approved successfully! Payment has been transferred to the freelancer.');
      setShowApprovalModal(false);
      setSelectedMilestone(null);
      
      // Refresh page after approval
      await new Promise(resolve => setTimeout(resolve, 3000));
      window.location.reload();
    } catch (error) {
      console.error('Error approving milestone:', error);
      alert('Failed to approve milestone. Please try again.');
    } finally {
      setApprovingMilestone(null);
    }
  };

  // Component to display individual milestone
  const MilestoneCard = ({ milestoneIndex }: { milestoneIndex: number }) => {
    const { data: milestoneData, isLoading } = useMilestone(projectId, milestoneIndex);
    
    if (isLoading || !milestoneData) {
      return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      );
    }
    
    const [description, amount, deadline, status, deliverable, submittedAt] = milestoneData;
    const milestoneStatus = MilestoneStatus[status as keyof typeof MilestoneStatus] || 'Unknown';
    const isSubmitted = status === 1;
    const isApproved = status === 2;
    const canApprove = status === 1 && projectData && projectData[0].toLowerCase() === address?.toLowerCase();
    
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-white font-bold text-lg">Milestone #{milestoneIndex + 1}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 0 ? 'bg-yellow-600 text-white' : 
                status === 1 ? 'bg-blue-600 text-white' : 
                status === 2 ? 'bg-green-600 text-white' : 
                status === 3 ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
              }`}>
                {milestoneStatus}
              </span>
              {isSubmitted && (
                <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium animate-pulse">
                  🔔 Needs Review
                </span>
              )}
            </div>
            <p className="text-gray-300 mb-3">{description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Amount:</span>
                <span className="text-green-400 font-bold ml-2">{formatEther(amount)} ETH</span>
              </div>
              <div>
                <span className="text-gray-400">Deadline:</span>
                <span className="text-white ml-2">
                  {new Date(Number(deadline) * 1000).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span className={`ml-2 ${
                  status === 0 ? 'text-yellow-400' : 
                  status === 1 ? 'text-blue-400' : 
                  status === 2 ? 'text-green-400' : 
                  status === 3 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {milestoneStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Deliverable Information */}
        {(isSubmitted || isApproved) && (
          <div className="mb-4 bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium">Submitted Work</h4>
              <span className="text-gray-400 text-sm">
                Submitted: {new Date(Number(submittedAt) * 1000).toLocaleDateString()}
              </span>
            </div>
            {deliverable ? (
              <div className="bg-gray-600 rounded p-3">
                <p className="text-gray-300 break-all mb-2">{deliverable}</p>
                {deliverable.startsWith('http') && (
                  <a 
                    href={deliverable} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm inline-block"
                  >
                    🔗 View Deliverable
                  </a>
                )}
              </div>
            ) : (
              <p className="text-gray-400 italic">No deliverable URL provided</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {canApprove && (
            <button
              onClick={() => {
                setSelectedMilestone(milestoneIndex);
                setShowApprovalModal(true);
              }}
              disabled={isApproving || approvingMilestone === milestoneIndex}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex-1"
            >
              {approvingMilestone === milestoneIndex ? 'Approving...' : '✅ Approve & Pay'}
            </button>
          )}
          
          {canApprove && (
            <button
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              🚨 Dispute
            </button>
          )}
          
          {status === 0 && (
            <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg px-4 py-2 flex-1">
              <span className="text-yellow-400 text-sm">⏳ Waiting for freelancer submission</span>
            </div>
          )}
          
          {isApproved && (
            <div className="bg-green-600 bg-opacity-20 border border-green-600 rounded-lg px-4 py-2 flex-1">
              <span className="text-green-400 text-sm">✅ Approved & Payment Sent</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Approval Confirmation Modal
  const ApprovalModal = () => {
    if (!showApprovalModal || selectedMilestone === null) return null;
    
    const { data: milestoneData } = useMilestone(projectId, selectedMilestone);
    const amount = milestoneData ? formatEther(milestoneData[1]) : '0';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-white mb-2">Approve Milestone</h3>
            <p className="text-gray-400">
              This will approve Milestone #{selectedMilestone + 1} and automatically transfer{' '}
              <span className="text-green-400 font-bold">{amount} ETH</span> to the freelancer.
            </p>
          </div>
          
          <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm">
              ⚠️ <strong>Important:</strong> This action cannot be undone. Make sure you have reviewed the submitted work carefully.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => handleApproveMilestone(selectedMilestone)}
              disabled={isApproving}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {isApproving ? 'Processing...' : 'Confirm Approval'}
            </button>
            <button 
              onClick={() => {
                setShowApprovalModal(false);
                setSelectedMilestone(null);
              }}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Security and loading checks
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Please connect your wallet to view milestones.</p>
        </div>
      </div>
    );
  }

  if (isCheckingClient) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying client status...</p>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You must be registered as a client to approve milestones.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingProject || isLoadingCount) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project milestones...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-gray-400 mb-6">The requested project could not be found.</p>
          <button 
            onClick={() => router.push('/client')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
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
  const isProjectOwner = client.toLowerCase() === address?.toLowerCase();

  if (!isProjectOwner) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You can only approve milestones for your own projects.</p>
          <button 
            onClick={() => router.push('/client')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const milestoneIndices = Array.from({ length: Number(milestoneCount || 0) }, (_, i) => i);

  return (
    <div className="min-h-screen bg-[#070E1B] p-6">
      <ApprovalModal />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <button 
              onClick={() => router.push('/client')}
              className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Milestone Management</h1>
            <p className="text-gray-400">Review and approve submitted work from your freelancer</p>
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Project #{projectId}</h2>
              <p className="text-gray-300 mb-2">{description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">
                  Total Budget: <span className="text-white font-medium">{formatEther(totalAmount)} ETH</span>
                </span>
                <span className="text-gray-400">
                  Freelancer: <span className="text-white">{freelancer.slice(0, 6)}...{freelancer.slice(-4)}</span>
                </span>
                <span className="text-gray-400">
                  Milestones: <span className="text-white font-medium">{milestoneCount?.toString() || '0'}</span>
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              projectStatus === 'Active' ? 'bg-green-600 text-white' : 
              projectStatus === 'Completed' ? 'bg-blue-600 text-white' : 
              projectStatus === 'Cancelled' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
            }`}>
              {projectStatus}
            </span>
          </div>
        </div>

        {/* Milestones List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Milestones ({milestoneCount?.toString() || '0'})
          </h2>
          
          {milestoneIndices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-white text-xl font-bold mb-2">No Milestones Found</h3>
              <p className="text-gray-400 text-lg">
                This project doesn't have any milestones configured.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {milestoneIndices.map((index) => (
                <MilestoneCard key={index} milestoneIndex={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}