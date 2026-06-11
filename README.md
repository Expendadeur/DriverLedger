# DriveLedger - Decentralized E-Commerce & Booking Platform

A premium Web3 platform where all commercial transactions and vehicle bookings are executed 100% on-chain.

## 🚀 Features

- **On-chain Marketplace**: Products are smart contract entities. Payments and stock management happen on the blockchain.
- **On-chain Booking**: Vehicles are reserved via smart contracts with real-time availability tracking.
- **Role-Based Access**: Multi-role system (Admin, Employee, Client) managed via `DriveLedgerAccessControl` smart contract.
- **Real-time Indexing**: Backend service monitors blockchain events to provide a high-performance cached API.
- **Mobile First & Responsive**: Built with React and TailwindCSS for a premium user experience.
- **QR Validation**: Orders and bookings generate hash-based QR codes verifiable by employees.

## 🏗 Architecture

- **Blockchain**: Solidity, Hardhat, Ethers.js, OpenZeppelin.
- **Backend**: Node.js, Express, Prisma, PostgreSQL.
- **Frontend**: React, Vite, TailwindCSS, Lucide-Icons.
- **Services**: PDFKit, QRCode, Firebase FCM.

## 🛠 Setup

### 1. Smart Contracts
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Backend
```bash
cd backend
npm install
# Configure .env with your PostgreSQL and Contract addresses
npx prisma generate
npx prisma db push
node server.js
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Security

- **ReentrancyGuard**: All payment-related functions are protected.
- **AccessControl**: Strict role verification for management functions.
- **Wallet Auth**: Backend authentication via EIP-712 message signing.
- **Source of Truth**: The blockchain is the ONLY source of truth for transactions.

## 📄 License
MIT
