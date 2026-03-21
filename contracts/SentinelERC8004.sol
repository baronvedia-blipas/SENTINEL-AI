// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SentinelERC8004
 * @notice ERC-8004 Agent Identity & Reputation Registry for Sentinel AI.
 *         Registers Sentinel as an autonomous agent with on-chain identity,
 *         capabilities, and reputation — the core of what judges evaluate.
 *
 * @dev ERC-8004 defines a standard for AI agent identity on-chain.
 *      Key concepts:
 *      - Agent registration with metadata (name, capabilities, endpoint)
 *      - Reputation tracking per agent
 *      - Service endpoint discovery
 */
contract SentinelERC8004 {
    // --- Types ---
    struct AgentIdentity {
        address agentAddress;
        string  name;
        string  description;
        string  serviceEndpoint; // URL where agent API lives
        string[] capabilities;   // e.g., ["contract-analysis", "tx-risk", "agent-guard"]
        uint256 registeredAt;
        bool    active;
    }

    struct ReputationRecord {
        uint256 totalDecisions;
        uint256 blockedThreats;
        uint256 allowedSafe;
        uint256 score;           // Weighted reputation score
        uint256 lastUpdated;
    }

    // --- State ---
    mapping(address => AgentIdentity) public agents;
    mapping(address => ReputationRecord) public reputation;
    address[] public registeredAgents;

    address public owner;

    // --- Events ---
    event AgentRegistered(
        address indexed agentAddress,
        string name,
        string serviceEndpoint
    );
    event AgentUpdated(address indexed agentAddress);
    event AgentDeactivated(address indexed agentAddress);
    event ReputationUpdated(
        address indexed agentAddress,
        uint256 newScore,
        uint256 totalDecisions
    );

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyRegisteredAgent(address _agent) {
        require(agents[_agent].active, "Agent not registered or inactive");
        _;
    }

    // --- Constructor ---
    constructor() {
        owner = msg.sender;
    }

    // --- Registration ---

    /**
     * @notice Register a new ERC-8004 agent on-chain.
     */
    function registerAgent(
        address _agentAddress,
        string calldata _name,
        string calldata _description,
        string calldata _serviceEndpoint,
        string[] calldata _capabilities
    ) external onlyOwner {
        require(!agents[_agentAddress].active, "Agent already registered");

        agents[_agentAddress] = AgentIdentity({
            agentAddress: _agentAddress,
            name: _name,
            description: _description,
            serviceEndpoint: _serviceEndpoint,
            capabilities: _capabilities,
            registeredAt: block.timestamp,
            active: true
        });

        reputation[_agentAddress] = ReputationRecord({
            totalDecisions: 0,
            blockedThreats: 0,
            allowedSafe: 0,
            score: 0,
            lastUpdated: block.timestamp
        });

        registeredAgents.push(_agentAddress);

        emit AgentRegistered(_agentAddress, _name, _serviceEndpoint);
    }

    /**
     * @notice Update reputation after a decision. Called by SentinelGuard.
     */
    function updateReputation(
        address _agent,
        bool _blocked
    ) external onlyOwner onlyRegisteredAgent(_agent) {
        ReputationRecord storage rep = reputation[_agent];

        rep.totalDecisions += 1;
        if (_blocked) {
            rep.blockedThreats += 1;
            rep.score += 10; // Higher reward for catching threats
        } else {
            rep.allowedSafe += 1;
            rep.score += 5;
        }
        rep.lastUpdated = block.timestamp;

        emit ReputationUpdated(_agent, rep.score, rep.totalDecisions);
    }

    // --- View Functions ---

    function getAgent(address _agent) external view returns (AgentIdentity memory) {
        return agents[_agent];
    }

    function getReputation(address _agent) external view returns (ReputationRecord memory) {
        return reputation[_agent];
    }

    function getRegisteredAgentCount() external view returns (uint256) {
        return registeredAgents.length;
    }

    function isRegistered(address _agent) external view returns (bool) {
        return agents[_agent].active;
    }

    // --- Admin ---

    function deactivateAgent(address _agent) external onlyOwner {
        agents[_agent].active = false;
        emit AgentDeactivated(_agent);
    }
}
