"use client";

import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserRegistryWrite, useIsRegistered, getUserTypeNumber } from '@/utils/contracts';

export default function Register() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  
  const [userType, setUserType] = useState(roleParam || '');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    skills: [] as string[],
    profileImage: ''
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  
  // Check if user is already registered
  const { data: isRegistered, isLoading: isCheckingRegistration, refetch: refetchRegistration } = useIsRegistered();
  
  // Smart contract functions
  const { registerUser, isPending: isRegistering, error: contractError, data: hash, writeContract } = useUserRegistryWrite();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  
  useEffect(() => {
    if (isRegistered && !isCheckingRegistration && !isSubmitting) {
      // User is already registered, redirect to home
      router.push('/');
    }
  }, [isRegistered, isCheckingRegistration, isSubmitting, router]);

  // Set transaction hash when writeContract returns hash
  useEffect(() => {
    if (hash) {
      setTxHash(hash);
    }
  }, [hash]);

  // Handle successful transaction confirmation
  useEffect(() => {
    if (isConfirmed && !isCheckingRegistration) {
      // Transaction confirmed, refetch registration status
      refetchRegistration().then(() => {
        // Small delay to ensure blockchain state is updated
        setTimeout(() => {
          // Redirect to appropriate dashboard
          if (userType === 'client') {
            router.push('/client');
          } else if (userType === 'freelancer') {
            router.push('/freelancer');
          } else {
            // Both - let user choose which dashboard to view first
            router.push('/');
          }
          setIsSubmitting(false);
        }, 1000);
      });
    }
  }, [isConfirmed, isCheckingRegistration, userType, router, refetchRegistration]);

  const handleSkillAdd = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()]
      });
      setCurrentSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setTxHash(undefined);
    
    try {
      const userTypeNumber = getUserTypeNumber(userType);
      
      if (userTypeNumber === 0) {
        throw new Error('Please select a valid user type');
      }
      
      // Call smart contract to register user
      registerUser(
        userTypeNumber,
        formData.name,
        formData.email,
        formData.bio,
        formData.skills,
        formData.profileImage || ''
      );
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f8f0f5] mb-4">Connect Your Wallet</h1>
          <p className="text-[#f0d0e0] mb-6">Please connect your wallet to register on FreelanceDAO.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-[#ff1493] text-white px-6 py-3 rounded-lg hover:bg-[#cc1076]"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  if (isCheckingRegistration || (isSubmitting && isConfirming)) {
    return (
      <div className="min-h-screen bg-[#1a000d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff1493] mx-auto mb-4"></div>
          <p className="text-[#f0d0e0]">
            {isCheckingRegistration ? 'Checking registration status...' : 
             isSubmitting && isConfirming ? 'Confirming transaction...' : 
             'Processing registration...'}
          </p>
          {txHash && (
            <p className="text-sm text-[#f0d0e0] mt-2">
              Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a000d] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#f8f0f5] mb-4">Join FreelanceDAO</h1>
          <p className="text-[#f0d0e0]">Create your profile and start your decentralized freelancing journey</p>
          <p className="text-sm text-[#f0d0e0] mt-2">Wallet: {address}</p>
        </div>

        <div className="bg-[#4d0026] rounded-lg p-8 border border-[#660033]">
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
            {/* User Type Selection */}
            <div>
              <label className="block text-[#f0d0e0] text-lg font-medium mb-4">I want to join as:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    userType === 'client' ? 'border-[#ff1493] bg-[#ff1493]/20' : 'border-[#660033] bg-[#660033]'
                  }`}
                  onClick={() => setUserType('client')}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">👔</div>
                    <h3 className="text-[#f8f0f5] font-bold">Client</h3>
                    <p className="text-[#f0d0e0] text-sm mt-2">I want to hire talented freelancers for my projects</p>
                  </div>
                </div>
                
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    userType === 'freelancer' ? 'border-[#ff69b4] bg-[#ff69b4]/20' : 'border-[#660033] bg-[#660033]'
                  }`}
                  onClick={() => setUserType('freelancer')}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">💻</div>
                    <h3 className="text-[#f8f0f5] font-bold">Freelancer</h3>
                    <p className="text-[#f0d0e0] text-sm mt-2">I want to offer my skills and work on exciting projects</p>
                  </div>
                </div>
                
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    userType === 'both' ? 'border-[#ffb6c1] bg-[#ffb6c1]/20' : 'border-[#660033] bg-[#660033]'
                  }`}
                  onClick={() => setUserType('both')}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">⚡</div>
                    <h3 className="text-[#f8f0f5] font-bold">Both</h3>
                    <p className="text-[#f0d0e0] text-sm mt-2">I want to both hire freelancers and offer my services</p>
                  </div>
                </div>
              </div>
            </div>

            {userType && (
              <>
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#f0d0e0] text-sm font-medium mb-2">Full Name *</label>
                    <input 
                      className="w-full bg-[#660033] text-[#f8f0f5] px-4 py-3 rounded-lg border border-[#800040] focus:border-[#ff1493] focus:outline-none" 
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#f0d0e0] text-sm font-medium mb-2">Email Address *</label>
                    <input 
                      type="email"
                      className="w-full bg-[#660033] text-[#f8f0f5] px-4 py-3 rounded-lg border border-[#800040] focus:border-[#ff1493] focus:outline-none" 
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-[#f0d0e0] text-sm font-medium mb-2">
                    Bio {userType === 'freelancer' || userType === 'both' ? '*' : ''}
                  </label>
                  <textarea 
                    className="w-full bg-[#660033] text-[#f8f0f5] px-4 py-3 rounded-lg border border-[#800040] focus:border-[#ff1493] focus:outline-none" 
                    rows={4}
                    placeholder={userType === 'freelancer' ? "Tell clients about your experience and expertise..." : "Tell us about yourself and your business..."}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    required={userType === 'freelancer' || userType === 'both'}
                  />
                </div>

                {/* Skills (for freelancers) */}
                {(userType === 'freelancer' || userType === 'both') && (
                  <div>
                    <label className="block text-[#f0d0e0] text-sm font-medium mb-2">Skills *</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        className="flex-1 bg-[#660033] text-[#f8f0f5] px-4 py-3 rounded-lg border border-[#800040] focus:border-[#ff1493] focus:outline-none" 
                        placeholder="Add a skill (e.g., React, Solidity, UI/UX)"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSkillAdd();
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={handleSkillAdd}
                        className="bg-[#ff1493] text-white px-6 py-3 rounded-lg hover:bg-[#cc1076]"
                      >
                        Add
                      </button>
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span key={index} className="bg-[#ff1493] text-white px-3 py-1 rounded-full flex items-center gap-2">
                            {skill}
                            <button 
                              type="button"
                              onClick={() => handleSkillRemove(skill)}
                              className="text-[#ffb6c1] hover:text-[#f8f0f5]"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Image */}
                <div>
                  <label className="block text-[#f0d0e0] text-sm font-medium mb-2">Profile Image (optional)</label>
                  <input 
                    className="w-full bg-[#660033] text-[#f8f0f5] px-4 py-3 rounded-lg border border-[#800040] focus:border-[#ff1493] focus:outline-none" 
                    placeholder="IPFS hash or image URL"
                    value={formData.profileImage}
                    onChange={(e) => setFormData({...formData, profileImage: e.target.value})}
                  />
                  <p className="text-[#f0d0e0] text-sm mt-1">Upload your image to IPFS and paste the hash here</p>
                </div>

                {/* Terms and Submit */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" required className="mt-1" />
                    <label className="text-[#f0d0e0] text-sm">
                      I agree to the FreelanceDAO Terms of Service and Privacy Policy. I understand that my profile information will be stored on-chain and publicly visible.
                    </label>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting || isRegistering || !userType || !formData.name || !formData.email || ((userType === 'freelancer' || userType === 'both') && formData.skills.length === 0)}
                    className="w-full bg-[#ff1493] text-white px-6 py-4 rounded-lg hover:bg-[#cc1076] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                  >
                    {isSubmitting || isRegistering ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isRegistering ? 'Confirming transaction...' : 'Registering...'}
                      </div>
                    ) : (
                      `Join FreelanceDAO as ${userType === 'both' ? 'Client & Freelancer' : userType.charAt(0).toUpperCase() + userType.slice(1)}`
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#4d0026] rounded-lg p-6 text-center border border-[#660033]">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-[#f8f0f5] font-bold mb-2">Secure Payments</h3>
            <p className="text-[#f0d0e0] text-sm">All payments are secured by smart contracts with milestone-based releases</p>
          </div>
          <div className="bg-[#4d0026] rounded-lg p-6 text-center border border-[#660033]">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-[#f8f0f5] font-bold mb-2">Fast Transactions</h3>
            <p className="text-[#f0d0e0] text-sm">Leverage BlockDAG's speed for instant payments and low fees</p>
          </div>
          <div className="bg-[#4d0026] rounded-lg p-6 text-center border border-[#660033]">
            <div className="text-3xl mb-3">🌟</div>
            <h3 className="text-[#f8f0f5] font-bold mb-2">Reputation System</h3>
            <p className="text-[#f0d0e0] text-sm">Build your on-chain reputation that follows you everywhere</p>
          </div>
        </div>
      </div>
    </div>
  );
}