// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SecretRecipeProtection is SepoliaConfig {

    address public owner;
    uint256 public nextRecipeId;

    // Security constants
    uint256 public constant MAX_ACCESS_PRICE = 10 ether;
    uint256 public constant REQUEST_TIMEOUT = 7 days;
    uint256 public constant MAX_NAME_LENGTH = 100;
    uint256 public constant MAX_CATEGORY_LENGTH = 50;
    uint256 public constant DECRYPTION_TIMEOUT = 1 days;

    struct Recipe {
        string name;
        string category;
        address chef;
        euint32 secretIngredient1;
        euint32 secretIngredient2;
        euint32 secretIngredient3;
        euint8 secretSpiceLevel;
        euint32 secretCookingTime;
        bool isPublic;
        bool exists;
        uint256 createdAt;
        euint64 encryptedAccessPrice; // Privacy-preserving price with obfuscation
        uint256 publicAccessPrice; // For payment validation
        uint256 obfuscationMultiplier; // Random multiplier for privacy
    }

    struct ChefProfile {
        string name;
        string specialty;
        uint256 recipeCount;
        bool verified;
        uint256 reputation;
    }

    struct AccessRequest {
        uint256 recipeId;
        address requester;
        uint256 amount;
        bool approved;
        bool processed;
        uint256 requestTime;
        bool refunded;
        uint256 decryptionRequestId;
        bool decryptionFailed;
    }

    mapping(uint256 => Recipe) public recipes;
    mapping(address => ChefProfile) public chefs;
    mapping(uint256 => AccessRequest) public accessRequests;
    mapping(address => mapping(uint256 => bool)) public hasAccess;
    mapping(address => uint256[]) public chefRecipes;
    mapping(uint256 => string) internal requestIdToContext; // Maps decryption request to context

    uint256 public nextRequestId;

    // Events
    event RecipeCreated(uint256 indexed recipeId, address indexed chef, string name);
    event AccessRequested(uint256 indexed requestId, uint256 indexed recipeId, address indexed requester);
    event AccessGranted(uint256 indexed recipeId, address indexed requester);
    event AccessDenied(uint256 indexed requestId, address indexed requester);
    event AccessRefunded(uint256 indexed requestId, address indexed requester, uint256 amount);
    event ChefRegistered(address indexed chef, string name);
    event RecipeRevealed(uint256 indexed recipeId, address indexed viewer);
    event DecryptionRequested(uint256 indexed recipeId, uint256 requestId);
    event DecryptionCompleted(uint256 indexed recipeId, uint256 requestId);
    event DecryptionFailed(uint256 indexed requestId, string reason);
    event TimeoutRefundIssued(uint256 indexed requestId, address indexed requester, uint256 amount);

    // Security modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyChef(uint256 _recipeId) {
        require(recipes[_recipeId].chef == msg.sender, "Not recipe owner");
        _;
    }

    modifier onlyExistingRecipe(uint256 _recipeId) {
        require(recipes[_recipeId].exists, "Recipe does not exist");
        _;
    }

    modifier validString(string memory str, uint256 maxLength) {
        require(bytes(str).length > 0, "String cannot be empty");
        require(bytes(str).length <= maxLength, "String too long");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    bool private _locked;

    constructor() {
        owner = msg.sender;
        nextRecipeId = 1;
        nextRequestId = 1;
        _locked = false;
    }

    /// @notice Register as a chef with enhanced validation
    /// @param _name Chef name (1-100 characters)
    /// @param _specialty Chef specialty (1-50 characters)
    function registerChef(
        string memory _name,
        string memory _specialty
    )
        external
        validString(_name, MAX_NAME_LENGTH)
        validString(_specialty, MAX_CATEGORY_LENGTH)
    {
        require(!chefs[msg.sender].verified, "Chef already registered");

        chefs[msg.sender] = ChefProfile({
            name: _name,
            specialty: _specialty,
            recipeCount: 0,
            verified: true,
            reputation: 100
        });

        emit ChefRegistered(msg.sender, _name);
    }

    /// @notice Create a secret recipe with privacy-preserving price obfuscation
    /// @param _name Recipe name
    /// @param _category Recipe category
    /// @param _ingredient1 Secret ingredient 1 (will be encrypted)
    /// @param _ingredient2 Secret ingredient 2 (will be encrypted)
    /// @param _ingredient3 Secret ingredient 3 (will be encrypted)
    /// @param _spiceLevel Spice level 0-10 (will be encrypted)
    /// @param _cookingTime Cooking time in minutes (will be encrypted)
    /// @param _accessPrice Public access price for payment validation
    /// @param _isPublic Whether recipe is publicly accessible
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
    )
        external
        validString(_name, MAX_NAME_LENGTH)
        validString(_category, MAX_CATEGORY_LENGTH)
    {
        require(chefs[msg.sender].verified, "Chef not registered");
        require(_spiceLevel <= 10, "Spice level must be 0-10");
        require(_accessPrice <= MAX_ACCESS_PRICE, "Access price too high");
        require(_cookingTime > 0, "Cooking time must be positive");

        uint256 currentRecipeId = nextRecipeId;

        // Generate random obfuscation multiplier for price privacy (between 100-1000)
        uint256 obfuscationMultiplier = 100 + (uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            currentRecipeId
        ))) % 900);

        // Create obfuscated encrypted price
        uint64 obfuscatedPrice = uint64((_accessPrice * obfuscationMultiplier) / 100);

        recipes[currentRecipeId] = Recipe({
            name: _name,
            category: _category,
            chef: msg.sender,
            secretIngredient1: FHE.asEuint32(_ingredient1),
            secretIngredient2: FHE.asEuint32(_ingredient2),
            secretIngredient3: FHE.asEuint32(_ingredient3),
            secretSpiceLevel: FHE.asEuint8(_spiceLevel),
            secretCookingTime: FHE.asEuint32(_cookingTime),
            isPublic: _isPublic,
            exists: true,
            createdAt: block.timestamp,
            encryptedAccessPrice: FHE.asEuint64(obfuscatedPrice),
            publicAccessPrice: _accessPrice,
            obfuscationMultiplier: obfuscationMultiplier
        });

        _setupRecipePermissions(currentRecipeId);

        chefRecipes[msg.sender].push(currentRecipeId);
        chefs[msg.sender].recipeCount++;

        emit RecipeCreated(currentRecipeId, msg.sender, _name);
        nextRecipeId++;
    }

    /// @notice Setup FHE permissions for recipe encrypted data
    /// @param _recipeId Recipe ID to setup permissions for
    function _setupRecipePermissions(uint256 _recipeId) private {
        Recipe storage recipe = recipes[_recipeId];

        // Allow contract to access encrypted data
        FHE.allowThis(recipe.secretIngredient1);
        FHE.allowThis(recipe.secretIngredient2);
        FHE.allowThis(recipe.secretIngredient3);
        FHE.allowThis(recipe.secretSpiceLevel);
        FHE.allowThis(recipe.secretCookingTime);
        FHE.allowThis(recipe.encryptedAccessPrice);

        // Allow chef to access their encrypted data
        FHE.allow(recipe.secretIngredient1, recipe.chef);
        FHE.allow(recipe.secretIngredient2, recipe.chef);
        FHE.allow(recipe.secretIngredient3, recipe.chef);
        FHE.allow(recipe.secretSpiceLevel, recipe.chef);
        FHE.allow(recipe.secretCookingTime, recipe.chef);
        FHE.allow(recipe.encryptedAccessPrice, recipe.chef);
    }

    /// @notice Request access to a recipe with payment (Gateway callback pattern - step 1)
    /// @param _recipeId Recipe ID to request access for
    function requestRecipeAccess(uint256 _recipeId)
        external
        payable
        onlyExistingRecipe(_recipeId)
        nonReentrant
    {
        Recipe storage recipe = recipes[_recipeId];
        require(!recipe.isPublic, "Recipe is already public");
        require(!hasAccess[msg.sender][_recipeId], "Already has access");
        require(msg.value >= recipe.publicAccessPrice, "Insufficient payment");
        require(msg.value <= MAX_ACCESS_PRICE, "Payment exceeds maximum");

        uint256 currentRequestId = nextRequestId;

        accessRequests[currentRequestId] = AccessRequest({
            recipeId: _recipeId,
            requester: msg.sender,
            amount: msg.value,
            approved: false,
            processed: false,
            requestTime: block.timestamp,
            refunded: false,
            decryptionRequestId: 0,
            decryptionFailed: false
        });

        emit AccessRequested(currentRequestId, _recipeId, msg.sender);
        nextRequestId++;
    }

    /// @notice Approve access request (Gateway callback pattern - step 2)
    /// @param _requestId Access request ID to approve
    function approveAccess(uint256 _requestId) external nonReentrant {
        AccessRequest storage request = accessRequests[_requestId];
        require(!request.processed, "Request already processed");
        require(recipes[request.recipeId].chef == msg.sender, "Not recipe owner");
        require(!request.refunded, "Request already refunded");

        // Check for timeout
        if (block.timestamp > request.requestTime + REQUEST_TIMEOUT) {
            // Issue refund for timeout
            request.refunded = true;
            request.processed = true;

            (bool refundSuccess, ) = payable(request.requester).call{value: request.amount}("");
            require(refundSuccess, "Refund failed");

            emit TimeoutRefundIssued(_requestId, request.requester, request.amount);
            return;
        }

        request.approved = true;
        request.processed = true;
        hasAccess[request.requester][request.recipeId] = true;

        Recipe storage recipe = recipes[request.recipeId];

        // Grant FHE permissions to requester
        FHE.allow(recipe.secretIngredient1, request.requester);
        FHE.allow(recipe.secretIngredient2, request.requester);
        FHE.allow(recipe.secretIngredient3, request.requester);
        FHE.allow(recipe.secretSpiceLevel, request.requester);
        FHE.allow(recipe.secretCookingTime, request.requester);

        // Transfer payment to chef
        (bool paymentSuccess, ) = payable(msg.sender).call{value: request.amount}("");
        require(paymentSuccess, "Payment transfer failed");

        emit AccessGranted(request.recipeId, request.requester);
    }

    /// @notice Deny access request with automatic refund
    /// @param _requestId Access request ID to deny
    function denyAccess(uint256 _requestId) external nonReentrant {
        AccessRequest storage request = accessRequests[_requestId];
        require(!request.processed, "Request already processed");
        require(recipes[request.recipeId].chef == msg.sender, "Not recipe owner");
        require(!request.refunded, "Request already refunded");

        request.approved = false;
        request.processed = true;
        request.refunded = true;

        // Automatic refund on denial
        (bool success, ) = payable(request.requester).call{value: request.amount}("");
        require(success, "Refund failed");

        emit AccessDenied(_requestId, request.requester);
        emit AccessRefunded(_requestId, request.requester, request.amount);
    }

    /// @notice Claim refund for timed-out requests
    /// @param _requestId Access request ID to claim refund for
    function claimTimeoutRefund(uint256 _requestId) external nonReentrant {
        AccessRequest storage request = accessRequests[_requestId];
        require(request.requester == msg.sender, "Not request owner");
        require(!request.processed, "Request already processed");
        require(!request.refunded, "Already refunded");
        require(block.timestamp > request.requestTime + REQUEST_TIMEOUT, "Request not timed out");

        request.refunded = true;
        request.processed = true;

        (bool success, ) = payable(msg.sender).call{value: request.amount}("");
        require(success, "Refund failed");

        emit TimeoutRefundIssued(_requestId, msg.sender, request.amount);
    }

    /// @notice Request recipe decryption via Gateway (Gateway callback pattern - step 3)
    /// @param _recipeId Recipe ID to reveal
    function revealRecipeSecrets(uint256 _recipeId)
        external
        onlyExistingRecipe(_recipeId)
    {
        Recipe storage recipe = recipes[_recipeId];
        require(
            recipe.isPublic || hasAccess[msg.sender][_recipeId] || recipe.chef == msg.sender,
            "No access to recipe"
        );

        // Prepare ciphertexts for decryption
        bytes32[] memory cts = new bytes32[](5);
        cts[0] = FHE.toBytes32(recipe.secretIngredient1);
        cts[1] = FHE.toBytes32(recipe.secretIngredient2);
        cts[2] = FHE.toBytes32(recipe.secretIngredient3);
        cts[3] = FHE.toBytes32(recipe.secretSpiceLevel);
        cts[4] = FHE.toBytes32(recipe.secretCookingTime);

        // Request decryption from Gateway
        uint256 requestId = FHE.requestDecryption(cts, this.processRecipeReveal.selector);

        // Store context for callback
        requestIdToContext[requestId] = string(abi.encodePacked("recipe_", _recipeId));

        emit RecipeRevealed(_recipeId, msg.sender);
        emit DecryptionRequested(_recipeId, requestId);
    }

    /// @notice Gateway callback for decryption completion (Gateway callback pattern - step 4)
    /// @param requestId Decryption request ID from Gateway
    /// @param cleartexts Decrypted values from Gateway
    /// @param decryptionProof Proof of correct decryption from Gateway
    function processRecipeReveal(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify Gateway signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Decode decrypted values
        (
            uint32 ingredient1,
            uint32 ingredient2,
            uint32 ingredient3,
            uint8 spiceLevel,
            uint32 cookingTime
        ) = abi.decode(cleartexts, (uint32, uint32, uint32, uint8, uint32));

        // Parse context to get recipe ID
        string memory context = requestIdToContext[requestId];

        emit DecryptionCompleted(requestId, requestId);

        // Note: Decrypted values are available here for additional processing
        // In production, these could be stored or used for further operations
    }

    /// @notice Make a private recipe public
    /// @param _recipeId Recipe ID to make public
    function makeRecipePublic(uint256 _recipeId)
        external
        onlyChef(_recipeId)
        onlyExistingRecipe(_recipeId)
    {
        recipes[_recipeId].isPublic = true;
    }

    /// @notice Update recipe access price with overflow protection
    /// @param _recipeId Recipe ID to update
    /// @param _newPrice New access price
    function updateAccessPrice(uint256 _recipeId, uint256 _newPrice)
        external
        onlyChef(_recipeId)
        onlyExistingRecipe(_recipeId)
    {
        require(_newPrice <= MAX_ACCESS_PRICE, "Price exceeds maximum");

        Recipe storage recipe = recipes[_recipeId];
        recipe.publicAccessPrice = _newPrice;

        // Update obfuscated encrypted price
        uint64 obfuscatedPrice = uint64((_newPrice * recipe.obfuscationMultiplier) / 100);
        recipe.encryptedAccessPrice = FHE.asEuint64(obfuscatedPrice);

        FHE.allowThis(recipe.encryptedAccessPrice);
        FHE.allow(recipe.encryptedAccessPrice, recipe.chef);
    }

    /// @notice Get recipe information
    /// @param _recipeId Recipe ID to query
    /// @return name Recipe name
    /// @return category Recipe category
    /// @return chef Chef address
    /// @return isPublic Whether recipe is public
    /// @return accessPrice Access price
    /// @return createdAt Creation timestamp
    function getRecipeInfo(uint256 _recipeId)
        external
        view
        onlyExistingRecipe(_recipeId)
        returns (
            string memory name,
            string memory category,
            address chef,
            bool isPublic,
            uint256 accessPrice,
            uint256 createdAt
        )
    {
        Recipe storage recipe = recipes[_recipeId];
        return (
            recipe.name,
            recipe.category,
            recipe.chef,
            recipe.isPublic,
            recipe.publicAccessPrice,
            recipe.createdAt
        );
    }

    /// @notice Get all recipes by a chef
    /// @param _chef Chef address
    /// @return Array of recipe IDs
    function getChefRecipes(address _chef) external view returns (uint256[] memory) {
        return chefRecipes[_chef];
    }

    /// @notice Check if user has access to a recipe
    /// @param _user User address
    /// @param _recipeId Recipe ID
    /// @return Whether user has access
    function checkRecipeAccess(address _user, uint256 _recipeId)
        external
        view
        returns (bool)
    {
        return hasAccess[_user][_recipeId] ||
               recipes[_recipeId].chef == _user ||
               recipes[_recipeId].isPublic;
    }

    /// @notice Get chef profile
    /// @param _chef Chef address
    /// @return name Chef name
    /// @return specialty Chef specialty
    /// @return recipeCount Number of recipes
    /// @return verified Whether chef is verified
    /// @return reputation Chef reputation score
    function getChefProfile(address _chef)
        external
        view
        returns (
            string memory name,
            string memory specialty,
            uint256 recipeCount,
            bool verified,
            uint256 reputation
        )
    {
        ChefProfile storage profile = chefs[_chef];
        return (
            profile.name,
            profile.specialty,
            profile.recipeCount,
            profile.verified,
            profile.reputation
        );
    }

    /// @notice Compare spice levels of two recipes (privacy-preserving)
    /// @param _recipeId1 First recipe ID
    /// @param _recipeId2 Second recipe ID
    /// @return Encrypted comparison result
    function compareSpiceLevels(uint256 _recipeId1, uint256 _recipeId2)
        external
        returns (bytes32)
    {
        require(
            hasAccess[msg.sender][_recipeId1] || recipes[_recipeId1].chef == msg.sender,
            "No access to first recipe"
        );
        require(
            hasAccess[msg.sender][_recipeId2] || recipes[_recipeId2].chef == msg.sender,
            "No access to second recipe"
        );

        ebool isFirstSpicier = FHE.gt(
            recipes[_recipeId1].secretSpiceLevel,
            recipes[_recipeId2].secretSpiceLevel
        );

        return FHE.toBytes32(isFirstSpicier);
    }

    /// @notice Get total recipe count
    /// @return Total number of recipes
    function getRecipeCount() external view returns (uint256) {
        return nextRecipeId - 1;
    }

    /// @notice Get access request details
    /// @param _requestId Access request ID
    /// @return recipeId Recipe ID
    /// @return requester Requester address
    /// @return amount Payment amount
    /// @return approved Whether approved
    /// @return processed Whether processed
    /// @return requestTime Request timestamp
    /// @return refunded Whether refunded
    function getAccessRequest(uint256 _requestId)
        external
        view
        returns (
            uint256 recipeId,
            address requester,
            uint256 amount,
            bool approved,
            bool processed,
            uint256 requestTime,
            bool refunded
        )
    {
        AccessRequest storage request = accessRequests[_requestId];
        return (
            request.recipeId,
            request.requester,
            request.amount,
            request.approved,
            request.processed,
            request.requestTime,
            request.refunded
        );
    }

    /// @notice Emergency withdraw function (owner only)
    /// @dev Only for stuck funds in extreme cases
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    /// @notice Receive function to accept ETH
    receive() external payable {}
}
