// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {FreelanceEscrow} from "../src/FreelanceEscrow.sol";
import {UserRegistry} from "../src/UserRegistry.sol";

contract DeployFreelanceEscrow is Script {
    function run() public returns (FreelanceEscrow, UserRegistry) {
        vm.startBroadcast();
        
        // Deploy UserRegistry first
        UserRegistry userRegistry = new UserRegistry();
        
        // Deploy FreelanceEscrow with UserRegistry address
        FreelanceEscrow escrow = new FreelanceEscrow(address(userRegistry));
        
        vm.stopBroadcast();
        
        return (escrow, userRegistry);
    }
}