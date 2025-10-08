// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Challenge.sol";

contract ChallengeFactory {
    address public owner;
    address[] public settlers;
    address public rewardManager;
    mapping(uint256 => address) public deployedChallenges;
    uint256 public challengeCounter;
    uint256 public currentWeek;

    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event SettlersChanged(address[] newSettlers);
    event rewardManagerChanged(address indexed oldrewardManager, address indexed newrewardManager);
    event ChallengeDeployed(uint256 indexed challengeId, address indexed challenge, address indexed settler, address rewardManager);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _owner, address[] memory _settlers, address _rewardManager) {
        owner = _owner;
        settlers = _settlers;
        rewardManager = _rewardManager;
    }

    // Change owner
    function changeOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        emit OwnerChanged(owner, _newOwner);
        owner = _newOwner;
    }

    function updateWeek(uint256 week) external onlyOwner() {
        currentWeek = week;
    }

    // Change settlers
    function changeSettlers(address[] calldata _newSettlers) external onlyOwner {
        settlers = _newSettlers;
        emit SettlersChanged(_newSettlers);
    }

    // Change router contract
    function changerewardManager(address _newrewardManager) external onlyOwner {
        require(_newrewardManager != address(0), "Zero address");
        emit rewardManagerChanged(rewardManager, _newrewardManager);
        rewardManager = _newrewardManager;
    }

    // Deploy a new Challenge contract with a random settler
    function deployChallenge() external {
        require(settlers.length > 0, "No settlers");
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % settlers.length;
        address selectedSettler = settlers[randomIndex];
        Challenge challenge = new Challenge(selectedSettler, rewardManager, currentWeek);
        challengeCounter++;
        deployedChallenges[challengeCounter] = address(challenge);
        emit ChallengeDeployed(challengeCounter, address(challenge), selectedSettler, rewardManager);
    }

    // Get challenge address by ID
    function getChallengeById(uint256 _challengeId) external view returns (address) {
        require(_challengeId > 0 && _challengeId <= challengeCounter, "Invalid challenge ID");
        return deployedChallenges[_challengeId];
    }

    // Get total number of deployed challenges
    function getTotalChallenges() external view returns (uint256) {
        return challengeCounter;
    }

    // Get all settlers
    function getSettlers() external view returns (address[] memory) {
        return settlers;
    }
}
