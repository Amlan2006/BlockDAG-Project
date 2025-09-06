"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function Register() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    skills: [] as string[],
    profileImage: ''
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    try {
      // TODO: Call smart contract to register user
      console.log('Registering user:', {
        userType,
        address,
        ...formData
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to appropriate dashboard
      if (userType === 'client') {
        router.push('/client');
      } else if (userType === 'freelancer') {
        router.push('/freelancer');
      } else {
        // Both - let user choose
        router.push('/choose-role');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#070E1B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-6">Please connect your wallet to register on FreelanceDAO.</p>
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Join FreelanceDAO</h1>
          <p className="text-gray-400">Create your profile and start your decentralized freelancing journey</p>
          <p className="text-sm text-gray-500 mt-2">Wallet: {address}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Type Selection */}
            <div>
              <label className="block text-gray-300 text-lg font-medium mb-4">I want to join as:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    userType === 'client' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-700'
                  }`}
                  onClick={() => setUserType('client')}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">👔</div>
                    <h3 className="text-white font-bold">Client</h3>
                    <p className="text-gray-400 text-sm mt-2">I want to hire talented freelancers for my projects</p>
                  </div>
                </div>
                
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    userType === 'freelancer' ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-700'
                  }`}
                  onClick={() => setUserType('freelancer')}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">💻</div>
                    <h3 className="text-white font-bold">Freelancer</h3>
                    <p className="text-gray-400 text-sm mt-2">I want to offer my skills and work on exciting projects</p>
                  </div>
                </div>
                
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    userType === 'both' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-600 bg-gray-700'
                  }`}
                  onClick={() => setUserType('both')}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">⚡</div>
                    <h3 className="text-white font-bold">Both</h3>
                    <p className="text-gray-400 text-sm mt-2">I want to both hire freelancers and offer my services</p>
                  </div>
                </div>
              </div>
            </div>

            {userType && (
              <>
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Full Name *</label>
                    <input 
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Email Address *</label>
                    <input 
                      type="email"
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Bio {userType === 'freelancer' || userType === 'both' ? '*' : ''}
                  </label>
                  <textarea 
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
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
                    <label className="block text-gray-300 text-sm font-medium mb-2">Skills *</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
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
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
                            {skill}
                            <button 
                              type="button"
                              onClick={() => handleSkillRemove(skill)}
                              className="text-red-300 hover:text-red-100"
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
                  <label className="block text-gray-300 text-sm font-medium mb-2">Profile Image (optional)</label>
                  <input 
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" 
                    placeholder="IPFS hash or image URL"
                    value={formData.profileImage}
                    onChange={(e) => setFormData({...formData, profileImage: e.target.value})}
                  />
                  <p className="text-gray-500 text-sm mt-1">Upload your image to IPFS and paste the hash here</p>
                </div>

                {/* Terms and Submit */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" required className="mt-1" />
                    <label className="text-gray-300 text-sm">
                      I agree to the FreelanceDAO Terms of Service and Privacy Policy. I understand that my profile information will be stored on-chain and publicly visible.
                    </label>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting || !userType || !formData.name || !formData.email || ((userType === 'freelancer' || userType === 'both') && formData.skills.length === 0)}
                    className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Registering...
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
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-white font-bold mb-2">Secure Payments</h3>
            <p className="text-gray-400 text-sm">All payments are secured by smart contracts with milestone-based releases</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-white font-bold mb-2">Fast Transactions</h3>
            <p className="text-gray-400 text-sm">Leverage BlockDAG's speed for instant payments and low fees</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🌟</div>
            <h3 className="text-white font-bold mb-2">Reputation System</h3>
            <p className="text-gray-400 text-sm">Build your on-chain reputation that follows you everywhere</p>
          </div>
        </div>
      </div>
    </div>
  );
}