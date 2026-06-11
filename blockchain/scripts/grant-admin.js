import { ethers } from "ethers";

async function main() {
    const RPC_URL = "http://127.0.0.1:8545";
    const ACCESS_CONTROL_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // Account #0 Private Key (Default Hardhat Admin)
    const ADMIN_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

    // --- METTEZ VOTRE ADRESSE METAMASK ICI ---
    const targetAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    // Minimal ABI for grantRole and ADMIN_ROLE constant
    const abi = [
        "function grantRole(bytes32 role, address account) external",
        "function ADMIN_ROLE() view returns (bytes32)"
    ];

    const contract = new ethers.Contract(ACCESS_CONTROL_ADDRESS, abi, wallet);

    console.log(`Connecting to ${RPC_URL}...`);
    try {
        await provider.getNetwork();
    } catch (e) {
        console.error("ERREUR: Impossible de se connecter au nœud Hardhat. Est-ce que 'npx hardhat node' est lancé ?");
        return;
    }

    console.log(`Fetching ADMIN_ROLE constant...`);
    const ADMIN_ROLE = await contract.ADMIN_ROLE();

    console.log(`Granting ADMIN_ROLE to ${targetAddress}...`);
    const tx = await contract.grantRole(ADMIN_ROLE, targetAddress);
    console.log(`Transaction sent: ${tx.hash}`);

    await tx.wait();
    console.log("--------------------------------------------------");
    console.log("SUCCÈS ! Votre compte est maintenant Administrateur.");
    console.log("Rafraîchissez votre navigateur pour voir le Dashboard.");
    console.log("--------------------------------------------------");
}

main().catch(console.error);
