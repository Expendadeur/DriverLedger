// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DriveLedgerAccessControl.sol";

contract DriveLedgerMarketplace is ReentrancyGuard, Ownable {
    DriveLedgerAccessControl public accessControl;

    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
        uint256 stock;
        address seller;
        bool isActive;
        bool isPublished;
        string imageUri;
    }

    struct Order {
        uint256 id;
        uint256 productId;
        address buyer;
        uint256 timestamp;
        uint256 amount;
        string status;
    }

    uint256 private _productIds;
    uint256 private _orderIds;

    mapping(uint256 => Product) public products;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public customerOrders;

    event ProductAdded(uint256 indexed id, string name, uint256 price, uint256 stock, string imageUri);
    event ProductUpdated(uint256 indexed id, string name, uint256 price, uint256 stock, bool isActive, bool isPublished, string imageUri);
    event ProductPurchased(uint256 indexed orderId, uint256 indexed productId, address indexed buyer, uint256 amount);
    event OrderStatusUpdated(uint256 indexed orderId, string status);
    event ProductStatusChanged(uint256 indexed id, bool isActive, bool isPublished);

    constructor(address _accessControlAddress) Ownable(msg.sender) {
        accessControl = DriveLedgerAccessControl(_accessControlAddress);
    }

    modifier onlyAdmin() {
        require(accessControl.isAdmin(msg.sender), "Caller is not an admin");
        _;
    }

    modifier onlyEmployee() {
        require(accessControl.isEmployee(msg.sender) || accessControl.isAdmin(msg.sender), "Caller is not an employee");
        _;
    }

    function addProduct(
        string memory _name,
        string memory _description,
        uint256 _price,
        uint256 _stock,
        string memory _imageUri
    ) external onlyAdmin {
        _productIds++;
        products[_productIds] = Product({
            id: _productIds,
            name: _name,
            description: _description,
            price: _price,
            stock: _stock,
            seller: msg.sender,
            isActive: true,
            isPublished: true,
            imageUri: _imageUri
        });
        emit ProductAdded(_productIds, _name, _price, _stock, _imageUri);
    }

    function updateProduct(
        uint256 _id,
        string memory _name,
        string memory _description,
        uint256 _price,
        uint256 _stock,
        bool _isActive,
        bool _isPublished,
        string memory _imageUri
    ) external onlyAdmin {
        require(products[_id].id != 0, "Product does not exist");
        Product storage product = products[_id];
        product.name = _name;
        product.description = _description;
        product.price = _price;
        product.stock = _stock;
        product.isActive = _isActive;
        product.isPublished = _isPublished;
        product.imageUri = _imageUri;
        emit ProductUpdated(_id, _name, _price, _stock, _isActive, _isPublished, _imageUri);
    }

    function setProductStatus(uint256 _id, bool _isActive, bool _isPublished) external onlyAdmin {
        require(products[_id].id != 0, "Product does not exist");
        products[_id].isActive = _isActive;
        products[_id].isPublished = _isPublished;
        emit ProductStatusChanged(_id, _isActive, _isPublished);
    }

    function purchaseProduct(uint256 _productId) external payable nonReentrant {
        Product storage product = products[_productId];
        require(product.isActive && product.isPublished, "Product not available");
        require(product.stock > 0, "Out of stock");
        require(msg.value >= product.price, "Insufficient payment");

        product.stock--;
        _orderIds++;
        
        orders[_orderIds] = Order({
            id: _orderIds,
            productId: _productId,
            buyer: msg.sender,
            timestamp: block.timestamp,
            amount: msg.value,
            status: "PAID"
        });

        customerOrders[msg.sender].push(_orderIds);

        emit ProductPurchased(_orderIds, _productId, msg.sender, msg.value);
    }

    function updateOrderStatus(uint256 _orderId, string memory _status) external onlyEmployee {
        require(orders[_orderId].id != 0, "Order does not exist");
        orders[_orderId].status = _status;
        emit OrderStatusUpdated(_orderId, _status);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    function getCustomerOrders(address _customer) external view returns (uint256[] memory) {
        return customerOrders[_customer];
    }

    function getTotalProducts() external view returns (uint256) {
        return _productIds;
    }

    function getTotalOrders() external view returns (uint256) {
        return _orderIds;
    }
}
