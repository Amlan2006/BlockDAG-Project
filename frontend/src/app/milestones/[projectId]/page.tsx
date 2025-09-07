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
        <div className="card animate-pulse">
          <div className="h-6 bg-background-secondary rounded mb-4"></div>
          <div className="h-4 bg-background-secondary rounded mb-2"></div>
          <div className="h-4 bg-background-secondary rounded"></div>
        </div>
      );
    }
    
    const [description, amount, deadline, status, deliverable, submittedAt] = milestoneData;
    const milestoneStatus = MilestoneStatus[status as keyof typeof MilestoneStatus] || 'Unknown';
    const isSubmitted = status >= 1;
    const isApproved = status === 2;
    const canSubmit = status === 0 && projectData && projectData[1].toLowerCase() === address?.toLowerCase();
    
    return (
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-primary font-bold text-lg">Milestone #{milestoneIndex + 1}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 0 ? 'bg-yellow-600 text-white' : 
                status === 1 ? 'bg-secondary text-primary' : 
                status === 2 ? 'bg-green-600 text-white' : 
                status === 3 ? 'bg-red-600 text-white' : 'bg-background-secondary text-primary'
              }`}>
                {milestoneStatus}
              </span>
            </div>
            <p className="text-muted mb-3">{description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted">Amount:</span>
                <span className="text-secondary font-bold ml-2">{formatEther(amount)} ETH</span>
              </div>
              <div>
                <span className="text-muted">Deadline:</span>
                <span className="text-primary ml-2">
                  {new Date(Number(deadline) * 1000).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted">Status:</span>
                <span className={`ml-2 ${
                  status === 0 ? 'text-accent' : 
                  status === 1 ? 'text-secondary' : 
                  status === 2 ? 'text-green-400' : 
                  status === 3 ? 'text-red-400' : 'text-muted'
                }`}>
                  {milestoneStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Deliverable Information */}
        {isSubmitted && (
          <div className="mb-4 bg-background-secondary rounded-lg p-4 border border-secondary">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-primary font-medium">Deliverable</h4>
              <span className="text-muted text-sm">
                Submitted: {new Date(Number(submittedAt) * 1000).toLocaleDateString()}
              </span>
            </div>
            {deliverable ? (
              <div className="bg-background rounded p-3">
                <p className="text-primary break-all">{deliverable}</p>
                {deliverable.startsWith('http') && (
                  <a 
                    href={deliverable} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-accent text-sm mt-2 inline-block"
                  >
                    🔗 View Deliverable
                  </a>
                )}
              </div>
            ) : (
              <p className="text-muted italic">No deliverable URL provided</p>
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
              className="btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Work'}
            </button>
          )}
          
          {isSubmitted && !isApproved && (
            <div className="bg-background-secondary bg-opacity-20 border border-secondary rounded-lg px-4 py-2">
              <span className="text-secondary text-sm">⏳ Awaiting client approval</span>
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
        <div className="card w-full max-w-2xl mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-primary">Submit Milestone #{selectedMilestone + 1}</h3>
            <button 
              onClick={() => {
                setShowSubmitModal(false);
                setDeliverableUrl('');
                setSelectedMilestone(null);
              }}
              className="text-muted hover:text-primary text-xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-muted text-sm font-medium mb-2">
                Deliverable URL *
              </label>
              <input
                type="url"
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                className="w-full bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none"
                placeholder="https://github.com/your-repo or https://drive.google.com/file/..."
              />
              <p className="text-muted text-sm mt-1">
                Provide a link to your completed work (GitHub repo, Google Drive, etc.)
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleSubmitMilestone(selectedMilestone)}
                disabled={isSubmitting || !deliverableUrl.trim()}
                className={`flex-1 ${
                  isSubmitting || !deliverableUrl.trim()
                    ? 'bg-background-secondary text-muted cursor-not-allowed' 
                    : 'btn-primary'
                } py-3 rounded-lg font-medium`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Milestone'}
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setDeliverableUrl('');
                  setSelectedMilestone(null);
                }}
                className="btn-outline flex-1"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-muted">Please connect your wallet to view milestones.</p>
        </div>
      </div>
    );
  }

  if (isCheckingFreelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted">Verifying freelancer status...</p>
        </div>
      </div>
    );
  }

  if (!isFreelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-muted mb-6">You must be registered as a freelancer to view milestones.</p>
          <button 
            onClick={() => router.push('/')}
            className="btn-primary"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted">Loading project milestones...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Project Not Found</h1>
          <p className="text-muted mb-6">The requested project could not be found.</p>
          <button 
            onClick={() => router.push('/freelancer')}
            className="btn-primary"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-muted mb-6">You can only view milestones for projects assigned to you.</p>
          <button 
            onClick={() => router.push('/freelancer')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <button 
              onClick={() => router.push('/freelancer')}
              className="text-secondary hover:text-primary mb-4 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-primary mb-2">Project Milestones</h1>
            <p className="text-muted">Submit your work and track milestone progress</p>
          </div>
        </div>

        {/* Project Summary */}
        <div className="card mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-primary mb-2">Project #{projectId}</h2>
              <p className="text-muted mb-2">{description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted">
                  Budget: <span className="text-primary font-medium">{formatEther(totalAmount)} ETH</span>
                </span>
                <span className="text-muted">
                  Created: <span className="text-primary">{new Date(Number(createdAt) * 1000).toLocaleDateString()}</span>
                </span>
                <span className="text-muted">
                  Milestones: <span className="text-primary font-medium">{milestoneCount?.toString() || '0'}</span>
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              projectStatus === 'Active' ? 'bg-yellow-600 text-white' : 
              projectStatus === 'Completed' ? 'bg-green-600 text-white' : 
              projectStatus === 'Cancelled' ? 'bg-red-600 text-white' : 'bg-background-secondary text-primary'
            }`}>
              {projectStatus}
            </span>
          </div>
          
          <div className="bg-primary bg-opacity-20 border border-secondary rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary font-medium">👤 Client:</span>
              <span className="text-primary font-mono">
                {client.slice(0, 6)}...{client.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Milestones List */}
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Milestones ({milestoneCount?.toString() || '0'})
          </h2>
          
          {!milestoneCount || milestoneCount === BigInt(0) ? (
            <div className="text-center py-12">
              <div className="text-accent text-6xl mb-4">📋</div>
              <h3 className="text-primary text-xl font-bold mb-2">No Milestones Created</h3>
              <p className="text-muted text-lg">
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