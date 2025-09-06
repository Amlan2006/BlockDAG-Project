// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UserRegistry.sol";

contract FreelanceEscrow is ReentrancyGuard, Ownable {
    enum ProjectStatus { Active, Completed, Disputed, Cancelled }
    enum MilestoneStatus { Pending, Submitted, Approved, Disputed, Cancelled }
    
    struct Milestone {
        string description;
        uint256 amount;
        uint256 deadline;
        MilestoneStatus status;
        string deliverable; // IPFS hash or URL
        uint256 submittedAt;
    }
    
    struct ProjectApplication {
        address freelancer;
        string proposal;
        uint256 proposedRate;
        uint256 appliedAt;
        bool isAccepted;
    }
    
    mapping(uint256 => ProjectApplication[]) public projectApplications;
    
    struct Project {
        address client;
        address freelancer;
        address paymentToken; // address(0) for ETH
        uint256 totalAmount;
        uint256 platformFee;
        ProjectStatus status;
        uint256 createdAt;
        string projectDescription;
        Milestone[] milestones;
        uint256 releasedAmount;
        uint256 disputeCount;
    }
    
    struct Rating {
        uint8 score; // 1-5 stars
        string comment;
        uint256 timestamp;
    }
    
    mapping(uint256 => Project) public projects;
    mapping(address => uint256[]) public clientProjects;
    mapping(address => uint256[]) public freelancerProjects;
    mapping(address => Rating[]) public userRatings;
    mapping(address => uint256) public userReputation; // Average rating * 100
    
    UserRegistry public userRegistry;
    uint256 public projectCounter;
    uint256 public platformFeeRate = 300; // 3%
    address public platformOwner;
    uint256 public disputeWindow = 7 days;
    uint256 public autoApprovalWindow = 14 days;
    
    event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed freelancer, uint256 totalAmount);
    event ProjectApplicationSubmitted(uint256 indexed projectId, address indexed freelancer, string proposal);
    event FreelancerAssigned(uint256 indexed projectId, address indexed freelancer);
    event MilestoneSubmitted(uint256 indexed projectId, uint256 milestoneIndex, string deliverable);
    event MilestoneApproved(uint256 indexed projectId, uint256 milestoneIndex, uint256 amount);
    event MilestoneAutoApproved(uint256 indexed projectId, uint256 milestoneIndex, uint256 amount);
    event DisputeRaised(uint256 indexed projectId, uint256 milestoneIndex, address disputeRaiser);
    event DisputeResolved(uint256 indexed projectId, uint256 milestoneIndex, bool favorFreelancer);
    event ProjectCompleted(uint256 indexed projectId);
    event ProjectCancelled(uint256 indexed projectId, uint256 refundAmount);
    event RatingGiven(address indexed rater, address indexed ratee, uint8 score);
    
    modifier onlyProjectParticipant(uint256 projectId) {
        Project storage project = projects[projectId];
        require(
            msg.sender == project.client || 
            msg.sender == project.freelancer, 
            "Not a project participant"
        );
        _;
    }
    
    modifier onlyClient(uint256 projectId) {
        require(projects[projectId].client == msg.sender, "Only client can perform this action");
        _;
    }
    
    modifier onlyFreelancer(uint256 projectId) {
        require(projects[projectId].freelancer == msg.sender, "Only freelancer can perform this action");
        _;
    }
    
    constructor(address _userRegistry) Ownable(msg.sender) {
        platformOwner = msg.sender;
        userRegistry = UserRegistry(_userRegistry);
    }
    
    function createProject(
        address freelancer,
        address paymentToken,
        string memory projectDescription,
        string[] memory milestoneDescriptions,
        uint256[] memory milestoneAmounts,
        uint256[] memory milestoneDeadlines
    ) public payable returns (uint256) {
        require(milestoneDescriptions.length == milestoneAmounts.length, "Mismatched milestone arrays");
        require(milestoneDescriptions.length == milestoneDeadlines.length, "Mismatched deadline arrays");
        require(milestoneDescriptions.length > 0, "At least one milestone required");
        
        // Check if client is registered
        require(userRegistry.isClient(msg.sender), "Client must be registered");
        
        // If freelancer is specified, check if they're registered
        if (freelancer != address(0)) {
            require(freelancer != msg.sender, "Client and freelancer cannot be the same");
            require(userRegistry.isFreelancer(freelancer), "Freelancer must be registered");
        }
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneAmounts[i] > 0, "Milestone amount must be greater than 0");
            require(milestoneDeadlines[i] > block.timestamp, "Deadline must be in the future");
            totalAmount += milestoneAmounts[i];
        }
        
        uint256 platformFee = (totalAmount * platformFeeRate) / 10000;
        uint256 totalRequired = totalAmount + platformFee;
        
        uint256 projectId = projectCounter++;
        
        Project storage project = projects[projectId];
        project.client = msg.sender;
        project.freelancer = freelancer;
        project.paymentToken = paymentToken;
        project.totalAmount = totalAmount;
        project.platformFee = platformFee;
        project.status = ProjectStatus.Active;
        project.createdAt = block.timestamp;
        project.projectDescription = projectDescription;
        
        // Create milestones
        for (uint256 i = 0; i < milestoneDescriptions.length; i++) {
            project.milestones.push(Milestone({
                description: milestoneDescriptions[i],
                amount: milestoneAmounts[i],
                deadline: milestoneDeadlines[i],
                status: MilestoneStatus.Pending,
                deliverable: "",
                submittedAt: 0
            }));
        }
        
        // Handle payment
        if (paymentToken == address(0)) {
            require(msg.value >= totalRequired, "Insufficient ETH sent");
            if (msg.value > totalRequired) {
                payable(msg.sender).transfer(msg.value - totalRequired);
            }
        } else {
            IERC20(paymentToken).transferFrom(msg.sender, address(this), totalRequired);
        }
        
        clientProjects[msg.sender].push(projectId);
        
        // Only add to freelancer projects if freelancer is specified
        if (freelancer != address(0)) {
            freelancerProjects[freelancer].push(projectId);
        }
        
        emit ProjectCreated(projectId, msg.sender, freelancer, totalAmount);
        return projectId;
    }
    
    function submitMilestone(
        uint256 projectId, 
        uint256 milestoneIndex, 
        string memory deliverable
    ) public onlyFreelancer(projectId) {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Active, "Project not active");
        require(milestoneIndex < project.milestones.length, "Invalid milestone index");
        require(project.milestones[milestoneIndex].status == MilestoneStatus.Pending, "Milestone not pending");
        require(bytes(deliverable).length > 0, "Deliverable cannot be empty");
        
        project.milestones[milestoneIndex].status = MilestoneStatus.Submitted;
        project.milestones[milestoneIndex].deliverable = deliverable;
        project.milestones[milestoneIndex].submittedAt = block.timestamp;
        
        emit MilestoneSubmitted(projectId, milestoneIndex, deliverable);
    }
    
    function approveMilestone(uint256 projectId, uint256 milestoneIndex) public onlyClient(projectId) nonReentrant {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Active, "Project not active");
        require(milestoneIndex < project.milestones.length, "Invalid milestone index");
        require(project.milestones[milestoneIndex].status == MilestoneStatus.Submitted, "Milestone not submitted");
        
        _releaseMilestonePayment(projectId, milestoneIndex);
    }
    
    function autoApproveMilestone(uint256 projectId, uint256 milestoneIndex) public {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Active, "Project not active");
        require(milestoneIndex < project.milestones.length, "Invalid milestone index");
        
        Milestone storage milestone = project.milestones[milestoneIndex];
        require(milestone.status == MilestoneStatus.Submitted, "Milestone not submitted");
        require(
            block.timestamp >= milestone.submittedAt + autoApprovalWindow,
            "Auto-approval window not reached"
        );
        
        _releaseMilestonePayment(projectId, milestoneIndex);
        emit MilestoneAutoApproved(projectId, milestoneIndex, milestone.amount);
    }
    
    function _releaseMilestonePayment(uint256 projectId, uint256 milestoneIndex) internal {
        Project storage project = projects[projectId];
        Milestone storage milestone = project.milestones[milestoneIndex];
        
        milestone.status = MilestoneStatus.Approved;
        uint256 amount = milestone.amount;
        project.releasedAmount += amount;
        
        // Transfer payment to freelancer
        if (project.paymentToken == address(0)) {
            payable(project.freelancer).transfer(amount);
        } else {
            IERC20(project.paymentToken).transfer(project.freelancer, amount);
        }
        
        emit MilestoneApproved(projectId, milestoneIndex, amount);
        
        // Check if project is completed
        if (project.releasedAmount == project.totalAmount) {
            project.status = ProjectStatus.Completed;
            
            // Transfer platform fee
            if (project.paymentToken == address(0)) {
                payable(platformOwner).transfer(project.platformFee);
            } else {
                IERC20(project.paymentToken).transfer(platformOwner, project.platformFee);
            }
            
            emit ProjectCompleted(projectId);
        }
    }
            
    function applyToProject(
        uint256 projectId,
        string memory proposal,
        uint256 proposedRate
    ) public {
            require(projectId < projectCounter, "Project does not exist");
            require(userRegistry.isFreelancer(msg.sender), "Only registered freelancers can apply");
                
            Project storage project = projects[projectId];
            require(project.status == ProjectStatus.Active, "Project not active");
            require(project.freelancer == address(0), "Project already has a freelancer");
            require(project.client != msg.sender, "Client cannot apply to own project");
                
            // Check if freelancer already applied
            ProjectApplication[] storage applications = projectApplications[projectId];
            for (uint256 i = 0; i < applications.length; i++) {
                require(applications[i].freelancer != msg.sender, "Already applied to this project");
            }
                
            applications.push(ProjectApplication({
                freelancer: msg.sender,
                proposal: proposal,
                proposedRate: proposedRate,
                appliedAt: block.timestamp,
                isAccepted: false
            }));
                
            emit ProjectApplicationSubmitted(projectId, msg.sender, proposal);
        }
            
        function assignFreelancer(uint256 projectId, address freelancer) public {
            require(projectId < projectCounter, "Project does not exist");
                
            Project storage project = projects[projectId];
            require(msg.sender == project.client, "Only client can assign freelancer");
            require(project.status == ProjectStatus.Active, "Project not active");
            require(project.freelancer == address(0), "Project already has a freelancer");
            require(userRegistry.isFreelancer(freelancer), "Address is not a registered freelancer");
                
            // Verify freelancer applied to this project
            bool hasApplied = false;
            ProjectApplication[] storage applications = projectApplications[projectId];
            for (uint256 i = 0; i < applications.length; i++) {
                if (applications[i].freelancer == freelancer) {
                    applications[i].isAccepted = true;
                    hasApplied = true;
                    break;
                }
            }
            require(hasApplied, "Freelancer has not applied to this project");
                
            project.freelancer = freelancer;
            freelancerProjects[freelancer].push(projectId);
                
            emit FreelancerAssigned(projectId, freelancer);
    }
    
    function raiseDispute(uint256 projectId, uint256 milestoneIndex) public onlyProjectParticipant(projectId) {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Active, "Project not active");
        require(milestoneIndex < project.milestones.length, "Invalid milestone index");
        
        Milestone storage milestone = project.milestones[milestoneIndex];
        require(
            milestone.status == MilestoneStatus.Submitted || 
            milestone.status == MilestoneStatus.Pending,
            "Invalid milestone status for dispute"
        );
        
        milestone.status = MilestoneStatus.Disputed;
        project.disputeCount++;
        
        emit DisputeRaised(projectId, milestoneIndex, msg.sender);
    }
    
    function resolveDispute(
        uint256 projectId, 
        uint256 milestoneIndex, 
        bool favorFreelancer
    ) public onlyOwner {
        Project storage project = projects[projectId];
        require(milestoneIndex < project.milestones.length, "Invalid milestone index");
        require(project.milestones[milestoneIndex].status == MilestoneStatus.Disputed, "Milestone not disputed");
        
        if (favorFreelancer) {
            _releaseMilestonePayment(projectId, milestoneIndex);
        } else {
            project.milestones[milestoneIndex].status = MilestoneStatus.Cancelled;
        }
        
        emit DisputeResolved(projectId, milestoneIndex, favorFreelancer);
    }
    
    function cancelProject(uint256 projectId) public onlyClient(projectId) nonReentrant {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Active, "Project not active");
        
        // Can only cancel if no milestones have been approved
        require(project.releasedAmount == 0, "Cannot cancel project with approved milestones");
        
        project.status = ProjectStatus.Cancelled;
        uint256 refundAmount = project.totalAmount + project.platformFee;
        
        // Refund to client
        if (project.paymentToken == address(0)) {
            payable(project.client).transfer(refundAmount);
        } else {
            IERC20(project.paymentToken).transfer(project.client, refundAmount);
        }
        
        emit ProjectCancelled(projectId, refundAmount);
    }
    
    function rateUser(address user, uint8 score, string memory comment) public {
        require(score >= 1 && score <= 5, "Rating must be between 1 and 5");
        require(user != msg.sender, "Cannot rate yourself");
        
        // Check if rater has worked with the ratee
        bool hasWorkedTogether = false;
        
        // Check client projects
        uint256[] memory raterClientProjects = clientProjects[msg.sender];
        for (uint256 i = 0; i < raterClientProjects.length; i++) {
            if (projects[raterClientProjects[i]].freelancer == user) {
                hasWorkedTogether = true;
                break;
            }
        }
        
        // Check freelancer projects
        if (!hasWorkedTogether) {
            uint256[] memory raterFreelancerProjects = freelancerProjects[msg.sender];
            for (uint256 i = 0; i < raterFreelancerProjects.length; i++) {
                if (projects[raterFreelancerProjects[i]].client == user) {
                    hasWorkedTogether = true;
                    break;
                }
            }
        }
        
        require(hasWorkedTogether, "You haven't worked with this user");
        
        userRatings[user].push(Rating({
            score: score,
            comment: comment,
            timestamp: block.timestamp
        }));
        
        _updateUserReputation(user);
        
        emit RatingGiven(msg.sender, user, score);
    }
    
    function _updateUserReputation(address user) internal {
        Rating[] memory ratings = userRatings[user];
        if (ratings.length == 0) return;
        
        uint256 totalScore = 0;
        for (uint256 i = 0; i < ratings.length; i++) {
            totalScore += ratings[i].score;
        }
        
        userReputation[user] = (totalScore * 100) / ratings.length;
    }
    
    // View functions
    function getProject(uint256 projectId) public view returns (
        address client,
        address freelancer,
        address paymentToken,
        uint256 totalAmount,
        uint256 platformFee,
        ProjectStatus status,
        uint256 createdAt,
        string memory projectDescription,
        uint256 releasedAmount,
        uint256 disputeCount
    ) {
        Project storage project = projects[projectId];
        return (
            project.client,
            project.freelancer,
            project.paymentToken,
            project.totalAmount,
            project.platformFee,
            project.status,
            project.createdAt,
            project.projectDescription,
            project.releasedAmount,
            project.disputeCount
        );
    }
    
    function getAllProjects() public view returns (uint256[] memory) {
        uint256[] memory allProjectIds = new uint256[](projectCounter);
        for (uint256 i = 0; i < projectCounter; i++) {
            allProjectIds[i] = i;
        }
        return allProjectIds;
    }
    
    function getAvailableProjects() public view returns (uint256[] memory) {
        uint256 availableCount = 0;
        
        // First, count available projects
        for (uint256 i = 0; i < projectCounter; i++) {
            if (projects[i].freelancer == address(0) && projects[i].status == ProjectStatus.Active) {
                availableCount++;
            }
        }
        
        // Create array of available project IDs
        uint256[] memory availableProjects = new uint256[](availableCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < projectCounter; i++) {
            if (projects[i].freelancer == address(0) && projects[i].status == ProjectStatus.Active) {
                availableProjects[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return availableProjects;
    }
    
    function getProjectsByClient(address client) public view returns (uint256[] memory) {
        return clientProjects[client];
    }
    
    function getMilestone(uint256 projectId, uint256 milestoneIndex) public view returns (
        string memory description,
        uint256 amount,
        uint256 deadline,
        MilestoneStatus status,
        string memory deliverable,
        uint256 submittedAt
    ) {
        require(milestoneIndex < projects[projectId].milestones.length, "Invalid milestone index");
        Milestone storage milestone = projects[projectId].milestones[milestoneIndex];
        return (
            milestone.description,
            milestone.amount,
            milestone.deadline,
            milestone.status,
            milestone.deliverable,
            milestone.submittedAt
        );
    }
    
    function getMilestoneCount(uint256 projectId) public view returns (uint256) {
        return projects[projectId].milestones.length;
    }
    
    function getClientProjects(address client) public view returns (uint256[] memory) {
        return clientProjects[client];
    }
    
    function getFreelancerProjects(address freelancer) public view returns (uint256[] memory) {
        return freelancerProjects[freelancer];
    }
    
    function getUserRatings(address user) public view returns (Rating[] memory) {
        return userRatings[user];
    }
    
    function getUserReputation(address user) public view returns (uint256) {
        return userReputation[user];
    }
    
    function getProjectApplications(uint256 projectId) public view returns (
        address[] memory freelancers,
        string[] memory proposals,
        uint256[] memory proposedRates,
        uint256[] memory appliedAt,
        bool[] memory isAccepted
    ) {
        ProjectApplication[] storage applications = projectApplications[projectId];
        uint256 length = applications.length;
        
        freelancers = new address[](length);
        proposals = new string[](length);
        proposedRates = new uint256[](length);
        appliedAt = new uint256[](length);
        isAccepted = new bool[](length);
        
        for (uint256 i = 0; i < length; i++) {
            freelancers[i] = applications[i].freelancer;
            proposals[i] = applications[i].proposal;
            proposedRates[i] = applications[i].proposedRate;
            appliedAt[i] = applications[i].appliedAt;
            isAccepted[i] = applications[i].isAccepted;
        }
    }
    
    // Admin functions
    function setPlatformFeeRate(uint256 newRate) public onlyOwner {
        require(newRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = newRate;
    }
    
    function setDisputeWindow(uint256 newWindow) public onlyOwner {
        disputeWindow = newWindow;
    }
    
    function setAutoApprovalWindow(uint256 newWindow) public onlyOwner {
        autoApprovalWindow = newWindow;
    }
    
    function emergencyWithdraw(address token, uint256 amount) public onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}