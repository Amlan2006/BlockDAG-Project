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

// Backward compatibility
export const abi = FreelanceEscrowABI;
