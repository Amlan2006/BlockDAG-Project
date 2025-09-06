// FreelanceEscrow Contract ABI - Essential functions for frontend integration
export const FreelanceEscrowABI = [
  // View functions
  {
    "type": "function",
    "name": "projectCounter",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAvailableProjects",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256[]", "internalType": "uint256[]"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProject",
    "inputs": [{"name": "projectId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {"name": "client", "type": "address", "internalType": "address"},
      {"name": "freelancer", "type": "address", "internalType": "address"},
      {"name": "paymentToken", "type": "address", "internalType": "address"},
      {"name": "totalAmount", "type": "uint256", "internalType": "uint256"},
      {"name": "platformFee", "type": "uint256", "internalType": "uint256"},
      {"name": "status", "type": "uint8", "internalType": "enum FreelanceEscrow.ProjectStatus"},
      {"name": "createdAt", "type": "uint256", "internalType": "uint256"},
      {"name": "projectDescription", "type": "string", "internalType": "string"},
      {"name": "releasedAmount", "type": "uint256", "internalType": "uint256"},
      {"name": "disputeCount", "type": "uint256", "internalType": "uint256"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getClientProjects",
    "inputs": [{"name": "client", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256[]", "internalType": "uint256[]"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getFreelancerProjects",
    "inputs": [{"name": "freelancer", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256[]", "internalType": "uint256[]"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMilestone",
    "inputs": [
      {"name": "projectId", "type": "uint256", "internalType": "uint256"},
      {"name": "milestoneIndex", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [
      {"name": "description", "type": "string", "internalType": "string"},
      {"name": "amount", "type": "uint256", "internalType": "uint256"},
      {"name": "deadline", "type": "uint256", "internalType": "uint256"},
      {"name": "status", "type": "uint8", "internalType": "enum FreelanceEscrow.MilestoneStatus"},
      {"name": "deliverable", "type": "string", "internalType": "string"},
      {"name": "submittedAt", "type": "uint256", "internalType": "uint256"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMilestoneCount",
    "inputs": [{"name": "projectId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProjectApplications",
    "inputs": [{"name": "projectId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {"name": "freelancers", "type": "address[]", "internalType": "address[]"},
      {"name": "proposals", "type": "string[]", "internalType": "string[]"},
      {"name": "proposedRates", "type": "uint256[]", "internalType": "uint256[]"},
      {"name": "appliedAt", "type": "uint256[]", "internalType": "uint256[]"},
      {"name": "isAccepted", "type": "bool[]", "internalType": "bool[]"}
    ],
    "stateMutability": "view"
  },
  // Core functions
  {
    "type": "function",
    "name": "createProject",
    "inputs": [
      {"name": "freelancer", "type": "address", "internalType": "address"},
      {"name": "paymentToken", "type": "address", "internalType": "address"},
      {"name": "projectDescription", "type": "string", "internalType": "string"},
      {"name": "milestoneDescriptions", "type": "string[]", "internalType": "string[]"},
      {"name": "milestoneAmounts", "type": "uint256[]", "internalType": "uint256[]"},
      {"name": "milestoneDeadlines", "type": "uint256[]", "internalType": "uint256[]"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "applyToProject",
    "inputs": [
      {"name": "projectId", "type": "uint256", "internalType": "uint256"},
      {"name": "proposal", "type": "string", "internalType": "string"},
      {"name": "proposedRate", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "assignFreelancer",
    "inputs": [
      {"name": "projectId", "type": "uint256", "internalType": "uint256"},
      {"name": "freelancer", "type": "address", "internalType": "address"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "submitMilestone",
    "inputs": [
      {"name": "projectId", "type": "uint256", "internalType": "uint256"},
      {"name": "milestoneIndex", "type": "uint256", "internalType": "uint256"},
      {"name": "deliverable", "type": "string", "internalType": "string"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approveMilestone",
    "inputs": [
      {"name": "projectId", "type": "uint256", "internalType": "uint256"},
      {"name": "milestoneIndex", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  // Events
  {
    "type": "event",
    "name": "ProjectCreated",
    "inputs": [
      {"name": "projectId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "client", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "freelancer", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "totalAmount", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ]
  },
  {
    "type": "event",
    "name": "ProjectApplicationSubmitted",
    "inputs": [
      {"name": "projectId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "freelancer", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "proposal", "type": "string", "indexed": false, "internalType": "string"}
    ]
  },
  {
    "type": "event",
    "name": "FreelancerAssigned",
    "inputs": [
      {"name": "projectId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "freelancer", "type": "address", "indexed": true, "internalType": "address"}
    ]
  }
] as const;

// UserRegistry Contract ABI
export const UserRegistryABI = [
  {
    "type": "function",
    "name": "registerUser",
    "inputs": [
      {"name": "_userType", "type": "uint8", "internalType": "enum UserRegistry.UserType"},
      {"name": "_name", "type": "string", "internalType": "string"},
      {"name": "_email", "type": "string", "internalType": "string"},
      {"name": "_bio", "type": "string", "internalType": "string"},
      {"name": "_skills", "type": "string[]", "internalType": "string[]"},
      {"name": "_profileImageHash", "type": "string", "internalType": "string"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getUserProfile",
    "inputs": [{"name": "_user", "type": "address", "internalType": "address"}],
    "outputs": [
      {"name": "userType", "type": "uint8", "internalType": "enum UserRegistry.UserType"},
      {"name": "name", "type": "string", "internalType": "string"},
      {"name": "email", "type": "string", "internalType": "string"},
      {"name": "bio", "type": "string", "internalType": "string"},
      {"name": "skills", "type": "string[]", "internalType": "string[]"},
      {"name": "profileImageHash", "type": "string", "internalType": "string"},
      {"name": "registrationDate", "type": "uint256", "internalType": "uint256"},
      {"name": "isActive", "type": "bool", "internalType": "bool"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isRegistered",
    "inputs": [{"name": "_user", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isClient",
    "inputs": [{"name": "_user", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isFreelancer",
    "inputs": [{"name": "_user", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "UserRegistered",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "userType", "type": "uint8", "indexed": false, "internalType": "enum UserRegistry.UserType"},
      {"name": "name", "type": "string", "indexed": false, "internalType": "string"}
    ]
  }
] as const;

// Backward compatibility
export const abi = FreelanceEscrowABI;
