const { ethers } = require("ethers");

// ABI fragments — only the functions we need (avoids loading artifacts)
const GUARD_ABI = [
  "function logDecision(address _target, uint8 _decision, uint8 _riskLevel, string _reason, bytes _encryptedReport, uint256 _paymentWei) external returns (uint256)",
  "function getRecentEntries(uint256 _count) external view returns (tuple(address analyst, address target, uint8 decision, uint8 riskLevel, string reason, bytes encryptedReport, uint256 timestamp, uint256 paymentWei)[])",
  "function getAuditLogLength() external view returns (uint256)",
  "function reputationScore(address) external view returns (uint256)",
  "function totalAnalyses(address) external view returns (uint256)",
  "event ActionAnalyzed(uint256 indexed entryId, address indexed analyst, address indexed target, uint8 decision, uint8 riskLevel, string reason)",
];

const ERC8004_ABI = [
  "function getAgent(address _agent) external view returns (tuple(address agentAddress, string name, string description, string serviceEndpoint, string[] capabilities, uint256 registeredAt, bool active))",
  "function getReputation(address _agent) external view returns (tuple(uint256 totalDecisions, uint256 blockedThreats, uint256 allowedSafe, uint256 score, uint256 lastUpdated))",
  "function updateReputation(address _agent, bool _blocked) external",
  "function isRegistered(address _agent) external view returns (bool)",
];

// Lazy singletons
let _provider = null;
let _wallet = null;
let _guardContract = null;
let _erc8004Contract = null;

function getProvider() {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(
      process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc"
    );
  }
  return _provider;
}

function getWallet() {
  if (!_wallet) {
    _wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, getProvider());
  }
  return _wallet;
}

function getGuardContract() {
  if (!_guardContract) {
    _guardContract = new ethers.Contract(process.env.SENTINEL_GUARD_ADDRESS, GUARD_ABI, getWallet());
  }
  return _guardContract;
}

function getERC8004Contract() {
  if (!_erc8004Contract) {
    _erc8004Contract = new ethers.Contract(process.env.SENTINEL_ERC8004_ADDRESS, ERC8004_ABI, getWallet());
  }
  return _erc8004Contract;
}

async function logDecisionOnChain(data) {
  const guard = getGuardContract();
  const decisionEnum = data.decision === "BLOCK" ? 1 : 0;
  const riskEnum = { LOW: 0, MEDIUM: 1, HIGH: 2 }[data.riskLevel] || 0;
  const targetAddress = ethers.isAddress(data.target) ? data.target : ethers.ZeroAddress;
  const encryptedBytes = data.encryptedReport ? ethers.toUtf8Bytes(data.encryptedReport) : "0x";

  const tx = await guard.logDecision(
    targetAddress, decisionEnum, riskEnum,
    data.reason.substring(0, 200),
    encryptedBytes,
    ethers.parseEther(data.paymentWei || "0")
  );
  const receipt = await tx.wait();

  const event = receipt.logs.find((log) => {
    try { return guard.interface.parseLog(log)?.name === "ActionAnalyzed"; } catch { return false; }
  });

  let entryId = 0;
  if (event) {
    entryId = Number(guard.interface.parseLog(event).args.entryId);
  }

  return {
    txHash: receipt.hash,
    entryId,
    explorerUrl: `https://testnet.snowtrace.io/tx/${receipt.hash}`,
    gasUsed: receipt.gasUsed?.toString() || "N/A",
    gasPrice: receipt.gasPrice ? (Number(receipt.gasPrice) / 1e9).toFixed(2) + " gwei" : "N/A",
    gasCost: receipt.gasUsed && receipt.gasPrice ? (Number(receipt.gasUsed) * Number(receipt.gasPrice) / 1e18).toFixed(6) + " AVAX" : "N/A",
  };
}

async function updateReputation(blocked) {
  const erc8004 = getERC8004Contract();
  const tx = await erc8004.updateReputation(getWallet().address, blocked);
  await tx.wait();
}

async function getAgentReputation() {
  const erc8004 = getERC8004Contract();
  const rep = await erc8004.getReputation(getWallet().address);
  return {
    totalDecisions: Number(rep.totalDecisions),
    blockedThreats: Number(rep.blockedThreats),
    allowedSafe: Number(rep.allowedSafe),
    score: Number(rep.score),
    lastUpdated: Number(rep.lastUpdated),
  };
}

async function getAgentIdentity() {
  const erc8004 = getERC8004Contract();
  const agent = await erc8004.getAgent(getWallet().address);
  return {
    address: agent.agentAddress,
    name: agent.name,
    description: agent.description,
    serviceEndpoint: agent.serviceEndpoint,
    capabilities: [...agent.capabilities],
    registeredAt: Number(agent.registeredAt),
    active: agent.active,
  };
}

async function getRecentAuditLog(count = 10) {
  const guard = getGuardContract();
  const entries = await guard.getRecentEntries(count);
  return entries.map((entry) => ({
    analyst: entry.analyst,
    target: entry.target,
    decision: Number(entry.decision) === 1 ? "BLOCK" : "ALLOW",
    riskLevel: ["LOW", "MEDIUM", "HIGH"][Number(entry.riskLevel)],
    reason: entry.reason,
    timestamp: Number(entry.timestamp),
    paymentWei: ethers.formatEther(entry.paymentWei),
  }));
}

async function getBalance() {
  const balance = await getProvider().getBalance(getWallet().address);
  return ethers.formatEther(balance);
}

module.exports = {
  logDecisionOnChain, updateReputation, getAgentReputation,
  getAgentIdentity, getRecentAuditLog, getBalance,
};
