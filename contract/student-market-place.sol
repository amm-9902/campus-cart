// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract StudentMarketplace {

    uint public itemCount = 0;

    struct Item {
        uint id;
        address payable seller;
        string name;
        string imageUrl; // ADDED
        uint price;
        bool isSold;
        bool isCancelled;
    }

    mapping(uint => Item) public items;

    mapping(uint => address payable) public buyers;
    mapping(uint => bool) public paymentLocked;

    event ItemListed(uint id, address seller, string name, string imageUrl, uint price); // UPDATED
    event ItemSold(uint id, address buyer, address seller, string name, uint price);
    event ItemCancelled(uint id, address seller);
    event PaymentReleased(uint id, address buyer, address seller, uint amount);

    function createListing(string memory _name, string memory _imageUrl, uint _price) public { // UPDATED
        require(bytes(_name).length > 0, "Item name cannot be empty");
        require(_price > 0, "Item price must be greater than zero");

        itemCount++;

        items[itemCount] = Item(
            itemCount,
            payable(msg.sender),
            _name,
            _imageUrl, // ADDED
            _price,
            false,
            false
        );

        emit ItemListed(itemCount, msg.sender, _name, _imageUrl, _price);
    }

    function buyItem(uint _id) public payable {
        Item storage item = items[_id];

        require(_id > 0 && _id <= itemCount, "Item does not exist");
        require(msg.value == item.price, "Please submit the exact asking price in wei");
        require(!item.isSold, "Item has already been sold");
        require(!item.isCancelled, "Item listing was cancelled");
        require(msg.sender != item.seller, "Seller cannot buy their own item");

        item.isSold = true;

        buyers[_id] = payable(msg.sender);
        paymentLocked[_id] = true;

        emit ItemSold(_id, msg.sender, item.seller, item.name, item.price);
    }

    function cancelListing(uint _id) public {
        Item storage item = items[_id];

        require(_id > 0 && _id <= itemCount, "Item does not exist");
        require(msg.sender == item.seller, "Only the seller can cancel this listing");
        require(!item.isSold, "Cannot cancel a sold item");
        require(!item.isCancelled, "Item is already cancelled");

        item.isCancelled = true;

        emit ItemCancelled(_id, msg.sender);
    }

    function confirmReceived(uint _id) public {
        Item storage item = items[_id];

        require(item.isSold, "Item has not been sold");
        require(paymentLocked[_id], "Payment already released");
        require(msg.sender == buyers[_id], "Only buyer can confirm");

        paymentLocked[_id] = false;

        (bool success, ) = payable(item.seller).call{value: item.price}("");
        require(success, "Transfer failed.");


        emit PaymentReleased(
            _id,
            buyers[_id],
            item.seller,
            item.price
        );
    }

    function isPaymentLocked(uint _id) public view returns (bool) {
        return paymentLocked[_id];
    }
}