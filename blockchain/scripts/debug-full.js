import hre from "hardhat";

async function main() {
    console.log("HRE Keys:", Object.keys(hre));
    console.log("Ethers defined:", !!hre.ethers);
    if (hre.ethers) {
        console.log("Ethers signer count:", (await hre.ethers.getSigners()).length);
    }
}

main().catch(console.error);
