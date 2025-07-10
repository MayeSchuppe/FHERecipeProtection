const hre = require("hardhat");

async function main() {
  console.log("Starting full simulation of SecretRecipeProtection workflow...\n");
  console.log("═".repeat(70));
  console.log("SECURE RECIPE PROTECTION PLATFORM SIMULATION");
  console.log("═".repeat(70));

  // Get signers
  const [owner, chef1, chef2, user1, user2] = await hre.ethers.getSigners();

  console.log("\n👥 PARTICIPANTS:");
  console.log("  Owner:", owner.address);
  console.log("  Chef 1:", chef1.address);
  console.log("  Chef 2:", chef2.address);
  console.log("  User 1:", user1.address);
  console.log("  User 2:", user2.address);

  // Deploy contract
  console.log("\n" + "─".repeat(70));
  console.log("📦 STEP 1: DEPLOYING CONTRACT");
  console.log("─".repeat(70));

  const SecretRecipeProtection = await hre.ethers.getContractFactory("SecretRecipeProtection");
  const contract = await SecretRecipeProtection.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ Contract deployed at:", contractAddress);

  // Register chefs
  console.log("\n" + "─".repeat(70));
  console.log("👨‍🍳 STEP 2: REGISTERING CHEFS");
  console.log("─".repeat(70));

  console.log("\nRegistering Chef 1...");
  const registerTx1 = await contract.connect(chef1).registerChef(
    "Gordon Ramsay",
    "French & British Cuisine"
  );
  await registerTx1.wait();
  console.log("✅ Chef 1 registered: Gordon Ramsay");

  console.log("\nRegistering Chef 2...");
  const registerTx2 = await contract.connect(chef2).registerChef(
    "Jamie Oliver",
    "Italian & Mediterranean Cuisine"
  );
  await registerTx2.wait();
  console.log("✅ Chef 2 registered: Jamie Oliver");

  // Display chef profiles
  const profile1 = await contract.getChefProfile(chef1.address);
  const profile2 = await contract.getChefProfile(chef2.address);

  console.log("\n📋 Chef Profiles:");
  console.log(`  ${profile1[0]} - ${profile1[1]}`);
  console.log(`    Recipes: ${profile1[2]}, Reputation: ${profile1[4]}`);
  console.log(`  ${profile2[0]} - ${profile2[1]}`);
  console.log(`    Recipes: ${profile2[2]}, Reputation: ${profile2[4]}`);

  // Create recipes
  console.log("\n" + "─".repeat(70));
  console.log("📝 STEP 3: CREATING SECRET RECIPES");
  console.log("─".repeat(70));

  console.log("\nChef 1 creating recipe: Beef Wellington...");
  const createTx1 = await contract.connect(chef1).createSecretRecipe(
    "Beef Wellington",
    "Main Course",
    12345, // Secret ingredient 1
    67890, // Secret ingredient 2
    11111, // Secret ingredient 3
    5,     // Spice level
    180,   // Cooking time (minutes)
    hre.ethers.parseEther("0.01"), // Access price
    false  // Private recipe
  );
  await createTx1.wait();
  console.log("✅ Recipe #1 created: Beef Wellington");

  console.log("\nChef 1 creating recipe: Chocolate Soufflé...");
  const createTx2 = await contract.connect(chef1).createSecretRecipe(
    "Chocolate Soufflé",
    "Dessert",
    22222,
    33333,
    44444,
    2,
    45,
    hre.ethers.parseEther("0.005"),
    true   // Public recipe
  );
  await createTx2.wait();
  console.log("✅ Recipe #2 created: Chocolate Soufflé (Public)");

  console.log("\nChef 2 creating recipe: Pasta Carbonara...");
  const createTx3 = await contract.connect(chef2).createSecretRecipe(
    "Pasta Carbonara",
    "Main Course",
    55555,
    66666,
    77777,
    3,
    30,
    hre.ethers.parseEther("0.008"),
    false
  );
  await createTx3.wait();
  console.log("✅ Recipe #3 created: Pasta Carbonara");

  // Display recipe information
  console.log("\n📖 Recipe Catalog:");
  const recipeCount = await contract.getRecipeCount();
  for (let i = 1; i <= recipeCount; i++) {
    const info = await contract.getRecipeInfo(i);
    console.log(`\n  Recipe #${i}: ${info[0]}`);
    console.log(`    Category: ${info[1]}`);
    console.log(`    Chef: ${info[2]}`);
    console.log(`    Status: ${info[3] ? "Public" : "Private"}`);
    console.log(`    Access Price: ${hre.ethers.formatEther(info[4])} ETH`);
  }

  // Request access
  console.log("\n" + "─".repeat(70));
  console.log("🔐 STEP 4: REQUESTING RECIPE ACCESS");
  console.log("─".repeat(70));

  console.log("\nUser 1 requesting access to Recipe #1 (Beef Wellington)...");
  const requestTx1 = await contract.connect(user1).requestRecipeAccess(1, {
    value: hre.ethers.parseEther("0.01")
  });
  const receipt1 = await requestTx1.wait();
  console.log("✅ Access requested");
  console.log("   Request ID: 1");
  console.log("   Transaction:", receipt1.hash);

  console.log("\nUser 2 requesting access to Recipe #3 (Pasta Carbonara)...");
  const requestTx2 = await contract.connect(user2).requestRecipeAccess(3, {
    value: hre.ethers.parseEther("0.008")
  });
  const receipt2 = await requestTx2.wait();
  console.log("✅ Access requested");
  console.log("   Request ID: 2");
  console.log("   Transaction:", receipt2.hash);

  // Approve access
  console.log("\n" + "─".repeat(70));
  console.log("✅ STEP 5: APPROVING ACCESS REQUESTS");
  console.log("─".repeat(70));

  console.log("\nChef 1 approving User 1's request for Recipe #1...");
  const approveTx1 = await contract.connect(chef1).approveAccess(1);
  await approveTx1.wait();
  console.log("✅ Access approved for User 1");
  console.log("   Payment transferred to Chef 1");

  console.log("\nChef 2 approving User 2's request for Recipe #3...");
  const approveTx2 = await contract.connect(chef2).approveAccess(2);
  await approveTx2.wait();
  console.log("✅ Access approved for User 2");
  console.log("   Payment transferred to Chef 2");

  // Check access
  console.log("\n" + "─".repeat(70));
  console.log("🔍 STEP 6: VERIFYING ACCESS PERMISSIONS");
  console.log("─".repeat(70));

  const user1HasAccess1 = await contract.checkRecipeAccess(user1.address, 1);
  const user1HasAccess2 = await contract.checkRecipeAccess(user1.address, 2);
  const user1HasAccess3 = await contract.checkRecipeAccess(user1.address, 3);

  console.log("\nUser 1 Access Status:");
  console.log(`  Recipe #1 (Beef Wellington): ${user1HasAccess1 ? "✅ Granted" : "❌ Denied"}`);
  console.log(`  Recipe #2 (Chocolate Soufflé): ${user1HasAccess2 ? "✅ Public" : "❌ Denied"}`);
  console.log(`  Recipe #3 (Pasta Carbonara): ${user1HasAccess3 ? "✅ Granted" : "❌ Denied"}`);

  const user2HasAccess1 = await contract.checkRecipeAccess(user2.address, 1);
  const user2HasAccess2 = await contract.checkRecipeAccess(user2.address, 2);
  const user2HasAccess3 = await contract.checkRecipeAccess(user2.address, 3);

  console.log("\nUser 2 Access Status:");
  console.log(`  Recipe #1 (Beef Wellington): ${user2HasAccess1 ? "✅ Granted" : "❌ Denied"}`);
  console.log(`  Recipe #2 (Chocolate Soufflé): ${user2HasAccess2 ? "✅ Public" : "❌ Denied"}`);
  console.log(`  Recipe #3 (Pasta Carbonara): ${user2HasAccess3 ? "✅ Granted" : "❌ Denied"}`);

  // Make recipe public
  console.log("\n" + "─".repeat(70));
  console.log("🌐 STEP 7: MAKING RECIPE PUBLIC");
  console.log("─".repeat(70));

  console.log("\nChef 1 making Recipe #1 (Beef Wellington) public...");
  const publicTx = await contract.connect(chef1).makeRecipePublic(1);
  await publicTx.wait();
  console.log("✅ Recipe #1 is now public");

  const recipe1Info = await contract.getRecipeInfo(1);
  console.log(`   Status: ${recipe1Info[3] ? "Public" : "Private"}`);

  // Update access price
  console.log("\n" + "─".repeat(70));
  console.log("💰 STEP 8: UPDATING ACCESS PRICE");
  console.log("─".repeat(70));

  console.log("\nChef 2 updating Recipe #3 price...");
  const newPrice = hre.ethers.parseEther("0.012");
  const updateTx = await contract.connect(chef2).updateAccessPrice(3, newPrice);
  await updateTx.wait();
  console.log("✅ Price updated");
  console.log(`   New price: ${hre.ethers.formatEther(newPrice)} ETH`);

  const recipe3Info = await contract.getRecipeInfo(3);
  console.log(`   Confirmed: ${hre.ethers.formatEther(recipe3Info[4])} ETH`);

  // Final statistics
  console.log("\n" + "═".repeat(70));
  console.log("📊 FINAL STATISTICS");
  console.log("═".repeat(70));

  const finalRecipeCount = await contract.getRecipeCount();
  console.log(`\n  Total Recipes: ${finalRecipeCount}`);

  const chef1Recipes = await contract.getChefRecipes(chef1.address);
  const chef2Recipes = await contract.getChefRecipes(chef2.address);
  console.log(`  Chef 1 Recipes: ${chef1Recipes.length}`);
  console.log(`  Chef 2 Recipes: ${chef2Recipes.length}`);

  const finalProfile1 = await contract.getChefProfile(chef1.address);
  const finalProfile2 = await contract.getChefProfile(chef2.address);
  console.log(`\n  ${finalProfile1[0]}`);
  console.log(`    Total Recipes: ${finalProfile1[2]}`);
  console.log(`    Reputation: ${finalProfile1[4]}`);
  console.log(`  ${finalProfile2[0]}`);
  console.log(`    Total Recipes: ${finalProfile2[2]}`);
  console.log(`    Reputation: ${finalProfile2[4]}`);

  console.log("\n" + "═".repeat(70));
  console.log("✨ SIMULATION COMPLETED SUCCESSFULLY");
  console.log("═".repeat(70));

  console.log("\n💡 Summary:");
  console.log("  ✅ Contract deployed and initialized");
  console.log("  ✅ 2 chefs registered");
  console.log("  ✅ 3 recipes created (2 private, 1 public)");
  console.log("  ✅ 2 access requests made and approved");
  console.log("  ✅ 1 recipe made public");
  console.log("  ✅ 1 recipe price updated");
  console.log("\n🔐 All encrypted data protected with FHE technology\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });
