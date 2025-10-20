# Secret Recipe Protection

A revolutionary confidential culinary technology platform that leverages Fully Homomorphic Encryption (FHE) to protect proprietary recipes and cooking formulas. This decentralized application enables chefs and culinary professionals to securely share their secret recipes while maintaining complete privacy and control over their intellectual property.


## 🔐 Core Concept

Secret Recipe Protection utilizes cutting-edge FHE smart contracts to create an unprecedented level of privacy for culinary creations. Chefs can encrypt their secret ingredients, cooking techniques, and proprietary formulas on-chain, allowing them to monetize their knowledge without revealing sensitive information until proper authorization is granted.

### Privacy-Preserving Culinary Innovation

Traditional recipe sharing platforms expose valuable culinary secrets to potential theft or unauthorized use. Our FHE-based solution ensures that:

- **Ingredient formulas remain encrypted** - Secret ingredient combinations are stored as encrypted values that cannot be read without proper access
- **Selective disclosure** - Chefs control exactly who can access their recipes and under what conditions
- **Verifiable ownership** - Blockchain technology provides immutable proof of recipe authorship and creation dates
- **Monetization without exposure** - Access requests can be processed with encrypted data, protecting formulas even during verification

## 🎯 Key Features

### For Culinary Professionals

- **Chef Registration** - Establish your verified identity as a culinary professional with specialty credentials
- **Encrypted Recipe Creation** - Store up to three secret ingredients as encrypted values alongside cooking parameters
- **Access Control Management** - Approve or deny access requests to your proprietary recipes
- **Revenue Generation** - Set custom pricing for recipe access and earn from your culinary expertise
- **Public/Private Toggle** - Choose whether recipes are openly viewable or require paid access

### For Food Enthusiasts

- **Recipe Discovery** - Browse available recipes from verified chefs across multiple cuisines
- **Secure Access Requests** - Pay to unlock secret formulas and techniques from professional chefs
- **Encrypted Data Handling** - All sensitive recipe information remains encrypted using FHE technology
- **Recipe Collections** - Build your personal library of licensed professional recipes

## 🔬 FHE Smart Contract Technology

The platform utilizes Fully Homomorphic Encryption (FHE) smart contracts to enable computation on encrypted data without decryption. This breakthrough technology allows:

- **On-chain Privacy** - Secret ingredients stored as encrypted euint32 values
- **Encrypted Computations** - Spice levels and cooking parameters processed without exposure
- **Zero-Knowledge Verification** - Access control enforced without revealing recipe details
- **Permanent Confidentiality** - Even contract operators cannot view encrypted recipe data

### Encrypted Data Types

- **Secret Ingredients** - Three encrypted uint32 values for proprietary ingredient codes
- **Spice Level** - Encrypted uint8 value (0-10 scale) for heat sensitivity
- **Cooking Time** - Encrypted uint32 for precise timing information
- **Access Permissions** - Encrypted boolean flags for authorization status

## 🌐 Live Demonstration

