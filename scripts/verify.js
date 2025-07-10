const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting contract verification process...\n");

  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found for network: ${hre.network.name}`);
    console.error(`Expected file: ${deploymentFile}`);
    console.error("\nPlease deploy the contract first:");
    console.error(`  npx hardhat run scripts/deploy.js --network ${hre.network.name}\n`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("Network:", hre.network.name);
  console.log("Contract address:", contractAddress);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log();

  // Verify the contract on Etherscan
  try {
    console.log("Verifying contract on Etherscan...");
    console.log("This may take a few moments...\n");

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });

    console.log("\n✅ Contract verified successfully!");

    if (hre.network.name === "sepolia") {
      console.log(`\n🔍 View verified contract:`);
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
    } else if (hre.network.name === "mainnet") {
      console.log(`\n🔍 View verified contract:`);
      console.log(`https://etherscan.io/address/${contractAddress}#code`);
    }

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");

      if (hre.network.name === "sepolia") {
        console.log(`\n🔍 View verified contract:`);
        console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
      } else if (hre.network.name === "mainnet") {
        console.log(`\n🔍 View verified contract:`);
        console.log(`https://etherscan.io/address/${contractAddress}#code`);
      }
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);

      if (error.message.includes("API Key")) {
        console.error("\n💡 Make sure you have set ETHERSCAN_API_KEY in your .env file");
      }

      process.exit(1);
    }
  }

  console.log("\n✨ Verification completed!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error during verification:");
    console.error(error);
    process.exit(1);
  });
