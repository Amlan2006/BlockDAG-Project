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
    
    // More detailed application checking
    const freelancersArray = applications && applications[0] ? applications[0] as any[] : [];
    const hasApplications = Boolean(freelancersArray.length > 0);
    const applicationCount = freelancersArray.length;
    
    return (
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-primary font-bold text-lg">{description.slice(0, 50)}...</h3>
            <p className="text-muted text-sm">
              {hasFreelancer ? `Freelancer: ${freelancer.slice(0, 6)}...${freelancer.slice(-4)}` : 'No freelancer assigned'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            projectStatus === 'Active' ? 'bg-yellow-600' : 
            projectStatus === 'Completed' ? 'bg-green-600' : 
            projectStatus === 'Cancelled' ? 'bg-red-600' : 'bg-background-secondary'
          } text-primary`}>
            {projectStatus}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-muted">Budget:</span>
            <span className="text-primary">{formatEther(totalAmount)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Created:</span>
            <span className="text-primary">{new Date(Number(createdAt) * 1000).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Applications:</span>
            <span className="text-primary">{applicationCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Milestones:</span>
            <span className="text-primary">{milestoneCount?.toString() || '0'}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedProject(projectId)}
            className="btn-primary flex-1"
          >
            View Details
          </button>
          
          {/* Applications Button */}
          <button 
            onClick={() => {
              if (hasApplications) {
                router.push(`/applications/${projectId}`);
              } else {
                alert(`No applications found for project ${projectId}. Freelancers count: ${freelancersArray.length}`);
              }
            }}
            className={`flex-1 text-primary px-3 py-2 rounded ${
              !hasFreelancer && hasApplications 
                ? 'btn-secondary' 
                : 'bg-background-secondary'
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
              className="btn-secondary flex-1"
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
          <div className="bg-primary rounded-lg p-4">
            <h3 className="text-primary text-sm font-medium">Total Projects</h3>
            <p className="text-primary text-2xl font-bold">{projectIds?.length || 0}</p>
          </div>
          <div className="bg-secondary rounded-lg p-4">
            <h3 className="text-primary text-sm font-medium">Active Projects</h3>
            <p className="text-primary text-2xl font-bold">{activeProjects}</p>
          </div>
          <div className="bg-accent rounded-lg p-4">
            <h3 className="text-primary text-sm font-medium">Total Spent</h3>
            <p className="text-primary text-2xl font-bold">-- ETH</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4">
            <h3 className="text-primary text-sm font-medium">Avg Rating Given</h3>
            <p className="text-primary text-2xl font-bold">-- ⭐</p>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="card">
          <h2 className="text-xl font-bold text-primary mb-4">Recent Projects</h2>
          {isLoadingProjects ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-4"></div>
              <p className="text-muted">Loading projects...</p>
            </div>
          ) : projectIds && projectIds.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projectIds.slice(0, 4).map((projectId) => (
                <ProjectCard key={projectId} projectId={Number(projectId)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted mb-4">No projects yet</p>
              <button 
                onClick={() => router.push('/create-project')}
                className="btn-primary"
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
        <h2 className="text-2xl font-bold text-primary">My Projects</h2>
        <button 
          onClick={() => router.push('/create-project')}
          className="btn-primary"
        >
          + New Project
        </button>
      </div>

      {isLoadingProjects ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted">Loading your projects...</p>
        </div>
      ) : projectIds && projectIds.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projectIds.map((projectId) => (
            <ProjectCard key={projectId} projectId={Number(projectId)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-primary text-xl font-bold mb-2">No Projects Yet</h3>
          <p className="text-muted mb-6">Create your first project to start hiring freelancers</p>
          <button 
            onClick={() => router.push('/create-project')}
            className="btn-primary"
          >
            Create Your First Project
          </button>
        </div>
      )}
    </div>
  );

  const CreateProject = () => (
    <div className="card">
      <h2 className="text-xl font-bold text-primary mb-4">Create New Project</h2>
      <p className="text-muted">Project creation functionality will be implemented here...</p>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-muted">Please connect your wallet to access the client dashboard.</p>
        </div>
      </div>
    );
  }

  if (isCheckingClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted">Verifying client status...</p>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-muted mb-6">You must be registered as a client to access this dashboard.</p>
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
            <h1 className="text-3xl font-bold text-primary">Client Dashboard</h1>
            <p className="text-muted">Manage your projects and freelancers</p>
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
            { id: 'overview', label: '📊 Overview' },
            { id: 'projects', label: '💼 My Projects' },
            { id: 'create', label: '➕ Create Project' },
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