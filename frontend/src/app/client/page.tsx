"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function ClientDashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Mock data - replace with actual smart contract calls
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "E-commerce Website",
      freelancer: "0x1234...5678",
      freelancerName: "John Doe",
      status: "In Progress",
      budget: "2.5 ETH",
      progress: "2/3",
      nextMilestone: "Frontend Development",
      daysLeft: 5
    },
    {
      id: 2,
      title: "Mobile App Design",
      freelancer: "0x9876...5432",
      freelancerName: "Jane Smith",
      status: "Completed",
      budget: "1.8 ETH",
      progress: "3/3",
      rating: 5
    }
  ]);

  const [availableFreelancers, setAvailableFreelancers] = useState([
    {
      address: "0x1234...5678",
      name: "John Doe",
      skills: ["React", "Solidity", "Web3"],
      rating: 4.8,
      projectsCompleted: 15,
      hourlyRate: "0.05 ETH"
    },
    {
      address: "0x9876...5432", 
      name: "Jane Smith",
      skills: ["UI/UX", "Figma", "React"],
      rating: 4.9,
      projectsCompleted: 23,
      hourlyRate: "0.04 ETH"
    }
  ]);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
    // TODO: Check if user is registered as client
    // TODO: Load user profile and projects from smart contract
  }, [isConnected, router]);

  const Overview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-600 rounded-lg p-4">
          <h3 className="text-white text-sm font-medium">Active Projects</h3>
          <p className="text-white text-2xl font-bold">3</p>
        </div>
        <div className="bg-green-600 rounded-lg p-4">
          <h3 className="text-white text-sm font-medium">Completed Projects</h3>
          <p className="text-white text-2xl font-bold">12</p>
        </div>
        <div className="bg-yellow-600 rounded-lg p-4">
          <h3 className="text-white text-sm font-medium">Total Spent</h3>
          <p className="text-white text-2xl font-bold">15.2 ETH</p>
        </div>
        <div className="bg-purple-600 rounded-lg p-4">
          <h3 className="text-white text-sm font-medium">Avg Rating Given</h3>
          <p className="text-white text-2xl font-bold">4.7 ⭐</p>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Active Projects</h2>
        <div className="space-y-4">
          {projects.filter(p => p.status === "In Progress").map(project => (
            <div key={project.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium">{project.title}</h3>
                  <p className="text-gray-300 text-sm">Freelancer: {project.freelancerName}</p>
                  <p className="text-gray-300 text-sm">Budget: {project.budget}</p>
                </div>
                <div className="text-right">
                  <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">{project.status}</span>
                  <p className="text-gray-300 text-sm mt-1">Progress: {project.progress}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Next: {project.nextMilestone}</span>
                  <span className="text-yellow-400 text-sm">{project.daysLeft} days left</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MyProjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Projects</h2>
        <button 
          onClick={() => router.push('/create-project')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold">{project.title}</h3>
                <p className="text-gray-400 text-sm">Freelancer: {project.freelancerName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                project.status === 'Completed' ? 'bg-green-600' : 'bg-yellow-600'
              } text-white`}>
                {project.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Budget:</span>
                <span className="text-white">{project.budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Progress:</span>
                <span className="text-white">{project.progress} Milestones</span>
              </div>
              {project.rating && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Your Rating:</span>
                  <span className="text-yellow-400">{project.rating}⭐</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
                View Details
              </button>
              {project.status === 'In Progress' && (
                <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700">
                  Message Freelancer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const FindFreelancers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Find Freelancers</h2>
        <div className="flex gap-2">
          <input 
            className="bg-gray-700 text-white px-4 py-2 rounded-lg"
            placeholder="Search skills..."
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableFreelancers.map((freelancer, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold">{freelancer.name}</h3>
                <p className="text-gray-400 text-sm">{freelancer.address}</p>
              </div>
              <span className="text-yellow-400">{freelancer.rating}⭐</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div>
                <span className="text-gray-300 text-sm">Skills:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {freelancer.skills.map((skill, i) => (
                    <span key={i} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Projects Completed:</span>
                <span className="text-white">{freelancer.projectsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Hourly Rate:</span>
                <span className="text-white">{freelancer.hourlyRate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
                Hire
              </button>
              <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Please connect your wallet to access the client dashboard.</p>
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
            <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
            <p className="text-gray-400">Welcome back! Manage your projects and find talented freelancers.</p>
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
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'projects', label: '📋 My Projects', icon: '📋' },
            { id: 'freelancers', label: '👥 Find Freelancers', icon: '👥' },
            { id: 'payments', label: '💰 Payments', icon: '💰' },
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
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'projects' && <MyProjects />}
        {activeTab === 'freelancers' && <FindFreelancers />}
        {activeTab === 'payments' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Payment History</h2>
            <p className="text-gray-400">Payment tracking functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}