"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { 
  useAvailableProjects, 
  useProject, 
  useFreelanceEscrowWrite,
  useFreelancerProjects,
  useMilestoneCount, 
  useIsFreelancer,
  formatProjectStatus 
} from '../../utils/contracts';
import { parseEther, formatEther } from 'viem';

interface Job {
  id: number;
  title: string;
  client: string;
  clientName: string;
  clientRating: number;
  budget: string;
  deadline: string;
  skills: string[];
  description: string;
  postedDate: string;
  applicants: number;
  milestones: {
    description: string;
    amount: string;
    deadline: string;
  }[];
  status: string;
}

interface SearchFilters {
  search: string;
  category: string;
  budgetMin: string;
  budgetMax: string;
}

interface ApplicationData {
  proposal: string;
  proposedRate: string;
  estimatedTime: string;
}

export default function FreelancerDashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('browse');

  // Check if user is registered as freelancer
  const { data: isFreelancer, isLoading: isCheckingFreelancer } = useIsFreelancer();
  
  // Get available projects from smart contract
  const { data: availableProjectIds, isLoading: isLoadingAvailable, refetch: refetchProjects } = useAvailableProjects();
  
  // Get freelancer's assigned projects
  const { data: assignedProjectIds, isLoading: isLoadingAssigned, refetch: refetchAssigned } = useFreelancerProjects();
  
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    proposal: '',
    proposedRate: '',
    estimatedTime: ''
  });
  const [userApplications, setUserApplications] = useState<Set<number>>(new Set());
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: '',
    category: 'all',
    budgetMin: '',
    budgetMax: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const { applyToProject: applyToProjectContract, isPending: isApplying } = useFreelanceEscrowWrite();

  const handleApplyToJob = async (jobId: number) => {
    try {
      // Convert proposed rate to wei
      const proposedRateInWei = parseEther(applicationData.proposedRate);
      
      // Call smart contract function
      await applyToProjectContract(
        jobId,
        applicationData.proposal,
        proposedRateInWei
      );
      
      setUserApplications(prev => new Set([...prev, jobId]));
      setShowApplicationModal(false);
      setApplicationData({ proposal: '', proposedRate: '', estimatedTime: '' });
      
      alert('Application submitted successfully!');
      
      // Refresh projects
      refetchProjects();
    } catch (error: any) {
      console.error('Error applying to job:', error);
      alert('Failed to submit application: ' + (error.message || 'Please try again.'));
    }
  };

  // Component to display assigned project
  const AssignedProjectCard = ({ projectId }: { projectId: number }) => {
    const { data: projectData, isLoading } = useProject(projectId);
    const { data: milestoneCount } = useMilestoneCount(projectId);
    
    if (isLoading || !projectData) {
      return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      );
    }
    
    const [client, freelancer, paymentToken, totalAmount, platformFee, status, createdAt, description] = projectData;
    const projectStatus = formatProjectStatus(status);
    const isAssignedToMe = freelancer.toLowerCase() === address?.toLowerCase();
    
    if (!isAssignedToMe) {
      return null;
    }
    
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-white font-bold text-lg">{description.slice(0, 60)}...</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                projectStatus === 'Active' ? 'bg-green-600 text-white' : 
                projectStatus === 'Completed' ? 'bg-blue-600 text-white' : 
                projectStatus === 'Cancelled' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
              }`}>
                {projectStatus}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
              <span>📅 Started: {new Date(Number(createdAt) * 1000).toLocaleDateString()}</span>
              <span>👤 Client: {client.slice(0, 6)}...{client.slice(-4)}</span>
              <span className="text-green-400">✓ Assigned to You</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-bold text-xl">{formatEther(totalAmount)} ETH</p>
            <p className="text-gray-400 text-sm">Total Budget</p>
          </div>
        </div>
        
        <p className="text-gray-300 mb-4 leading-relaxed">{description}</p>
        
        {/* Project Details */}
        <div className="mb-4 bg-gray-700 rounded-lg p-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Project ID:</span>
              <span className="text-white ml-2">#{projectId}</span>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <span className={`ml-2 ${
                projectStatus === 'Active' ? 'text-green-400' : 
                projectStatus === 'Completed' ? 'text-blue-400' : 
                projectStatus === 'Cancelled' ? 'text-red-400' : 'text-gray-400'
              }`}>{projectStatus}</span>
            </div>
            <div>
              <span className="text-gray-400">Milestones:</span>
              <span className="text-white ml-2">{milestoneCount?.toString() || '0'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => router.push(`/milestones/${projectId}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1"
          >
            View Milestones
          </button>
          <button 
            onClick={() => router.push(`/milestones/${projectId}`)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Submit Work
          </button>
          <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Contact Client
          </button>
        </div>
      </div>
    );
  };

  // Component to display individual project from smart contract
  const ProjectCard = ({ projectId }: { projectId: number }) => {
    const { data: projectData, isLoading } = useProject(projectId);
    
    if (isLoading || !projectData) {
      return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      );
    }
    
    const [client, freelancer, paymentToken, totalAmount, platformFee, status, createdAt, description] = projectData;
    const projectStatus = formatProjectStatus(status);
    const hasFreelancer = freelancer !== '0x0000000000000000000000000000000000000000';
    const hasApplied = userApplications.has(projectId);
    
    // Only show if project is active and doesn't have a freelancer assigned
    if (projectStatus !== 'Active' || hasFreelancer) {
      return null;
    }
    
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-white font-bold text-lg">{description.slice(0, 60)}...</h3>
              {hasApplied && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                  Applied ✓
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
              <span>📅 {new Date(Number(createdAt) * 1000).toLocaleDateString()}</span>
              <span>👤 {client.slice(0, 6)}...{client.slice(-4)}</span>
              <span className="text-green-400">Open for Applications</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-bold text-xl">{formatEther(totalAmount)} ETH</p>
            <p className="text-gray-400 text-sm">Total Budget</p>
          </div>
        </div>
        
        <p className="text-gray-300 mb-4 leading-relaxed">{description}</p>
        
        {/* Project Details */}
        <div className="mb-4 bg-gray-700 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Project ID:</span>
              <span className="text-white ml-2">#{projectId}</span>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400 ml-2">{projectStatus}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setSelectedJob(projectId);
              setShowApplicationModal(true);
            }}
            disabled={hasApplied || isApplying}
            className={`${
              hasApplied || isApplying
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white px-6 py-2 rounded-lg font-medium transition-colors flex-1`}
          >
            {isApplying ? 'Applying...' : hasApplied ? 'Applied ✓' : 'Apply Now'}
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            🔖 Save
          </button>
        </div>
      </div>
    );
  };
  const ApplicationModal = () => {
    if (!showApplicationModal || selectedJob === null) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Apply to Project #{selectedJob}</h3>
            <button 
              onClick={() => setShowApplicationModal(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleApplyToJob(selectedJob);
          }} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Proposal *
              </label>
              <textarea 
                required
                value={applicationData.proposal}
                onChange={(e) => setApplicationData({...applicationData, proposal: e.target.value})}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
                rows={6}
                placeholder="Describe your approach to this project, relevant experience, and why you're the best fit..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Proposed Rate (ETH) *
                </label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={applicationData.proposedRate}
                  onChange={(e) => setApplicationData({...applicationData, proposedRate: e.target.value})}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
                  placeholder="Your rate for this project"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Estimated Timeline
                </label>
                <input 
                  type="text"
                  value={applicationData.estimatedTime}
                  onChange={(e) => setApplicationData({...applicationData, estimatedTime: e.target.value})}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                disabled={isApplying}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {isApplying ? 'Submitting Application...' : 'Submit Application'}
              </button>
              <button 
                type="button"
                onClick={() => setShowApplicationModal(false)}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const MyProjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Assigned Projects</h2>
        <button 
          onClick={() => refetchAssigned()}
          disabled={isLoadingAssigned}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoadingAssigned ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {isLoadingAssigned ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your assigned projects...</p>
        </div>
      ) : assignedProjectIds && assignedProjectIds.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-gray-400">
              You have {assignedProjectIds.length} assigned project{assignedProjectIds.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="space-y-4">
            {assignedProjectIds.map((projectId) => (
              <AssignedProjectCard key={projectId} projectId={Number(projectId)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-white text-xl font-bold mb-2">No Assigned Projects Yet</h3>
          <p className="text-gray-400 text-lg mb-6">
            You haven't been assigned to any projects yet. Keep applying to available projects!
          </p>
          <button 
            onClick={() => setActiveTab('browse')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Browse Available Projects
          </button>
        </div>
      )}
    </div>
  );

  const FindJobs = () => (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Browse Available Projects</h2>
          <button 
            onClick={() => refetchProjects()}
            disabled={isLoadingAvailable}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoadingAvailable ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-gray-400">
            Showing {availableProjectIds?.length || 0} available projects
          </p>
        </div>
      </div>

      {/* Project Listings */}
      <div className="space-y-4">
        {isLoadingAvailable ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading available projects...</p>
          </div>
        ) : availableProjectIds && availableProjectIds.length > 0 ? (
          <div className="space-y-4">
            {availableProjectIds.map((projectId) => (
              <ProjectCard key={projectId} projectId={Number(projectId)} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <h3 className="text-white text-xl font-bold mb-2">No Projects Available</h3>
            <p className="text-gray-400 mb-4">
              There are currently no open projects available for applications.
            </p>
            <p className="text-gray-500 text-sm">
              Check back later or refresh to see new opportunities!
            </p>
          </div>
        )}
      </div>
      
      <ApplicationModal />
    </div>
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Please connect your wallet to access the freelancer dashboard.</p>
        </div>
      </div>
    );
  }

  if (isCheckingFreelancer) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying freelancer status...</p>
        </div>
      </div>
    );
  }

  if (!isFreelancer) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You must be registered as a freelancer to access this dashboard.</p>
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

  return (
    <div className="min-h-screen bg-[#070E1B] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Freelancer Dashboard</h1>
            <p className="text-gray-400">Manage your projects and find new opportunities.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button 
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'browse', label: '🔍 Browse Projects' },
            { id: 'my-projects', label: '📋 My Projects' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'browse' && <FindJobs />}
        {activeTab === 'my-projects' && <MyProjects />}
      </div>
    </div>
  );
}