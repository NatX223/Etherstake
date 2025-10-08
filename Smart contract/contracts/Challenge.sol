// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Challenge is ReentrancyGuard {
    address public author;
    address public settler;
    uint256 public amount;
    address public routerContract;
    
    uint256 public deadline;
    bool public isSettled;
    bool public isInitialized;
    
    // Events
    event ChallengeInitialized(address indexed author, uint256 deadline, uint256 amount);
    event Settled(uint256 userAmount, uint256 routerAmount);
    
    // Modifiers
    modifier onlySettler() {
        require(msg.sender == settler, "Only settler can call this");
        _;
    }
    
    modifier beforeDeadline() {
        require(block.timestamp < deadline, "Deadline has passed");
        _;
    }
    
    modifier afterDeadline() {
        require(block.timestamp >= deadline, "Deadline not reached");
        _;
    }
    
    modifier notSettled() {
        require(!isSettled, "Challenge already settled");
        _;
    }
    
    modifier onlySettled() {
        require(isSettled, "Challenge not settled yet");
        _;
    }
    
    constructor(address _settler, address _routerContract) {
        settler = _settler;
        routerContract = _routerContract;
    }
    
    // Initialize the challenge
    function initialize(uint256 _deadline) external payable {
        require(author == address(0), "Already initialized");
        require(_deadline > block.timestamp, "Deadline must be in future");
        
        author = msg.sender;
        deadline = _deadline;
        amount = msg.value;
        emit ChallengeInitialized(msg.sender, _deadline, msg.value);
    }
    
    // Settle function - only settler can call after deadline
    function settle(uint256 _userAmount, uint256  _routerAmount) external onlySettler afterDeadline notSettled {
        require(_userAmount + _routerAmount == amount, "Amount mismatch");
        (bool success, ) = routerContract.call{value: _routerAmount}("");
        require(success, "Router payment failed.");

        (bool success2, ) = author.call{value: _userAmount}("");
        require(success2, "Author payment failed.");   

        isSettled = true;
        emit Settled(_userAmount, _routerAmount);
    }
} 