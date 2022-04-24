const { ethers } = require("hardhat");
const hre = require("hardhat");


async function main() {
    const [deployer] = await hre.ethers.getSigners();
    // deploy Treasury
    Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();
    console.log("Treasury deployed to", treasury.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
