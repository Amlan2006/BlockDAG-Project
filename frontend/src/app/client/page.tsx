"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { 
  useClientProjects, 
  useProject, 
  useProjectApplications,
  useFreelanceEscrowWrite,
  useMilestoneCount,
  useIsClient,
  formatProjectStatus 
} from '@/utils/contracts';
import { formatEther } from 'viem';

export default function ClientDashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if user is registered as client
  const { data: isClient, isLoading: isCheckingClient } = useIsClient();
  
  // Get client's projects
  const { data: projectIds, isLoading: isLoadingProjects } = useClientProjects();
  
  // Smart contract functions
  const { assignFreelancer, approveMilestone } = useFreelanceEscrowWrite();
  
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);
  
  const handleAssignFreelancer = async (projectId: number, freelancerAddress: string) => {
    try {
      setIsAssigning(true);
      await assignFreelancer(projectId, freelancerAddress);
      
      alert('Freelancer assigned successfully!');
      
      // Refresh data after assignment
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Error assigning freelancer:', error);
      alert('Failed to assign freelancer. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };
  
  const handleApproveMilestone = async (projectId: number, milestoneIndex: number) => {
    try {
      await approveMilestone(projectId, milestoneIndex);
      alert('Milestone approved successfully!');
    } catch (error) {
      console.error('Error approving milestone:', error);
      alert('Failed to approve milestone. Please try again.');
    }
  };



  // Component to display individual project details
  const ProjectCard = ({ projectId }: { projectId: number }) => {
    const { data: projectData, isLoading } = useProject(projectId);
    const { data: applications, isLoading: isLoadingApps, error: appsError } = useProjectApplications(projectId);
    const { data: milestoneCount } = useMilestoneCount(projectId);
    
    // Debug logging
    // console.log(`Project ${projectId}:`, {
    //   projectData,
    //   applications,
    //   isLoadingApps,
    //   appsError
    // });
    
    if (isLoading || !projectData) {
      return (
        <div className="bg-[#4d0026] rounded-lg p-6 animate-pulse border border-[#660033]">
          <div className="h-6 bg-[#660033] rounded mb-4"></div>
          <div className="h-4 bg-[#660033] rounded mb-2"></div>
          <div className="h-4 bg-[#660033] rounded"></div>
        </div>
      );
    }
    
    const [client, freelancer, paymentToken, totalAmount, platformFee, status, createdAt, description] = projectData;
    const projectStatus = formatProjectStatus(status);
    const hasFreelancer = freelancer !== '0x0000000000000000000000000000000000000000';
    
    // More detailed application checking
    // applications is [freelancers[], proposals[], proposedRates[], appliedAt[], isAccepted[]]
    const freelancersArray = applications && applications[0] ? applications[0] as any[] : [];
    const hasApplications = Boolean(freelancersArray.length > 0);
    const applicationCount = freelancersArray.length;
    
    // console.log(`Project ${projectId} details:`, {
    //   hasFreelancer,
    //   hasApplications,
    //   applicationCount,
    //   freelancersArray: freelancersArray,
    //   applicationsStructure: applications ? {
    //     freelancers: applications[0],
    //     proposals: applications[1],
    //     proposedRates: applications[2],
    //     appliedAt: applications[3],
    //     isAccepted: applications[4]
    //   } : null
    // });
    
    return (
      <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-[#f8f0f5] font-bold text-lg">{description.slice(0, 50)}...</h3>
            <p className="text-[#f0d0e0] text-sm">
              {hasFreelancer ? `Freelancer: ${freelancer.slice(0, 6)}...${freelancer.slice(-4)}` : 'No freelancer assigned'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            projectStatus === 'Active' ? 'bg-yellow-600' : 
            projectStatus === 'Completed' ? 'bg-green-600' : 
            projectStatus === 'Cancelled' ? 'bg-red-600' : 'bg-[#660033]'
          } text-white`}>
            {projectStatus}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-[#f0d0e0]">Budget:</span>
            <span className="text-[#f8f0f5]">{formatEther(totalAmount)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#f0d0e0]">Created:</span>
            <span className="text-[#f8f0f5]">{new Date(Number(createdAt) * 1000).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#f0d0e0]">Applications:</span>
            <span className="text-[#f8f0f5]">{applicationCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#f0d0e0]">Milestones:</span>
            <span className="text-[#f8f0f5]">{milestoneCount?.toString() || '0'}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedProject(projectId)}
            className="flex-1 bg-[#ff1493] text-white px-3 py-2 rounded hover:bg-[#cc1076]"
          >
            View Details
          </button>
          
          {/* Applications Button */}
          <button 
            onClick={() => {
              // console.log('View Applications clicked for project:', projectId);
              // console.log('Current state:', { hasFreelancer, hasApplications, applicationCount });
              // console.log('Applications data structure:', applications);
              if (hasApplications) {
                router.push(`/applications/${projectId}`);
              } else {
                alert(`No applications found for project ${projectId}. Freelancers count: ${freelancersArray.length}`);
              }
            }}
            className={`flex-1 text-white px-3 py-2 rounded ${
              !hasFreelancer && hasApplications 
                ? 'bg-[#ff69b4] hover:bg-[#ff1493]' 
                : 'bg-[#33001a]'
            }`}
            disabled={hasFreelancer}
          >
            {hasFreelancer 
              ? 'Freelancer Assigned' 
              : hasApplications 
                ? `View Applications (${applicationCount})` 
                : 'No Applications'
            }
          </button>
          
          {/* Milestones Button - Only show if freelancer is assigned */}
          {hasFreelancer && (
            <button 
              onClick={() => router.push(`/client-milestones/${projectId}`)}
              className="flex-1 bg-[#cc1076] text-white px-3 py-2 rounded hover:bg-[#ff1493]"
            >
              Manage Milestones
            </button>
          )}
        </div>
      </div>
    );
  };

  const Overview = () => {
    const activeProjects = projectIds?.filter(id => {
      // This would need individual project data to determine status
      return true; // Placeholder
    })?.length || 0;
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#ff1493] rounded-lg p-4">
            <h3 className="text-[#f8f0f5] text-sm font-medium">Total Projects</h3>
            <p className="text-[#f8f0f5] text-2xl font-bold">{projectIds?.length || 0}</p>
          </div>
          <div className="bg-[#ff69b4] rounded-lg p-4">
            <h3 className="text-[#f8f0f5] text-sm font-medium">Active Projects</h3>
            <p className="text-[#f8f0f5] text-2xl font-bold">{activeProjects}</p>
          </div>
          <div className="bg-[#ffb6c1] rounded-lg p-4">
            <h3 className="text-[#1a000d] text-sm font-medium">Total Spent</h3>
            <p className="text-[#1a000d] text-2xl font-bold">-- ETH</p>
          </div>
          <div className="bg-[#cc1076] rounded-lg p-4">
            <h3 className="text-[#f8f0f5] text-sm font-medium">Avg Rating Given</h3>
            <p className="text-[#f8f0f5] text-2xl font-bold">-- ⭐</p>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
          <h2 className="text-xl font-bold text-[#f8f0f5] mb-4">Recent Projects</h2>
          {isLoadingProjects ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493] mx-auto mb-4"></div>
              <p className="text-[#f0d0e0]">Loading projects...</p>
            </div>
          ) : projectIds && projectIds.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projectIds.slice(0, 4).map((projectId) => (
                <ProjectCard key={projectId} projectId={Number(projectId)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#f0d0e0] mb-4">No projects yet</p>
              <button 
                onClick={() => router.push('/create-project')}
                className="bg-[#ff1493] text-white px-6 py-3 rounded-lg hover:bg-[#cc1076]"
              >
                Create Your First Project
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Projects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#f8f0f5]">My Projects</h2>
        <button 
          onClick={() => router.push('/create-project')}
          className="bg-[#ff1493] text-white px-4 py-2 rounded-lg hover:bg-[#cc1076]"
        >
          + New Project
        </button>
      </div>

      {isLoadingProjects ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff1493] mx-auto mb-4"></div>
          <p className="text-[#f0d0e0]">Loading your projects...</p>
        </div>
      ) : projectIds && projectIds.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projectIds.map((projectId) => (
            <ProjectCard key={projectId} projectId={Number(projectId)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-[#f8f0f5] text-xl font-bold mb-2">No Projects Yet</h3>
          <p className="text-[#f0d0e0] mb-6">Create your first project to start hiring freelancers</p>
          <button 
            onClick={() => router.push('/create-project')}
            className="bg-[#ff1493] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#cc1076]"
          >
            Create Your First Project
          </button>
        </div>
      )}
    </div>
  );

  const CreateProject = () => (
    <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
      <h2 className="text-xl font-bold text-[#f8f0f5] mb-4">Create New Project</h2>
      <p className="text-[#f0d0e0]">Project creation functionality will be implemented here...</p>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f8f0f5] mb-4">Access Denied</h1>
          <p className="text-[#f0d0e0]">Please connect your wallet to access the client dashboard.</p>
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
          <p className="text-[#f0d0e0] mb-6">You must be registered as a client to access this dashboard.</p>
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

  return (
    <div className="min-h-screen bg-[#1a000d] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#f8f0f5]">Client Dashboard</h1>
            <p className="text-[#f0d0e0]">Manage your projects and freelancers</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[#f8f0f5]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button 
              onClick={() => router.push('/')}
              className="bg-[#ff1493] text-white px-4 py-2 rounded hover:bg-[#cc1076]"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'projects', label: '💼 My Projects' },
            { id: 'create', label: '➕ Create Project' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold ${
                activeTab === tab.id
                  ? 'bg-[#ff1493] text-white'
                  : 'bg-[#4d0026] text-[#f8f0f5] hover:bg-[#660033]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'projects' && <Projects />}
        {activeTab === 'create' && <CreateProject />}
      </div>
      
      {/* Project Detail Modal */}
      {selectedProject !== null && (
        <ProjectDetailModal 
          projectId={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </div>
  );
}
