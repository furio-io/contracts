const hre = require("hardhat");
const EthCrypto = require("eth-crypto");

const ownerPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
    const address = "0xbd7348a8302d73782be4B4C3E959ECbCAD26FE2D";
    const salt = getSalt("1", "250", "500");
    const expiration = 1653474602;
    const encoder = hre.ethers.utils.defaultAbiCoder;
    console.log("Address", encoder.encode(['address'],[address]));
    console.log("Salt", encoder.encode(['string'], [salt]));
    console.log("Expiration", encoder.encode(['uint256'],[expiration]));
    console.log("Message", encoder.encode(['address','string','uint256'],[address,salt,expiration]));
    console.log("Hash",hre.ethers.utils.sha256(encoder.encode(['address','string','uint256'],[address,salt,expiration])));
    console.log("Another hash",hre.ethers.utils.sha256('0x000000000000000000000000bd7348a8302d73782be4b4c3e959ecbcad26fe2d000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000628e052a00000000000000000000000000000000000000000000000000000000000000146d617831707269636532353076616c7565353030000000000000000000000000'));
    console.log("Signature", getSignature(ownerPrivateKey, address, salt, expiration));
}

const getSalt = (max, price, value) => {
    return ['max', max, 'price', price, 'value', value].join('');
}

const getSignature = (pkey, address, salt, expiration) => {
    const encoder = hre.ethers.utils.defaultAbiCoder;
    let messageHash = hre.ethers.utils.sha256(encoder.encode(['address', 'string', 'uint256'], [address, salt, expiration]));
    return EthCrypto.sign(pkey, messageHash);
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
