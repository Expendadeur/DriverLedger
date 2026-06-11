import { ethers } from "ethers";

const rpc = "https://ethereum-sepolia.core.chainstack.com/91bdf46e33094e4e848bb12abca704af";
const provider = new ethers.JsonRpcProvider(rpc);
const accessControlAddr = "0x0C26EF26368fF4922aC9293c9c5BCEBbc9f0149E";

const abi = [
    "function isAdmin(address account) public view returns (bool)",
    "function hasRole(bytes32 role, address account) public view returns (bool)"
];

const contract = new ethers.Contract(accessControlAddr, abi, provider);

async function check() {
    try {
        console.log("Checking contract code...");
        const code = await provider.getCode(accessControlAddr);
        if (code === "0x") {
            console.log("NO CONTRACT FOUND AT", accessControlAddr, "ON SEPOLIA!");
            return;
        }
        console.log("Contract found. Checking admin status for 0x1c334667841443D4E80B5964bfc03319844ead76...");
        const isAdmin = await contract.isAdmin("0x1c334667841443D4E80B5964bfc03319844ead76");
        console.log("isAdmin:", isAdmin);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

check();
