export const MARKETPLACE_ABI = [
    "function addProduct(string memory _name, string memory _description, uint256 _price, uint256 _stock, string memory _imageUri) external",
    "function updateProduct(uint256 _id, string memory _name, string memory _description, uint256 _price, uint256 _stock, bool _isActive, bool _isPublished, string memory _imageUri) external",
    "function setProductStatus(uint256 _id, bool _isActive, bool _isPublished) external",
    "function purchaseProduct(uint256 _productId) external payable",
    "function updateOrderStatus(uint256 _orderId, string memory _status) external",
    "function products(uint256) view returns (uint256 id, string name, string description, uint256 price, uint256 stock, address seller, bool isActive, bool isPublished, string imageUri)",
    "function getTotalProducts() view returns (uint256)",
    "function getTotalOrders() view returns (uint256)",
    "function getCustomerOrders(address _customer) view returns (uint256[] memory)",
    "function withdraw() external",
    "event ProductAdded(uint256 indexed id, string name, uint256 price, uint256 stock, string imageUri)",
    "event ProductUpdated(uint256 indexed id, string name, uint256 price, uint256 stock, bool isActive, bool isPublished, string imageUri)",
    "event ProductPurchased(uint256 indexed orderId, uint256 indexed productId, address indexed buyer, uint256 amount)",
    "event OrderStatusUpdated(uint256 indexed orderId, string status)",
    "event ProductStatusChanged(uint256 indexed id, bool isActive, bool isPublished)"
];

export const BOOKING_ABI = [
    "function addVehicle(string memory _model, string memory _plateNumber, uint256 _dailyPrice, string memory _vehicleType, string memory _imageUri) external",
    "function updateVehicle(uint256 _id, string memory _model, string memory _plateNumber, uint256 _dailyPrice, bool _isAvailable, string memory _vehicleType, string memory _imageUri) external",
    "function bookVehicle(uint256 _vehicleId, uint256 _days) external payable",
    "function updateReservationStatus(uint256 _reservationId, string memory _status) external",
    "function vehicles(uint256) view returns (uint256 id, string model, string plateNumber, uint256 dailyPrice, bool isAvailable, string vehicleType, string imageUri)",
    "function getTotalVehicles() view returns (uint256)",
    "function getTotalReservations() view returns (uint256)",
    "function getClientReservations(address _client) view returns (uint256[] memory)",
    "function withdraw() external",
    "event VehicleAdded(uint256 indexed id, string model, uint256 dailyPrice, string vehicleType, string imageUri)",
    "event VehicleUpdated(uint256 indexed id, string model, uint256 dailyPrice, bool isAvailable, string vehicleType, string imageUri)",
    "event ReservationCreated(uint256 indexed id, uint256 indexed vehicleId, address indexed client, uint256 totalPaid)",
    "event ReservationStatusUpdated(uint256 indexed id, string status)"
];

export const ACCESS_CONTROL_ABI = [
    "function isAdmin(address account) public view returns (bool)",
    "function isEmployee(address account) public view returns (bool)",
    "function isDeactivated(address account) public view returns (bool)",
    "function registerAsClient() external",
    "function setUserStatus(address account, bool deactivated) external",
    "function addEmployee(address employee) external",
    "function removeEmployee(address employee) external"
];

export const CONTRACT_ADDRESSES = {
    marketplace: "0xd9cC06DF8a6b71edD9b2C8BD9f97f63633052929",
    booking: "0xeD5F70b25b16C32111edf3FD1424418E8c709033",
    accessControl: "0x0C26EF26368fF4922aC9293c9c5BCEBbc9f0149E"
};
