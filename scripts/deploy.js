const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment process...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Get the contract factory
  console.log("Compiling contracts...");
  const SecretRecipeProtection = await hre.ethers.getContractFactory("SecretRecipeProtection");

  // Deploy the contract
  console.log("Deploying SecretRecipeProtection contract...");
  const contract = await SecretRecipeProtection.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ SecretRecipeProtection deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Block number:", await hre.ethers.provider.getBlockNumber());

  // Get deployment transaction
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    console.log("Transaction hash:", deployTx.hash);
    console.log("Gas used:", deployTx.gasLimit.toString());
  }

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    transactionHash: deployTx?.hash || "N/A",
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📝 Deployment info saved to:", deploymentFile);

  // Wait for block confirmations on public networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for 5 block confirmations...");
    await contract.deploymentTransaction().wait(5);
    console.log("✅ Confirmed!");

    // Display Etherscan link
    if (hre.network.name === "sepolia") {
      console.log("\n🔍 View on Etherscan:");
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
    } else if (hre.network.name === "mainnet") {
      console.log("\n🔍 View on Etherscan:");
      console.log(`https://etherscan.io/address/${contractAddress}`);
    }

    console.log("\n📋 Next steps:");
    console.log("1. Verify the contract:");
    console.log(`   npx hardhat run scripts/verify.js --network ${hre.network.name}`);
    console.log("2. Interact with the contract:");
    console.log(`   npx hardhat run scripts/interact.js --network ${hre.network.name}`);
  }

  console.log("\n✨ Deployment completed successfully!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
