// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title RecipeVault
 * @notice Confidential recipe protection system using Fully Homomorphic Encryption
 * @dev Example dApp showcasing FHEVM SDK integration for encrypted data management
 */
contract RecipeVault is SepoliaConfig {

    address public owner;
    uint256 public nextRecipeId;

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
        uint256 accessPrice;
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
    }

    mapping(uint256 => Recipe) public recipes;
    mapping(address => ChefProfile) public chefs;
    mapping(uint256 => AccessRequest) public accessRequests;
    mapping(address => mapping(uint256 => bool)) public hasAccess;
    mapping(address => uint256[]) public chefRecipes;

    uint256 public nextRequestId;

    event RecipeCreated(uint256 indexed recipeId, address indexed chef, string name);
    event AccessRequested(uint256 indexed requestId, uint256 indexed recipeId, address indexed requester);
    event AccessGranted(uint256 indexed recipeId, address indexed requester);
    event AccessDenied(uint256 indexed requestId, address indexed requester);
    event ChefRegistered(address indexed chef, string name);
    event RecipeRevealed(uint256 indexed recipeId, address indexed viewer);

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

    constructor() {
        owner = msg.sender;
        nextRecipeId = 1;
        nextRequestId = 1;
    }

    function registerChef(string memory _name, string memory _specialty) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
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
    ) external {
        require(chefs[msg.sender].verified, "Chef not registered");
        require(bytes(_name).length > 0, "Recipe name required");
        require(_spiceLevel <= 10, "Spice level must be 0-10");

        uint256 currentRecipeId = nextRecipeId;

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
            accessPrice: _accessPrice
        });

        _setupRecipePermissions(currentRecipeId);

        chefRecipes[msg.sender].push(currentRecipeId);
        chefs[msg.sender].recipeCount++;

        emit RecipeCreated(currentRecipeId, msg.sender, _name);
        nextRecipeId++;
    }

    function _setupRecipePermissions(uint256 _recipeId) private {
        Recipe storage recipe = recipes[_recipeId];

        FHE.allowThis(recipe.secretIngredient1);
        FHE.allowThis(recipe.secretIngredient2);
        FHE.allowThis(recipe.secretIngredient3);
        FHE.allowThis(recipe.secretSpiceLevel);
        FHE.allowThis(recipe.secretCookingTime);

        FHE.allow(recipe.secretIngredient1, recipe.chef);
        FHE.allow(recipe.secretIngredient2, recipe.chef);
        FHE.allow(recipe.secretIngredient3, recipe.chef);
        FHE.allow(recipe.secretSpiceLevel, recipe.chef);
        FHE.allow(recipe.secretCookingTime, recipe.chef);
    }

    function requestRecipeAccess(uint256 _recipeId) external payable onlyExistingRecipe(_recipeId) {
        Recipe storage recipe = recipes[_recipeId];
        require(!recipe.isPublic, "Recipe is already public");
        require(!hasAccess[msg.sender][_recipeId], "Already has access");
        require(msg.value >= recipe.accessPrice, "Insufficient payment");

        accessRequests[nextRequestId] = AccessRequest({
            recipeId: _recipeId,
            requester: msg.sender,
            amount: msg.value,
            approved: false,
            processed: false,
            requestTime: block.timestamp
        });

        emit AccessRequested(nextRequestId, _recipeId, msg.sender);
        nextRequestId++;
    }

    function approveAccess(uint256 _requestId) external {
        AccessRequest storage request = accessRequests[_requestId];
        require(!request.processed, "Request already processed");
        require(recipes[request.recipeId].chef == msg.sender, "Not recipe owner");

        request.approved = true;
        request.processed = true;
        hasAccess[request.requester][request.recipeId] = true;

        Recipe storage recipe = recipes[request.recipeId];
        FHE.allow(recipe.secretIngredient1, request.requester);
        FHE.allow(recipe.secretIngredient2, request.requester);
        FHE.allow(recipe.secretIngredient3, request.requester);
        FHE.allow(recipe.secretSpiceLevel, request.requester);
        FHE.allow(recipe.secretCookingTime, request.requester);

        payable(msg.sender).transfer(request.amount);

        emit AccessGranted(request.recipeId, request.requester);
    }

    function denyAccess(uint256 _requestId) external {
        AccessRequest storage request = accessRequests[_requestId];
        require(!request.processed, "Request already processed");
        require(recipes[request.recipeId].chef == msg.sender, "Not recipe owner");

        request.approved = false;
        request.processed = true;

        payable(request.requester).transfer(request.amount);

        emit AccessDenied(_requestId, request.requester);
    }

    function getRecipeInfo(uint256 _recipeId) external view onlyExistingRecipe(_recipeId) returns (
        string memory name,
        string memory category,
        address chef,
        bool isPublic,
        uint256 accessPrice,
        uint256 createdAt
    ) {
        Recipe storage recipe = recipes[_recipeId];
        return (
            recipe.name,
            recipe.category,
            recipe.chef,
            recipe.isPublic,
            recipe.accessPrice,
            recipe.createdAt
        );
    }

    function getChefRecipes(address _chef) external view returns (uint256[] memory) {
        return chefRecipes[_chef];
    }

    function checkRecipeAccess(address _user, uint256 _recipeId) external view returns (bool) {
        return hasAccess[_user][_recipeId] || recipes[_recipeId].chef == _user || recipes[_recipeId].isPublic;
    }

    function getChefProfile(address _chef) external view returns (
        string memory name,
        string memory specialty,
        uint256 recipeCount,
        bool verified,
        uint256 reputation
    ) {
        ChefProfile storage profile = chefs[_chef];
        return (
            profile.name,
            profile.specialty,
            profile.recipeCount,
            profile.verified,
            profile.reputation
        );
    }

    function getRecipeCount() external view returns (uint256) {
        return nextRecipeId - 1;
    }
}
