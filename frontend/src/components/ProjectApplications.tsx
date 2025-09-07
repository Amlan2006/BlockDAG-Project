"use client";

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { FreelanceEscrowABI, contractAddress } from '../constants';

interface ProjectApplicationsProps {
  projectId: number;
}

export default function ProjectApplications({ projectId }: ProjectApplicationsProps) {
  const router = useRouter();
  const { data: applicationData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'getProjectApplications',
    args: [BigInt(projectId)],
  });

  const handleViewProfile = (freelancerAddress: string) => {
    router.push(`/freelancer/profile/${freelancerAddress}`);
  };

  if (!applicationData) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold text-primary mb-4">Project Applications</h3>
        <p className="text-muted">Loading applications...</p>
      </div>
    );
  }

  const [freelancers, proposals, proposedRates, appliedAt, isAccepted] = applicationData;

  if (freelancers.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold text-primary mb-4">Project Applications</h3>
        <p className="text-muted text-center py-8">
          No applications yet. Share your project to attract freelancers!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h3 className="text-xl font-bold text-primary mb-4">
          Project Applications ({freelancers.length})
        </h3>
        
        <div className="space-y-4">
          {freelancers.map((freelancer, index) => (
            <div key={index} className="bg-background-secondary rounded-lg p-4 border border-secondary">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-primary font-medium mb-1">
                    Freelancer: {freelancer.slice(0, 6)}...{freelancer.slice(-4)}
                  </h4>
                  <p className="text-muted text-sm mb-2">
                    Proposed Rate: {proposedRates[index].toString()} ETH
                  </p>
                  <p className="text-muted text-sm mb-2">
                    Applied: {new Date(Number(appliedAt[index]) * 1000).toLocaleDateString()}
                  </p>
                  {isAccepted[index] && (
                    <span className="inline-block bg-green-600 text-white px-2 py-1 rounded text-xs">
                      ✓ Accepted
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-primary text-sm font-medium mb-1">Proposal:</p>
                <p className="text-muted text-sm bg-background p-2 rounded">
                  {proposals[index]}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewProfile(freelancer)}
                  className="btn-primary"
                >
                  View Profile
                </button>
                
                {!isAccepted[index] && (
                  <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                    Accept Application
                  </button>
                )}
                
                <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}