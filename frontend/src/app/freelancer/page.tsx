"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { 
  useAvailableProjects, 
  useProject, 
  useFreelanceEscrowWrite, 
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

  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: '',
    category: 'all',
    budgetMin: '',
    budgetMax: ''
  });

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    proposal: '',
    proposedRate: '',
    estimatedTime: ''
  });
  const [userApplications, setUserApplications] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
    loadAvailableProjects();
  }, [isConnected, router]);

  useEffect(() => {
    let filtered = [...availableJobs];
    
    if (searchFilters.search) {
      const searchLower = searchFilters.search.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.clientName.toLowerCase().includes(searchLower)
      );
    }
    
    if (searchFilters.budgetMin) {
      const minBudget = parseFloat(searchFilters.budgetMin);
      filtered = filtered.filter(job => parseFloat(job.budget.replace(' ETH', '')) >= minBudget);
    }
    
    if (searchFilters.budgetMax) {
      const maxBudget = parseFloat(searchFilters.budgetMax);
      filtered = filtered.filter(job => parseFloat(job.budget.replace(' ETH', '')) <= maxBudget);
    }
    
    if (searchFilters.category !== 'all') {
      filtered = filtered.filter(job => 
        job.skills.some((skill: string) => 
          skill.toLowerCase().includes(searchFilters.category.toLowerCase())
        )
      );
    }
    
    setFilteredJobs(filtered);
  }, [availableJobs, searchFilters]);

  const loadAvailableProjects = async () => {
    setLoading(true);
    try {
      // This will be replaced with actual smart contract data in the next update
      // For now, keeping mock data until we implement the full contract integration
      const mockProjects: Job[] = [
        {
          id: 1,
          title: "React Developer Needed",
          client: "0xabcd...1234",
          clientName: "TechCorp",
          clientRating: 4.5,
          budget: "3.0 ETH",
          deadline: "2 weeks",
          skills: ["React", "TypeScript", "Web3"],
          description: "Need an experienced React developer for a DeFi dashboard project. Building responsive components and integrating with smart contracts.",
          postedDate: "2 days ago",
          applicants: 5,
          milestones: [
            { description: "UI Components", amount: "1.0 ETH", deadline: "1 week" },
            { description: "Smart Contract Integration", amount: "1.5 ETH", deadline: "2 weeks" },
            { description: "Testing & Deployment", amount: "0.5 ETH", deadline: "2.5 weeks" }
          ],
          status: "Open"
        },
        {
          id: 2,
          title: "Smart Contract Audit",
          client: "0xefgh...5678",
          clientName: "DeFi Protocol",
          clientRating: 4.9,
          budget: "5.0 ETH",
          deadline: "1 month",
          skills: ["Solidity", "Security", "Auditing"],
          description: "Security audit required for our new lending protocol smart contracts. Must have experience with DeFi protocols.",
          postedDate: "1 day ago",
          applicants: 3,
          milestones: [
            { description: "Initial Review", amount: "2.0 ETH", deadline: "1 week" },
            { description: "Detailed Analysis", amount: "2.0 ETH", deadline: "3 weeks" },
            { description: "Final Report", amount: "1.0 ETH", deadline: "1 month" }
          ],
          status: "Open"
        },
        {
          id: 3,
          title: "Mobile DApp Development",
          client: "0xqrst...7890",
          clientName: "MobileDeFi",
          clientRating: 4.3,
          budget: "4.5 ETH",
          deadline: "6 weeks",
          skills: ["React Native", "Web3", "Mobile"],
          description: "Develop a mobile DApp for our DeFi platform with wallet integration and portfolio tracking features.",
          postedDate: "1 hour ago",
          applicants: 1,
          milestones: [
            { description: "App Architecture", amount: "1.0 ETH", deadline: "1 week" },
            { description: "Core Features", amount: "2.5 ETH", deadline: "4 weeks" },
            { description: "Testing & Launch", amount: "1.0 ETH", deadline: "6 weeks" }
          ],
          status: "Open"
        }
      ];
      
      setAvailableJobs(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const { applyToProject: applyToProjectContract } = useFreelanceEscrowWrite();

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
      
      setAvailableJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, applicants: job.applicants + 1 } : job
      ));
      
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const ApplicationModal = () => {
    if (!showApplicationModal || !selectedJob) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Apply to Project</h3>
            <button 
              onClick={() => setShowApplicationModal(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-white font-bold">{selectedJob.title}</h4>
            <p className="text-gray-300 text-sm">Client: {selectedJob.clientName}</p>
            <p className="text-green-400 font-bold">Budget: {selectedJob.budget}</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleApplyToJob(selectedJob.id);
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
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Submit Application
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

  const FindJobs = () => (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Browse Available Projects</h2>
          <button 
            onClick={loadAvailableProjects}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>
        
        {/* Search Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input 
            value={searchFilters.search}
            onChange={(e) => setSearchFilters({...searchFilters, search: e.target.value})}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="🔍 Search projects..."
          />
          <select 
            value={searchFilters.category}
            onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="react">Web Development</option>
            <option value="solidity">Smart Contracts</option>
            <option value="mobile">Mobile Apps</option>
            <option value="audit">Security & Auditing</option>
          </select>
          <input 
            type="number"
            step="0.1"
            value={searchFilters.budgetMin}
            onChange={(e) => setSearchFilters({...searchFilters, budgetMin: e.target.value})}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Min Budget (ETH)"
          />
          <input 
            type="number"
            step="0.1"
            value={searchFilters.budgetMax}
            onChange={(e) => setSearchFilters({...searchFilters, budgetMax: e.target.value})}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Max Budget (ETH)"
          />
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-gray-400">
            Showing {filteredJobs.length} of {availableJobs.length} projects
          </p>
          {(searchFilters.search || searchFilters.category !== 'all' || searchFilters.budgetMin || searchFilters.budgetMax) && (
            <button 
              onClick={() => setSearchFilters({ search: '', category: 'all', budgetMin: '', budgetMax: '' })}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading available projects...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <h3 className="text-white text-xl font-bold mb-2">No Projects Found</h3>
            <p className="text-gray-400 mb-4">
              {availableJobs.length === 0 
                ? "No projects are currently available. Check back later!" 
                : "Try adjusting your search filters to find more projects."}
            </p>
          </div>
        ) : (
          filteredJobs.map(job => {
            const hasApplied = userApplications.has(job.id);
            return (
              <div key={job.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-lg">{job.title}</h3>
                      {hasApplied && (
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Applied ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <span>📅 Posted {job.postedDate}</span>
                      <span>👤 {job.clientName}</span>
                      <span>⭐ {job.clientRating}</span>
                      <span>👥 {job.applicants} applicants</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-xl">{job.budget}</p>
                    <p className="text-gray-400 text-sm">⏱️ {job.deadline}</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4 leading-relaxed">{job.description}</p>
                
                {/* Skills */}
                <div className="mb-4">
                  <span className="text-gray-400 text-sm font-medium">Required Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.skills.map((skill, i) => (
                      <span key={i} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Milestones Preview */}
                <div className="mb-4 bg-gray-700 rounded-lg p-3">
                  <span className="text-gray-400 text-sm font-medium">Project Milestones:</span>
                  <div className="mt-2 space-y-2">
                    {job.milestones.slice(0, 2).map((milestone, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-300">{milestone.description}</span>
                        <span className="text-green-400 font-medium">{milestone.amount}</span>
                      </div>
                    ))}
                    {job.milestones.length > 2 && (
                      <p className="text-gray-500 text-xs">+{job.milestones.length - 2} more milestones</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setSelectedJob(job);
                      setShowApplicationModal(true);
                    }}
                    disabled={hasApplied}
                    className={`${
                      hasApplied 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white px-6 py-2 rounded-lg font-medium transition-colors`}
                  >
                    {hasApplied ? 'Applied ✓' : 'Apply Now'}
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    🔖 Save
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    👤 View Client
                  </button>
                </div>
              </div>
            );
          })
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

  return (
    <div className="min-h-screen bg-[#070E1B] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Freelancer Dashboard</h1>
            <p className="text-gray-400">Browse and apply to available projects from clients.</p>
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

        <FindJobs />
      </div>
    </div>
  );
}