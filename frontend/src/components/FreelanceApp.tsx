"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function FreelanceApp() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('dashboard');

  const Dashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-600 rounded-lg p-4">
        <h3 className="text-white text-sm font-medium">Active Projects</h3>
        <p className="text-white text-2xl font-bold">3</p>
      </div>
      <div className="bg-green-600 rounded-lg p-4">
        <h3 className="text-white text-sm font-medium">Completed</h3>
        <p className="text-white text-2xl font-bold">12</p>
      </div>
      <div className="bg-yellow-600 rounded-lg p-4">
        <h3 className="text-white text-sm font-medium">Total Earned</h3>
        <p className="text-white text-2xl font-bold">5.2 ETH</p>
      </div>
      <div className="bg-purple-600 rounded-lg p-4">
        <h3 className="text-white text-sm font-medium">Reputation</h3>
        <p className="text-white text-2xl font-bold">4.8 ⭐</p>
      </div>
    </div>
  );

  const CreateProject = () => (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Create New Project</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="bg-gray-700 text-white px-4 py-3 rounded-lg" 
            placeholder="Project Title"
          />
          <input 
            className="bg-gray-700 text-white px-4 py-3 rounded-lg" 
            placeholder="Freelancer Address (0x...)"
          />
        </div>
        <textarea 
          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg" 
          placeholder="Project Description"
          rows={3}
        />
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input placeholder="Description" className="bg-gray-600 text-white px-3 py-2 rounded" />
            <input placeholder="Amount (ETH)" type="number" className="bg-gray-600 text-white px-3 py-2 rounded" />
            <input type="date" className="bg-gray-600 text-white px-3 py-2 rounded" />
          </div>
          <button type="button" className="text-blue-400 text-sm">+ Add Another Milestone</button>
        </div>
        <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Create Project & Deposit Funds
        </button>
      </form>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome to FreelanceDAO</h2>
        <p className="text-gray-400 mb-6">
          The first fully decentralized freelance platform built on BlockDAG
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex space-x-4 mb-6">
        {['dashboard', 'create', 'projects'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold capitalize ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'create' && <CreateProject />}
      {activeTab === 'projects' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">My Projects</h2>
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium">E-commerce Website</h3>
              <p className="text-gray-300 text-sm">Status: Milestone 2 Submitted</p>
              <div className="flex gap-2 mt-2">
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">Dispute</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}