const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

const generateNonce = () => {
    return `Welcome to DriveLedger! Sign this message to authenticate. Nonce: ${Math.floor(Math.random() * 1000000)}`;
};

const verifySignature = (address, signature, nonce) => {
    try {
        const recoveredAddress = ethers.verifyMessage(nonce, signature);
        return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
        return false;
    }
};

const signToken = (user) => {
    return jwt.sign(
        { id: user.id, address: user.address, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
    );
};

module.exports = { generateNonce, verifySignature, signToken };
