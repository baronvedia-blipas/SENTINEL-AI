# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sentinel AI — Autonomous Web3 security agent on Avalanche Fuji (ERC-8004). Analyzes smart contracts and transactions before execution, blocks risky actions, logs decisions on-chain, and charges per analysis via x402 micropayments.

## Build & Run Commands

```bash
# Root: install deps + compile contracts
npm install
npm run compile                    # hardhat compile (Solidity 0.8.24)

# Backend (Express on port 3001)
cd backend && npm install
cd backend && node index.js

# Frontend (Vite on port 5173, proxies /api → localhost:3001)
cd frontend && npm install
cd frontend && npm run dev

# Deploy contracts to Fuji testnet
npm run deploy:fuji                # requires DEPLOYER_PRIVATE_KEY with AVAX

# Deploy to local Hardhat node
npm run node                       # terminal 1
npm run deploy:local               # terminal 2
```

## Architecture

Three-layer system: **Smart Contracts** ← **Backend API** ← **React Frontend**

### Smart Contracts (Solidity 0.8.24, Hardhat 2, Fuji chainId 43113)
- `SentinelGuard.sol` — On-chain audit log. `logDecision()` stores BLOCK/ALLOW decisions with encrypted reports. Reputation: +10 for BLOCK, +5 for ALLOW.
- `SentinelERC8004.sol` — Agent identity registry. Stores name, capabilities, service endpoint. `updateReputation()` tracks decision history.
- Enums: `Decision { ALLOW=0, BLOCK=1 }`, `RiskLevel { LOW=0, MEDIUM=1, HIGH=2 }`

### Backend (Express + ethers.js v6 + Claude API)
- **Analyzers are rule-based, not ML.** Claude is only used for generating Spanish explanations via `tool_use`.
- `contractAnalyzer.js` — 5 rules: reentrancy, unlimited approval, tx.origin, missing require, unchecked send
- `txAnalyzer.js` — 5 rules: unlimited approve, high-value transfer, unknown contract, zero address, suspicious spender
- `agentGuard.js` — Dispatches to contract or tx analyzer based on `actionType`, returns BLOCK if HIGH risk
- `avalancheService.js` — Loads ABIs from `artifacts/`, lazy-creates contract instances, logs decisions on-chain
- `x402Middleware.js` — Returns 402 with pricing if `X-402-Payment` header missing; MVP accepts any token
- `claudeService.js` — Uses `claude-sonnet-4-20250514` with `format_security_report` tool for structured output

### Frontend (React 19 + Vite 8 + Tailwind CSS 4)
- 4 tab panels: ContractAnalyzer, TxAnalyzer, AgentGuard, AuditLog
- All paid API calls include `X-402-Payment` header
- Vite proxies `/api` to `localhost:3001` (see `vite.config.js`)
- Dark theme via CSS variables in `index.css`

## Key Conventions

- Decision logic: `riskLevel === "HIGH"` → BLOCK, else ALLOW
- All API responses include `onChain: { txHash, entryId, explorerUrl }` when logging succeeds
- Reason strings are truncated to 200 chars before on-chain storage (gas optimization)
- Encrypted reports are base64-encoded JSON stored as bytes in SentinelGuard
- Backend loads `.env` from project root (`../. env` relative to backend/)
- Contract ABIs are loaded from Hardhat artifacts at `artifacts/contracts/<Name>.sol/<Name>.json`

## Environment Variables (.env at project root)

```
DEPLOYER_PRIVATE_KEY   # Wallet private key (Fuji testnet only)
FUJI_RPC_URL           # Default: https://api.avax-test.network/ext/bc/C/rpc
ANTHROPIC_API_KEY      # Claude API key
PORT                   # Backend port (default 3001)
SENTINEL_GUARD_ADDRESS # Filled after deploy
SENTINEL_ERC8004_ADDRESS # Filled after deploy
```
