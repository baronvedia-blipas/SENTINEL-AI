/**
 * Avalanche Service — ethers.js interactions with Fuji testnet.
 *
 * Handles:
 * - Logging decisions on-chain (SentinelGuard)
 * - Updating reputation (SentinelERC8004)
 * - Reading on-chain data
 */

const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Load ABIs from Hardhat artifacts
function loadABI(contractName) {
  const artifactPath = path.resolve(
    __dirname,
    `../../artifacts/contracts/${contractName}.sol/${contractName}.json`
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return artifact.abi;
}

// Provider & Wallet
const provider = new ethers.JsonRpcProvider(
  process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc"
);

const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

// Contract instances (lazy-loaded)
let guardContract = null;
let erc8004Contract = null;

function getGuardContract() {
  if (!guardContract) {
    const abi = loadABI("SentinelGuard");
    guardContract = new ethers.Contract(process.env.SENTINEL_GUARD_ADDRESS, abi, wallet);
  }
  return guardContract;
}

function getERC8004Contract() {
  if (!erc8004Contract) {
    const abi = loadABI("SentinelERC8004");
    erc8004Contract = new ethers.Contract(process.env.SENTINEL_ERC8004_ADDRESS, abi, wallet);
  }
  return erc8004Contract;
}

/**
 * Log a BLOCK/ALLOW decision on-chain via SentinelGuard.
 * @param {{ target: string, decision: string, riskLevel: string, reason: string, encryptedReport: string, paymentWei: string }} data
 * @returns {Promise<{ txHash: string, entryId: number }>}
 */
async function logDecisionOnChain(data) {
  const guard = getGuardContract();

  const decisionEnum = data.decision === "BLOCK" ? 1 : 0; // ALLOW=0, BLOCK=1
  const riskEnum = { LOW: 0, MEDIUM: 1, HIGH: 2 }[data.riskLevel] || 0;

  const targetAddress = ethers.isAddress(data.target)
    ? data.target
    : ethers.ZeroAddress;

  const encryptedBytes = data.encryptedReport
    ? ethers.toUtf8Bytes(data.encryptedReport)
    : "0x";

  const tx = await guard.logDecision(
    targetAddress,
    decisionEnum,
    riskEnum,
    data.reason.substring(0, 200), // Limit reason length for gas
    encryptedBytes,
    ethers.parseEther(data.paymentWei || "0")
  );

  const receipt = await tx.wait();

  // Extract entryId from event
  const event = receipt.logs.find((log) => {
    try {
      const parsed = guard.interface.parseLog(log);
      return parsed?.name === "ActionAnalyzed";
    } catch {
      return false;
    }
  });

  let entryId = 0;
  if (event) {
    const parsed = guard.interface.parseLog(event);
    entryId = Number(parsed.args.entryId);
  }

  return {
    txHash: receipt.hash,
    entryId,
    explorerUrl: `https://testnet.snowtrace.io/tx/${receipt.hash}`,
  };
}

/**
 * Update agent reputation on ERC-8004 registry.
 */
async function updateReputation(blocked) {
  const erc8004 = getERC8004Contract();
  const tx = await erc8004.updateReputation(wallet.address, blocked);
  await tx.wait();
  return tx.hash;
}

/**
 * Get agent reputation from ERC-8004 registry.
 */
async function getAgentReputation() {
  const erc8004 = getERC8004Contract();
  const rep = await erc8004.getReputation(wallet.address);
  return {
    totalDecisions: Number(rep.totalDecisions),
    blockedThreats: Number(rep.blockedThreats),
    allowedSafe: Number(rep.allowedSafe),
    score: Number(rep.score),
    lastUpdated: Number(rep.lastUpdated),
  };
}

/**
 * Get agent identity from ERC-8004 registry.
 */
async function getAgentIdentity() {
  const erc8004 = getERC8004Contract();
  const agent = await erc8004.getAgent(wallet.address);
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

/**
 * Get recent audit log entries from SentinelGuard.
 */
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

/**
 * Get wallet balance.
 */
async function getBalance() {
  const balance = await provider.getBalance(wallet.address);
  return ethers.formatEther(balance);
}

module.exports = {
  logDecisionOnChain,
  updateReputation,
  getAgentReputation,
  getAgentIdentity,
  getRecentAuditLog,
  getBalance,
  wallet,
  provider,
};
