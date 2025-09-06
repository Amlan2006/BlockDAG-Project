"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useFreelanceEscrowWrite, useIsClient } from '@/utils/contracts';
import { parseEther } from 'viem';

interface Milestone {
  description: string;
  amount: string;
  deadline: string;
}

export default function CreateProject() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { data: isClient, isLoading: isCheckingClient } = useIsClient();
  const { createProject, isPending: isCreating, error: contractError } = useFreelanceEscrowWrite();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    freelancer: '', // Optional - can be empty for open projects
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH by default
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    { description: '', amount: '', deadline: '' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addMilestone = () => {
    setMilestones([...milestones, { description: '', amount: '', deadline: '' }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate form
      if (!formData.title || !formData.description) {
        throw new Error('Please fill in all required fields');
      }

      if (milestones.some(m => !m.description || !m.amount || !m.deadline)) {
        throw new Error('Please complete all milestone fields');
      }

      // Prepare milestone data
      const milestoneDescriptions = milestones.map(m => m.description);
      const milestoneAmounts = milestones.map(m => parseEther(m.amount));
      const milestoneDeadlines = milestones.map(m => BigInt(new Date(m.deadline).getTime() / 1000));

      // Calculate total amount
      const totalAmount = milestoneAmounts.reduce((sum, amount) => sum + amount, BigInt(0));
      const platformFee = totalAmount * BigInt(300) / BigInt(10000); // 3% platform fee
      const totalRequired = totalAmount + platformFee;

      // Create project
      await createProject(
        formData.freelancer || '0x0000000000000000000000000000000000000000',
        formData.paymentToken,
        formData.description,
        milestoneDescriptions,
        milestoneAmounts,
        milestoneDeadlines,
        formData.paymentToken === '0x0000000000000000000000000000000000000000' ? totalRequired : undefined
      );

      // Wait for transaction to be mined
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Redirect back to client dashboard
      router.push('/client');
    } catch (error: any) {
      console.error('Project creation failed:', error);
      setError(error.message || 'Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Please connect your wallet to create a project.</p>
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
          <p className="text-gray-400 mb-6">You must be registered as a client to create projects.</p>
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Project</h1>
            <p className="text-gray-400">Post a project and hire talented freelancers</p>
          </div>
          <button 
            onClick={() => router.push('/client')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            
            {contractError && (
              <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
                <p className="text-red-400">Transaction failed: {contractError.message}</p>
              </div>
            )}

            {/* Basic Project Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Project Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Project Title *</label>
                  <input 
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
                    placeholder="e.g., React Dashboard Development"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                  <select 
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select category</option>
                    <option value="web-development">Web Development</option>
                    <option value="smart-contracts">Smart Contracts</option>
                    <option value="mobile-apps">Mobile Apps</option>
                    <option value="ui-ux">UI/UX Design</option>
                    <option value="auditing">Security Auditing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Project Description *</label>
                <textarea 
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
                  rows={6}
                  placeholder="Describe your project requirements, objectives, and any specific technologies needed..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Specific Freelancer (optional)</label>
                <input 
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
                  placeholder="0x... (leave empty for open applications)"
                  value={formData.freelancer}
                  onChange={(e) => setFormData({...formData, freelancer: e.target.value})}
                />
                <p className="text-gray-500 text-sm mt-1">Leave empty to allow any freelancer to apply</p>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Project Milestones</h2>
                <button 
                  type="button"
                  onClick={addMilestone}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Milestone
                </button>
              </div>

              {milestones.map((milestone, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-medium">Milestone {index + 1}</h3>
                    {milestones.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
                      <input 
                        className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" 
                        placeholder="e.g., UI Components"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Amount (ETH) *</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" 
                        placeholder="1.0"
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Deadline *</label>
                      <input 
                        type="datetime-local"
                        className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" 
                        value={milestone.deadline}
                        onChange={(e) => updateMilestone(index, 'deadline', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Total Amount Display */}
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Project Amount:</span>
                  <span className="text-green-400 font-bold text-lg">
                    {milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0).toFixed(2)} ETH
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400 text-sm">Platform Fee (3%):</span>
                  <span className="text-gray-400 text-sm">
                    {(milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0) * 0.03).toFixed(4)} ETH
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-500">
                  <span className="text-white font-medium">Total Required:</span>
                  <span className="text-blue-400 font-bold">
                    {(milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0) * 1.03).toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={isSubmitting || isCreating}
                className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {isSubmitting || isCreating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isCreating ? 'Creating Project...' : 'Processing...'}
                  </div>
                ) : (
                  'Create Project'
                )}
              </button>
              <button 
                type="button"
                onClick={() => router.push('/client')}
                className="bg-gray-600 text-white px-6 py-4 rounded-lg hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}