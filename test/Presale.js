const { expect } = require("chai");
const { ethers } = require("hardhat");
const EthCrypto = require("eth-crypto");

// PRIVATE KEYS FOR CREATING SIGNATURES
const ownerPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const addr1PrivateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

describe("Presale", function () {
    // RUN THIS BEFORE EACH TEST
    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        Presale = await ethers.getContractFactory("Presale");
        presale = await Presale.deploy();
        Token = await ethers.getContractFactory("Token");
        token = await Token.deploy();
        Treasury = await ethers.getContractFactory("Treasury");
        treasury = await Treasury.deploy();
        Usdc = await ethers.getContractFactory("MockUSDC");
        usdc = await Usdc.deploy();
        Verifier = await ethers.getContractFactory("Verifier");
        verifier = await Verifier.deploy();
        await presale.setFurToken(token.address);
        await presale.setTreasury(treasury.address);
        await presale.setPaymentToken(usdc.address);
        await presale.setVerifier(verifier.address);
        await token.setPresaleNft(presale.address);
    });
    it("Deployment has correct info", async function () {
        expect(await presale.furToken()).to.equal(token.address);
        expect(await presale.name()).to.equal('Furio Presale NFT');
        expect(await presale.owner()).to.equal(owner.address);
        expect(await presale.paymentToken()).to.equal(usdc.address);
        expect(await presale.symbol()).to.equal('$FURPRESALE');
        expect(await presale.totalSupply()).to.equal(0);
        expect(await presale.treasury()).to.equal(treasury.address);
    });
    it("Can purchase a presale NFT", async function () {
        await expect(usdc.mint(addr1.address, "250000000")).to.not.be.reverted;
        const expiration = await getBlockTimestamp() + 600;
        const salt = getSalt("1", "250", "500");
        const signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        await expect(usdc.connect(addr1).approve(presale.address, "250000000")).to.not.be.reverted;
        await expect(presale.connect(addr1).buy(signature, "1", "1", "250", "500", expiration)).to.not.be.reverted;
        expect(await presale.balanceOf(addr1.address)).to.equal(1);
        expect(await presale.tokenValue(1)).to.equal(500);
        expect(await presale.value(addr1.address)).to.equal(500);
        expect(await usdc.balanceOf(treasury.address)).to.equal("250000000");
    });
    it("Cannot purchase more than the max per signature", async function () {
        await expect(usdc.mint(addr1.address, "500000000")).to.not.be.reverted;
        const expiration = await getBlockTimestamp() + 600;
        const salt = getSalt("1", "250", "500");
        const signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        await expect(usdc.connect(addr1).approve(presale.address, "500000000")).to.not.be.reverted;
        await expect(presale.connect(addr1).buy(signature, "1", "1", "250", "500", expiration)).to.not.be.reverted;
        await expect(presale.connect(addr1).buy(signature, "1", "1", "250", "500", expiration)).to.be.revertedWith("Quantity is too high");
    });
    it("Can purchase multiple times with the same signature", async function () {
        await expect(usdc.mint(addr1.address, "1650000000")).to.not.be.reverted;
        const expiration = await getBlockTimestamp() + 600;
        const salt = getSalt("10", "150", "100");
        const signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        await expect(usdc.connect(addr1).approve(presale.address, "1650000000")).to.not.be.reverted;
        await expect(presale.connect(addr1).buy(signature, "1", "10", "150", "100", expiration)).to.not.be.reverted;
        expect(await presale.balanceOf(addr1.address)).to.equal(1);
        expect(await presale.tokenValue(1)).to.equal(100);
        expect(await presale.value(addr1.address)).to.equal(100);
        expect(await usdc.balanceOf(treasury.address)).to.equal("150000000");
        await expect(presale.connect(addr1).buy(signature, "1", "10", "150", "100", expiration)).to.not.be.reverted;
        expect(await presale.balanceOf(addr1.address)).to.equal(2);
        expect(await presale.tokenValue(2)).to.equal(100);
        expect(await presale.value(addr1.address)).to.equal(200);
        expect(await usdc.balanceOf(treasury.address)).to.equal("300000000");
        await expect(presale.connect(addr1).buy(signature, "8", "10", "150", "100", expiration)).to.not.be.reverted;
        expect(await presale.balanceOf(addr1.address)).to.equal(10);
        expect(await presale.value(addr1.address)).to.equal(1000);
        expect(await usdc.balanceOf(treasury.address)).to.equal("1500000000");
        await expect(presale.connect(addr1).buy(signature, "1", "10", "150", "100", expiration)).to.be.revertedWith("Quantity is too high");
    });
    it("Can purchase multiple times with different signatures", async function () {
        await expect(usdc.mint(addr1.address, "3500000000")).to.not.be.reverted;
        const expiration = await getBlockTimestamp() + 600;
        var salt = getSalt("1", "250", "500");
        var signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        await expect(usdc.connect(addr1).approve(presale.address, "250000000")).to.not.be.reverted;
        await expect(presale.connect(addr1).buy(signature, "1", "1", "250", "500", expiration)).to.not.be.reverted;
        var salt = getSalt("10", "150", "100");
        var signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        await expect(usdc.connect(addr1).approve(presale.address, "1500000000")).to.not.be.reverted;
        await expect(presale.connect(addr1).buy(signature, "10", "10", "150", "100", expiration)).to.not.be.reverted;
        var salt = getSalt("10", "175", "100");
        var signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        await expect(usdc.connect(addr1).approve(presale.address, "1750000000")).to.not.be.reverted;
        await expect(presale.connect(addr1).buy(signature, "10", "10", "175", "100", expiration)).to.not.be.reverted;
        expect(await presale.balanceOf(addr1.address)).to.equal(21);
        expect(await presale.value(addr1.address)).to.equal(2500);
        expect(await usdc.balanceOf(treasury.address)).to.equal("3500000000");
    });
    it("Can purchase a presale NFT for free", async function () {
        const expiration = await getBlockTimestamp() + 600;
        const salt = getSalt("1", "0", "500");
        const signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        await expect(presale.connect(addr1).buy(signature, "1", "1", "0", "500", expiration)).to.not.be.reverted;
        expect(await presale.balanceOf(addr1.address)).to.equal(1);
        expect(await presale.tokenValue(1)).to.equal(500);
        expect(await presale.value(addr1.address)).to.equal(500);
    });
    it("Cannot claim NFTs while token is paused", async function () {
        const expiration = await getBlockTimestamp() + 600;
        const salt = getSalt("10", "0", "100");
        const signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        await expect(presale.connect(addr1).buy(signature, "10", "10", "0", "100", expiration)).to.not.be.reverted;
        expect(await presale.balanceOf(addr1.address)).to.equal(10);
        expect(await presale.value(addr1.address)).to.equal(1000);
        await expect(presale.connect(addr1).claim()).to.be.revertedWith("Fur token is paused");
    });
    it("Can claim NFTs when token is unpaused", async function () {
        const expiration = await getBlockTimestamp() + 600;
        const salt = getSalt("10", "0", "100");
        const signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        await expect(presale.connect(addr1).buy(signature, "10", "10", "0", "100", expiration)).to.not.be.reverted;
        expect(await presale.balanceOf(addr1.address)).to.equal(10);
        expect(await presale.value(addr1.address)).to.equal(1000);
        await expect(token.unpause()).to.not.be.reverted;
        await expect(presale.connect(addr1).claim()).to.not.be.reverted;
        expect(await token.balanceOf(addr1.address)).to.equal("1000000000000000000000");
    });
    it("Cannot claim NFTs multiple times", async function () {
        const expiration = await getBlockTimestamp() + 600;
        const salt = getSalt("10", "0", "100");
        const signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        await expect(presale.connect(addr1).buy(signature, "10", "10", "0", "100", expiration)).to.not.be.reverted;
        expect(await presale.balanceOf(addr1.address)).to.equal(10);
        expect(await presale.value(addr1.address)).to.equal(1000);
        await expect(token.unpause()).to.not.be.reverted;
        await expect(presale.connect(addr1).claim()).to.not.be.reverted;
        expect(await token.balanceOf(addr1.address)).to.equal("1000000000000000000000");
        await expect(presale.connect(addr1).claim()).to.be.revertedWith("No claimable tokens");
        expect(await token.balanceOf(addr1.address)).to.equal("1000000000000000000000");
    });
});

async function getBlockTimestamp () {
    return (await hre.ethers.provider.getBlock("latest")).timestamp;
}

const getSalt = (max, price, value) => {
    return ['max', max, 'price', price, 'value', value].join('');
}

const getSignature = (pkey, address, salt, expiration) => {
    const encoder = hre.ethers.utils.defaultAbiCoder;
    let messageHash = hre.ethers.utils.sha256(encoder.encode(['address', 'string', 'uint256'], [address, salt, expiration]));
    return EthCrypto.sign(pkey, messageHash);
};
