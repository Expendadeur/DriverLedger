const { keccak256, toUtf8Bytes } = require('ethers');
const roles = ['ADMIN_ROLE', 'EMPLOYEE_ROLE', 'CLIENT_ROLE'];
roles.forEach(r => {
    console.log(`${r}: ${keccak256(toUtf8Bytes(r))}`);
});
