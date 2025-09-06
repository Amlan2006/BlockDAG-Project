// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserRegistry {
    enum UserType { None, Client, Freelancer, Both }
    
    struct UserProfile {
        UserType userType;
        string name;
        string email;
        string bio;
        string[] skills; // For freelancers
        string profileImageHash; // IPFS hash
        uint256 registrationDate;
        bool isActive;
    }
    
    mapping(address => UserProfile) public userProfiles;
    mapping(UserType => address[]) public usersByType;
    
    address[] public allUsers;
    
    event UserRegistered(address indexed user, UserType userType, string name);
    event UserProfileUpdated(address indexed user, string name, string bio);
    event UserTypeUpdated(address indexed user, UserType oldType, UserType newType);
    
    modifier onlyRegisteredUser() {
        require(userProfiles[msg.sender].userType != UserType.None, "User not registered");
        require(userProfiles[msg.sender].isActive, "User account is inactive");
        _;
    }
    
    function registerUser(
        UserType _userType,
        string memory _name,
        string memory _email,
        string memory _bio,
        string[] memory _skills,
        string memory _profileImageHash
    ) public {
        require(_userType != UserType.None, "Invalid user type");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        UserProfile storage profile = userProfiles[msg.sender];
        
        // If user is already registered, update their type
        if (profile.userType != UserType.None) {
            UserType oldType = profile.userType;
            
            // Remove from old type array if changing type
            if (oldType != _userType && _userType != UserType.Both) {
                _removeFromUserTypeArray(msg.sender, oldType);
            }
            
            // Update user type
            profile.userType = _userType;
            
            emit UserTypeUpdated(msg.sender, oldType, _userType);
        } else {
            // New user registration
            profile.userType = _userType;
            profile.registrationDate = block.timestamp;
            profile.isActive = true;
            allUsers.push(msg.sender);
            
            emit UserRegistered(msg.sender, _userType, _name);
        }
        
        // Update profile information
        profile.name = _name;
        profile.email = _email;
        profile.bio = _bio;
        profile.skills = _skills;
        profile.profileImageHash = _profileImageHash;
        
        // Add to appropriate user type arrays
        if (_userType == UserType.Client || _userType == UserType.Both) {
            if (!_isInUserTypeArray(msg.sender, UserType.Client)) {
                usersByType[UserType.Client].push(msg.sender);
            }
        }
        
        if (_userType == UserType.Freelancer || _userType == UserType.Both) {
            if (!_isInUserTypeArray(msg.sender, UserType.Freelancer)) {
                usersByType[UserType.Freelancer].push(msg.sender);
            }
        }
        
        emit UserProfileUpdated(msg.sender, _name, _bio);
    }
    
    function updateProfile(
        string memory _name,
        string memory _email,
        string memory _bio,
        string[] memory _skills,
        string memory _profileImageHash
    ) public onlyRegisteredUser {
        UserProfile storage profile = userProfiles[msg.sender];
        
        profile.name = _name;
        profile.email = _email;
        profile.bio = _bio;
        profile.skills = _skills;
        profile.profileImageHash = _profileImageHash;
        
        emit UserProfileUpdated(msg.sender, _name, _bio);
    }
    
    function deactivateAccount() public onlyRegisteredUser {
        userProfiles[msg.sender].isActive = false;
    }
    
    function reactivateAccount() public {
        require(userProfiles[msg.sender].userType != UserType.None, "User not registered");
        userProfiles[msg.sender].isActive = true;
    }
    
    // View functions
    function getUserProfile(address _user) public view returns (
        UserType userType,
        string memory name,
        string memory email,
        string memory bio,
        string[] memory skills,
        string memory profileImageHash,
        uint256 registrationDate,
        bool isActive
    ) {
        UserProfile memory profile = userProfiles[_user];
        return (
            profile.userType,
            profile.name,
            profile.email,
            profile.bio,
            profile.skills,
            profile.profileImageHash,
            profile.registrationDate,
            profile.isActive
        );
    }
    
    function isRegistered(address _user) public view returns (bool) {
        return userProfiles[_user].userType != UserType.None && userProfiles[_user].isActive;
    }
    
    function isClient(address _user) public view returns (bool) {
        UserType userType = userProfiles[_user].userType;
        return (userType == UserType.Client || userType == UserType.Both) && userProfiles[_user].isActive;
    }
    
    function isFreelancer(address _user) public view returns (bool) {
        UserType userType = userProfiles[_user].userType;
        return (userType == UserType.Freelancer || userType == UserType.Both) && userProfiles[_user].isActive;
    }
    
    function getUsersByType(UserType _userType) public view returns (address[] memory) {
        return usersByType[_userType];
    }
    
    function getAllUsers() public view returns (address[] memory) {
        return allUsers;
    }
    
    function getTotalUsers() public view returns (uint256) {
        return allUsers.length;
    }
    
    function getUserSkills(address _user) public view returns (string[] memory) {
        return userProfiles[_user].skills;
    }
    
    // Internal helper functions
    function _isInUserTypeArray(address _user, UserType _userType) internal view returns (bool) {
        address[] memory users = usersByType[_userType];
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == _user) {
                return true;
            }
        }
        return false;
    }
    
    function _removeFromUserTypeArray(address _user, UserType _userType) internal {
        address[] storage users = usersByType[_userType];
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == _user) {
                users[i] = users[users.length - 1];
                users.pop();
                break;
            }
        }
    }
    
    // Admin functions for emergency use
    function getUserCount() public view returns (uint256 clients, uint256 freelancers, uint256 total) {
        return (
            usersByType[UserType.Client].length,
            usersByType[UserType.Freelancer].length,
            allUsers.length
        );
    }
}