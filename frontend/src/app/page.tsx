"use client";

import ConnectButton from "@/components/ConnectButton";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useIsRegistered, useUserProfile, formatUserType } from "@/utils/contracts";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  
  // Get user registration status from smart contract
  const { data: isRegistered, isLoading: isLoadingRegistration } = useIsRegistered();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && !isLoadingRegistration && !isLoadingProfile) {
      setIsLoading(false);
    }
  }, [isConnected, isLoadingRegistration, isLoadingProfile]);

  const handleRoleSelection = (role: string) => {
    if (isRegistered && userProfile) {
      // If already registered, determine which dashboard to show based on their registered type
      const userTypeNumber = userProfile[0]; // userType is the first element
      const userTypeString = formatUserType(userTypeNumber).toLowerCase();
      
      if (userTypeString === 'both') {
        // User can choose which dashboard to access
        router.push(`/${role}`);
      } else if (userTypeString === role) {
        // User registered type matches requested role
        router.push(`/${role}`);
      } else {
        // User trying to access wrong dashboard
        alert(`You are registered as a ${userTypeString}. Please select the correct dashboard.`);
        return;
      }
    } else {
      // If not registered, go to registration with pre-selected role
      router.push(`/register?role=${role}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#070E1B] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4 text-center">
          💼 FreelanceDAO
        </h1>
        <p className="text-xl text-gray-400 text-center mb-8">
          The First Fully Decentralized Freelance Platform on BlockDAG
        </p>
        
        {/* Wallet Connection */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          {isConnected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                {isLoading ? (
                  <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">
                    ⏳ Checking registration...
                  </span>
                ) : isRegistered && userProfile ? (
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                      ✓ Registered as {formatUserType(userProfile[0])}
                    </span>
                    <span className="text-gray-300 text-sm">
                      {userProfile[1]} {/* name */}
                    </span>
                  </div>
                ) : (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    📝 Not registered
                  </span>
                )}
              </div>
              <button
                onClick={() => disconnect()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="text-center">
              <ConnectButton />
              <p className="text-gray-400 mt-2">Connect your wallet to get started</p>
            </div>
          )}
        </div>

        {isConnected && !isLoading ? (
          <>
            {/* Role Selection */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {isRegistered ? "Choose Your Dashboard" : "How would you like to get started?"}
              </h2>
              <p className="text-gray-400 mb-8">
                {isRegistered 
                  ? "Access your personalized dashboard" 
                  : "Join thousands of professionals in the decentralized economy"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Client Card */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-8 text-center hover:transform hover:scale-105 transition-all duration-200">
                <div className="text-6xl mb-4">👔</div>
                <h3 className="text-2xl font-bold text-white mb-4">I'm a Client</h3>
                <p className="text-blue-100 mb-6">
                  I want to hire talented freelancers for my projects with secure, milestone-based payments
                </p>
                <ul className="text-blue-100 text-sm space-y-2 mb-6">
                  <li>✓ Post projects with custom milestones</li>
                  <li>✓ Secure escrow payments</li>
                  <li>✓ Access to verified freelancers</li>
                  <li>✓ Dispute resolution system</li>
                </ul>
                <button 
                  onClick={() => handleRoleSelection('client')}
                  disabled={isRegistered && userProfile && formatUserType(userProfile[0]) === 'Freelancer'}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isRegistered && userProfile && formatUserType(userProfile[0]) === 'Freelancer'
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      : 'bg-white text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {isRegistered ? "Go to Client Dashboard" : "Join as Client"}
                </button>
                {isRegistered && userProfile && formatUserType(userProfile[0]) === 'Freelancer' && (
                  <p className="text-blue-200 text-xs mt-2">You are registered as a Freelancer</p>
                )}
              </div>

              {/* Freelancer Card */}
              <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-xl p-8 text-center hover:transform hover:scale-105 transition-all duration-200">
                <div className="text-6xl mb-4">💻</div>
                <h3 className="text-2xl font-bold text-white mb-4">I'm a Freelancer</h3>
                <p className="text-green-100 mb-6">
                  I want to offer my skills and work on exciting projects with guaranteed payments
                </p>
                <ul className="text-green-100 text-sm space-y-2 mb-6">
                  <li>✓ Browse available projects</li>
                  <li>✓ Build on-chain reputation</li>
                  <li>✓ Instant milestone payments</li>
                  <li>✓ No platform holds your funds</li>
                </ul>
                <button 
                  onClick={() => handleRoleSelection('freelancer')}
                  disabled={isRegistered && userProfile && formatUserType(userProfile[0]) === 'Client'}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isRegistered && userProfile && formatUserType(userProfile[0]) === 'Client'
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      : 'bg-white text-green-700 hover:bg-green-50'
                  }`}
                >
                  {isRegistered ? "Go to Freelancer Dashboard" : "Join as Freelancer"}
                </button>
                {isRegistered && userProfile && formatUserType(userProfile[0]) === 'Client' && (
                  <p className="text-green-200 text-xs mt-2">You are registered as a Client</p>
                )}
              </div>
            </div>

            {!isRegistered && (
              <div className="text-center mt-8">
                <p className="text-gray-400 mb-4">Want to do both?</p>
                <button 
                  onClick={() => router.push('/register?role=both')}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Register as Both Client & Freelancer
                </button>
              </div>
            )}
          </>
        ) : isConnected && isLoading ? (
          /* Loading State */
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your registration status...</p>
          </div>
        ) : (
          /* Welcome Section for Non-Connected Users */
          <div className="text-center">
            <div className="max-w-4xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">Why Choose FreelanceDAO?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold text-white mb-3">Secure Escrow</h3>
                  <p className="text-gray-400">
                    Smart contracts hold funds safely until milestones are completed. No risk of non-payment.
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold text-white mb-3">Fast & Cheap</h3>
                  <p className="text-gray-400">
                    BlockDAG's speed enables instant payments with minimal fees. No waiting, no high costs.
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="text-4xl mb-4">🌟</div>
                  <h3 className="text-xl font-bold text-white mb-3">On-Chain Reputation</h3>
                  <p className="text-gray-400">
                    Build a verifiable reputation that follows you across all Web3 platforms.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gray-800 rounded-lg p-8 mb-12">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Platform Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">1,240+</div>
                  <div className="text-gray-400">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">850+</div>
                  <div className="text-gray-400">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">120+ ETH</div>
                  <div className="text-gray-400">Total Paid Out</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">4.9⭐</div>
                  <div className="text-gray-400">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
