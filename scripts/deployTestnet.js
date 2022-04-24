const { ethers } = require("hardhat");
const hre = require("hardhat");

//const USDCAddress = '0x5CEB2e44A73B05E241293a85b2e4dE0AF706a8aC';

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    // deploy USDC
    USDC = await ethers.getContractFactory("MockUSDC");
    usdc = await USDC.deploy();
    console.log("USDC deployed to", usdc.address);
    await usdc.mint(deployer.address, "1000000000000");
    // deploy treasury
    Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();
    console.log("Treasury deployed to", treasury.address);
    // deploy token
    //Token = await ethers.getContractFactory("Token");
    //token = await Token.deploy();
    //console.log("Token deployed to", token.address);
    // deploy verifier
    Verifier = await ethers.getContractFactory("Verifier");
    verifier = await Verifier.deploy();
    // deploy presale
    Presale = await ethers.getContractFactory("Presale");
    presale = await Presale.deploy();
    console.log("Presale NFT deployed to", presale.address);
    await presale.setPaymentToken(usdc.address);
    await presale.setTreasury(treasury.address);
    await presale.setVerifier(verifier.address);
    //await presale.setFurioToken(token.address);
    //await token.unpause();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
