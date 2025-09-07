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
      <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
        <h3 className="text-xl font-bold text-[#f8f0f5] mb-4">Project Applications</h3>
        <p className="text-[#f0d0e0]">Loading applications...</p>
      </div>
    );
  }

  const [freelancers, proposals, proposedRates, appliedAt, isAccepted] = applicationData;

  if (freelancers.length === 0) {
    return (
      <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
        <h3 className="text-xl font-bold text-[#f8f0f5] mb-4">Project Applications</h3>
        <p className="text-[#f0d0e0] text-center py-8">
          No applications yet. Share your project to attract freelancers!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
        <h3 className="text-xl font-bold text-[#f8f0f5] mb-4">
          Project Applications ({freelancers.length})
        </h3>
        
        <div className="space-y-4">
          {freelancers.map((freelancer, index) => (
            <div key={index} className="bg-[#660033] rounded-lg p-4 border border-[#800040]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-[#f8f0f5] font-medium mb-1">
                    Freelancer: {freelancer.slice(0, 6)}...{freelancer.slice(-4)}
                  </h4>
                  <p className="text-[#f0d0e0] text-sm mb-2">
                    Proposed Rate: {proposedRates[index].toString()} ETH
                  </p>
                  <p className="text-[#f0d0e0] text-sm mb-2">
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
                <p className="text-[#f8f0f5] text-sm font-medium mb-1">Proposal:</p>
                <p className="text-[#f0d0e0] text-sm bg-[#800040] p-2 rounded">
                  {proposals[index]}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewProfile(freelancer)}
                  className="bg-[#ff1493] text-white px-4 py-2 rounded text-sm hover:bg-[#cc1076]"
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
