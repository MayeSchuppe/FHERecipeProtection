# API Documentation

## Contract: SecretRecipeProtection

**Version**: 2.0 (Enhanced with Gateway Callback Pattern)
**License**: MIT
**Solidity**: ^0.8.24

## Table of Contents

1. [Overview](#overview)
2. [State Variables](#state-variables)
3. [Data Structures](#data-structures)
4. [Events](#events)
5. [Modifiers](#modifiers)
6. [Functions](#functions)
   - [Chef Management](#chef-management)
   - [Recipe Management](#recipe-management)
   - [Access Control](#access-control)
   - [Refund Mechanisms](#refund-mechanisms)
   - [Decryption (Gateway Pattern)](#decryption-gateway-pattern)
   - [View Functions](#view-functions)
   - [Administrative](#administrative)

---

## Overview

The SecretRecipeProtection contract enables chefs to create and manage encrypted recipes using Fully Homomorphic Encryption (FHE). The system implements a Gateway callback pattern for asynchronous decryption, comprehensive refund mechanisms, timeout protection, and privacy-preserving price obfuscation.

### Key Features

- ✅ FHE-encrypted recipe storage
- ✅ Gateway callback pattern for async operations
- ✅ Automatic refund mechanisms
- ✅ Timeout protection (7-day default)
- ✅ Privacy-preserving price obfuscation
- ✅ Reentrancy protection
- ✅ Comprehensive input validation
- ✅ Multi-tier access control

---

## State Variables

### Public Constants

```solidity
uint256 public constant MAX_ACCESS_PRICE = 10 ether;
```
Maximum allowed access price for recipes (prevents overflow).

```solidity
uint256 public constant REQUEST_TIMEOUT = 7 days;
```
Timeout period for access requests (enables refund claims).

```solidity
uint256 public constant MAX_NAME_LENGTH = 100;
```
Maximum length for chef names and recipe names.

```solidity
uint256 public constant MAX_CATEGORY_LENGTH = 50;
```
Maximum length for categories and specialties.

```solidity
uint256 public constant DECRYPTION_TIMEOUT = 1 days;
```
Timeout for Gateway decryption callbacks.

### Public State Variables

```solidity
address public owner;
```
Contract owner address (deployer).

```solidity
uint256 public nextRecipeId;
```
Auto-incrementing ID for next recipe (starts at 1).

```solidity
uint256 public nextRequestId;
```
Auto-incrementing ID for next access request (starts at 1).

### Mappings

```solidity
mapping(uint256 => Recipe) public recipes;
```
Recipe ID to Recipe struct mapping.

```solidity
mapping(address => ChefProfile) public chefs;
```
Chef address to profile mapping.

```solidity
mapping(uint256 => AccessRequest) public accessRequests;
```
Request ID to AccessRequest struct mapping.

```solidity
mapping(address => mapping(uint256 => bool)) public hasAccess;
```
User address → Recipe ID → Access status.

```solidity
mapping(address => uint256[]) public chefRecipes;
```
Chef address → Array of owned recipe IDs.

```solidity
mapping(uint256 => string) internal requestIdToContext;
```
Decryption request ID → Context string (for Gateway callbacks).

---

## Data Structures

### Recipe

```solidity
struct Recipe {
    string name;                      // Recipe name (max 100 chars)
    string category;                  // Category (max 50 chars)
    address chef;                     // Owner address
    euint32 secretIngredient1;        // Encrypted ingredient 1
    euint32 secretIngredient2;        // Encrypted ingredient 2
    euint32 secretIngredient3;        // Encrypted ingredient 3
    euint8 secretSpiceLevel;          // Encrypted spice level (0-10)
    euint32 secretCookingTime;        // Encrypted time (minutes)
    bool isPublic;                    // Public access flag
    bool exists;                      // Existence flag
    uint256 createdAt;                // Creation timestamp
    euint64 encryptedAccessPrice;     // Obfuscated encrypted price
    uint256 publicAccessPrice;        // Public price for validation
    uint256 obfuscationMultiplier;    // Random multiplier (100-1000)
}
```

### ChefProfile

```solidity
struct ChefProfile {
    string name;                      // Chef name
    string specialty;                 // Chef specialty
    uint256 recipeCount;              // Number of recipes created
    bool verified;                    // Verification status
    uint256 reputation;               // Reputation score (starts at 100)
}
```

### AccessRequest

```solidity
struct AccessRequest {
    uint256 recipeId;                 // Requested recipe ID
    address requester;                // Requester address
    uint256 amount;                   // Payment amount (wei)
    bool approved;                    // Approval status
    bool processed;                   // Processing status
    uint256 requestTime;              // Request timestamp
    bool refunded;                    // Refund status
    uint256 decryptionRequestId;      // Gateway request ID
    bool decryptionFailed;            // Failure flag
}
```

---

## Events

### RecipeCreated
```solidity
event RecipeCreated(uint256 indexed recipeId, address indexed chef, string name);
```
Emitted when a new recipe is created.

### AccessRequested
```solidity
event AccessRequested(uint256 indexed requestId, uint256 indexed recipeId, address indexed requester);
```
Emitted when access is requested with payment.

### AccessGranted
```solidity
event AccessGranted(uint256 indexed recipeId, address indexed requester);
```
Emitted when access is approved by chef.

### AccessDenied
```solidity
event AccessDenied(uint256 indexed requestId, address indexed requester);
```
Emitted when access is denied by chef.

### AccessRefunded
```solidity
event AccessRefunded(uint256 indexed requestId, address indexed requester, uint256 amount);
```
Emitted when payment is refunded.

### ChefRegistered
```solidity
event ChefRegistered(address indexed chef, string name);
```
Emitted when a chef registers.

### RecipeRevealed
```solidity
event RecipeRevealed(uint256 indexed recipeId, address indexed viewer);
```
Emitted when recipe decryption is requested.

### DecryptionRequested
```solidity
event DecryptionRequested(uint256 indexed recipeId, uint256 requestId);
```
Emitted when Gateway decryption is initiated.

### DecryptionCompleted
```solidity
event DecryptionCompleted(uint256 indexed recipeId, uint256 requestId);
```
Emitted when Gateway callback succeeds.

### DecryptionFailed
```solidity
event DecryptionFailed(uint256 indexed requestId, string reason);
```
Emitted when Gateway callback fails.

### TimeoutRefundIssued
```solidity
event TimeoutRefundIssued(uint256 indexed requestId, address indexed requester, uint256 amount);
```
Emitted when timeout refund is processed.

---

## Modifiers

### onlyOwner
```solidity
modifier onlyOwner()
```
Restricts function to contract owner only.

**Reverts**: "Not authorized" if caller is not owner.

### onlyChef
```solidity
modifier onlyChef(uint256 _recipeId)
```
Restricts function to recipe owner only.

**Parameters**:
- `_recipeId`: Recipe ID to check ownership

**Reverts**: "Not recipe owner" if caller doesn't own recipe.

### onlyExistingRecipe
```solidity
modifier onlyExistingRecipe(uint256 _recipeId)
```
Validates recipe exists before proceeding.

**Parameters**:
- `_recipeId`: Recipe ID to validate

**Reverts**: "Recipe does not exist" if recipe not found.

### validString
```solidity
modifier validString(string memory str, uint256 maxLength)
```
Validates string length constraints.

**Parameters**:
- `str`: String to validate
- `maxLength`: Maximum allowed length

**Reverts**:
- "String cannot be empty" if length is 0
- "String too long" if exceeds maxLength

### nonReentrant
```solidity
modifier nonReentrant()
```
Prevents reentrancy attacks on state-changing functions.

**Reverts**: "ReentrancyGuard: reentrant call" if reentry detected.

---

## Functions

## Chef Management

### registerChef

```solidity
function registerChef(
    string memory _name,
    string memory _specialty
) external
```

Register as a verified chef in the system.

**Parameters**:
- `_name`: Chef name (1-100 characters)
- `_specialty`: Chef specialty (1-50 characters)

**Requirements**:
- Name length: 1-100 characters
- Specialty length: 1-50 characters
- Caller must not be already registered

**Events**: Emits `ChefRegistered`

**Gas Cost**: ~100k-150k gas

**Example**:
```javascript
await contract.registerChef("Gordon Ramsay", "Fine Dining");
```

---

## Recipe Management

### createSecretRecipe

```solidity
function createSecretRecipe(
    string memory _name,
    string memory _category,
    uint32 _ingredient1,
    uint32 _ingredient2,
    uint32 _ingredient3,
    uint8 _spiceLevel,
    uint32 _cookingTime,
    uint256 _accessPrice,
    bool _isPublic
) external
```

Create a new encrypted recipe with privacy-preserving price obfuscation.

**Parameters**:
- `_name`: Recipe name (1-100 characters)
- `_category`: Recipe category (1-50 characters)
- `_ingredient1`: Secret ingredient code 1 (encrypted)
- `_ingredient2`: Secret ingredient code 2 (encrypted)
- `_ingredient3`: Secret ingredient code 3 (encrypted)
- `_spiceLevel`: Spice level 0-10 (encrypted)
- `_cookingTime`: Cooking time in minutes (encrypted)
- `_accessPrice`: Public access price (max 10 ether)
- `_isPublic`: Whether recipe is publicly accessible

**Requirements**:
- Caller must be registered chef
- Name length: 1-100 characters
- Category length: 1-50 characters
- Spice level: 0-10
- Cooking time: > 0
- Access price: ≤ 10 ether

**Events**: Emits `RecipeCreated`

**Gas Cost**: ~500k-800k gas (FHE operations)

**Privacy Features**:
- All ingredients encrypted with FHE
- Price obfuscated with random multiplier (100-1000)
- Spice level and cooking time encrypted

**Example**:
```javascript
await contract.createSecretRecipe(
    "Beef Wellington",
    "Main Course",
    12345,  // ingredient code 1
    67890,  // ingredient code 2
    11111,  // ingredient code 3
    7,      // spice level
    120,    // cooking time (minutes)
    ethers.utils.parseEther("0.1"),  // price
    false   // private recipe
);
```

### makeRecipePublic

```solidity
function makeRecipePublic(uint256 _recipeId) external
```

Make a private recipe publicly accessible.

**Parameters**:
- `_recipeId`: Recipe ID to make public

**Requirements**:
- Caller must own the recipe
- Recipe must exist

**Gas Cost**: ~30k-50k gas

**Example**:
```javascript
await contract.makeRecipePublic(1);
```

### updateAccessPrice

```solidity
function updateAccessPrice(
    uint256 _recipeId,
    uint256 _newPrice
) external
```

Update recipe access price with automatic obfuscation.

**Parameters**:
- `_recipeId`: Recipe ID to update
- `_newPrice`: New access price (max 10 ether)

**Requirements**:
- Caller must own the recipe
- Recipe must exist
- New price ≤ 10 ether

**Events**: Updates encrypted price with new obfuscation

**Gas Cost**: ~150k-250k gas (FHE operations)

**Example**:
```javascript
await contract.updateAccessPrice(1, ethers.utils.parseEther("0.2"));
```

---

## Access Control

### requestRecipeAccess

```solidity
function requestRecipeAccess(uint256 _recipeId) external payable
```

Request paid access to a private recipe (Gateway callback pattern - Step 1).

**Parameters**:
- `_recipeId`: Recipe ID to request access for

**Payment**: Must send exact access price in wei

**Requirements**:
- Recipe must exist
- Recipe must not be public
- Caller must not already have access
- Payment must be ≥ access price
- Payment must be ≤ MAX_ACCESS_PRICE

**Events**: Emits `AccessRequested`

**Gas Cost**: ~100k-150k gas

**Security**: Protected by nonReentrant modifier

**Example**:
```javascript
const recipeInfo = await contract.getRecipeInfo(1);
await contract.requestRecipeAccess(1, {
    value: recipeInfo.accessPrice
});
```

### approveAccess

```solidity
function approveAccess(uint256 _requestId) external
```

Approve an access request and grant permissions (Gateway callback pattern - Step 2).

**Parameters**:
- `_requestId`: Access request ID to approve

**Requirements**:
- Caller must own the recipe
- Request must not be already processed
- Request must not be refunded
- Request must not be timed out (7 days)

**Effects**:
- Grants FHE permissions to requester
- Transfers payment to chef
- Marks request as processed
- Updates hasAccess mapping

**Events**: Emits `AccessGranted` or `TimeoutRefundIssued`

**Gas Cost**: ~200k-300k gas (with FHE permissions)

**Security**: Protected by nonReentrant modifier

**Example**:
```javascript
await contract.approveAccess(1);
```

### denyAccess

```solidity
function denyAccess(uint256 _requestId) external
```

Deny an access request with automatic refund.

**Parameters**:
- `_requestId`: Access request ID to deny

**Requirements**:
- Caller must own the recipe
- Request must not be already processed
- Request must not be refunded

**Effects**:
- Automatically refunds payment to requester
- Marks request as processed and refunded

**Events**: Emits `AccessDenied` and `AccessRefunded`

**Gas Cost**: ~80k-120k gas

**Security**: Protected by nonReentrant modifier

**Example**:
```javascript
await contract.denyAccess(1);
```

---

## Refund Mechanisms

### claimTimeoutRefund

```solidity
function claimTimeoutRefund(uint256 _requestId) external
```

Claim refund for a timed-out access request.

**Parameters**:
- `_requestId`: Access request ID to claim refund for

**Requirements**:
- Caller must be the requester
- Request must not be already processed
- Request must not be already refunded
- Request must be > 7 days old

**Effects**:
- Issues refund to requester
- Marks request as processed and refunded

**Events**: Emits `TimeoutRefundIssued`

**Gas Cost**: ~60k-100k gas

**Security**: Protected by nonReentrant modifier

**Example**:
```javascript
// Wait 7 days after request
await contract.claimTimeoutRefund(1);
```

---

## Decryption (Gateway Pattern)

### revealRecipeSecrets

```solidity
function revealRecipeSecrets(uint256 _recipeId) external
```

Request recipe decryption via FHE Gateway (Gateway callback pattern - Step 3).

**Parameters**:
- `_recipeId`: Recipe ID to reveal

**Requirements**:
- Recipe must exist
- Caller must have access (public, granted, or owner)

**Effects**:
- Prepares ciphertext array
- Calls FHE.requestDecryption()
- Stores context for callback

**Events**: Emits `RecipeRevealed` and `DecryptionRequested`

**Gas Cost**: ~250k-400k gas (Gateway call)

**Returns**: Gateway will callback to `processRecipeReveal()`

**Example**:
```javascript
const tx = await contract.revealRecipeSecrets(1);
const receipt = await tx.wait();
// Listen for DecryptionRequested event to get requestId
```

### processRecipeReveal

```solidity
function processRecipeReveal(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

Gateway callback for decryption completion (Gateway callback pattern - Step 4).

**Parameters**:
- `requestId`: Decryption request ID from Gateway
- `cleartexts`: ABI-encoded decrypted values
- `decryptionProof`: Cryptographic proof from Gateway

**Effects**:
- Verifies Gateway signatures
- Decodes decrypted values
- Emits success or failure event

**Events**: Emits `DecryptionCompleted` or `DecryptionFailed`

**Security**: Uses FHE.checkSignatures() for proof verification

**Note**: This function is called by the FHE Gateway, not directly by users.

**Decoded Values**:
```solidity
(uint32 ingredient1, uint32 ingredient2, uint32 ingredient3,
 uint8 spiceLevel, uint32 cookingTime)
```

---

## View Functions

### getRecipeInfo

```solidity
function getRecipeInfo(uint256 _recipeId) external view returns (
    string memory name,
    string memory category,
    address chef,
    bool isPublic,
    uint256 accessPrice,
    uint256 createdAt
)
```

Get public recipe information.

**Parameters**:
- `_recipeId`: Recipe ID to query

**Requirements**:
- Recipe must exist

**Returns**:
- `name`: Recipe name
- `category`: Recipe category
- `chef`: Owner address
- `isPublic`: Public access flag
- `accessPrice`: Access price in wei
- `createdAt`: Creation timestamp

**Gas Cost**: Minimal (view function)

**Example**:
```javascript
const info = await contract.getRecipeInfo(1);
console.log(`Recipe: ${info.name}, Price: ${ethers.utils.formatEther(info.accessPrice)} ETH`);
```

### getChefRecipes

```solidity
function getChefRecipes(address _chef) external view returns (uint256[] memory)
```

Get all recipe IDs owned by a chef.

**Parameters**:
- `_chef`: Chef address

**Returns**: Array of recipe IDs

**Gas Cost**: Minimal (view function)

**Example**:
```javascript
const recipes = await contract.getChefRecipes(chefAddress);
console.log(`Chef has ${recipes.length} recipes`);
```

### checkRecipeAccess

```solidity
function checkRecipeAccess(address _user, uint256 _recipeId) external view returns (bool)
```

Check if a user has access to a recipe.

**Parameters**:
- `_user`: User address to check
- `_recipeId`: Recipe ID to check

**Returns**: `true` if user has access (owner, granted, or public)

**Gas Cost**: Minimal (view function)

**Example**:
```javascript
const hasAccess = await contract.checkRecipeAccess(userAddress, 1);
```

### getChefProfile

```solidity
function getChefProfile(address _chef) external view returns (
    string memory name,
    string memory specialty,
    uint256 recipeCount,
    bool verified,
    uint256 reputation
)
```

Get chef profile information.

**Parameters**:
- `_chef`: Chef address

**Returns**:
- `name`: Chef name
- `specialty`: Chef specialty
- `recipeCount`: Number of recipes
- `verified`: Verification status
- `reputation`: Reputation score

**Gas Cost**: Minimal (view function)

**Example**:
```javascript
const profile = await contract.getChefProfile(chefAddress);
console.log(`Chef ${profile.name}, Reputation: ${profile.reputation}`);
```

### getRecipeCount

```solidity
function getRecipeCount() external view returns (uint256)
```

Get total number of recipes in the system.

**Returns**: Total recipe count

**Gas Cost**: Minimal (view function)

**Example**:
```javascript
const count = await contract.getRecipeCount();
console.log(`Total recipes: ${count}`);
```

### getAccessRequest

```solidity
function getAccessRequest(uint256 _requestId) external view returns (
    uint256 recipeId,
    address requester,
    uint256 amount,
    bool approved,
    bool processed,
    uint256 requestTime,
    bool refunded
)
```

Get access request details.

**Parameters**:
- `_requestId`: Request ID to query

**Returns**:
- `recipeId`: Requested recipe ID
- `requester`: Requester address
- `amount`: Payment amount
- `approved`: Approval status
- `processed`: Processing status
- `requestTime`: Request timestamp
- `refunded`: Refund status

**Gas Cost**: Minimal (view function)

**Example**:
```javascript
const request = await contract.getAccessRequest(1);
console.log(`Request for recipe ${request.recipeId}, Amount: ${ethers.utils.formatEther(request.amount)}`);
```

### compareSpiceLevels

```solidity
function compareSpiceLevels(uint256 _recipeId1, uint256 _recipeId2) external returns (bytes32)
```

Compare spice levels of two recipes (privacy-preserving).

**Parameters**:
- `_recipeId1`: First recipe ID
- `_recipeId2`: Second recipe ID

**Requirements**:
- Caller must have access to both recipes

**Returns**: Encrypted comparison result (bytes32)

**Gas Cost**: ~150k-250k gas (FHE comparison)

**Note**: Returns encrypted boolean, needs decryption to view result

---

## Administrative

### emergencyWithdraw

```solidity
function emergencyWithdraw() external
```

Emergency function to withdraw stuck funds.

**Requirements**:
- Caller must be owner

**Effects**: Transfers entire contract balance to owner

**Security**: Only for emergency recovery scenarios

**Gas Cost**: ~30k-50k gas

**Example**:
```javascript
// Owner only
await contract.emergencyWithdraw();
```

### receive

```solidity
receive() external payable
```

Fallback function to accept ETH transfers.

**Note**: Allows contract to receive ETH without function calls

---

## Gas Cost Summary

| Function | Estimated Gas | Notes |
|----------|--------------|-------|
| registerChef | 100k-150k | Basic storage |
| createSecretRecipe | 500k-800k | Multiple FHE operations |
| requestRecipeAccess | 100k-150k | With payment |
| approveAccess | 200k-300k | FHE permissions |
| denyAccess | 80k-120k | With refund |
| claimTimeoutRefund | 60k-100k | Simple refund |
| revealRecipeSecrets | 250k-400k | Gateway call |
| processRecipeReveal | 100k-200k | Callback processing |
| makeRecipePublic | 30k-50k | State update |
| updateAccessPrice | 150k-250k | FHE update |
| compareSpiceLevels | 150k-250k | FHE comparison |

**Note**: Actual gas costs vary based on network conditions and input data size.

---

## Error Messages

| Error | Cause |
|-------|-------|
| "Not authorized" | Caller is not owner |
| "Not recipe owner" | Caller doesn't own recipe |
| "Recipe does not exist" | Invalid recipe ID |
| "String cannot be empty" | Empty string provided |
| "String too long" | String exceeds max length |
| "ReentrancyGuard: reentrant call" | Reentrancy detected |
| "Chef already registered" | Chef already has profile |
| "Chef not registered" | Chef must register first |
| "Spice level must be 0-10" | Invalid spice level |
| "Access price too high" | Price > MAX_ACCESS_PRICE |
| "Cooking time must be positive" | Invalid cooking time |
| "Recipe is already public" | Cannot request public recipe |
| "Already has access" | User already granted access |
| "Insufficient payment" | Payment < access price |
| "Payment exceeds maximum" | Payment > MAX_ACCESS_PRICE |
| "Request already processed" | Cannot process twice |
| "Request already refunded" | Cannot refund twice |
| "Not request owner" | Caller didn't make request |
| "Request not timed out" | Cannot claim before timeout |
| "No access to recipe" | User lacks permission |
| "No access to first/second recipe" | Comparison access denied |
| "Refund failed" | ETH transfer failed |
| "Payment transfer failed" | ETH transfer failed |
| "Withdraw failed" | ETH transfer failed |

---

## Integration Example

### Complete Workflow

```javascript
const { ethers } = require("ethers");

// Connect to contract
const contract = new ethers.Contract(contractAddress, abi, signer);

// 1. Register as chef
await contract.registerChef("Chef Name", "Italian Cuisine");

// 2. Create secret recipe
const tx1 = await contract.createSecretRecipe(
    "Pasta Carbonara",
    "Main Course",
    12345, 67890, 11111,  // ingredients
    5,                     // spice level
    30,                    // cooking time
    ethers.utils.parseEther("0.1"),  // price
    false                  // private
);
await tx1.wait();

// 3. User requests access
const tx2 = await contract.connect(userSigner).requestRecipeAccess(1, {
    value: ethers.utils.parseEther("0.1")
});
const receipt = await tx2.wait();
const requestId = receipt.events.find(e => e.event === "AccessRequested").args.requestId;

// 4. Chef approves
await contract.approveAccess(requestId);

// 5. User reveals recipe
await contract.connect(userSigner).revealRecipeSecrets(1);

// 6. Listen for decryption completion
contract.on("DecryptionCompleted", (recipeId, requestId) => {
    console.log("Recipe decrypted:", recipeId);
});
```

---

## Security Best Practices

1. **Always validate recipe existence** before operations
2. **Check access permissions** before revealing
3. **Monitor timeout periods** for requests
4. **Handle decryption failures** gracefully
5. **Verify event emissions** in frontend
6. **Use exact payment amounts** to avoid rejections
7. **Implement frontend timeout checks** for UX
8. **Listen for refund events** to update UI

---

For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md)

For deployment instructions, see [README.md](../README.md)
