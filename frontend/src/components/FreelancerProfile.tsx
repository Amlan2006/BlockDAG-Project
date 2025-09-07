"use client";

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { UserRegistryABI, FreelanceEscrowABI, userRegistryAddress, contractAddress } from '../constants';

interface Rating {
  score: number;
  comment: string;
  timestamp: bigint;
}

interface FreelancerProfileProps {
  freelancerAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FreelancerProfile({ freelancerAddress, isOpen, onClose }: FreelancerProfileProps) {
  // Read freelancer profile from UserRegistry
  const { data: userProfile } = useReadContract({
    address: userRegistryAddress as `0x${string}`,
    abi: UserRegistryABI,
    functionName: 'getUserProfile',
    args: [freelancerAddress as `0x${string}`],
  });

  // Read freelancer ratings from FreelanceEscrow
  const { data: userRatings } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'getUserRatings',
    args: [freelancerAddress as `0x${string}`],
  });

  // Read freelancer reputation score
  const { data: userReputation } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'getUserReputation',
    args: [freelancerAddress as `0x${string}`],
  });

  const formatReputation = (reputation: bigint | undefined) => {
    if (!reputation) return '0.0';
    return (Number(reputation) / 100).toFixed(1);
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Freelancer Profile</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary text-2xl"
          >
            ×
          </button>
        </div>

        {/* Profile Information */}
        {userProfile && (
          <div className="mb-6">
            <div className="bg-background-secondary rounded-lg p-4 mb-4">
              <h3 className="text-xl font-semibold text-primary mb-2">{userProfile[1]}</h3>
              <p className="text-muted text-sm mb-2">Email: {userProfile[2]}</p>
              <p className="text-muted mb-4">{userProfile[3]}</p>
              
              {/* Skills */}
              {userProfile[4] && userProfile[4].length > 0 && (
                <div className="mb-4">
                  <h4 className="text-primary font-medium mb-2">Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile[4].map((skill, index) => (
                      <span
                        key={index}
                        className="bg-secondary text-primary px-2 py-1 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reputation */}
              <div className="flex items-center gap-4">
                <div className="text-primary">
                  <span className="font-medium">Reputation: </span>
                  <span className="text-yellow-400 text-lg">
                    {formatReputation(userReputation)} ⭐
                  </span>
                </div>
                <div className="text-muted text-sm">
                  Member since: {userProfile[6] ? formatDate(userProfile[6]) : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ratings Section */}
        <div className="bg-background-secondary rounded-lg p-4">
          <h3 className="text-xl font-semibold text-primary mb-4">
            Ratings & Reviews ({userRatings ? userRatings.length : 0})
          </h3>
          
          {userRatings && userRatings.length > 0 ? (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {userRatings.map((rating: Rating, index: number) => (
                <div key={index} className="bg-background rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 text-lg">
                        {renderStars(rating.score)}
                      </span>
                      <span className="text-primary font-medium">
                        {rating.score}/5
                      </span>
                    </div>
                    <span className="text-muted text-sm">
                      {formatDate(rating.timestamp)}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-muted text-sm italic">
                      "{rating.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-8">
              No ratings yet. Be the first to work with this freelancer!
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}