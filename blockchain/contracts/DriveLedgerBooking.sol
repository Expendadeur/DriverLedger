// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DriveLedgerAccessControl.sol";

contract DriveLedgerBooking is ReentrancyGuard, Ownable {
    DriveLedgerAccessControl public accessControl;

    struct Vehicle {
        uint256 id;
        string model;
        string plateNumber;
        uint256 dailyPrice;
        bool isAvailable;
        string vehicleType; // car, moto, truck, van
        string imageUri;
    }

    struct Reservation {
        uint256 id;
        uint256 vehicleId;
        address client;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPaid;
        string status;
    }

    uint256 private _vehicleIds;
    uint256 private _reservationIds;

    mapping(uint256 => Vehicle) public vehicles;
    mapping(uint256 => Reservation) public reservations;
    mapping(address => uint256[]) public clientReservations;

    event VehicleAdded(uint256 indexed id, string model, uint256 dailyPrice, string vehicleType, string imageUri);
    event VehicleUpdated(uint256 indexed id, string model, uint256 dailyPrice, bool isAvailable, string vehicleType, string imageUri);
    event ReservationCreated(uint256 indexed id, uint256 indexed vehicleId, address indexed client, uint256 totalPaid);
    event ReservationStatusUpdated(uint256 indexed id, string status);

    constructor(address _accessControlAddress) Ownable(msg.sender) {
        accessControl = DriveLedgerAccessControl(_accessControlAddress);
    }

    modifier onlyAdmin() {
        require(accessControl.isAdmin(msg.sender), "Uniquement sur administrateur du pleteforme");
        _;
    }

    modifier onlyEmployee() {
        require(accessControl.isEmployee(msg.sender) || accessControl.isAdmin(msg.sender), "Caller is not an employee");
        _;
    }

    function addVehicle(
        string memory _model,
        string memory _plateNumber,
        uint256 _dailyPrice,
        string memory _vehicleType,
        string memory _imageUri
    ) external onlyAdmin {
        _vehicleIds++;
        vehicles[_vehicleIds] = Vehicle({
            id: _vehicleIds,
            model: _model,
            plateNumber: _plateNumber,
            dailyPrice: _dailyPrice,
            isAvailable: true,
            vehicleType: _vehicleType,
            imageUri: _imageUri
        });
        emit VehicleAdded(_vehicleIds, _model, _dailyPrice, _vehicleType, _imageUri);
    }

    function updateVehicle(
        uint256 _id,
        string memory _model,
        string memory _plateNumber,
        uint256 _dailyPrice,
        bool _isAvailable,
        string memory _vehicleType,
        string memory _imageUri
    ) external onlyAdmin {
        require(vehicles[_id].id != 0, "Vehicle does not exist");
        Vehicle storage vehicle = vehicles[_id];
        vehicle.model = _model;
        vehicle.plateNumber = _plateNumber;
        vehicle.dailyPrice = _dailyPrice;
        vehicle.isAvailable = _isAvailable;
        vehicle.vehicleType = _vehicleType;
        vehicle.imageUri = _imageUri;
        emit VehicleUpdated(_id, _model, _dailyPrice, _isAvailable, _vehicleType, _imageUri);
    }

    function bookVehicle(uint256 _vehicleId, uint256 _days) external payable nonReentrant {
        Vehicle storage vehicle = vehicles[_vehicleId];
        require(vehicle.isAvailable, "Vehicle not available");
        require(_days > 0, "Must book at least 1 day");
        uint256 totalCost = vehicle.dailyPrice * _days;
        require(msg.value >= totalCost, "Insufficient payment");

        vehicle.isAvailable = false;
        _reservationIds++;

        reservations[_reservationIds] = Reservation({
            id: _reservationIds,
            vehicleId: _vehicleId,
            client: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + (_days * 1 days),
            totalPaid: msg.value,
            status: "CONFIRMED"
        });

        clientReservations[msg.sender].push(_reservationIds);
        emit ReservationCreated(_reservationIds, _vehicleId, msg.sender, msg.value);
    }

    function updateReservationStatus(uint256 _reservationId, string memory _status) external onlyEmployee {
        require(reservations[_reservationId].id != 0, "Reservation does not exist");
        reservations[_reservationId].status = _status;

        // If completed, make vehicle available again
        if (keccak256(bytes(_status)) == keccak256(bytes("COMPLETED"))) {
            vehicles[reservations[_reservationId].vehicleId].isAvailable = true;
        }
        emit ReservationStatusUpdated(_reservationId, _status);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    function getClientReservations(address _client) external view returns (uint256[] memory) {
        return clientReservations[_client];
    }

    function getTotalVehicles() external view returns (uint256) {
        return _vehicleIds;
    }

    function getTotalReservations() external view returns (uint256) {
        return _reservationIds;
    }
}
