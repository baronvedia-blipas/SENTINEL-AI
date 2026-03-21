import { useState, useEffect, useCallback } from "react";

const FUJI_CHAIN_ID = "0xa869"; // 43113 in hex

const FUJI_NETWORK = {
  chainId: FUJI_CHAIN_ID,
  chainName: "Avalanche Fuji C-Chain",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
};

export default function useWallet() {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const hasMetaMask = typeof window !== "undefined" && !!window.ethereum;

  // Check if already connected on mount
  useEffect(() => {
    if (!hasMetaMask) return;

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      })
      .catch(() => {});

    window.ethereum
      .request({ method: "eth_chainId" })
      .then(setChainId)
      .catch(() => {});

    // Listen for account/chain changes
    const handleAccountsChanged = (accounts) => {
      setAddress(accounts[0] || null);
    };
    const handleChainChanged = (id) => {
      setChainId(id);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [hasMetaMask]);

  const connect = useCallback(async () => {
    if (!hasMetaMask) {
      setError("MetaMask not installed");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(accounts[0]);

      // Check if on Fuji, if not, switch
      const currentChain = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(currentChain);

      if (currentChain !== FUJI_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: FUJI_CHAIN_ID }],
          });
          setChainId(FUJI_CHAIN_ID);
        } catch (switchError) {
          // Chain not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [FUJI_NETWORK],
            });
            setChainId(FUJI_CHAIN_ID);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, [hasMetaMask]);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const isOnFuji = chainId === FUJI_CHAIN_ID;
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return {
    address,
    shortAddress,
    chainId,
    isOnFuji,
    isConnecting,
    hasMetaMask,
    error,
    connect,
    disconnect,
  };
}
