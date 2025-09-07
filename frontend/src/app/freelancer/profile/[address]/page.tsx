"use client";

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { usePathname, useRouter } from 'next/navigation';
import { UserRegistryABI, FreelanceEscrowABI, contractAddress, userRegistryAddress } from '../../../../constants';

interface Rating {
  score: number;
  comment: string;
  timestamp: bigint;
}

export default function FreelancerProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [freelancerAddress, setFreelancerAddress] = useState<string | null>(null);

  // Extract freelancer address from URL
  useEffect(() => {
    if (pathname) {
      const address = pathname.split('/').pop();
      if (address && address.startsWith('0x') && address.length === 42) {
        setFreelancerAddress(address);
      }
    }
  }, [pathname]);

  // Read freelancer profile from UserRegistry
  const { data: userProfile, isLoading: isProfileLoading } = useReadContract({
    address: userRegistryAddress as `0x${string}`,
    abi: UserRegistryABI,
    functionName: 'getUserProfile',
    args: freelancerAddress ? [freelancerAddress as `0x${string}`] : undefined,
    query: { enabled: !!freelancerAddress }
  });

  // Read freelancer ratings from FreelanceEscrow
  const { data: userRatings, isLoading: isRatingsLoading } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'getUserRatings',
    args: freelancerAddress ? [freelancerAddress as `0x${string}`] : undefined,
    query: { enabled: !!freelancerAddress }
  });

  // Read freelancer reputation score
  const { data: userReputation } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'getUserReputation',
    args: freelancerAddress ? [freelancerAddress as `0x${string}`] : undefined,
    query: { enabled: !!freelancerAddress }
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

  if (!freelancerAddress) {
    return (
      <div className="min-h-screen bg-[#1a000d] text-[#f8f0f5] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Freelancer Profile</h1>
            <button
              onClick={() => router.back()}
              className="bg-[#ff1493] text-white px-4 py-2 rounded-lg hover:bg-[#cc1076]"
            >
              Back
            </button>
          </div>
          <div className="bg-[#4d0026] rounded-lg p-8 text-center border border-[#660033]">
            <p className="text-[#f0d0e0]">Invalid freelancer address</p>
          </div>
        </div>
      </div>
    );
  }

  if (isProfileLoading || isRatingsLoading) {
    return (
      <div className="min-h-screen bg-[#1a000d] text-[#f8f0f5] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Freelancer Profile</h1>
            <button
              onClick={() => router.back()}
              className="bg-[#ff1493] text-white px-4 py-2 rounded-lg hover:bg-[#cc1076]"
            >
              Back
            </button>
          </div>
          <div className="bg-[#4d0026] rounded-lg p-8 text-center border border-[#660033]">
            <p className="text-[#f0d0e0]">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a000d] text-[#f8f0f5] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Freelancer Profile</h1>
          <button
            onClick={() => router.back()}
            className="bg-[#ff1493] text-white px-4 py-2 rounded-lg hover:bg-[#cc1076]"
          >
            Back
          </button>
        </div>

        {/* Profile Information */}
        {userProfile && (
          <div className="mb-6">
            <div className="bg-[#4d0026] rounded-lg p-6 mb-6 border border-[#660033]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f8f0f5] mb-2">{userProfile[1]}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#f0d0e0] text-sm">Address:</span>
                    <p className="text-[#f8f0f5] font-mono text-sm bg-[#660033] px-2 py-1 rounded">
                      {freelancerAddress}
                    </p>
                  </div>
                </div>
                <div className="bg-[#660033] px-4 py-2 rounded-lg border border-[#800040]">
                  <span className="text-[#ff69b4] font-medium">
                    Reputation: {formatReputation(userReputation)} ⭐
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#660033] p-4 rounded-lg border border-[#800040]">
                  <p className="text-[#f0d0e0] text-sm mb-1">Email</p>
                  <p className="text-[#f8f0f5]">{userProfile[2]}</p>
                </div>
                <div className="bg-[#660033] p-4 rounded-lg border border-[#800040]">
                  <p className="text-[#f0d0e0] text-sm mb-1">Member Since</p>
                  <p className="text-[#f8f0f5]">
                    {userProfile[6] ? formatDate(userProfile[6]) : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-[#f0d0e0] text-sm">Bio</h3>
                  <div className="flex-1 border-t border-[#660033]"></div>
                </div>
                <div className="bg-[#660033] p-4 rounded-lg border border-[#800040]">
                  <p className="text-[#f8f0f5]">
                    {userProfile[3] || 'No bio available'}
                  </p>
                </div>
              </div>
              
              {/* Skills */}
              {userProfile[4] && userProfile[4].length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[#f0d0e0] text-sm">Skills</h3>
                    <div className="flex-1 border-t border-[#660033]"></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userProfile[4].map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="bg-[#ff1493] text-white px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ratings Section */}
        <div className="bg-[#4d0026] rounded-lg p-6 border border-[#660033]">
          <h3 className="text-xl font-bold text-[#f8f0f5] mb-4">
            Ratings & Reviews ({userRatings ? userRatings.length : 0})
          </h3>
          
          {userRatings && userRatings.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {userRatings.map((rating: Rating, index: number) => (
                <div key={index} className="bg-[#660033] rounded-lg p-4 border border-[#800040]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#ff69b4] text-lg">
                        {renderStars(rating.score)}
                      </span>
                      <span className="text-[#f8f0f5] font-medium">
                        {rating.score}/5
                      </span>
                    </div>
                    <span className="text-[#f0d0e0] text-sm">
                      {formatDate(rating.timestamp)}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-[#f0d0e0] text-sm italic">
                      "{rating.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#f0d0e0]">
                No ratings yet. Be the first to work with this freelancer!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}