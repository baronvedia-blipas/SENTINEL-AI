# 🛡️ Sentinel AI

**Autonomous Security Agent for Web3 on Avalanche**

Sentinel AI is an ERC-8004 registered agent that acts as a guard layer for Web3. It analyzes smart contracts and transactions **before execution**, blocks risky actions, charges per analysis via x402 micropayments, and stores encrypted audit reports using EncryptedERC. Every BLOCK/ALLOW decision is logged on-chain as verifiable reputation.

> **Key Innovation:** Sentinel is not just a tool — it IS an ERC-8004 agent with on-chain identity, reputation built from correct decisions, and a real business model via micropayments.

---

## 🏆 Avalanche — Aleph Hackathon 2026

**Track:** Avalanche | **Team:** Sentinel AI

### Deployed Contracts (Fuji Testnet — Chain ID 43113)

| Contract | Address | Explorer |
|----------|---------|----------|
| SentinelERC8004 | `0xf9AbfD966521BE7F0950823A635305BcEd56b68A` | [View on Snowtrace](https://testnet.snowtrace.io/address/0xf9AbfD966521BE7F0950823A635305BcEd56b68A) |
| SentinelGuard | `0x24aB78183Cc27649bC8afD07D8b949b2F914eF59` | [View on Snowtrace](https://testnet.snowtrace.io/address/0x24aB78183Cc27649bC8afD07D8b949b2F914eF59) |
| Agent Address | `0x567FCdC8e7148a60b91F3367D09EB1b23aF413aC` | [View on Snowtrace](https://testnet.snowtrace.io/address/0x567FCdC8e7148a60b91F3367D09EB1b23aF413aC) |

---

## 🎯 Features

### 1. Smart Contract Analyzer
- Paste Solidity code → rule-based vulnerability detection
- Detects: **reentrancy**, unlimited approvals, tx.origin auth, missing require(), unchecked .send()
- Claude AI generates human-readable explanation + fix suggestions in Spanish
- Cost: **$0.001 USDC** per analysis via x402

### 2. Transaction Risk Analyzer
- Input transaction data → real-time risk assessment
- Detects: unlimited approvals, high-value transfers, unknown contracts, zero address burns
- Claude AI explains risks in plain Spanish
- Cost: **$0.0005 USDC** per analysis via x402

### 3. AI Agent Guard (ERC-8004 Core)
- Sentinel acts as security guard for AI agents
- Agent action → risk analysis → **BLOCK** or **ALLOW**
- Every decision logged on Avalanche Fuji with verifiable TX hash
- Reputation score increases with each correct decision (+10 BLOCK, +5 ALLOW)
- Encrypted audit reports stored on-chain (EncryptedERC)

### 4. On-Chain Audit Log
- Real-time viewer of all decisions stored on SentinelGuard contract
- Agent identity card with ERC-8004 metadata
- Reputation dashboard: score, blocked threats, allowed safe actions

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24 + Hardhat |
| Blockchain | Avalanche Fuji C-Chain (43113) |
| Backend | Node.js + Express + ethers.js v6 |
| AI | Claude API (claude-sonnet-4) with tool_use |
| Frontend | React 19 + Vite 8 + Tailwind CSS 4 |
| Payments | x402 Protocol (micropayments per API call) |
| Privacy | EncryptedERC (encrypted audit reports) |
| Identity | ERC-8004 Agent Registry |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Avalanche Fuji wallet with test AVAX ([Get from faucet](https://build.avax.network/console/primary-network/faucet))
- Anthropic API key

### Setup

```bash
# 1. Clone and install
git clone https://github.com/baronvedia-blipas/SENTINEL-AI.git
cd SENTINEL-AI

# 2. Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Configure environment
cp .env.example .env
# Edit .env with your keys

# 4. Compile and deploy contracts
npm run compile
npm run deploy:fuji

# 5. Start backend (terminal 1)
cd backend && node index.js

# 6. Start frontend (terminal 2)
cd frontend && npm run dev

# 7. Open http://localhost:5173
```

---

## 🎬 Demo Flow (60 seconds)

1. **Contract Analysis** → Paste vulnerable Solidity contract → Sentinel detects reentrancy → HIGH risk + Spanish explanation + x402 payment confirmed

2. **Transaction Risk** → Submit unlimited approve transaction → Flagged HIGH risk → Warning shown to user

3. **Agent Guard** → AI agent attempts risky action → Sentinel **BLOCKS** it → Transaction logged on Avalanche Fuji → Visible in real explorer → Reputation score increases on-chain

---

## 📡 API Endpoints

### Paid (require `X-402-Payment` header)
| Method | Endpoint | Cost | Description |
|--------|----------|------|-------------|
| POST | `/api/analyze/contract` | $0.001 | Analyze Solidity code |
| POST | `/api/analyze/transaction` | $0.0005 | Analyze transaction risk |
| POST | `/api/agent/evaluate` | $0.001 | Agent Guard decision |

### Free
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit-log` | On-chain audit entries |
| GET | `/api/agent/identity` | ERC-8004 agent info |
| GET | `/api/agent/reputation` | Reputation score |
| GET | `/api/pricing` | x402 pricing info |
| GET | `/api/health` | Health check |

---

## 🏗️ Architecture

```
User / AI Agent
      │
      ▼
┌─────────────┐     x402 Payment
│  Frontend    │◄──── $0.001/analysis
│  React+Vite  │
└──────┬──────┘
       │ /api
       ▼
┌─────────────┐     Claude API
│  Backend     │◄──── Explanations (Spanish)
│  Express.js  │
└──────┬──────┘
       │ ethers.js
       ▼
┌─────────────────────────────────────┐
│       Avalanche Fuji (43113)        │
│                                     │
│  SentinelGuard    SentinelERC8004   │
│  (Audit Log)      (Agent Identity)  │
│  (EncryptedERC)   (Reputation)      │
└─────────────────────────────────────┘
```

---

## 🔐 Hackathon Criteria Coverage

| Criteria | Implementation |
|----------|---------------|
| **ERC-8004** | Sentinel registered as agent on-chain with identity, capabilities, and reputation |
| **x402** | Micropayments per API call ($0.001/$0.0005 USDC) with 402 Payment Required flow |
| **EncryptedERC** | Audit reports stored as encrypted bytes on SentinelGuard contract |
| **Live on Fuji** | Contracts deployed, transactions verifiable on Snowtrace explorer |
| **AI Integration** | Claude API with tool_use for structured security reports in Spanish |

---

## 📄 License

MIT — Built for the Avalanche — Aleph Hackathon 2026
