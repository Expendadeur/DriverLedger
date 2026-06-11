import { ethers } from "ethers";

async function main() {
    const RPC_URL = "https://ethereum-sepolia.core.chainstack.com/91bdf46e33094e4e848bb12abca704af";
    const ACCESS_CONTROL_ADDRESS = "0x7F15142B76CbC47247F65aAF25f5Ba17B6555284";

    // Account #0 Private Key (Default Hardhat Admin)
    const ADMIN_PRIVATE_KEY = "1d46fc1133eb7e7156e80a2684aaeee8dfb4d27d27f8b2802f57bd881eacab57";

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

    // --- METTEZ VOTRE ADRESSE METAMASK ICI ---
    const targetAddress = "0x1c334667841443D4E80B5964bfc03319844ead76";

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
