"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { 
  useProject, 
  useProjectApplications,
  useFreelanceEscrowWrite,
  useIsClient,
  formatProjectStatus 
} from '@/utils/contracts';
import { formatEther } from 'viem';

export default function ProjectApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const projectId = parseInt(params.projectId as string);
  
  // Check if user is registered as client
  const { data: isClient, isLoading: isCheckingClient } = useIsClient();
  
  // Get project data and applications
  const { data: projectData, isLoading: isLoadingProject } = useProject(projectId);
  const { data: applications, isLoading: isLoadingApplications } = useProjectApplications(projectId);
  
  // Smart contract functions
  const { assignFreelancer } = useFreelanceEscrowWrite();
  
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null);

  const handleAssignFreelancer = async (freelancerAddress: string) => {
    try {
      setIsAssigning(true);
      setSelectedFreelancer(freelancerAddress);
      
      await assignFreelancer(projectId, freelancerAddress);
      
      alert('Freelancer assigned successfully!');
      
      // Refresh data after assignment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Redirect back to client dashboard
      router.push('/client');
    } catch (error) {
      console.error('Error assigning freelancer:', error);
      alert('Failed to assign freelancer. Please try again.');
    } finally {
      setIsAssigning(false);
      setSelectedFreelancer(null);
    }
  };

  // Security checks
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f8f0f5] mb-4">Access Denied</h1>
          <p className="text-[#f0d0e0]">Please connect your wallet to view applications.</p>
        </div>
      </div>
    );
  }

  if (isCheckingClient) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff1493] mx-auto mb-4"></div>
          <p className="text-[#f0d0e0]">Verifying client status...</p>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f8f0f5] mb-4">Access Denied</h1>
          <p className="text-[#f0d0e0] mb-6">You must be registered as a client to view applications.</p>
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
  if (isLoadingProject || isLoadingApplications) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff1493] mx-auto mb-4"></div>
          <p className="text-[#f0d0e0]">Loading project applications...</p>
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
            onClick={() => router.push('/client')}
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
  
  // Parse applications data structure
  const freelancersArray = applications && applications[0] ? applications[0] as any[] : [];
  const proposalsArray = applications && applications[1] ? applications[1] as any[] : [];
  const proposedRatesArray = applications && applications[2] ? applications[2] as any[] : [];
  const appliedAtArray = applications && applications[3] ? applications[3] as any[] : [];
  const isAcceptedArray = applications && applications[4] ? applications[4] as any[] : [];
  
  const hasApplications = freelancersArray.length > 0;
  const applicationCount = freelancersArray.length;

  // Check if current user is the project owner
  const isProjectOwner = client.toLowerCase() === address?.toLowerCase();

  if (!isProjectOwner) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f8f0f5] mb-4">Access Denied</h1>
          <p className="text-[#f0d0e0] mb-6">You can only view applications for your own projects.</p>
          <button 
            onClick={() => router.push('/client')}
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
              onClick={() => router.push('/client')}
              className="text-[#ff69b4] hover:text-[#ff1493] mb-4 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-[#f8f0f5] mb-2">Project Applications</h1>
            <p className="text-[#f0d0e0]">Review and manage applications for your project</p>
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
                  Applications: <span className="text-[#f8f0f5] font-medium">{applicationCount}</span>
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
          
          {hasFreelancer && (
            <div className="bg-[#ff1493] bg-opacity-20 border border-[#ff69b4] rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-[#ff69b4] font-medium">✓ Freelancer Assigned:</span>
                <span className="text-[#f8f0f5] font-mono">
                  {freelancer.slice(0, 6)}...{freelancer.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Applications List */}
        <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
          <h2 className="text-2xl font-bold text-[#f8f0f5] mb-6">
            Applications ({applicationCount})
          </h2>
          
          {!hasApplications ? (
            <div className="text-center py-12">
              <div className="text-[#ffb6c1] text-6xl mb-4">📝</div>
              <h3 className="text-[#f8f0f5] text-xl font-bold mb-2">No Applications Yet</h3>
              <p className="text-[#f0d0e0] text-lg">
                Once freelancers apply to your project, you'll see their proposals here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {freelancersArray.map((freelancerAddress: string, index: number) => (
                <div key={index} className="bg-[#660033] rounded-lg p-6 border border-[#800040]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-[#f8f0f5] font-bold text-lg">
                          {freelancerAddress.slice(0, 6)}...{freelancerAddress.slice(-4)}
                        </h3>
                        <span className="bg-[#ff1493] text-white px-3 py-1 rounded-full text-sm font-medium">
                          Application #{index + 1}
                        </span>
                        {isAcceptedArray[index] && (
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            ✓ Accepted
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-[#f0d0e0] text-sm">Applied On:</span>
                          <p className="text-[#f8f0f5] font-medium">
                            {new Date(Number(appliedAtArray[index]) * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-[#f0d0e0] text-sm">Proposed Rate:</span>
                          <p className="text-[#ff69b4] font-bold text-lg">
                            {formatEther(proposedRatesArray[index])} ETH
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-[#f0d0e0] text-sm">Proposal:</span>
                        <div className="bg-[#800040] rounded-lg p-4 mt-2">
                          <p className="text-[#f8f0f5] leading-relaxed">
                            {proposalsArray[index]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-[#800040]">
                    <button
                      onClick={() => handleAssignFreelancer(freelancerAddress)}
                      disabled={isAssigning || isAcceptedArray[index] || hasFreelancer}
                      className={`${
                        isAssigning && selectedFreelancer === freelancerAddress
                          ? 'bg-[#33001a] text-[#f0d0e0] cursor-not-allowed' 
                          : isAcceptedArray[index] || hasFreelancer
                          ? 'bg-[#33001a] text-[#f0d0e0] cursor-not-allowed'
                          : 'bg-[#ff1493] hover:bg-[#cc1076] text-white'
                      } px-6 py-2 rounded-lg font-medium flex-1 transition-colors`}
                    >
                      {isAssigning && selectedFreelancer === freelancerAddress
                        ? 'Assigning...' 
                        : isAcceptedArray[index]
                        ? 'Already Assigned'
                        : hasFreelancer
                        ? 'Project Assigned'
                        : 'Assign Freelancer'
                      }
                    </button>
                    <button
                      onClick={() => router.push(`/freelancer/profile/${freelancerAddress}`)}
                      className="bg-[#660033] text-[#f8f0f5] px-6 py-2 rounded-lg hover:bg-[#800040] transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}