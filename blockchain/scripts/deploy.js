//deploy.js
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// 1. D'ABORD : Initialiser __filename et __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 2. ENSUITE : Charger explicitement le fichier .env en utilisant le bon chemin
dotenv.config({ path: join(__dirname, "../.env") });

async function main() {
    console.log("Connecting to network...");

    // Utilise le nœud Sepolia si disponible, sinon se rabat sur le local
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Récupère votre vraie clé privée du fichier .env
    const DEPLOYER_KEY = process.env.PRIVATE_KEY;
    if (!DEPLOYER_KEY) {
        throw new Error("Veuillez configurer la variable PRIVATE_KEY dans votre fichier .env");
    }

    // Ajoute automatiquement le préfixe 0x si vous l'aviez retiré
    const formattedKey = DEPLOYER_KEY.startsWith("0x") ? DEPLOYER_KEY : `0x${DEPLOYER_KEY}`;
    const wallet = new ethers.Wallet(formattedKey, provider);

    // Get current nonce to avoid conflicts
    let nonce = await provider.getTransactionCount(wallet.address);
    console.log("Deploying DriveLedger contracts...");
    console.log("Deploying with account:", wallet.address);
    console.log("Starting nonce:", nonce);

    const loadArtifact = (name) => {
        const raw = readFileSync(join(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`), "utf8");
        return JSON.parse(raw);
    };

    // 1. Deploy AccessControl
    const acArtifact = loadArtifact("DriveLedgerAccessControl");
    const AccessControl = new ethers.ContractFactory(acArtifact.abi, acArtifact.bytecode, wallet);
    const accessControl = await AccessControl.deploy({ nonce: nonce++ });
    await accessControl.waitForDeployment();
    const accessControlAddress = await accessControl.getAddress();
    console.log("DriveLedgerAccessControl deployed to:", accessControlAddress);

    // 2. Deploy Marketplace
    const mktArtifact = loadArtifact("DriveLedgerMarketplace");
    const Marketplace = new ethers.ContractFactory(mktArtifact.abi, mktArtifact.bytecode, wallet);
    const marketplace = await Marketplace.deploy(accessControlAddress, { nonce: nonce++ });
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("DriveLedgerMarketplace deployed to:", marketplaceAddress);

    // 3. Deploy Booking
    const bkgArtifact = loadArtifact("DriveLedgerBooking");
    const Booking = new ethers.ContractFactory(bkgArtifact.abi, bkgArtifact.bytecode, wallet);
    const booking = await Booking.deploy(accessControlAddress, { nonce: nonce++ });
    await booking.waitForDeployment();
    const bookingAddress = await booking.getAddress();
    console.log("DriveLedgerBooking deployed to:", bookingAddress);

    console.log("\n=== COPY THESE ADDRESSES TO YOUR CONFIG ===");
    console.log(`ACCESS_CONTROL_ADDRESS="${accessControlAddress}"`);
    console.log(`MARKETPLACE_ADDRESS="${marketplaceAddress}"`);
    console.log(`BOOKING_ADDRESS="${bookingAddress}"`);
    console.log("\nAll contracts deployed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});