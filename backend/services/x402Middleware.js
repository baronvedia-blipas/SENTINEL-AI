/**
 * x402 Payment Middleware — Pay-per-analysis via micropayments.
 *
 * For the hackathon MVP, this implements a simplified x402 flow:
 * - Each API call requires a payment header (X-402-Payment)
 * - Payment is verified and logged
 * - In production, this would integrate with Coinbase x402 SDK
 *
 * Pricing:
 * - Contract analysis: $0.001 USDC
 * - Transaction analysis: $0.0005 USDC
 * - Agent guard: $0.001 USDC
 */

const PRICING = {
  "/api/analyze/contract": { cost: "0.001", currency: "USDC", description: "Contract Analysis" },
  "/api/analyze/transaction": { cost: "0.0005", currency: "USDC", description: "Transaction Analysis" },
  "/api/agent/evaluate": { cost: "0.001", currency: "USDC", description: "Agent Guard Evaluation" },
};

/**
 * x402 payment verification middleware.
 * For MVP: accepts a payment token header and logs it.
 * Responds with 402 Payment Required if no payment provided.
 */
function x402PaymentMiddleware(req, res, next) {
  const route = req.path;
  const pricing = PRICING[route];

  // Skip middleware for routes without pricing (free endpoints)
  if (!pricing) {
    return next();
  }

  const paymentHeader = req.headers["x-402-payment"];

  // If no payment header, return 402 with pricing info
  if (!paymentHeader) {
    return res.status(402).json({
      error: "Payment Required",
      protocol: "x402",
      pricing: {
        cost: pricing.cost,
        currency: pricing.currency,
        description: pricing.description,
        paymentAddress: process.env.SENTINEL_GUARD_ADDRESS || "0x0",
        network: "avalanche-fuji",
        chainId: 43113,
      },
      instructions: "Include X-402-Payment header with payment proof to access this endpoint.",
    });
  }

  // For MVP: accept any non-empty payment token as valid
  // In production: verify on-chain payment via x402 SDK
  const payment = {
    token: paymentHeader,
    cost: pricing.cost,
    currency: pricing.currency,
    route: route,
    timestamp: Date.now(),
    verified: true, // MVP: always true if header present
  };

  // Attach payment info to request for downstream use
  req.x402Payment = payment;

  console.log(`[x402] Payment received for ${pricing.description}: ${pricing.cost} ${pricing.currency}`);

  next();
}

/**
 * Get pricing info for all endpoints.
 */
function getPricing() {
  return Object.entries(PRICING).map(([route, info]) => ({
    endpoint: route,
    ...info,
  }));
}

module.exports = { x402PaymentMiddleware, getPricing, PRICING };
