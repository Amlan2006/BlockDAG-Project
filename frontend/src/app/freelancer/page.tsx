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
  category: string; // Add category field
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
        <div className="card animate-pulse">
          <div className="h-6 bg-background-secondary rounded mb-4"></div>
          <div className="h-4 bg-background-secondary rounded mb-2"></div>
          <div className="h-4 bg-background-secondary rounded"></div>
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
      <div className="card hover:border-primary transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-primary font-bold text-lg">{description.slice(0, 60)}...</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                projectStatus === 'Active' ? 'bg-yellow-600 text-white' : 
                projectStatus === 'Completed' ? 'bg-green-600 text-white' : 
                projectStatus === 'Cancelled' ? 'bg-red-600 text-white' : 'bg-background-secondary text-primary'
              }`}>
                {projectStatus}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-accent mb-2">
              <span>📅 Started: {new Date(Number(createdAt) * 1000).toLocaleDateString()}</span>
              <span>👤 Client: {client.slice(0, 6)}...{client.slice(-4)}</span>
              <span className="text-secondary">✓ Assigned to You</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-secondary font-bold text-xl">{formatEther(totalAmount)} ETH</p>
            <p className="text-accent text-sm">Total Budget</p>
          </div>
        </div>
        
        <p className="text-muted mb-4 leading-relaxed">{description}</p>
        
        {/* Project Details */}
        <div className="mb-4 bg-background-secondary rounded-lg p-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-accent">Project ID:</span>
              <span className="text-primary ml-2">#{projectId}</span>
            </div>
            <div>
              <span className="text-accent">Status:</span>
              <span className={`ml-2 ${
                projectStatus === 'Active' ? 'text-accent' : 
                projectStatus === 'Completed' ? 'text-green-400' : 
                projectStatus === 'Cancelled' ? 'text-red-400' : 'text-primary'
              }`}>{projectStatus}</span>
            </div>
            <div>
              <span className="text-accent">Milestones:</span>
              <span className="text-primary ml-2">{milestoneCount?.toString() || '0'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => router.push(`/milestones/${projectId}`)}
            className="btn-primary flex-1"
          >
            View Milestones
          </button>
          <button 
            onClick={() => router.push(`/milestones/${projectId}`)}
            className="btn-secondary"
          >
            Submit Work
          </button>
          <button className="btn-outline">
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
        <div className="card animate-pulse">
          <div className="h-6 bg-background-secondary rounded mb-4"></div>
          <div className="h-4 bg-background-secondary rounded mb-2"></div>
          <div className="h-4 bg-background-secondary rounded"></div>
        </div>
      );
    }
    
    const [client, freelancer, paymentToken, totalAmount, platformFee, status, createdAt, description] = projectData;
    const projectStatus = formatProjectStatus(status);
    const hasFreelancer = freelancer !== '0x0000000000000000000000000000000000000000';
    const hasApplied = userApplications.has(projectId);
    const category = getCategoryFromDescription(description);
    
    // Apply search filters
    const matchesSearch = searchFilters.search === '' || 
      description.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      category.toLowerCase().includes(searchFilters.search.toLowerCase());
      
    const matchesCategory = searchFilters.category === 'all' || searchFilters.category === category;
    
    const budgetInEth = parseFloat(formatEther(totalAmount));
    const matchesBudgetMin = searchFilters.budgetMin === '' || budgetInEth >= parseFloat(searchFilters.budgetMin);
    const matchesBudgetMax = searchFilters.budgetMax === '' || budgetInEth <= parseFloat(searchFilters.budgetMax);
    
    // Only show if project is active, doesn't have a freelancer assigned, and matches filters
    if (projectStatus !== 'Active' || hasFreelancer || !matchesSearch || !matchesCategory || !matchesBudgetMin || !matchesBudgetMax) {
      return null;
    }
    
    // Get category display name
    const getCategoryName = (category: string): string => {
      const categories: Record<string, string> = {
        'web-development': 'Web Development',
        'mobile-apps': 'Mobile Apps',
        'blockchain': 'Blockchain',
        'design': 'Design',
        'marketing': 'Marketing',
        'writing': 'Writing',
        'data-science': 'Data Science',
        'devops': 'DevOps',
        'consulting': 'Consulting',
        'other': 'Other'
      };
      return categories[category] || category;
    };
    
    return (
      <div className="card hover:border-primary transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-primary font-bold text-lg">{description.slice(0, 60)}...</h3>
              <span className="bg-secondary text-primary px-2 py-1 rounded text-xs font-medium">
                {getCategoryName(category)}
              </span>
              {hasApplied && (
                <span className="bg-primary text-primary px-2 py-1 rounded text-xs font-medium">
                  Applied ✓
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-accent mb-2">
              <span>📅 {new Date(Number(createdAt) * 1000).toLocaleDateString()}</span>
              <span>👤 {client.slice(0, 6)}...{client.slice(-4)}</span>
              <span className="text-secondary">Open for Applications</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-secondary font-bold text-xl">{formatEther(totalAmount)} ETH</p>
            <p className="text-accent text-sm">Total Budget</p>
          </div>
        </div>
        
        <p className="text-muted mb-4 leading-relaxed">{description}</p>
        
        {/* Project Details */}
        <div className="mb-4 bg-background-secondary rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-accent">Project ID:</span>
              <span className="text-primary ml-2">#{projectId}</span>
            </div>
            <div>
              <span className="text-accent">Status:</span>
              <span className="text-secondary ml-2">{projectStatus}</span>
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
                ? 'bg-background-secondary cursor-not-allowed' 
                : 'btn-primary'
            } flex-1`}
          >
            {isApplying ? 'Applying...' : hasApplied ? 'Applied ✓' : 'Apply Now'}
          </button>
          <button className="btn-outline">
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
        <div className="card w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-primary">Apply to Project #{selectedJob}</h3>
            <button 
              onClick={() => setShowApplicationModal(false)}
              className="text-muted hover:text-primary text-xl"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleApplyToJob(selectedJob);
          }} className="space-y-4">
            <div>
              <label className="block text-muted text-sm font-medium mb-2">
                Proposal *
              </label>
              <textarea 
                required
                value={applicationData.proposal}
                onChange={(e) => setApplicationData({...applicationData, proposal: e.target.value})}
                className="w-full bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none" 
                rows={6}
                placeholder="Describe your approach to this project, relevant experience, and why you're the best fit..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted text-sm font-medium mb-2">
                  Proposed Rate (ETH) *
                </label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={applicationData.proposedRate}
                  onChange={(e) => setApplicationData({...applicationData, proposedRate: e.target.value})}
                  className="w-full bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none" 
                  placeholder="Your rate for this project"
                />
              </div>
              <div>
                <label className="block text-muted text-sm font-medium mb-2">
                  Estimated Timeline
                </label>
                <input 
                  type="text"
                  value={applicationData.estimatedTime}
                  onChange={(e) => setApplicationData({...applicationData, estimatedTime: e.target.value})}
                  className="w-full bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none" 
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                disabled={isApplying}
                className={`flex-1 ${
                  isApplying 
                    ? 'bg-background-secondary text-muted cursor-not-allowed' 
                    : 'btn-primary'
                } py-3 rounded-lg font-medium`}
              >
                {isApplying ? 'Submitting Application...' : 'Submit Application'}
              </button>
              <button 
                type="button"
                onClick={() => setShowApplicationModal(false)}
                className="btn-outline flex-1"
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
        <h2 className="text-2xl font-bold text-primary">My Assigned Projects</h2>
        <button 
          onClick={() => refetchAssigned()}
          disabled={isLoadingAssigned}
          className="btn-primary"
        >
          {isLoadingAssigned ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {isLoadingAssigned ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted">Loading your assigned projects...</p>
        </div>
      ) : assignedProjectIds && assignedProjectIds.length > 0 ? (
        <div className="space-y-6">
          <div className="card">
            <p className="text-muted">
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
          <div className="text-accent text-6xl mb-4">📋</div>
          <h3 className="text-primary text-xl font-bold mb-2">No Assigned Projects Yet</h3>
          <p className="text-muted text-lg mb-6">
            You haven't been assigned to any projects yet. Keep applying to available projects!
          </p>
          <button 
            onClick={() => setActiveTab('browse')}
            className="btn-primary"
          >
            Browse Available Projects
          </button>
        </div>
      )}
    </div>
  );

  const FindJobs = () => {
    // Calculate filtered project count
    const filteredProjectCount = availableProjectIds?.filter(projectId => {
      // We would need to check each project against filters here
      // For now, we'll just show the total count
      return true;
    }).length || 0;
    
    return (
      <div className="space-y-6">
        {/* Search and Filter Header */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">Browse Available Projects</h2>
            <button 
              onClick={() => refetchProjects()}
              disabled={isLoadingAvailable}
              className="btn-primary"
            >
              {isLoadingAvailable ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-muted text-sm font-medium mb-2">
                Search Projects
              </label>
              <input
                type="text"
                value={searchFilters.search}
                onChange={(e) => setSearchFilters({...searchFilters, search: e.target.value})}
                placeholder="Search by title, description, or skills..."
                className="w-full bg-background-secondary text-primary px-4 py-2 rounded-lg border border-secondary focus:border-primary focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-muted text-sm font-medium mb-2">
                Category
              </label>
              <select
                value={searchFilters.category}
                onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
                className="w-full bg-background-secondary text-primary px-4 py-2 rounded-lg border border-secondary focus:border-primary focus:outline-none"
              >
                <option value="all" className="bg-background">All Categories</option>
                <option value="web-development" className="bg-background">Web Development</option>
                <option value="mobile-apps" className="bg-background">Mobile Apps</option>
                <option value="blockchain" className="bg-background">Blockchain</option>
                <option value="design" className="bg-background">Design</option>
                <option value="marketing" className="bg-background">Marketing</option>
                <option value="writing" className="bg-background">Writing</option>
                <option value="data-science" className="bg-background">Data Science</option>
                <option value="devops" className="bg-background">DevOps</option>
                <option value="consulting" className="bg-background">Consulting</option>
                <option value="other" className="bg-background">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-muted text-sm font-medium mb-2">
                Budget Range (ETH)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Min"
                  value={searchFilters.budgetMin}
                  onChange={(e) => setSearchFilters({...searchFilters, budgetMin: e.target.value})}
                  className="w-full bg-background-secondary text-primary px-2 py-2 rounded-lg border border-secondary focus:border-primary focus:outline-none text-sm"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Max"
                  value={searchFilters.budgetMax}
                  onChange={(e) => setSearchFilters({...searchFilters, budgetMax: e.target.value})}
                  className="w-full bg-background-secondary text-primary px-2 py-2 rounded-lg border border-secondary focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-muted">
              Showing {availableProjectIds?.length || 0} available projects
            </p>
            <button 
              onClick={() => setSearchFilters({ search: '', category: 'all', budgetMin: '', budgetMax: '' })}
              className="text-secondary hover:text-primary"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Project Listings */}
        <div className="space-y-4">
          {isLoadingAvailable ? (
            <div className="card text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
              <p className="text-muted">Loading available projects...</p>
            </div>
          ) : availableProjectIds && availableProjectIds.length > 0 ? (
            <div className="space-y-4">
              {availableProjectIds.map((projectId) => (
                <ProjectCard key={projectId} projectId={Number(projectId)} />
              ))}
            </div>
          ) : (
            <div className="card text-center">
              <h3 className="text-primary text-xl font-bold mb-2">No Projects Available</h3>
              <p className="text-muted mb-4">
                There are currently no open projects available for applications.
              </p>
              <p className="text-accent text-sm">
                Check back later or refresh to see new opportunities!
              </p>
            </div>
          )}
        </div>
        
        <ApplicationModal />
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-muted">Please connect your wallet to access the freelancer dashboard.</p>
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
          <p className="text-muted mb-6">You must be registered as a freelancer to access this dashboard.</p>
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Freelancer Dashboard</h1>
            <p className="text-accent">Manage your projects and find new opportunities.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-primary">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button 
              onClick={() => router.push('/')}
              className="btn-primary"
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
                  ? 'bg-primary text-primary'
                  : 'bg-background-secondary text-primary hover:bg-background'
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

const getCategoryFromDescription = (description: string): string => {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('website') || lowerDesc.includes('web') || lowerDesc.includes('frontend') || lowerDesc.includes('backend')) {
    return 'web-development';
  } else if (lowerDesc.includes('mobile') || lowerDesc.includes('app') || lowerDesc.includes('android') || lowerDesc.includes('ios')) {
    return 'mobile-apps';
  } else if (lowerDesc.includes('blockchain') || lowerDesc.includes('smart contract') || lowerDesc.includes('ethereum') || lowerDesc.includes('solidity')) {
    return 'blockchain';
  } else if (lowerDesc.includes('design') || lowerDesc.includes('ui') || lowerDesc.includes('ux') || lowerDesc.includes('graphic')) {
    return 'design';
  } else if (lowerDesc.includes('marketing') || lowerDesc.includes('seo') || lowerDesc.includes('social media')) {
    return 'marketing';
  } else if (lowerDesc.includes('writing') || lowerDesc.includes('content') || lowerDesc.includes('copy') || lowerDesc.includes('article')) {
    return 'writing';
  } else if (lowerDesc.includes('data') || lowerDesc.includes('analytics') || lowerDesc.includes('machine learning') || lowerDesc.includes('ai')) {
    return 'data-science';
  } else if (lowerDesc.includes('devops') || lowerDesc.includes('docker') || lowerDesc.includes('kubernetes') || lowerDesc.includes('ci/cd')) {
    return 'devops';
  } else if (lowerDesc.includes('consult') || lowerDesc.includes('advice') || lowerDesc.includes('strategy')) {
    return 'consulting';
  }
  
  return 'other';
};