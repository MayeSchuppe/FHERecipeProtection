const hre = require("hardhat");

async function main() {
  console.log("Deploying RecipeVault contract...");

  const RecipeVault = await hre.ethers.getContractFactory("RecipeVault");
  const recipeVault = await RecipeVault.deploy();

  await recipeVault.waitForDeployment();

  const address = await recipeVault.getAddress();
  console.log("RecipeVault deployed to:", address);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
