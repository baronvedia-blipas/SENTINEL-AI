// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SentinelGuard
 * @notice Logs BLOCK/ALLOW decisions on-chain for Sentinel AI security agent.
 *         Each decision builds verifiable reputation on Avalanche Fuji.
 *         Audit reports are stored as encrypted hashes (EncryptedERC-compatible).
 */
contract SentinelGuard {
    // --- Types ---
    enum Decision { ALLOW, BLOCK }
    enum RiskLevel { LOW, MEDIUM, HIGH }

    struct AuditEntry {
        address analyst;       // Sentinel agent address
        address target;        // Contract or address analyzed
        Decision decision;
        RiskLevel riskLevel;
        string    reason;      // Short plaintext reason
        bytes     encryptedReport; // EncryptedERC: encrypted full report
        uint256   timestamp;
        uint256   paymentWei;  // x402 payment amount recorded
    }

    // --- State ---
    AuditEntry[] public auditLog;
    mapping(address => uint256) public reputationScore;
    mapping(address => uint256) public totalAnalyses;

    address public owner;
    address public sentinelAgent; // ERC-8004 registered agent

    // --- Events ---
    event ActionAnalyzed(
        uint256 indexed entryId,
        address indexed analyst,
        address indexed target,
        Decision decision,
        RiskLevel riskLevel,
        string reason
    );
    event ReputationUpdated(address indexed agent, uint256 newScore);
    event EncryptedReportStored(uint256 indexed entryId, bytes encryptedData);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlySentinel() {
        require(
            msg.sender == sentinelAgent || msg.sender == owner,
            "Not authorized sentinel"
        );
        _;
    }

    // --- Constructor ---
    constructor(address _sentinelAgent) {
        owner = msg.sender;
        sentinelAgent = _sentinelAgent;
    }

    // --- Core Functions ---

    /**
     * @notice Log an analysis decision on-chain.
     */
    function logDecision(
        address _target,
        Decision _decision,
        RiskLevel _riskLevel,
        string calldata _reason,
        bytes calldata _encryptedReport,
        uint256 _paymentWei
    ) external onlySentinel returns (uint256 entryId) {
        entryId = auditLog.length;

        auditLog.push(AuditEntry({
            analyst: msg.sender,
            target: _target,
            decision: _decision,
            riskLevel: _riskLevel,
            reason: _reason,
            encryptedReport: _encryptedReport,
            timestamp: block.timestamp,
            paymentWei: _paymentWei
        }));

        // Update reputation: +10 for BLOCK (caught threat), +5 for ALLOW
        uint256 points = _decision == Decision.BLOCK ? 10 : 5;
        reputationScore[msg.sender] += points;
        totalAnalyses[msg.sender] += 1;

        emit ActionAnalyzed(entryId, msg.sender, _target, _decision, _riskLevel, _reason);
        emit ReputationUpdated(msg.sender, reputationScore[msg.sender]);

        if (_encryptedReport.length > 0) {
            emit EncryptedReportStored(entryId, _encryptedReport);
        }
    }

    // --- View Functions ---

    function getAuditLogLength() external view returns (uint256) {
        return auditLog.length;
    }

    function getAuditEntry(uint256 _id) external view returns (AuditEntry memory) {
        require(_id < auditLog.length, "Invalid entry ID");
        return auditLog[_id];
    }

    function getReputation(address _agent) external view returns (uint256 score, uint256 analyses) {
        return (reputationScore[_agent], totalAnalyses[_agent]);
    }

    function getRecentEntries(uint256 _count) external view returns (AuditEntry[] memory) {
        uint256 total = auditLog.length;
        uint256 count = _count > total ? total : _count;
        AuditEntry[] memory entries = new AuditEntry[](count);
        for (uint256 i = 0; i < count; i++) {
            entries[i] = auditLog[total - count + i];
        }
        return entries;
    }

    // --- Admin ---

    function setSentinelAgent(address _newAgent) external onlyOwner {
        sentinelAgent = _newAgent;
    }
}
