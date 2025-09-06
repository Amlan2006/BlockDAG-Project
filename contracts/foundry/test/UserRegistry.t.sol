// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {UserRegistry} from "../src/UserRegistry.sol";

contract UserRegistryTest is Test {
    UserRegistry public registry;
    
    address public client = address(0x123);
    address public freelancer = address(0x456);
    address public both = address(0x789);
    
    function setUp() public {
        registry = new UserRegistry();
        
        vm.deal(client, 1 ether);
        vm.deal(freelancer, 1 ether);
        vm.deal(both, 1 ether);
    }
    
    function testRegisterClient() public {
        vm.prank(client);
        
        string[] memory skills = new string[](0);
        
        registry.registerUser(
            UserRegistry.UserType.Client,
            "John Doe",
            "john@example.com",
            "Experienced entrepreneur looking for talent",
            skills,
            "QmHash123"
        );
        
        assertTrue(registry.isRegistered(client));
        assertTrue(registry.isClient(client));
        assertFalse(registry.isFreelancer(client));
        
        (
            UserRegistry.UserType userType,
            string memory name,
            string memory email,
            string memory bio,
            ,
            string memory profileImageHash,
            ,
            bool isActive
        ) = registry.getUserProfile(client);
        
        assertEq(uint(userType), uint(UserRegistry.UserType.Client));
        assertEq(name, "John Doe");
        assertEq(email, "john@example.com");
        assertEq(bio, "Experienced entrepreneur looking for talent");
        assertEq(profileImageHash, "QmHash123");
        assertTrue(isActive);
    }
    
    function testRegisterFreelancer() public {
        vm.prank(freelancer);
        
        string[] memory skills = new string[](3);
        skills[0] = "Solidity";
        skills[1] = "React";
        skills[2] = "Web3";
        
        registry.registerUser(
            UserRegistry.UserType.Freelancer,
            "Jane Smith",
            "jane@example.com",
            "Full-stack blockchain developer",
            skills,
            "QmHash456"
        );
        
        assertTrue(registry.isRegistered(freelancer));
        assertFalse(registry.isClient(freelancer));
        assertTrue(registry.isFreelancer(freelancer));
        
        string[] memory userSkills = registry.getUserSkills(freelancer);
        assertEq(userSkills.length, 3);
        assertEq(userSkills[0], "Solidity");
        assertEq(userSkills[1], "React");
        assertEq(userSkills[2], "Web3");
    }
    
    function testRegisterBoth() public {
        vm.prank(both);
        
        string[] memory skills = new string[](2);
        skills[0] = "Project Management";
        skills[1] = "Solidity";
        
        registry.registerUser(
            UserRegistry.UserType.Both,
            "Alice Johnson",
            "alice@example.com",
            "Entrepreneur and developer",
            skills,
            "QmHash789"
        );
        
        assertTrue(registry.isRegistered(both));
        assertTrue(registry.isClient(both));
        assertTrue(registry.isFreelancer(both));
        
        // Check if user is in both arrays
        address[] memory clients = registry.getUsersByType(UserRegistry.UserType.Client);
        address[] memory freelancers = registry.getUsersByType(UserRegistry.UserType.Freelancer);
        
        bool foundInClients = false;
        bool foundInFreelancers = false;
        
        for (uint i = 0; i < clients.length; i++) {
            if (clients[i] == both) foundInClients = true;
        }
        
        for (uint i = 0; i < freelancers.length; i++) {
            if (freelancers[i] == both) foundInFreelancers = true;
        }
        
        assertTrue(foundInClients);
        assertTrue(foundInFreelancers);
    }
    
    function testUpdateProfile() public {
        // First register
        vm.prank(freelancer);
        string[] memory skills = new string[](1);
        skills[0] = "React";
        
        registry.registerUser(
            UserRegistry.UserType.Freelancer,
            "Jane Smith",
            "jane@example.com",
            "Developer",
            skills,
            "QmHash456"
        );
        
        // Then update
        vm.prank(freelancer);
        string[] memory newSkills = new string[](2);
        newSkills[0] = "React";
        newSkills[1] = "Solidity";
        
        registry.updateProfile(
            "Jane Smith Updated",
            "jane.updated@example.com",
            "Senior blockchain developer",
            newSkills,
            "QmHashUpdated"
        );
        
        (
            ,
            string memory name,
            string memory email,
            string memory bio,
            ,
            string memory profileImageHash,
            ,
        ) = registry.getUserProfile(freelancer);
        
        assertEq(name, "Jane Smith Updated");
        assertEq(email, "jane.updated@example.com");
        assertEq(bio, "Senior blockchain developer");
        assertEq(profileImageHash, "QmHashUpdated");
        
        string[] memory updatedSkills = registry.getUserSkills(freelancer);
        assertEq(updatedSkills.length, 2);
        assertEq(updatedSkills[1], "Solidity");
    }
    
    function testChangeUserType() public {
        // Register as freelancer first
        vm.prank(freelancer);
        string[] memory skills = new string[](1);
        skills[0] = "React";
        
        registry.registerUser(
            UserRegistry.UserType.Freelancer,
            "Jane Smith",
            "jane@example.com",
            "Developer",
            skills,
            "QmHash456"
        );
        
        assertTrue(registry.isFreelancer(freelancer));
        assertFalse(registry.isClient(freelancer));
        
        // Change to both
        vm.prank(freelancer);
        registry.registerUser(
            UserRegistry.UserType.Both,
            "Jane Smith",
            "jane@example.com",
            "Developer and entrepreneur",
            skills,
            "QmHash456"
        );
        
        assertTrue(registry.isFreelancer(freelancer));
        assertTrue(registry.isClient(freelancer));
    }
    
    function testDeactivateAccount() public {
        // Register user
        vm.prank(client);
        string[] memory skills = new string[](0);
        
        registry.registerUser(
            UserRegistry.UserType.Client,
            "John Doe",
            "john@example.com",
            "Client",
            skills,
            "QmHash123"
        );
        
        assertTrue(registry.isRegistered(client));
        
        // Deactivate
        vm.prank(client);
        registry.deactivateAccount();
        
        assertFalse(registry.isRegistered(client));
        assertFalse(registry.isClient(client));
        
        // Reactivate
        vm.prank(client);
        registry.reactivateAccount();
        
        assertTrue(registry.isRegistered(client));
        assertTrue(registry.isClient(client));
    }
    
    function testGetUserCounts() public {
        // Register different types of users
        vm.prank(client);
        string[] memory noSkills = new string[](0);
        registry.registerUser(
            UserRegistry.UserType.Client,
            "Client1",
            "client1@example.com",
            "Client bio",
            noSkills,
            "QmHash1"
        );
        
        vm.prank(freelancer);
        string[] memory skills = new string[](1);
        skills[0] = "Solidity";
        registry.registerUser(
            UserRegistry.UserType.Freelancer,
            "Freelancer1",
            "freelancer1@example.com",
            "Freelancer bio",
            skills,
            "QmHash2"
        );
        
        vm.prank(both);
        registry.registerUser(
            UserRegistry.UserType.Both,
            "Both1",
            "both1@example.com",
            "Both bio",
            skills,
            "QmHash3"
        );
        
        (uint256 clientCount, uint256 freelancerCount, uint256 totalCount) = registry.getUserCount();
        
        assertEq(clientCount, 2); // client + both
        assertEq(freelancerCount, 2); // freelancer + both
        assertEq(totalCount, 3); // total unique users
    }
    
    function test_RevertWhen_RegisterWithEmptyName() public {
        vm.prank(client);
        string[] memory skills = new string[](0);
        
        vm.expectRevert("Name cannot be empty");
        registry.registerUser(
            UserRegistry.UserType.Client,
            "",
            "john@example.com",
            "Bio",
            skills,
            "QmHash123"
        );
    }
    
    function test_RevertWhen_UpdateProfileNotRegistered() public {
        vm.prank(client);
        string[] memory skills = new string[](0);
        
        vm.expectRevert("User not registered");
        registry.updateProfile(
            "John Doe",
            "john@example.com",
            "Bio",
            skills,
            "QmHash123"
        );
    }
}