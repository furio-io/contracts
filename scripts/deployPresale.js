const { ethers } = require("hardhat");
const hre = require("hardhat");


async function main() {
    const [deployer] = await hre.ethers.getSigners();
    // deploy Presale
    Presale = await ethers.getContractFactory("Presale");
    presale = await Presale.deploy();
    console.log("Presale deployed to", presale.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
