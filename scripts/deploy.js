const hre = require("hardhat");

async function main() {
  const TelegramToken = await hre.ethers.getContractFactory("TelegramToken");
  const token = await TelegramToken.deploy();

  await token.deployed();

  console.log("TelegramToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 