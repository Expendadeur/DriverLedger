import hre from "hardhat";

async function main() {
    console.log("HRE present:", !!hre);
    console.log("Ethers present on HRE:", !!hre.ethers);
    if (hre.ethers) {
        console.log("Ethers keys:", Object.keys(hre.ethers));
    }
}

main().catch(console.error);
