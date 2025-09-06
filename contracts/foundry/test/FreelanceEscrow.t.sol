// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {FreelanceEscrow} from "../src/FreelanceEscrow.sol";
import {UserRegistry} from "../src/UserRegistry.sol";

contract FreelanceEscrowTest is Test {
    FreelanceEscrow public escrow;
    UserRegistry public userRegistry;
    
    address public client = address(0x123);
    address public freelancer = address(0x456);
    address public platformOwner = address(0x789);
    
    uint256 public constant INITIAL_BALANCE = 10 ether;
    
    function setUp() public {
        vm.prank(platformOwner);
        userRegistry = new UserRegistry();
        
        vm.prank(platformOwner);
        escrow = new FreelanceEscrow(address(userRegistry));
        
        // Give test accounts some ETH
        vm.deal(client, INITIAL_BALANCE);
        vm.deal(freelancer, INITIAL_BALANCE);
        
        // Register users
        vm.prank(client);
        string[] memory noSkills = new string[](0);
        userRegistry.registerUser(
            UserRegistry.UserType.Client,
            "Test Client",
            "client@test.com",
            "Test client bio",
            noSkills,
            "QmTestClient"
        );
        
        vm.prank(freelancer);
        string[] memory skills = new string[](2);
        skills[0] = "Solidity";
        skills[1] = "React";
        userRegistry.registerUser(
            UserRegistry.UserType.Freelancer,
            "Test Freelancer",
            "freelancer@test.com",
            "Test freelancer bio",
            skills,
            "QmTestFreelancer"
        );
    }
    
    function testCreateProject() public {
        vm.prank(client);
        
        string[] memory descriptions = new string[](2);
        descriptions[0] = "Design mockups";
        descriptions[1] = "Implement frontend";
        
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1 ether;
        amounts[1] = 2 ether;
        
        uint256[] memory deadlines = new uint256[](2);
        deadlines[0] = block.timestamp + 7 days;
        deadlines[1] = block.timestamp + 14 days;
        
        uint256 totalAmount = 3 ether;
        uint256 platformFee = (totalAmount * 300) / 10000; // 3%
        uint256 totalRequired = totalAmount + platformFee;
        
        uint256 projectId = escrow.createProject{value: totalRequired}(
            freelancer,
            address(0), // ETH payment
            "Website development project",
            descriptions,
            amounts,
            deadlines
        );
        
        assertEq(projectId, 0);
        
        (address projectClient, address projectFreelancer, , uint256 projectTotal, , , , , , ) = escrow.getProject(projectId);
        assertEq(projectClient, client);
        assertEq(projectFreelancer, freelancer);
        assertEq(projectTotal, totalAmount);
    }
    
    function testSubmitMilestone() public {
        uint256 projectId = _createTestProject();
        
        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "https://ipfs.io/mockup-designs");
        
        (, , , FreelanceEscrow.MilestoneStatus status, string memory deliverable, ) = escrow.getMilestone(projectId, 0);
        assertEq(uint(status), uint(FreelanceEscrow.MilestoneStatus.Submitted));
        assertEq(deliverable, "https://ipfs.io/mockup-designs");
    }
    
    function testApproveMilestone() public {
        uint256 projectId = _createTestProject();
        
        // Submit milestone
        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "https://ipfs.io/mockup-designs");
        
        uint256 freelancerBalanceBefore = freelancer.balance;
        
        // Approve milestone
        vm.prank(client);
        escrow.approveMilestone(projectId, 0);
        
        uint256 freelancerBalanceAfter = freelancer.balance;
        assertEq(freelancerBalanceAfter - freelancerBalanceBefore, 1 ether);
        
        (, , , FreelanceEscrow.MilestoneStatus status, , ) = escrow.getMilestone(projectId, 0);
        assertEq(uint(status), uint(FreelanceEscrow.MilestoneStatus.Approved));
    }
    
    function testRaiseDispute() public {
        uint256 projectId = _createTestProject();
        
        // Submit milestone
        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "https://ipfs.io/mockup-designs");
        
        // Client raises dispute
        vm.prank(client);
        escrow.raiseDispute(projectId, 0);
        
        (, , , FreelanceEscrow.MilestoneStatus status, , ) = escrow.getMilestone(projectId, 0);
        assertEq(uint(status), uint(FreelanceEscrow.MilestoneStatus.Disputed));
    }
    
    function testResolveDispute() public {
        uint256 projectId = _createTestProject();
        
        // Submit milestone
        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "https://ipfs.io/mockup-designs");
        
        // Raise dispute
        vm.prank(client);
        escrow.raiseDispute(projectId, 0);
        
        uint256 freelancerBalanceBefore = freelancer.balance;
        
        // Resolve dispute in favor of freelancer
        vm.prank(platformOwner);
        escrow.resolveDispute(projectId, 0, true);
        
        uint256 freelancerBalanceAfter = freelancer.balance;
        assertEq(freelancerBalanceAfter - freelancerBalanceBefore, 1 ether);
        
        (, , , FreelanceEscrow.MilestoneStatus status, , ) = escrow.getMilestone(projectId, 0);
        assertEq(uint(status), uint(FreelanceEscrow.MilestoneStatus.Approved));
    }
    
    function testAutoApproval() public {
        uint256 projectId = _createTestProject();
        
        // Submit milestone
        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "https://ipfs.io/mockup-designs");
        
        // Fast forward time to auto-approval window
        vm.warp(block.timestamp + 15 days);
        
        uint256 freelancerBalanceBefore = freelancer.balance;
        
        // Auto approve milestone
        escrow.autoApproveMilestone(projectId, 0);
        
        uint256 freelancerBalanceAfter = freelancer.balance;
        assertEq(freelancerBalanceAfter - freelancerBalanceBefore, 1 ether);
    }
    
    function testCancelProject() public {
        uint256 projectId = _createTestProject();
        
        uint256 clientBalanceBefore = client.balance;
        
        // Cancel project
        vm.prank(client);
        escrow.cancelProject(projectId);
        
        uint256 clientBalanceAfter = client.balance;
        uint256 expectedRefund = 3 ether + (3 ether * 300 / 10000); // Total + platform fee
        assertEq(clientBalanceAfter - clientBalanceBefore, expectedRefund);
        
        (, , , , , FreelanceEscrow.ProjectStatus status, , , , ) = escrow.getProject(projectId);
        assertEq(uint(status), uint(FreelanceEscrow.ProjectStatus.Cancelled));
    }
    
    function testRating() public {
        uint256 projectId = _createTestProject();
        
        // Complete a milestone to establish work relationship
        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "https://ipfs.io/mockup-designs");
        
        vm.prank(client);
        escrow.approveMilestone(projectId, 0);
        
        // Rate the freelancer
        vm.prank(client);
        escrow.rateUser(freelancer, 5, "Excellent work!");
        
        uint256 reputation = escrow.getUserReputation(freelancer);
        assertEq(reputation, 500); // 5 * 100
        
        FreelanceEscrow.Rating[] memory ratings = escrow.getUserRatings(freelancer);
        assertEq(ratings.length, 1);
        assertEq(ratings[0].score, 5);
    }
    
    function _createTestProject() internal returns (uint256) {
        vm.prank(client);
        
        string[] memory descriptions = new string[](2);
        descriptions[0] = "Design mockups";
        descriptions[1] = "Implement frontend";
        
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1 ether;
        amounts[1] = 2 ether;
        
        uint256[] memory deadlines = new uint256[](2);
        deadlines[0] = block.timestamp + 7 days;
        deadlines[1] = block.timestamp + 14 days;
        
        uint256 totalAmount = 3 ether;
        uint256 platformFee = (totalAmount * 300) / 10000;
        uint256 totalRequired = totalAmount + platformFee;
        
        return escrow.createProject{value: totalRequired}(
            freelancer,
            address(0),
            "Website development project",
            descriptions,
            amounts,
            deadlines
        );
    }
}