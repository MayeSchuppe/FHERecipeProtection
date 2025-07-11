const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("SecretRecipeProtection - Comprehensive Test Suite", function () {
  // Fixture for deploying the contract
  async function deployContractFixture() {
    const [owner, chef1, chef2, user1, user2, user3] = await ethers.getSigners();

    const SecretRecipeProtection = await ethers.getContractFactory("SecretRecipeProtection");
    const contract = await SecretRecipeProtection.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    return { contract, contractAddress, owner, chef1, chef2, user1, user2, user3 };
  }

  describe("1. Deployment and Initialization", function () {
    it("should deploy successfully with valid address", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should set the correct owner on deployment", async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("should initialize with recipe ID starting at 1", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.nextRecipeId()).to.equal(1);
    });

    it("should initialize with request ID starting at 1", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.nextRequestId()).to.equal(1);
    });

    it("should have zero recipes at deployment", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.getRecipeCount()).to.equal(0);
    });
  });

  describe("2. Chef Registration", function () {
    it("should allow a user to register as a chef", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await expect(contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine"))
        .to.emit(contract, "ChefRegistered")
        .withArgs(chef1.address, "Gordon Ramsay");
    });

    it("should store correct chef profile data", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Jamie Oliver", "Italian Cuisine");

      const profile = await contract.getChefProfile(chef1.address);
      expect(profile[0]).to.equal("Jamie Oliver");
      expect(profile[1]).to.equal("Italian Cuisine");
      expect(profile[2]).to.equal(0); // recipeCount
      expect(profile[3]).to.equal(true); // verified
      expect(profile[4]).to.equal(100); // reputation
    });

    it("should reject registration with empty name", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await expect(
        contract.connect(chef1).registerChef("", "French Cuisine")
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("should reject duplicate chef registration", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await expect(
        contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine")
      ).to.be.revertedWith("Chef already registered");
    });

    it("should allow multiple different chefs to register", async function () {
      const { contract, chef1, chef2 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Chef 1", "Cuisine 1");
      await contract.connect(chef2).registerChef("Chef 2", "Cuisine 2");

      const profile1 = await contract.getChefProfile(chef1.address);
      const profile2 = await contract.getChefProfile(chef2.address);

      expect(profile1[3]).to.equal(true);
      expect(profile2[3]).to.equal(true);
    });

    it("should handle special characters in chef name", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      const specialName = "Chef Émile André-François";
      await contract.connect(chef1).registerChef(specialName, "Molecular Gastronomy");

      const profile = await contract.getChefProfile(chef1.address);
      expect(profile[0]).to.equal(specialName);
    });
  });

  describe("3. Recipe Creation", function () {
    it("should allow a registered chef to create a recipe", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await expect(
        contract.connect(chef1).createSecretRecipe(
          "Beef Wellington",
          "Main Course",
          12345,
          67890,
          11111,
          5,
          180,
          ethers.parseEther("0.01"),
          false
        )
      ).to.emit(contract, "RecipeCreated");
    });

    it("should store recipe information correctly", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      const recipeInfo = await contract.getRecipeInfo(1);
      expect(recipeInfo[0]).to.equal("Beef Wellington");
      expect(recipeInfo[1]).to.equal("Main Course");
      expect(recipeInfo[2]).to.equal(chef1.address);
      expect(recipeInfo[3]).to.equal(false); // isPublic
      expect(recipeInfo[4]).to.equal(ethers.parseEther("0.01"));
    });

    it("should reject recipe creation from unregistered chef", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await expect(
        contract.connect(chef1).createSecretRecipe(
          "Beef Wellington",
          "Main Course",
          12345,
          67890,
          11111,
          5,
          180,
          ethers.parseEther("0.01"),
          false
        )
      ).to.be.revertedWith("Chef not registered");
    });

    it("should reject recipe with empty name", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await expect(
        contract.connect(chef1).createSecretRecipe(
          "",
          "Main Course",
          12345,
          67890,
          11111,
          5,
          180,
          ethers.parseEther("0.01"),
          false
        )
      ).to.be.revertedWith("Recipe name required");
    });

    it("should reject recipe with invalid spice level (> 10)", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await expect(
        contract.connect(chef1).createSecretRecipe(
          "Beef Wellington",
          "Main Course",
          12345,
          67890,
          11111,
          15, // Invalid spice level > 10
          180,
          ethers.parseEther("0.01"),
          false
        )
      ).to.be.revertedWith("Spice level must be 0-10");
    });

    it("should increment chef's recipe count after creation", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await contract.connect(chef1).createSecretRecipe(
        "Recipe 1",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      const profile = await contract.getChefProfile(chef1.address);
      expect(profile[2]).to.equal(1); // recipeCount
    });

    it("should increment global recipe count", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      expect(await contract.getRecipeCount()).to.equal(0);

      await contract.connect(chef1).createSecretRecipe(
        "Recipe 1",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      expect(await contract.getRecipeCount()).to.equal(1);
    });

    it("should allow chef to create multiple recipes", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await contract.connect(chef1).createSecretRecipe(
        "Recipe 1",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await contract.connect(chef1).createSecretRecipe(
        "Recipe 2",
        "Dessert",
        22222,
        33333,
        44444,
        2,
        45,
        ethers.parseEther("0.005"),
        true
      );

      const profile = await contract.getChefProfile(chef1.address);
      expect(profile[2]).to.equal(2); // recipeCount
    });

    it("should handle zero spice level", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await expect(
        contract.connect(chef1).createSecretRecipe(
          "Mild Recipe",
          "Dessert",
          12345,
          67890,
          11111,
          0, // Zero spice level
          30,
          ethers.parseEther("0.01"),
          false
        )
      ).to.not.be.reverted;
    });

    it("should handle maximum spice level (10)", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await expect(
        contract.connect(chef1).createSecretRecipe(
          "Extremely Hot Recipe",
          "Main Course",
          12345,
          67890,
          11111,
          10, // Maximum spice level
          60,
          ethers.parseEther("0.01"),
          false
        )
      ).to.not.be.reverted;
    });

    it("should create public recipe correctly", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Public Recipe",
        "Dessert",
        12345,
        67890,
        11111,
        3,
        30,
        ethers.parseEther("0.01"),
        true // Public
      );

      const recipeInfo = await contract.getRecipeInfo(1);
      expect(recipeInfo[3]).to.equal(true); // isPublic
    });

    it("should handle zero access price", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await expect(
        contract.connect(chef1).createSecretRecipe(
          "Free Recipe",
          "Appetizer",
          12345,
          67890,
          11111,
          3,
          15,
          0, // Zero price
          false
        )
      ).to.not.be.reverted;
    });
  });

  describe("4. Recipe Access Requests", function () {
    it("should allow user to request recipe access with payment", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await expect(
        contract.connect(user1).requestRecipeAccess(1, {
          value: ethers.parseEther("0.01")
        })
      ).to.emit(contract, "AccessRequested");
    });

    it("should reject access request with insufficient payment", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await expect(
        contract.connect(user1).requestRecipeAccess(1, {
          value: ethers.parseEther("0.005") // Insufficient
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("should reject access request for non-existent recipe", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      await expect(
        contract.connect(user1).requestRecipeAccess(999, {
          value: ethers.parseEther("0.01")
        })
      ).to.be.revertedWith("Recipe does not exist");
    });

    it("should reject access request for public recipe", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Public Recipe",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        true // Public
      );

      await expect(
        contract.connect(user1).requestRecipeAccess(1, {
          value: ethers.parseEther("0.01")
        })
      ).to.be.revertedWith("Recipe is already public");
    });

    it("should allow overpayment for access request", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await expect(
        contract.connect(user1).requestRecipeAccess(1, {
          value: ethers.parseEther("0.02") // Overpayment
        })
      ).to.not.be.reverted;
    });
  });

  describe("5. Access Approval and Denial", function () {
    it("should allow chef to approve access request", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });

      await expect(contract.connect(chef1).approveAccess(1))
        .to.emit(contract, "AccessGranted")
        .withArgs(1, user1.address);
    });

    it("should grant access after approval", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });

      await contract.connect(chef1).approveAccess(1);

      const hasAccess = await contract.checkRecipeAccess(user1.address, 1);
      expect(hasAccess).to.equal(true);
    });

    it("should transfer payment to chef on approval", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });

      const balanceBefore = await ethers.provider.getBalance(chef1.address);

      const tx = await contract.connect(chef1).approveAccess(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(chef1.address);

      expect(balanceAfter).to.be.gt(balanceBefore - gasUsed);
    });

    it("should allow chef to deny access request", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });

      await expect(contract.connect(chef1).denyAccess(1))
        .to.emit(contract, "AccessDenied")
        .withArgs(1, user1.address);
    });

    it("should not grant access after denial", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });

      await contract.connect(chef1).denyAccess(1);

      const hasAccess = await contract.checkRecipeAccess(user1.address, 1);
      expect(hasAccess).to.equal(false);
    });

    it("should refund payment to user on denial", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      const balanceBefore = await ethers.provider.getBalance(user1.address);

      const requestTx = await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });
      const requestReceipt = await requestTx.wait();
      const requestGas = requestReceipt.gasUsed * requestReceipt.gasPrice;

      await contract.connect(chef1).denyAccess(1);

      const balanceAfter = await ethers.provider.getBalance(user1.address);

      // Balance should be approximately equal (minus gas costs)
      expect(balanceAfter).to.be.closeTo(balanceBefore - requestGas, ethers.parseEther("0.001"));
    });

    it("should prevent non-owner from approving access", async function () {
      const { contract, chef1, user1, user2 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });

      await expect(
        contract.connect(user2).approveAccess(1)
      ).to.be.revertedWith("Not recipe owner");
    });

    it("should prevent processing same request twice", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });

      await contract.connect(chef1).approveAccess(1);

      await expect(
        contract.connect(chef1).approveAccess(1)
      ).to.be.revertedWith("Request already processed");
    });
  });

  describe("6. Recipe Management", function () {
    it("should allow chef to make recipe public", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await contract.connect(chef1).makeRecipePublic(1);

      const recipeInfo = await contract.getRecipeInfo(1);
      expect(recipeInfo[3]).to.equal(true); // isPublic
    });

    it("should allow chef to update access price", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      const newPrice = ethers.parseEther("0.02");
      await contract.connect(chef1).updateAccessPrice(1, newPrice);

      const recipeInfo = await contract.getRecipeInfo(1);
      expect(recipeInfo[4]).to.equal(newPrice);
    });

    it("should prevent non-chef from making recipe public", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await expect(
        contract.connect(user1).makeRecipePublic(1)
      ).to.be.revertedWith("Not recipe owner");
    });

    it("should prevent non-chef from updating price", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await expect(
        contract.connect(user1).updateAccessPrice(1, ethers.parseEther("0.02"))
      ).to.be.revertedWith("Not recipe owner");
    });
  });

  describe("7. View Functions and Queries", function () {
    it("should return correct recipe count", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      expect(await contract.getRecipeCount()).to.equal(0);

      await contract.connect(chef1).createSecretRecipe(
        "Recipe 1",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      expect(await contract.getRecipeCount()).to.equal(1);

      await contract.connect(chef1).createSecretRecipe(
        "Recipe 2",
        "Dessert",
        22222,
        33333,
        44444,
        2,
        45,
        ethers.parseEther("0.005"),
        true
      );

      expect(await contract.getRecipeCount()).to.equal(2);
    });

    it("should return chef's recipe list", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Recipe 1",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );
      await contract.connect(chef1).createSecretRecipe(
        "Recipe 2",
        "Dessert",
        22222,
        33333,
        44444,
        2,
        45,
        ethers.parseEther("0.005"),
        true
      );

      const recipes = await contract.getChefRecipes(chef1.address);
      expect(recipes.length).to.equal(2);
      expect(recipes[0]).to.equal(1);
      expect(recipes[1]).to.equal(2);
    });

    it("should correctly check recipe access for users", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      // User should not have access initially
      expect(await contract.checkRecipeAccess(user1.address, 1)).to.equal(false);

      // Chef should have access to their own recipe
      expect(await contract.checkRecipeAccess(chef1.address, 1)).to.equal(true);
    });

    it("should grant access for public recipes", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Public Recipe",
        "Dessert",
        12345,
        67890,
        11111,
        2,
        30,
        ethers.parseEther("0.01"),
        true // Public
      );

      expect(await contract.checkRecipeAccess(user1.address, 1)).to.equal(true);
    });
  });

  describe("8. Edge Cases and Boundary Conditions", function () {
    it("should handle recipe query for non-existent ID", async function () {
      const { contract } = await loadFixture(deployContractFixture);

      await expect(
        contract.getRecipeInfo(999)
      ).to.be.revertedWith("Recipe does not exist");
    });

    it("should handle chef profile query for unregistered address", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const profile = await contract.getChefProfile(user1.address);
      expect(profile[3]).to.equal(false); // not verified
    });

    it("should handle empty chef recipes list", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      const recipes = await contract.getChefRecipes(chef1.address);
      expect(recipes.length).to.equal(0);
    });

    it("should handle maximum uint32 ingredient values", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      const maxUint32 = 2**32 - 1;

      await expect(
        contract.connect(chef1).createSecretRecipe(
          "Max Value Recipe",
          "Main Course",
          maxUint32,
          maxUint32,
          maxUint32,
          10,
          maxUint32,
          ethers.parseEther("0.01"),
          false
        )
      ).to.not.be.reverted;
    });

    it("should handle zero cooking time", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await expect(
        contract.connect(chef1).createSecretRecipe(
          "Instant Recipe",
          "Beverage",
          12345,
          67890,
          11111,
          0,
          0, // Zero cooking time
          ethers.parseEther("0.01"),
          false
        )
      ).to.not.be.reverted;
    });
  });

  describe("9. Gas Optimization Tests", function () {
    it("should use reasonable gas for chef registration", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      const tx = await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(200000); // < 200k gas
    });

    it("should use reasonable gas for recipe creation", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      const tx = await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(1000000); // < 1M gas
    });

    it("should use reasonable gas for access approval", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });

      const tx = await contract.connect(chef1).approveAccess(1);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(500000); // < 500k gas
    });
  });

  describe("10. Integration and Workflow Tests", function () {
    it("should handle complete recipe creation and access workflow", async function () {
      const { contract, chef1, user1 } = await loadFixture(deployContractFixture);

      // 1. Chef registers
      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      // 2. Chef creates recipe
      await contract.connect(chef1).createSecretRecipe(
        "Beef Wellington",
        "Main Course",
        12345,
        67890,
        11111,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      // 3. User requests access
      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });

      // 4. Chef approves access
      await contract.connect(chef1).approveAccess(1);

      // 5. Verify user has access
      expect(await contract.checkRecipeAccess(user1.address, 1)).to.equal(true);
    });

    it("should handle multiple chefs and recipes", async function () {
      const { contract, chef1, chef2, user1 } = await loadFixture(deployContractFixture);

      // Chef 1 creates recipe
      await contract.connect(chef1).registerChef("Chef 1", "Cuisine 1");
      await contract.connect(chef1).createSecretRecipe(
        "Recipe 1",
        "Main Course",
        11111,
        22222,
        33333,
        5,
        180,
        ethers.parseEther("0.01"),
        false
      );

      // Chef 2 creates recipe
      await contract.connect(chef2).registerChef("Chef 2", "Cuisine 2");
      await contract.connect(chef2).createSecretRecipe(
        "Recipe 2",
        "Dessert",
        44444,
        55555,
        66666,
        3,
        60,
        ethers.parseEther("0.02"),
        false
      );

      expect(await contract.getRecipeCount()).to.equal(2);

      // User can access both
      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });
      await contract.connect(user1).requestRecipeAccess(2, {
        value: ethers.parseEther("0.02")
      });

      await contract.connect(chef1).approveAccess(1);
      await contract.connect(chef2).approveAccess(2);

      expect(await contract.checkRecipeAccess(user1.address, 1)).to.equal(true);
      expect(await contract.checkRecipeAccess(user1.address, 2)).to.equal(true);
    });
  });
});
