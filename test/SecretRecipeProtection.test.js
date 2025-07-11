const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("SecretRecipeProtection", function () {
  // Fixture for deploying the contract
  async function deployContractFixture() {
    const [owner, chef1, chef2, user1, user2] = await ethers.getSigners();

    const SecretRecipeProtection = await ethers.getContractFactory("SecretRecipeProtection");
    const contract = await SecretRecipeProtection.deploy();

    return { contract, owner, chef1, chef2, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize with recipe ID starting at 1", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.nextRecipeId()).to.equal(1);
    });

    it("Should initialize with request ID starting at 1", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.nextRequestId()).to.equal(1);
    });
  });

  describe("Chef Registration", function () {
    it("Should allow a user to register as a chef", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await expect(contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine"))
        .to.emit(contract, "ChefRegistered")
        .withArgs(chef1.address, "Gordon Ramsay");

      const profile = await contract.getChefProfile(chef1.address);
      expect(profile[0]).to.equal("Gordon Ramsay");
      expect(profile[1]).to.equal("French Cuisine");
      expect(profile[2]).to.equal(0); // recipeCount
      expect(profile[3]).to.equal(true); // verified
      expect(profile[4]).to.equal(100); // reputation
    });

    it("Should reject registration with empty name", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await expect(
        contract.connect(chef1).registerChef("", "French Cuisine")
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should reject duplicate chef registration", async function () {
      const { contract, chef1 } = await loadFixture(deployContractFixture);

      await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");

      await expect(
        contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine")
      ).to.be.revertedWith("Chef already registered");
    });
  });

  describe("Recipe Creation", function () {
    it("Should allow a registered chef to create a recipe", async function () {
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

      const recipeInfo = await contract.getRecipeInfo(1);
      expect(recipeInfo[0]).to.equal("Beef Wellington");
      expect(recipeInfo[1]).to.equal("Main Course");
      expect(recipeInfo[2]).to.equal(chef1.address);
      expect(recipeInfo[3]).to.equal(false); // isPublic
      expect(recipeInfo[4]).to.equal(ethers.parseEther("0.01"));
    });

    it("Should reject recipe creation from unregistered chef", async function () {
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

    it("Should reject recipe with empty name", async function () {
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

    it("Should reject recipe with invalid spice level", async function () {
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

    it("Should increment chef's recipe count", async function () {
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

      const updatedProfile = await contract.getChefProfile(chef1.address);
      expect(updatedProfile[2]).to.equal(2); // recipeCount
    });
  });

  describe("Recipe Access Management", function () {
    it("Should allow user to request recipe access", async function () {
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

    it("Should reject access request with insufficient payment", async function () {
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

    it("Should reject access request for public recipe", async function () {
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
        true // Public
      );

      await expect(
        contract.connect(user1).requestRecipeAccess(1, {
          value: ethers.parseEther("0.01")
        })
      ).to.be.revertedWith("Recipe is already public");
    });

    it("Should allow chef to approve access request", async function () {
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

      const hasAccess = await contract.checkRecipeAccess(user1.address, 1);
      expect(hasAccess).to.equal(true);
    });

    it("Should allow chef to deny access request", async function () {
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

      const hasAccess = await contract.checkRecipeAccess(user1.address, 1);
      expect(hasAccess).to.equal(false);
    });

    it("Should prevent non-owner from approving access", async function () {
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
  });

  describe("Recipe Management", function () {
    it("Should allow chef to make recipe public", async function () {
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

    it("Should allow chef to update access price", async function () {
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

    it("Should prevent non-chef from making recipe public", async function () {
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
  });

  describe("View Functions", function () {
    it("Should return correct recipe count", async function () {
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

    it("Should return chef's recipes", async function () {
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

    it("Should check recipe access correctly", async function () {
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

      // Grant access to user
      await contract.connect(user1).requestRecipeAccess(1, {
        value: ethers.parseEther("0.01")
      });
      await contract.connect(chef1).approveAccess(1);

      // User should now have access
      expect(await contract.checkRecipeAccess(user1.address, 1)).to.equal(true);
    });
  });
});
