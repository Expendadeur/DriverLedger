const { ethers } = require('ethers');

const rpc = "https://ethereum-sepolia-rpc.publicnode.com";
const provider = new ethers.JsonRpcProvider(rpc);
const accessControlAddr = "0x0C26EF26368fF4922aC9293c9c5BCEBbc9f0149E";

const abi = [
    "function isAdmin(address account) public view returns (bool)",
    "function isEmployee(address account) public view returns (bool)"
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
        console.log("Contract found. Checking admin status for 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266...");
        const isAdmin = await contract.isAdmin("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
        console.log("isAdmin:", isAdmin);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

check();
