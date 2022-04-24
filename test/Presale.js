const { expect } = require("chai");
const { ethers } = require("hardhat");
const EthCrypto = require("eth-crypto");

// PRIVATE KEYS FOR CREATING SIGNATURES
const ownerPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const addr1PrivateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

describe("Presale", function () {
    // RUN THIS BEFORE EACH TEST
    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Verifier");
        verifier = await Verifier.deploy();
        Presale = await ethers.getContractFactory("Presale");
        presale = await Presale.deploy();
        Usdc = await ethers.getContractFactory("MockUSDC");
        usdc = await Usdc.deploy();
        Token = await ethers.getContractFactory("Token");
        token = await Token.deploy();
    });
    // Test signatures
    it("Can verify signatures", async function () {
        const expiration = await getBlockTimestamp() + 600;
        const salt = "1";
        const signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        expect(await verifier.verify(signature, addr1.address, salt, expiration)).to.equal(true);
    });
    it("Signatures can expiire", async function () {
        const expiration = await getBlockTimestamp() - 600;
        const salt = "1";
        const signature = getSignature(ownerPrivateKey, addr1.address, salt, expiration);
        expect(await verifier.verify(signature, addr1.address, salt, expiration)).to.equal(false);
    });
    it("Signatures with right signer but wrong data fail", async function () {
        const rightExpiration = await getBlockTimestamp() + 600;
        const wrongExpiration = await getBlockTimestamp() + 1200;
        const rightSalt = "1";
        const wrongSalt = "2";
        const signature = getSignature(ownerPrivateKey, addr1.address, rightSalt, rightExpiration);
        expect(await verifier.verify(signature, addr1.address, wrongSalt, rightExpiration)).to.equal(false);
        expect(await verifier.verify(signature, addr1.address, rightSalt, wrongExpiration)).to.equal(false);
        expect(await verifier.verify(signature, addr1.address, wrongSalt, wrongExpiration)).to.equal(false);
    });
    it("Signatures with wrong signer but right data fail", async function () {
        const expiration = await getBlockTimestamp() + 600;
        const salt = "1";
        const signature = getSignature(addr1PrivateKey, addr1.address, salt, expiration);
        expect(await verifier.verify(signature, addr1.address, salt, expiration)).to.equal(false);
    });
    it("Signatures with wrong signer and wrong data fail", async function () {
        const rightExpiration = await getBlockTimestamp() + 600;
        const wrongExpiration = await getBlockTimestamp() + 1200;
        const rightSalt = "1";
        const wrongSalt = "2";
        const signature = getSignature(addr1PrivateKey, addr1.address, rightSalt, rightExpiration);
        expect(await verifier.verify(signature, addr1.address, wrongSalt, wrongExpiration)).to.equal(false);
    });
});

async function getBlockTimestamp () {
    return (await hre.ethers.provider.getBlock("latest")).timestamp;
}

const getSignature = (pkey, address, salt, expiration) => {
    const encoder = hre.ethers.utils.defaultAbiCoder;
    let messageHash = hre.ethers.utils.sha256(encoder.encode(['address', 'string', 'uint256'], [address, salt, expiration]));
    return EthCrypto.sign(pkey, messageHash);
};
