const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "AVAX");

  // 1. Deploy SentinelERC8004 (Agent Identity Registry)
  console.log("\n--- Deploying SentinelERC8004 ---");
  const ERC8004 = await hre.ethers.getContractFactory("SentinelERC8004");
  const erc8004 = await ERC8004.deploy();
  await erc8004.waitForDeployment();
  const erc8004Address = await erc8004.getAddress();
  console.log("SentinelERC8004 deployed to:", erc8004Address);

  // 2. Deploy SentinelGuard (using deployer as sentinel agent initially)
  console.log("\n--- Deploying SentinelGuard ---");
  const Guard = await hre.ethers.getContractFactory("SentinelGuard");
  const guard = await Guard.deploy(deployer.address);
  await guard.waitForDeployment();
  const guardAddress = await guard.getAddress();
  console.log("SentinelGuard deployed to:", guardAddress);

  // 3. Register Sentinel as ERC-8004 agent
  console.log("\n--- Registering Sentinel Agent (ERC-8004) ---");
  const tx = await erc8004.registerAgent(
    deployer.address,
    "Sentinel AI",
    "Autonomous security agent that analyzes smart contracts and transactions before execution, blocks risky actions, and builds on-chain reputation.",
    "https://sentinel-ai.demo/api",
    ["contract-analysis", "transaction-risk", "agent-guard"]
  );
  await tx.wait();
  console.log("Sentinel AI registered as ERC-8004 agent!");

  // 4. Verify registration
  const agent = await erc8004.getAgent(deployer.address);
  console.log("\nAgent Identity:");
  console.log("  Name:", agent.name);
  console.log("  Active:", agent.active);
  console.log("  Capabilities:", agent.capabilities);

  // Summary
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("SentinelERC8004:", erc8004Address);
  console.log("SentinelGuard:  ", guardAddress);
  console.log("Agent Address:  ", deployer.address);
  console.log("\nAdd these to your .env file:");
  console.log(`SENTINEL_ERC8004_ADDRESS=${erc8004Address}`);
  console.log(`SENTINEL_GUARD_ADDRESS=${guardAddress}`);
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
