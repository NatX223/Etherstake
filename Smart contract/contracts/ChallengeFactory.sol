// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Challenge.sol";

contract ChallengeFactory {
    address public owner;
    address[] public settlers;
    address public routerContract;
    mapping(uint256 => address) public deployedChallenges;
    uint256 public challengeCounter;

    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event SettlersChanged(address[] newSettlers);
    event RouterContractChanged(address indexed oldRouterContract, address indexed newRouterContract);
    event ChallengeDeployed(uint256 indexed challengeId, address indexed challenge, address indexed settler, address routerContract);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _owner, address[] memory _settlers, address _routerContract) {
        owner = _owner;
        settlers = _settlers;
        routerContract = _routerContract;
    }

    // Change owner
    function changeOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        emit OwnerChanged(owner, _newOwner);
        owner = _newOwner;
    }

    // Change settlers
    function changeSettlers(address[] calldata _newSettlers) external onlyOwner {
        settlers = _newSettlers;
        emit SettlersChanged(_newSettlers);
    }

    // Change router contract
    function changeRouterContract(address _newRouterContract) external onlyOwner {
        require(_newRouterContract != address(0), "Zero address");
        emit RouterContractChanged(routerContract, _newRouterContract);
        routerContract = _newRouterContract;
    }

    // Deploy a new Challenge contract with a random settler
    function deployChallenge() external {
        require(settlers.length > 0, "No settlers");
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % settlers.length;
        address selectedSettler = settlers[randomIndex];
        Challenge challenge = new Challenge(selectedSettler, routerContract);
        challengeCounter++;
        deployedChallenges[challengeCounter] = address(challenge);
        emit ChallengeDeployed(challengeCounter, address(challenge), selectedSettler, routerContract);
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
