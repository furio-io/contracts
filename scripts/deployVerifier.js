const { ethers } = require("hardhat");
const hre = require("hardhat");


async function main() {
    const [deployer] = await hre.ethers.getSigners();
    // deploy Verifier
    Verifier = await ethers.getContractFactory("Verifier");
    verifier = await Verifier.deploy();
    console.log("Verifier deployed to", verifier.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
