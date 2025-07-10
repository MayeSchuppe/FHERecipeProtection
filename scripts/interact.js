const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting interaction with SecretRecipeProtection contract...\n");

  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found for network: ${hre.network.name}`);
    console.error(`Please deploy the contract first or specify the correct network.\n`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("Network:", hre.network.name);
  console.log("Contract address:", contractAddress);
  console.log();

  // Get signers
  const [owner, chef1] = await hre.ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Chef1 address:", chef1.address);
  console.log();

  // Get contract instance
  const SecretRecipeProtection = await hre.ethers.getContractFactory("SecretRecipeProtection");
  const contract = SecretRecipeProtection.attach(contractAddress);

  // Example interactions
  console.log("═".repeat(60));
  console.log("EXAMPLE INTERACTIONS");
  console.log("═".repeat(60));

  // 1. Get contract owner
  console.log("\n1️⃣  Getting contract owner...");
  const contractOwner = await contract.owner();
  console.log("Contract owner:", contractOwner);

  // 2. Register as chef
  console.log("\n2️⃣  Registering as chef...");
  try {
    const registerTx = await contract.connect(chef1).registerChef("Gordon Ramsay", "French Cuisine");
    await registerTx.wait();
    console.log("✅ Chef registered successfully!");
    console.log("Transaction hash:", registerTx.hash);
  } catch (error) {
    if (error.message.includes("Chef already registered")) {
      console.log("ℹ️  Chef already registered");
    } else {
      console.error("❌ Error:", error.message);
    }
  }

  // 3. Get chef profile
  console.log("\n3️⃣  Getting chef profile...");
  try {
    const profile = await contract.getChefProfile(chef1.address);
    console.log("Chef name:", profile[0]);
    console.log("Specialty:", profile[1]);
    console.log("Recipe count:", profile[2].toString());
    console.log("Verified:", profile[3]);
    console.log("Reputation:", profile[4].toString());
  } catch (error) {
    console.error("❌ Error getting chef profile:", error.message);
  }

  // 4. Get total recipe count
  console.log("\n4️⃣  Getting total recipe count...");
  const recipeCount = await contract.getRecipeCount();
  console.log("Total recipes:", recipeCount.toString());

  // 5. Get chef's recipes
  console.log("\n5️⃣  Getting chef's recipes...");
  const chefRecipes = await contract.getChefRecipes(chef1.address);
  console.log("Chef's recipe IDs:", chefRecipes.map(id => id.toString()).join(", "));

  // 6. If there are recipes, display info
  if (recipeCount > 0n) {
    console.log("\n6️⃣  Getting recipe information...");
    try {
      const recipeInfo = await contract.getRecipeInfo(1);
      console.log("\nRecipe #1 Information:");
      console.log("  Name:", recipeInfo[0]);
      console.log("  Category:", recipeInfo[1]);
      console.log("  Chef:", recipeInfo[2]);
      console.log("  Is Public:", recipeInfo[3]);
      console.log("  Access Price:", hre.ethers.formatEther(recipeInfo[4]), "ETH");
      console.log("  Created At:", new Date(Number(recipeInfo[5]) * 1000).toLocaleString());
    } catch (error) {
      console.error("❌ Error getting recipe info:", error.message);
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log("INTERACTION EXAMPLES COMPLETED");
  console.log("═".repeat(60));

  console.log("\n📝 Available Functions:");
  console.log("  - registerChef(name, specialty)");
  console.log("  - createSecretRecipe(name, category, ing1, ing2, ing3, spice, time, price, isPublic)");
  console.log("  - requestRecipeAccess(recipeId) [payable]");
  console.log("  - approveAccess(requestId)");
  console.log("  - denyAccess(requestId)");
  console.log("  - revealRecipeSecrets(recipeId)");
  console.log("  - makeRecipePublic(recipeId)");
  console.log("  - updateAccessPrice(recipeId, newPrice)");
  console.log("  - getRecipeInfo(recipeId)");
  console.log("  - getChefProfile(address)");
  console.log("  - checkRecipeAccess(user, recipeId)");
  console.log("  - getRecipeCount()");
  console.log("  - getChefRecipes(chef)");

  console.log("\n✨ Interaction completed!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error during interaction:");
    console.error(error);
    process.exit(1);
  });
