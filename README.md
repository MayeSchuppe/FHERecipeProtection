# Secret Recipe Protection

A revolutionary confidential culinary technology platform that leverages Fully Homomorphic Encryption (FHE) to protect proprietary recipes and cooking formulas. This decentralized application enables chefs and culinary professionals to securely share their secret recipes while maintaining complete privacy and control over their intellectual property.

## 🌐 Live Demo

**Website**: [https://fhe-recipe-protection.vercel.app/](https://fhe-recipe-protection.vercel.app/)

## 🎬 Demo Video

**Demo Video**: The `demo.mp4` file demonstrates how chefs can protect their secret recipes using FHE encryption technology.

## 🌟 Enhanced Features (v2.0)

### New in This Version

✅ **Gateway Callback Pattern** - Asynchronous processing for all encrypted operations
✅ **Refund Mechanism** - Automatic refunds for denied requests and decryption failures
✅ **Timeout Protection** - 7-day timeout prevents permanent fund locking
✅ **Privacy-Preserving Division** - Random multiplier obfuscation for encrypted prices
✅ **Price Obfuscation** - Advanced techniques to prevent price pattern analysis
✅ **Comprehensive Security** - Input validation, access control, overflow protection, reentrancy guards
✅ **Gas Optimization** - Efficient HCU (Homomorphic Computation Unit) usage
✅ **Enhanced Documentation** - Complete architecture and API documentation

## 🔐 Core Concept

Secret Recipe Protection utilizes cutting-edge FHE smart contracts to create an unprecedented level of privacy for culinary creations. Chefs can encrypt their secret ingredients, cooking techniques, and proprietary formulas on-chain, allowing them to monetize their knowledge without revealing sensitive information until proper authorization is granted.

### Privacy-Preserving Culinary Innovation

Traditional recipe sharing platforms expose valuable culinary secrets to potential theft or unauthorized use. Our FHE-based solution ensures that:

- **Ingredient formulas remain encrypted** - Secret ingredient combinations are stored as encrypted values that cannot be read without proper access
- **Selective disclosure** - Chefs control exactly who can access their recipes and under what conditions
- **Verifiable ownership** - Blockchain technology provides immutable proof of recipe authorship and creation dates
- **Monetization without exposure** - Access requests can be processed with encrypted data, protecting formulas even during verification
- **Price privacy** - Obfuscation techniques prevent analysis of recipe pricing patterns

## 🎯 Key Features

### For Culinary Professionals

- **Chef Registration** - Establish your verified identity as a culinary professional with specialty credentials
- **Encrypted Recipe Creation** - Store up to three secret ingredients as encrypted values alongside cooking parameters
- **Access Control Management** - Approve or deny access requests to your proprietary recipes
- **Revenue Generation** - Set custom pricing for recipe access and earn from your culinary expertise
- **Public/Private Toggle** - Choose whether recipes are openly viewable or require paid access
- **Automatic Refund System** - Built-in refund mechanism for denied requests
- **Timeout Protection** - Automatic refund for requests not processed within 7 days

### For Food Enthusiasts

- **Recipe Discovery** - Browse available recipes from verified chefs across multiple cuisines
- **Secure Access Requests** - Pay to unlock secret formulas and techniques from professional chefs
- **Encrypted Data Handling** - All sensitive recipe information remains encrypted using FHE technology
- **Recipe Collections** - Build your personal library of licensed professional recipes
- **Refund Protection** - Automatic refunds if access is denied or times out
- **Transparent Pricing** - Clear access costs with privacy-preserving obfuscation

## 🔬 FHE Smart Contract Technology

The platform utilizes Fully Homomorphic Encryption (FHE) smart contracts to enable computation on encrypted data without decryption. This breakthrough technology allows:

- **On-chain Privacy** - Secret ingredients stored as encrypted euint32 values
- **Encrypted Computations** - Spice levels and cooking parameters processed without exposure
- **Zero-Knowledge Verification** - Access control enforced without revealing recipe details
- **Permanent Confidentiality** - Even contract operators cannot view encrypted recipe data
- **Gateway Callback Pattern** - Asynchronous decryption via trusted FHE Gateway

### Encrypted Data Types

- **Secret Ingredients** - Three encrypted uint32 values for proprietary ingredient codes
- **Spice Level** - Encrypted uint8 value (0-10 scale) for heat sensitivity
- **Cooking Time** - Encrypted uint32 for precise timing information
- **Access Price** - Encrypted uint64 with obfuscation multiplier for price privacy
- **Access Permissions** - Encrypted boolean flags for authorization status

## 🏗️ Gateway Callback Architecture

The system implements an innovative **asynchronous Gateway callback pattern**:

```
1. User Request → Smart Contract Records → Escrows Payment
2. Gateway Processes → Performs FHE Operations → Generates Proofs
3. Callback Execution → Verifies Proofs → Completes Transaction
4. Finalization → Distributes Payments or Issues Refunds
```

### Benefits of Gateway Pattern:

- **Reliability** - Timeout protection prevents stuck transactions
- **Security** - Cryptographic proof verification via FHE.checkSignatures()
- **Scalability** - Off-chain computation reduces gas costs
- **Flexibility** - Handles complex FHE operations efficiently

## 🛡️ Advanced Security Features

### Input Validation
- Maximum string lengths enforced (100 chars names, 50 chars categories)
- Bounds checking on all numeric inputs
- Price caps to prevent overflow (max 10 ETH)
- Cooking time validation (must be positive)

### Access Control
- Multi-tier permission system with modifiers
- Recipe owner validation
- Existence checks before operations
- Fine-grained FHE permission management

### Overflow Protection
- Constants for all maximum values
- Checked arithmetic throughout
- No unchecked operations

### Reentrancy Protection
- NonReentrant modifier on all payment functions
- State changes before external calls
- Proper use of call() for ETH transfers

## 💰 Refund Mechanisms

### Automatic Refunds
- **Denial Refunds** - Instant refund when chef denies access request
- **Timeout Refunds** - Claimable after 7-day timeout period
- **Decryption Failure** - Event logging for recovery processes

### Refund Flow
```
Access Request (Payment Escrowed)
  ↓
Chef Denies → Automatic Refund
  or
7 Days Pass → Claimable Refund
  or
Approved → Payment to Chef
```

## 🔒 Privacy-Preserving Techniques

### Price Obfuscation

Traditional encrypted prices can leak information through transaction patterns. Our solution uses **random multiplier obfuscation**:

```solidity
// Generate random multiplier (100-1000)
uint256 obfuscationMultiplier = 100 + (random % 900);

// Obfuscate price before encryption
uint64 obfuscatedPrice = (actualPrice * obfuscationMultiplier) / 100;
euint64 encryptedPrice = FHE.asEuint64(obfuscatedPrice);
```

**Benefits**:
- Prevents price pattern analysis
- Maintains computational privacy
- Allows encrypted comparisons without division
- No division on encrypted values (uses multiplication)

### Division Problem Solution

FHE encryption makes division operations extremely expensive. Our solution:
- Uses **multiplication instead of division** for price calculations
- Random multipliers create privacy noise
- Public validation prices stored separately for payment verification
- Encrypted prices used only for homomorphic operations

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or later
- npm or yarn package manager
- MetaMask or another Web3 wallet
- Sepolia testnet ETH (for deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
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
npx hardhat compile

# Run tests
npx hardhat test

# Run coverage
npx hardhat coverage

# Deploy to local network
npx hardhat node              # Terminal 1
npx hardhat run scripts/deploy.js --network localhost  # Terminal 2

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 📖 Documentation

### Comprehensive Documentation Suite

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System design, Gateway pattern, security analysis
- **[API Reference](./docs/API.md)** - Complete function documentation with examples
- **[Security Audit](./SECURITY.md)** - Security features and audit checklist
- **[Deployment Guide](./DEPLOYMENT.md)** - Network configuration and deployment instructions
- **[Testing Guide](./TESTING.md)** - Test coverage and scenarios

## 🔄 Technology Stack

### Smart Contract Development
- **Solidity**: v0.8.24 with Cancun EVM version
- **Hardhat**: v2.19.0+ (Smart contract development framework)
- **Optimization**: Enabled with 200 runs for gas efficiency
- **FHE Integration**: @fhevm/solidity v0.5.0 for encrypted data types

### Frontend Technologies
- **Static HTML/CSS/JS**: Pure vanilla JavaScript implementation
- **Web3 Library**: ethers.js v6.10.0 for blockchain interaction
- **Deployment**: Vercel with static site configuration
- **Styling**: Custom CSS with modern UI/UX design

### Development Tools
- **@nomicfoundation/hardhat-toolbox**: Complete development toolkit
- **@nomicfoundation/hardhat-verify**: Etherscan verification
- **dotenv**: Environment variable management
- **Chai**: Testing framework

## 🧪 Testing

The project includes a comprehensive test suite covering:

- Contract deployment and initialization
- Chef registration and profile management
- Recipe creation with encrypted ingredients
- Access request and approval workflows
- Refund mechanisms (denial and timeout)
- Gateway callback pattern
- Recipe management (public/private, pricing)
- Security features (reentrancy, overflow)
- View functions and access control

Run tests:
```bash
npx hardhat test
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
      ✓ Should encrypt ingredients with FHE
      ✓ Should obfuscate prices with random multipliers
    Access Control
      ✓ Should allow requesting access with payment
      ✓ Should approve and grant permissions
      ✓ Should deny and issue automatic refund
    Timeout Protection
      ✓ Should allow claiming timeout refund after 7 days
      ✓ Should prevent early timeout claims
    Gateway Callback
      ✓ Should request decryption via Gateway
      ✓ Should process callback with proof verification
      ✓ Should handle decryption failures gracefully
```

## 📊 Gas Optimization

### HCU (Homomorphic Computation Unit) Management

| Operation | Gas Cost | HCU Usage |
|-----------|----------|-----------|
| Recipe Creation | 500k-800k | High (multiple FHE.asEuint*) |
| Access Request | 100k-150k | Low (payment only) |
| Access Approval | 200k-300k | Medium (FHE.allow calls) |
| Recipe Reveal | 250k-400k | High (Gateway call) |
| Refund | 60k-100k | Minimal (ETH transfer) |

### Optimization Strategies

1. **Batch Permissions** - Setup all FHE.allow() in single transaction
2. **Lazy Decryption** - Only decrypt when explicitly requested
3. **Caching** - Store public values separately from encrypted
4. **Selective Encryption** - Only encrypt truly sensitive fields
5. **Price Obfuscation** - Avoid division through multiplication

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
- `denyAccess(requestId)` - Deny an access request with refund (chef only)
- `checkRecipeAccess(user, recipeId)` - Check if user has access
- `claimTimeoutRefund(requestId)` - Claim refund after timeout

### Decryption (Gateway Pattern)
- `revealRecipeSecrets(recipeId)` - Request decryption via Gateway
- `processRecipeReveal(requestId, cleartexts, proof)` - Gateway callback (internal)

### View Functions
- `compareSpiceLevels(recipeId1, recipeId2)` - Compare encrypted spice levels
- `getAccessRequest(requestId)` - Get access request details

## 🔒 Security Features

- **MetaMask Integration** - Secure wallet connection for all transactions
- **FHE Encryption** - Industry-leading homomorphic encryption for data privacy
- **Smart Contract Auditing** - Transparent on-chain logic for trust verification
- **Access Logging** - Immutable record of all recipe access events
- **Payment Escrow** - Secure payment holding during request processing
- **Automatic Refunds** - Built-in refund mechanisms for denied/timed-out requests
- **Role-Based Access Control** - Chef ownership and permission management
- **Reentrancy Protection** - Guards against reentrancy attacks
- **Input Validation** - Comprehensive validation of all inputs
- **Overflow Protection** - Constants and checks prevent arithmetic overflows
- **Tested & Verified** - Comprehensive test coverage with security focus

## 🌟 Why FHE for Recipes?

Traditional encryption requires decryption before computation, exposing sensitive data. FHE enables:

1. **Price Verification** - Check access fees without revealing recipe contents
2. **Category Filtering** - Search recipes while keeping ingredients encrypted
3. **Reputation Calculations** - Compute chef ratings without exposing formulas
4. **Access Counting** - Track popularity metrics on encrypted data
5. **Ownership Proofs** - Verify authorship without recipe disclosure
6. **Privacy-Preserving Comparisons** - Compare recipes without revealing details

## 🎓 Educational Resources

This project demonstrates practical applications of:

- **Fully Homomorphic Encryption** in blockchain smart contracts
- **Gateway Callback Pattern** for asynchronous FHE operations
- **Privacy-preserving smart contract design** with encrypted data types
- **Refund mechanisms** and timeout protection patterns
- **Price obfuscation techniques** using random multipliers
- **Decentralized access control systems** for intellectual property
- **Web3 integration** with vanilla JavaScript (no framework overhead)
- **Cryptographic recipe protection** methodologies
- **Hardhat development** and testing workflows
- **Professional deployment** and verification practices
- **Gas optimization** strategies for FHE operations
- **Security best practices** (reentrancy, overflow, validation)

## 🤝 Contributing

We welcome contributions from the community! This project serves as a reference implementation for FHE-based privacy solutions and can be adapted for various industries beyond culinary applications.

Potential areas for enhancement:
- Multi-ingredient support (beyond three ingredients)
- Recipe versioning and update mechanisms
- Collaborative recipe development tools
- Integration with IoT kitchen devices
- NFT representation of signature recipes
- Advanced access control mechanisms (time-limited access)
- Recipe marketplace with automated pricing
- Reputation-based discounts
- Batch operations for efficiency

## 📞 Contact & Support

For questions, suggestions, or collaboration opportunities:

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Join our community forum for technical discussions
- **Documentation**: Comprehensive docs in the `/docs` folder

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌍 Vision

Secret Recipe Protection represents the future of culinary intellectual property management. By combining blockchain transparency with FHE privacy, we enable a new economy where chefs can confidently share their expertise while maintaining control over their most valuable assets - their secret recipes.

The Gateway callback pattern ensures reliable asynchronous processing, while comprehensive refund mechanisms and timeout protection guarantee that funds are never permanently locked. Privacy-preserving price obfuscation techniques prevent pattern analysis, and extensive security features protect both users and their intellectual property.

---

## 📝 Version History

### Version 2.0 (Current) - Enhanced Security & Privacy

**Major Enhancements**:
- ✅ Gateway callback pattern for async operations
- ✅ Comprehensive refund mechanisms
- ✅ Timeout protection (7-day default)
- ✅ Privacy-preserving price obfuscation
- ✅ Reentrancy protection
- ✅ Input validation with max lengths
- ✅ Overflow protection constants
- ✅ Enhanced documentation (Architecture + API)

**Security Improvements**:
- ✅ NonReentrant modifier on payment functions
- ✅ ValidString modifier for input validation
- ✅ MAX_ACCESS_PRICE constant (10 ETH cap)
- ✅ REQUEST_TIMEOUT constant (7 days)
- ✅ Emergency withdraw for owner

**New Features**:
- ✅ claimTimeoutRefund() function
- ✅ getAccessRequest() view function
- ✅ DecryptionFailed event handling
- ✅ TimeoutRefundIssued events
- ✅ AccessRefunded events
- ✅ Obfuscation multiplier for prices

### Version 1.0 - Initial Release

- Basic recipe creation and management
- FHE encryption for ingredients
- Access request/approval system
- Chef registration and profiles
- Recipe revelation with decryption

---

## 🔗 Quick Links

- **Documentation**: [./docs/](./docs/)
- **Architecture**: [./docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **API Reference**: [./docs/API.md](./docs/API.md)
- **Security**: [./SECURITY.md](./SECURITY.md)
- **Testing**: [./TESTING.md](./TESTING.md)
- **Deployment**: [./DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Built with cutting-edge FHE technology and comprehensive security features to protect culinary innovation worldwide.**

**Framework**: Hardhat v2.19.0+ | **Solidity**: v0.8.24 (Cancun) | **FHE**: @fhevm/solidity v0.5.0 | **Pattern**: Gateway Callback | **Security**: Reentrancy Protected + Input Validated + Overflow Protected
