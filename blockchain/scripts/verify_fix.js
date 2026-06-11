import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const MARKETPLACE_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const MARKETPLACE_ABI = ["function getTotalProducts() view returns (uint256)"];

async function main() {
    try {
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
        console.log("Checking bytecode at:", MARKETPLACE_ADDRESS);
        const code = await provider.getCode(MARKETPLACE_ADDRESS);
        if (code === "0x") {
            console.error("ERROR: No bytecode found at address!");
            process.exit(1);
        }
        console.log("Bytecode found. Calling getTotalProducts()...");
        const totalProducts = await contract.getTotalProducts();
        console.log("SUCCESS! Total Products:", totalProducts.toString());
    } catch (error) {
        console.error("FAILED:", error);
        process.exit(1);
    }
}

main();
