const hre = require("hardhat");

async function main() {
  const CampusVoting = await hre.ethers.getContractFactory("CampusVoting");

  const contract = await CampusVoting.deploy();

  await contract.waitForDeployment();

  console.log("CampusVoting deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
