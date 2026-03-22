/**
 * EncryptedERC — Real AES-256-GCM encryption for audit reports.
 *
 * Reports are encrypted with a key derived from the agent's private key,
 * so only the agent owner can decrypt them. This implements the EncryptedERC
 * pattern: public decision (BLOCK/ALLOW) + private encrypted report.
 */

const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

// Derive encryption key from deployer private key (deterministic)
function getEncryptionKey() {
  const seed = process.env.DEPLOYER_PRIVATE_KEY || "default-key";
  return crypto.createHash("sha256").update(seed).digest();
}

/**
 * Encrypt a report using AES-256-GCM.
 * @param {object} report - The report data to encrypt
 * @returns {{ encrypted: string, iv: string, tag: string }}
 */
function encryptReport(report) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const plaintext = JSON.stringify(report);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  // Pack iv + tag + encrypted into a single string for on-chain storage
  const packed = iv.toString("hex") + ":" + tag + ":" + encrypted;
  return {
    encrypted: packed,
    iv: iv.toString("hex"),
    tag,
    algorithm: ALGORITHM,
    keyDerivation: "SHA-256(DEPLOYER_PRIVATE_KEY)",
  };
}

/**
 * Decrypt a report using AES-256-GCM.
 * @param {string} packed - The packed encrypted string (iv:tag:ciphertext)
 * @returns {object} The decrypted report
 */
function decryptReport(packed) {
  const key = getEncryptionKey();
  const [ivHex, tagHex, ciphertext] = packed.split(":");

  if (!ivHex || !tagHex || !ciphertext) {
    throw new Error("Invalid encrypted format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

module.exports = { encryptReport, decryptReport };