**Website**: [https://fhe-recipe-protection.vercel.app/](https://fhe-recipe-protection.vercel.app/)

**GitHub Repository**: [https://github.com/MayeSchuppe/FHERecipeProtection](https://github.com/MayeSchuppe/FHERecipeProtection)

**Smart Contract Address**: `0x72E13974c2158A875bAdbc860bfe7A3d932AA612`

**Network**: Sepolia Testnet (Chain ID: 11155111)

**Etherscan**: [View Contract](https://sepolia.etherscan.io/address/0x72E13974c2158A875bAdbc860bfe7A3d932AA612)

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or later
- npm or yarn package manager
- MetaMask or another Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/MayeSchuppe/FHERecipeProtection.git
cd SecretRecipeProtection

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your .env file with private key and API keys
```

### Development Workflow

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Run full simulation
npm run simulate

# Deploy to local network
npm run node              # Terminal 1
npm run deploy:localhost  # Terminal 2

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify on Etherscan
npm run verify:sepolia

# Interact with deployed contract
npm run interact:sepolia
```

## 🏗️ Architecture

### Project Structure

```
secret-recipe-protection/
├── contracts/
│   └── SecretRecipeProtection.sol    # Main FHE smart contract
├── scripts/
│   ├── deploy.js                     # Deployment script
│   ├── verify.js                     # Etherscan verification
│   ├── interact.js                   # Contract interaction examples
│   └── simulate.js                   # Full workflow simulation
├── test/
│   └── SecretRecipeProtection.test.js # Comprehensive test suite
├── hardhat.config.js                 # Hardhat configuration
├── package.json                      # Dependencies and scripts
├── .env.example                      # Environment template
├── DEPLOYMENT.md                     # Detailed deployment guide
└── README.md                         # This file
```

### Smart Contract Components

```
SecretRecipeProtection.sol
├── Chef Management
│   ├── Registration & Verification
│   ├── Specialty Tracking
│   └── Reputation System
├── Recipe Storage
│   ├── Encrypted Ingredients (FHE)
│   ├── Metadata (Name, Category)
│   └── Access Pricing
├── Access Control
│   ├── Request Processing
│   ├── Payment Handling
│   └── Permission Management
└── Revelation System
    ├── Decryption Authorization
    └── Secret Disclosure
```

## 🛠️ Development Framework

### Hardhat Configuration

The project uses Hardhat as the primary development framework with:

- **Compiler**: Solidity 0.8.24 with optimization enabled
- **Testing**: Comprehensive test suite with Chai matchers
- **Networks**: Hardhat, Localhost, Sepolia, Mainnet
- **Plugins**:
  - `@nomicfoundation/hardhat-toolbox` - Complete development toolkit
  - `@nomicfoundation/hardhat-verify` - Etherscan verification
  - `dotenv` - Environment variable management

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run deploy:localhost` | Deploy to local network |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run verify:sepolia` | Verify contract on Etherscan |
| `npm run interact:localhost` | Interact with local deployment |
| `npm run interact:sepolia` | Interact with Sepolia deployment |
| `npm run simulate` | Run full workflow simulation |
| `npm run node` | Start local Hardhat node |
| `npm run clean` | Clean build artifacts |

## 📊 Contract Deployment

### Sepolia Testnet

**Contract Address**: `0x72E13974c2158A875bAdbc860bfe7A3d932AA612`

**Network Details**:
- Chain ID: 11155111
- RPC URL: https://rpc.sepolia.org
- Explorer: https://sepolia.etherscan.io

**Verified Contract**: [View on Etherscan](https://sepolia.etherscan.io/address/0x72E13974c2158A875bAdbc860bfe7A3d932AA612)

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🧪 Testing

The project includes a comprehensive test suite covering:

- Contract deployment and initialization
- Chef registration and profile management
- Recipe creation with encrypted ingredients
- Access request and approval workflows
- Recipe management (public/private, pricing)
- View functions and access control

Run tests:
```bash
npm test
```

Example output:
```
  SecretRecipeProtection
    Deployment
      ✓ Should set the correct owner
      ✓ Should initialize with recipe ID starting at 1
    Chef Registration
      ✓ Should allow a user to register as a chef
      ✓ Should reject registration with empty name
    Recipe Creation
      ✓ Should allow a registered chef to create a recipe
      ✓ Should reject recipe creation from unregistered chef
    ...
```

## 📖 Use Cases

### Professional Kitchens

- Protect signature dish formulations
- License recipes to franchises or partners
- Maintain competitive advantage through encrypted formulas
- Verify recipe authenticity and ownership

### Culinary Education

- Monetize teaching materials and techniques
- Provide graduated access to student learners
- Track recipe usage and attribution
- Create verifiable certification programs

### Food Industry

- Safeguard proprietary seasoning blends
- Secure beverage formulations
- Protect manufacturing processes
- Enable B2B recipe licensing

### Recipe Creators

- Establish intellectual property rights
- Generate passive income from creations
- Build reputation through verified recipes
- Collaborate without exposing secrets

## 🔒 Security Features

- **MetaMask Integration** - Secure wallet connection for all transactions
- **FHE Encryption** - Industry-leading homomorphic encryption for data privacy
- **Smart Contract Auditing** - Transparent on-chain logic for trust verification
- **Access Logging** - Immutable record of all recipe access events
- **Payment Escrow** - Automated payment distribution upon access approval
- **Role-Based Access Control** - Chef ownership and permission management
- **Tested & Verified** - Comprehensive test coverage and Etherscan verification

## 🌟 Why FHE for Recipes?

Traditional encryption requires decryption before computation, exposing sensitive data. FHE enables:

1. **Price Verification** - Check access fees without revealing recipe contents
2. **Category Filtering** - Search recipes while keeping ingredients encrypted
3. **Reputation Calculations** - Compute chef ratings without exposing formulas
4. **Access Counting** - Track popularity metrics on encrypted data
5. **Ownership Proofs** - Verify authorship without recipe disclosure

## 🎓 Educational Resources

This project demonstrates practical applications of:

- Fully Homomorphic Encryption in blockchain
- Privacy-preserving smart contract design
- Decentralized access control systems
- Web3 integration with modern UI frameworks
- Cryptographic recipe protection methodologies
- Hardhat development and testing workflows
- Professional deployment and verification practices

## 🤝 Contributing

We welcome contributions from the community! This project serves as a reference implementation for FHE-based privacy solutions and can be adapted for various industries beyond culinary applications.

Potential areas for enhancement:
- Multi-ingredient support (beyond three ingredients)
- Recipe versioning and update mechanisms
- Collaborative recipe development tools
- Integration with IoT kitchen devices
- NFT representation of signature recipes
- Advanced access control mechanisms
- Recipe marketplace features

## 📝 Smart Contract Functions

### Chef Management
- `registerChef(name, specialty)` - Register as a verified chef
- `getChefProfile(address)` - Get chef profile information
- `getChefRecipes(address)` - Get list of chef's recipes

### Recipe Management
- `createSecretRecipe(...)` - Create a new encrypted recipe
- `getRecipeInfo(recipeId)` - Get public recipe information
- `getRecipeCount()` - Get total number of recipes
- `makeRecipePublic(recipeId)` - Make a private recipe public
- `updateAccessPrice(recipeId, price)` - Update recipe access price

### Access Control
- `requestRecipeAccess(recipeId)` - Request access to a recipe (payable)
- `approveAccess(requestId)` - Approve an access request (chef only)
- `denyAccess(requestId)` - Deny an access request (chef only)
- `checkRecipeAccess(user, recipeId)` - Check if user has access
- `revealRecipeSecrets(recipeId)` - Reveal encrypted recipe data

## 📞 Contact & Support

For questions, suggestions, or collaboration opportunities:

- **GitHub Issues**: [Report bugs or request features](https://github.com/MayeSchuppe/FHERecipeProtection/issues)
- **Discussions**: Join our community forum for technical discussions
- **Website**: Visit our live platform for demonstrations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌍 Vision

Secret Recipe Protection represents the future of culinary intellectual property management. By combining blockchain transparency with FHE privacy, we enable a new economy where chefs can confidently share their expertise while maintaining control over their most valuable assets - their secret recipes.

---

**Built with cutting-edge FHE technology and Hardhat development framework to protect culinary innovation worldwide.**

**Deployment**: Sepolia Testnet | **Contract**: `0x72E13974c2158A875bAdbc860bfe7A3d932AA612` | **Framework**: Hardhat
