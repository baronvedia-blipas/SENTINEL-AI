const translations = {
  es: {
    // Header
    subtitle: "Agente de Seguridad Autónomo en Avalanche",
    connectWallet: "Conectar Wallet",
    connecting: "Conectando...",
    installMetamask: "Instalar MetaMask",
    disconnect: "Desconectar",
    viewExplorer: "Ver en Explorer",
    wrongNetwork: "Red incorrecta. Cambia a Avalanche Fuji.",
    switchBtn: "Cambiar",

    // Tabs
    liveDemo: "Demo en Vivo",
    contractAnalyzer: "Analizador de Contratos",
    txAnalyzer: "Analizador de TX",
    agentGuard: "Guardia de Agentes",
    agentIdentity: "Identidad del Agente",
    auditLog: "Registro de Auditoría",

    // Contract Analyzer
    contractTitle: "Analizador de Smart Contracts",
    contractDesc: "Pega código Solidity para detectar reentrancy, approvals ilimitados, abuso de tx.origin, y más.",
    loadExample: "Cargar Ejemplo",
    pasteCode: "// Pega tu código Solidity aquí...",
    analyzeBtn: "Analizar Contrato",
    analyzing: "Analizando...",
    cost: "Costo",
    via: "vía",

    // TX Analyzer
    txTitle: "Analizador de Riesgo de Transacciones",
    txDesc: "Analiza transacciones antes de ejecutarlas. Detecta approvals ilimitados, transferencias de alto valor, y contratos desconocidos.",
    analyzeTransaction: "Analizar Transacción",
    txType: "Tipo de Transacción",
    amount: "Monto",
    contractAddress: "Dirección del Contrato",
    spenderAddress: "Dirección del Spender",
    recipient: "Destinatario",

    // Agent Guard
    guardTitle: "Guardia de Agentes IA (ERC-8004)",
    guardDesc: "Sentinel actúa como guardia de seguridad para agentes IA. Cuando un agente quiere ejecutar una acción, pasa por Sentinel primero. Las acciones riesgosas son BLOQUEADAS y registradas on-chain.",
    deployVulnerable: "Deployar Contrato Vulnerable",
    unlimitedApprove: "Aprobación Ilimitada de Tokens",
    safeTransfer: "Transferencia Segura (10 USDC)",
    evaluating: "Sentinel está evaluando la acción...",
    actionBlocked: "ACCIÓN BLOQUEADA",
    actionAllowed: "ACCIÓN PERMITIDA",
    loggedOnChain: "Registrado en Avalanche Fuji",
    reputationUpdated: "Reputación actualizada",

    // Audit Log
    auditTitle: "Registro de Auditoría On-Chain",
    autoRefresh: "Auto-actualizar (5s)",
    refresh: "Actualizar",
    newDecision: "¡Nueva decisión registrada on-chain!",
    noEntries: "No hay entradas de auditoría aún.",
    loading: "Cargando datos on-chain...",

    // Demo
    demoTitle: "Demo en Vivo",
    demoDesc: "Mira a Sentinel AI analizar, bloquear amenazas, y permitir acciones seguras — todo registrado en Avalanche Fuji en tiempo real.",
    runDemo: "Ejecutar Demo",
    runningDemo: "Ejecutando Demo...",
    demoComplete: "Demo Completa",
    demoAllActions: "acciones analizadas y registradas en Avalanche Fuji.",
    threatsBlocked: "Amenazas Bloqueadas",
    safeActions: "Acciones Seguras",
    onChainTxs: "TXs On-Chain",
    step: "Paso",

    // Demo steps
    demoStep1Title: "Analizar Contrato Vulnerable",
    demoStep1Desc: "Sentinel detecta vulnerabilidad de reentrancy en un contrato Solidity",
    demoStep2Title: "Bloquear Aprobación Ilimitada",
    demoStep2Desc: "Un agente IA intenta aprobar tokens ilimitados — Sentinel lo bloquea",
    demoStep3Title: "Permitir Transferencia Segura",
    demoStep3Desc: "Una transferencia segura de 10 USDC — Sentinel la aprueba",

    // Profile
    profileActive: "ACTIVO",
    reputationScore: "Puntaje de Reputación",
    totalDecisions: "Decisiones Totales",
    threatsBlockedStat: "Amenazas Bloqueadas",
    safeActionsStat: "Acciones Seguras",
    detectionRate: "Tasa de Detección",
    recentActivity: "Actividad Reciente",

    // Landing
    landingSubtitle: "Agente de Seguridad Autónomo para Web3",
    landingDesc: "Analiza smart contracts y transacciones antes de su ejecución. Bloquea acciones riesgosas. Construye reputación on-chain con cada decisión correcta.",
    enterApp: "Entrar a la App",
    liveOn: "En vivo en Avalanche Fuji Testnet",

    // Common
    findings: "Vulnerabilidades Encontradas",
    aiAnalysis: "Análisis IA",
    onChainRecord: "Registro On-Chain",
    suggestedFixes: "Correcciones Sugeridas",
    risk: "Riesgo",
    txHash: "Hash de TX",
    entryId: "ID de Entrada",
    x402Payment: "Pago x402",
    verified: "verificado",
    line: "Línea",

    // Validation
    notSolidity: "No es Código Solidity",
    notSolidityDesc: "La entrada no parece ser código Solidity válido.",
    notSolidityHint: "Pega código Solidity válido que comience con",
    notSolidityHint2: "y contenga",
    notSolidityEtc: "etc.",

    // TX Analyzer presets & options
    unlimitedApprovePreset: "Approve Ilimitado",
    highValueTransfer: "Transferencia de Alto Valor",
    safeTransferPreset: "Transferencia Segura",
    approve: "Aprobar",
    transfer: "Transferir",
    swap: "Intercambiar",
    error: "Error",
    ruleBased: "basado en reglas",

    // Audit Log
    active: "Activo",
    loadingOnChain: "Cargando datos on-chain...",

    // Agent Profile
    loadingProfile: "Cargando perfil del agente...",
    guardContract: "Contrato SentinelGuard",
    guardContractDesc: "Registro de auditoría, decisiones, reportes encriptados",
    registryContract: "Registro SentinelERC8004",
    registryContractDesc: "Identidad del agente, capacidades, reputación",

    // Demo results
    checkAuditLog: "Revisa la pestaña Registro de Auditoría para ver el historial completo on-chain.",

    // Placeholders
    emptyContract: "Pega un contrato Solidity y haz click en",
    emptyContractHint: "o haz click en \"Cargar Ejemplo\" para probar con un contrato vulnerable",
    emptyTx: "Configura una transacción y haz click en",
    emptyTxHint: "o selecciona un preset para cargar un ejemplo",

    // Footer
    footer: "Sentinel AI — Avalanche Hackathon 2026",
  },
  en: {
    subtitle: "Autonomous Security Agent on Avalanche",
    connectWallet: "Connect Wallet",
    connecting: "Connecting...",
    installMetamask: "Install MetaMask",
    disconnect: "Disconnect",
    viewExplorer: "View on Explorer",
    wrongNetwork: "Wrong network. Switch to Avalanche Fuji.",
    switchBtn: "Switch",

    liveDemo: "Live Demo",
    contractAnalyzer: "Contract Analyzer",
    txAnalyzer: "TX Risk Analyzer",
    agentGuard: "Agent Guard",
    agentIdentity: "Agent Identity",
    auditLog: "Audit Log",

    contractTitle: "Smart Contract Analyzer",
    contractDesc: "Paste Solidity code to detect reentrancy, unlimited approvals, tx.origin abuse, and more.",
    loadExample: "Load Example",
    pasteCode: "// Paste your Solidity code here...",
    analyzeBtn: "Analyze Contract",
    analyzing: "Analyzing...",
    cost: "Cost",
    via: "via",

    txTitle: "Transaction Risk Analyzer",
    txDesc: "Analyze transactions before execution. Detects unlimited approvals, high-value transfers, and unknown contracts.",
    analyzeTransaction: "Analyze Transaction",
    txType: "Transaction Type",
    amount: "Amount",
    contractAddress: "Contract Address",
    spenderAddress: "Spender Address",
    recipient: "Recipient (to)",

    guardTitle: "AI Agent Guard (ERC-8004)",
    guardDesc: "Sentinel acts as a security guard for AI agents. When an agent wants to execute an action, it passes through Sentinel first. Risky actions are BLOCKED and logged on-chain.",
    deployVulnerable: "Deploy Vulnerable Contract",
    unlimitedApprove: "Unlimited Token Approve",
    safeTransfer: "Safe Transfer (10 USDC)",
    evaluating: "Sentinel is evaluating the action...",
    actionBlocked: "ACTION BLOCKED",
    actionAllowed: "ACTION ALLOWED",
    loggedOnChain: "Logged on Avalanche Fuji",
    reputationUpdated: "Reputation updated",

    auditTitle: "On-Chain Audit Log",
    autoRefresh: "Auto-refresh (5s)",
    refresh: "Refresh",
    newDecision: "New decision logged on-chain!",
    noEntries: "No audit entries yet.",
    loading: "Loading on-chain data...",

    demoTitle: "Live Demo",
    demoDesc: "Watch Sentinel AI analyze, block threats, and allow safe actions — all logged on Avalanche Fuji in real time.",
    runDemo: "Run Demo",
    runningDemo: "Running Demo...",
    demoComplete: "Demo Complete",
    demoAllActions: "actions analyzed and logged on Avalanche Fuji.",
    threatsBlocked: "Threats Blocked",
    safeActions: "Safe Actions",
    onChainTxs: "On-Chain TXs",
    step: "Step",

    demoStep1Title: "Analyze Vulnerable Contract",
    demoStep1Desc: "Sentinel detects reentrancy vulnerability in a Solidity contract",
    demoStep2Title: "Block Unlimited Approval",
    demoStep2Desc: "An AI agent tries to approve unlimited tokens — Sentinel blocks it",
    demoStep3Title: "Allow Safe Transfer",
    demoStep3Desc: "A safe 10 USDC transfer — Sentinel approves it",

    profileActive: "ACTIVE",
    reputationScore: "Reputation Score",
    totalDecisions: "Total Decisions",
    threatsBlockedStat: "Threats Blocked",
    safeActionsStat: "Safe Actions",
    detectionRate: "Detection Rate",
    recentActivity: "Recent Activity",

    unlimitedApprovePreset: "Unlimited Approve",
    highValueTransfer: "High-Value Transfer",
    safeTransferPreset: "Safe Transfer",
    approve: "Approve",
    transfer: "Transfer",
    swap: "Swap",
    error: "Error",
    ruleBased: "rule-based",

    active: "Active",
    loadingOnChain: "Loading on-chain data...",

    loadingProfile: "Loading agent profile...",
    guardContract: "SentinelGuard Contract",
    guardContractDesc: "Audit log, decisions, encrypted reports",
    registryContract: "SentinelERC8004 Registry",
    registryContractDesc: "Agent identity, capabilities, reputation",

    checkAuditLog: "Check the Audit Log tab to see the full on-chain history.",

    landingSubtitle: "Autonomous Security Agent for Web3",
    landingDesc: "Analyzes smart contracts and transactions before execution. Blocks risky actions. Builds on-chain reputation from every correct decision.",
    enterApp: "Enter App",
    liveOn: "Live on Avalanche Fuji Testnet",

    findings: "Vulnerabilities Found",
    aiAnalysis: "AI Analysis",
    onChainRecord: "On-Chain Record",
    suggestedFixes: "Suggested Fixes",
    risk: "Risk",
    txHash: "TX Hash",
    entryId: "Entry ID",
    x402Payment: "x402 Payment",
    verified: "verified",
    line: "Line",

    notSolidity: "Not Solidity Code",
    notSolidityDesc: "The input does not appear to be valid Solidity code.",
    notSolidityHint: "Paste valid Solidity code starting with",
    notSolidityHint2: "and containing",
    notSolidityEtc: "etc.",

    emptyContract: "Paste a Solidity contract and click",
    emptyContractHint: "or click \"Load Example\" to try with a vulnerable contract",
    emptyTx: "Configure a transaction and click",
    emptyTxHint: "or click a preset to load an example",

    footer: "Sentinel AI — Avalanche Hackathon 2026",
  },
};

export function t(lang, key) {
  return translations[lang]?.[key] || translations.en[key] || key;
}
