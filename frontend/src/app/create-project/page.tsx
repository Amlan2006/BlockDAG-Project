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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-muted">Please connect your wallet to create a project.</p>
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
          <p className="text-muted mb-6">You must be registered as a client to create projects.</p>
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Create New Project</h1>
            <p className="text-muted">Post a project and hire talented freelancers</p>
          </div>
          <button 
            onClick={() => router.push('/client')}
            className="btn-outline"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="card">
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
              <h2 className="text-xl font-bold text-primary">Project Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-muted text-sm font-medium mb-2">Project Title *</label>
                  <input 
                    className="w-full bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none" 
                    placeholder="e.g., React Dashboard Development"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-muted text-sm font-medium mb-2">Category</label>
                  <select 
                    className="w-full bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="" className="bg-background">Select category</option>
                    <option value="web-development" className="bg-background">Web Development</option>
                    <option value="smart-contracts" className="bg-background">Smart Contracts</option>
                    <option value="mobile-apps" className="bg-background">Mobile Apps</option>
                    <option value="ui-ux" className="bg-background">UI/UX Design</option>
                    <option value="auditing" className="bg-background">Security Auditing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted text-sm font-medium mb-2">Project Description *</label>
                <textarea 
                  className="w-full bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none" 
                  rows={6}
                  placeholder="Describe your project requirements, objectives, and any specific technologies needed..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-muted text-sm font-medium mb-2">Specific Freelancer (optional)</label>
                <input 
                  className="w-full bg-background-secondary text-primary px-4 py-3 rounded-lg border border-secondary focus:border-primary focus:outline-none" 
                  placeholder="0x... (leave empty for open applications)"
                  value={formData.freelancer}
                  onChange={(e) => setFormData({...formData, freelancer: e.target.value})}
                />
                <p className="text-muted text-sm mt-1">Leave empty to allow any freelancer to apply</p>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Project Milestones</h2>
                <button 
                  type="button"
                  onClick={addMilestone}
                  className="btn-primary"
                >
                  Add Milestone
                </button>
              </div>

              {milestones.map((milestone, index) => (
                <div key={index} className="bg-background-secondary rounded-lg p-6 border border-secondary">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-primary font-medium">Milestone {index + 1}</h3>
                    {milestones.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-accent hover:text-primary"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-muted text-sm font-medium mb-2">Description *</label>
                      <input 
                        className="w-full bg-background text-primary px-4 py-3 rounded-lg border border-accent focus:border-primary focus:outline-none" 
                        placeholder="e.g., UI Components"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-muted text-sm font-medium mb-2">Amount (ETH) *</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="w-full bg-background text-primary px-4 py-3 rounded-lg border border-accent focus:border-primary focus:outline-none" 
                        placeholder="1.0"
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-muted text-sm font-medium mb-2">Deadline *</label>
                      <input 
                        type="datetime-local"
                        className="w-full bg-background text-primary px-4 py-3 rounded-lg border border-accent focus:border-primary focus:outline-none" 
                        value={milestone.deadline}
                        onChange={(e) => updateMilestone(index, 'deadline', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Total Amount Display */}
              <div className="bg-primary bg-opacity-20 border border-secondary rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Total Project Amount:</span>
                  <span className="text-secondary font-bold text-lg">
                    {milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0).toFixed(2)} ETH
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-muted text-sm">Platform Fee (3%):</span>
                  <span className="text-muted text-sm">
                    {(milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0) * 0.03).toFixed(4)} ETH
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-secondary">
                  <span className="text-primary font-medium">Total Required:</span>
                  <span className="text-secondary font-bold">
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
                className="flex-1 btn-primary"
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
                className="btn-outline flex-1"
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