# Deployment Guide

This document provides comprehensive instructions for deploying and interacting with the SecretRecipeProtection smart contract.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Compilation](#compilation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Verification](#verification)
- [Interaction](#interaction)
- [Network Information](#network-information)

## Prerequisites

Before deploying the contract, ensure you have the following:

- Node.js (v18 or later)
- npm or yarn package manager
- MetaMask or another Web3 wallet
- Sepolia testnet ETH for deployment
- Etherscan API key for contract verification

## Environment Setup

1. **Clone the repository and install dependencies:**

```bash
npm install
```

2. **Create a `.env` file:**

Copy the `.env.example` file and fill in your credentials:

```bash
cp .env.example .env
```

3. **Configure environment variables:**

```env
# Network RPC URLs
SEPOLIA_RPC_URL=https://rpc.sepolia.org
MAINNET_RPC_URL=https://eth.llamarpc.com

# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API key
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional settings
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
REPORT_GAS=false
```

**⚠️ Security Warning:** Never commit your `.env` file to version control. It contains sensitive information like private keys.

## Compilation

Compile the smart contracts:

```bash
npm run compile
```

This will compile all Solidity contracts in the `contracts/` directory and generate artifacts in the `artifacts/` folder.

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Simulation

Test the complete workflow locally:

```bash
npm run simulate
```

The simulation script will:
- Deploy the contract
- Register multiple chefs
- Create secret recipes
- Request and approve access
- Demonstrate all core functionality

## Deployment

### Local Network Deployment

1. **Start a local Hardhat node:**

```bash
npm run node
```

2. **Deploy to local network (in a new terminal):**

```bash
npm run deploy:localhost
```

### Sepolia Testnet Deployment

1. **Ensure you have Sepolia ETH in your wallet**

Get testnet ETH from:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

2. **Deploy to Sepolia:**

```bash
npm run deploy:sepolia
```

3. **Deployment output:**

The script will display:
- Contract address
- Transaction hash
- Block number
- Etherscan link
- Gas used

Example output:
```
✅ SecretRecipeProtection deployed successfully!
Contract address: 0x72E13974c2158A875bAdbc860bfe7A3d932AA612
Network: sepolia
Block number: 4567890
Transaction hash: 0x...

🔍 View on Etherscan:
https://sepolia.etherscan.io/address/0x72E13974c2158A875bAdbc860bfe7A3d932AA612
```

4. **Deployment information is automatically saved** to `deployments/<network>.json`

## Verification

### Verify Contract on Etherscan

After deploying to Sepolia, verify the contract:

```bash
npm run verify:sepolia
```

The script will:
- Read deployment information from `deployments/sepolia.json`
- Submit contract source code to Etherscan
- Display verification status and links

**Note:** Verification may take a few minutes. The script will handle "Already Verified" status gracefully.

## Interaction

### Interact with Deployed Contract

```bash
npm run interact:sepolia
```

This script demonstrates:
- Getting contract owner
- Registering as a chef
- Retrieving chef profiles
- Getting recipe count
- Fetching recipe information
- Checking access permissions

### Custom Interactions

You can modify `scripts/interact.js` to perform custom interactions:

```javascript
// Example: Create a new recipe
const tx = await contract.connect(chef).createSecretRecipe(
  "My Recipe",
  "Dessert",
  12345,  // ingredient 1
  67890,  // ingredient 2
  11111,  // ingredient 3
  5,      // spice level (0-10)
  60,     // cooking time (minutes)
  ethers.parseEther("0.01"), // access price
  false   // is public
);
await tx.wait();
```

## Network Information

### Current Deployment

**Network:** Sepolia Testnet (Chain ID: 11155111)

**Contract Address:** `0x72E13974c2158A875bAdbc860bfe7A3d932AA612`

**Etherscan:** [View Contract](https://sepolia.etherscan.io/address/0x72E13974c2158A875bAdbc860bfe7A3d932AA612)

**Deployment Details:**
- Deployer: Configured in `.env`
- Compiler: Solidity 0.8.24
- Optimization: Enabled (200 runs)
- License: MIT

### Supported Networks

The project is configured for the following networks:

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Hardhat | 1337 | http://127.0.0.1:8545 | N/A |
| Localhost | 1337 | http://127.0.0.1:8545 | N/A |
| Sepolia | 11155111 | https://rpc.sepolia.org | https://sepolia.etherscan.io |
| Mainnet | 1 | https://eth.llamarpc.com | https://etherscan.io |

## Script Reference

### Deployment Scripts

- `scripts/deploy.js` - Main deployment script
- `scripts/verify.js` - Contract verification on Etherscan
- `scripts/interact.js` - Example interactions with deployed contract
- `scripts/simulate.js` - Full workflow simulation

### Test Files

- `test/SecretRecipeProtection.test.js` - Comprehensive test suite

## Troubleshooting

### Common Issues

**1. Insufficient funds for deployment:**
```
Error: insufficient funds for intrinsic transaction cost
```
**Solution:** Add more Sepolia ETH to your wallet using a faucet.

**2. Invalid private key:**
```
Error: invalid private key
```
**Solution:** Ensure your private key in `.env` is correct and doesn't include the `0x` prefix.

**3. Network connection issues:**
```
Error: could not detect network
```
**Solution:** Check your RPC URL in `.env` and ensure you have internet connectivity.

**4. Verification failure:**
```
Error: Etherscan API key not configured
```
**Solution:** Add your Etherscan API key to `.env` file.

### Gas Optimization

To report gas usage during tests:

```bash
REPORT_GAS=true npm test
```

### Clean Build

If you encounter compilation issues, clean and rebuild:

```bash
npm run clean
npm run compile
```

## Security Best Practices

1. **Never share your private key** or commit it to version control
2. **Test thoroughly** on testnets before mainnet deployment
3. **Verify contracts** on Etherscan for transparency
4. **Use hardware wallets** for mainnet deployments
5. **Keep dependencies updated** regularly
6. **Audit smart contracts** before production use

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Sepolia Testnet Information](https://sepolia.dev/)
- [Etherscan Verification Guide](https://docs.etherscan.io/tutorials/verifying-contracts-programmatically)

## Support

For issues or questions:
- Check existing [GitHub Issues](https://github.com/MayeSchuppe/SecretRecipeProtection/issues)
- Review the [README.md](README.md) for project overview
- Test using the simulation script: `npm run simulate`
