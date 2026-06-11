// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract DriveLedgerAccessControl is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMPLOYEE_ROLE = keccak256("EMPLOYEE_ROLE");
    bytes32 public constant CLIENT_ROLE = keccak256("CLIENT_ROLE");

    mapping(address => bool) public isDeactivated;

    event UserStatusChanged(address indexed account, bool deactivated);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyActive() {
        require(!isDeactivated[msg.sender], "Account is deactivated");
        _;
    }

    function isClient(address account) public view returns (bool) {
        return hasRole(CLIENT_ROLE, account) && !isDeactivated[account];
    }

    function isEmployee(address account) public view returns (bool) {
        return hasRole(EMPLOYEE_ROLE, account) && !isDeactivated[account];
    }

    function isAdmin(address account) public view returns (bool) {
        return hasRole(ADMIN_ROLE, account) && !isDeactivated[account];
    }

    function setUserStatus(address account, bool deactivated) external onlyRole(ADMIN_ROLE) {
        isDeactivated[account] = deactivated;
        emit UserStatusChanged(account, deactivated);
    }

    function registerAsClient() external {
        require(!hasRole(CLIENT_ROLE, msg.sender), "Already a client");
        require(!isDeactivated[msg.sender], "Banned from platform");
        _grantRole(CLIENT_ROLE, msg.sender);
    }

    function addEmployee(address employee) external onlyRole(ADMIN_ROLE) {
        _grantRole(EMPLOYEE_ROLE, employee);
    }

    function removeEmployee(address employee) external onlyRole(ADMIN_ROLE) {
        _revokeRole(EMPLOYEE_ROLE, employee);
    }
}
