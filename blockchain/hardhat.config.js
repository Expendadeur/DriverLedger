import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";

// Chargement du fichier .env
dotenv.config();

export default {
    solidity: "0.8.20",
    networks: {
        localhost: {
            type: "http", // Requis par Hardhat 3
            url: "http://127.0.0.1:8545",
        },
        sepolia: {
            type: "http", // CORRECTION ICI : Spécifie le type attendu pour Chainstack
            url: process.env.SEPOLIA_RPC_URL,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    }
};