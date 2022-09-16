// SPDX-License-Identifier:MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter private _itemsSold;
    Counters.Counter private _itemIds;

    address payable owner;
    uint256 public listingPrice= 0.025 ether;

    constructor(){
        owner= payable(msg.sender);
    }

    struct MarketItem{
        uint256 itemId;
        address NftContract;
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed NftContract,
        uint256 indexed tokenId,
        address owner, 
        address seller,
        uint256 price,
        bool sold
    );


    function getListingPrice() public view returns(uint256 ){
        return listingPrice;
    }

    function createMarketItem(
        address _NftContract,
        uint256 tokenId,
        uint price
    )public payable nonReentrant{
        require(price > 0, "Price must be greater than zero" );
        require(msg.value == listingPrice,"Price should be equal to the listingPrice");

        _itemIds.increment();
        uint256 currentId= _itemIds.current();
        idToMarketItem[currentId]= MarketItem(
            currentId,
            _NftContract,
            tokenId,
            payable(address(0)),
            payable(msg.sender),
            price,
            false
        );

        IERC721(_NftContract).transferFrom(msg.sender,address(this),tokenId);

        emit MarketItemCreated(
            currentId,
            _NftContract,
            tokenId,
            address(0),
            payable(msg.sender),
            price,
            false
        );
    }



    function createMarketSale(
        uint256 _itemId
    )public payable nonReentrant{
        uint256 price= idToMarketItem[_itemId].price;
        address NFTContract= idToMarketItem[_itemId].NftContract;
        uint256 tokenId= idToMarketItem[_itemId].tokenId;
        require(msg.value == price, "Please Submit the asking price in order to complete the purchase");

        idToMarketItem[_itemId].seller.transfer(msg.value);
        IERC721(NFTContract).transferFrom(address(this), msg.sender, tokenId);

        idToMarketItem[_itemId].owner= payable(msg.sender);
        idToMarketItem[_itemId].sold= true;
        _itemsSold.increment();


        payable(owner).transfer(listingPrice);
    }


    function fetchMarketItems() public view returns(MarketItem[] memory){
        uint256 itemsnotSold = _itemIds.current() - _itemsSold.current();
        uint256 totalItems= _itemIds.current();

        MarketItem[] memory notSoldItems= new MarketItem[](itemsnotSold);
        uint256 currentIndex=0;

        for(uint i=0;i<totalItems;++i){
            uint256 currentId= i+1;
            if(idToMarketItem[currentId].owner == address(0)){
                MarketItem storage currentItem= idToMarketItem[currentId];
                notSoldItems[currentIndex]= currentItem;
                currentIndex+=1;
            }
        }

        return notSoldItems;
    }

    function fetchMyNFTS() public view returns(MarketItem[] memory){
        uint256 totalItems= _itemIds.current();
        uint256 myNftsCount=0;
        uint256 currentIndex=0;

        for(uint i=0;i< totalItems;++i){
            if(idToMarketItem[i+1].owner == msg.sender){
                myNftsCount+=1;
            }
        }

        MarketItem[] memory myNfts= new MarketItem[](myNftsCount);

        for(uint i=0;i< totalItems;++i){
            uint256 currentId= i+1;

            if(idToMarketItem[currentId].owner == msg.sender){
                MarketItem storage currentItem= idToMarketItem[currentId];
                myNfts[currentIndex]= currentItem;
                currentIndex+=1;
            }
        }

        return myNfts;

    }

    function fetchItemsCreated() public view returns(MarketItem[] memory){
        uint256 totalItems= _itemIds.current();
        uint256 createdItemsCount=0;
        uint256 currentIndex=0;
        
        for(uint i=0;i<totalItems;++i){
            if(idToMarketItem[i+1].seller == msg.sender){
                createdItemsCount+=1;
            }
        }

        MarketItem[] memory createdItems= new MarketItem[](createdItemsCount);

        for(uint i=0;i<totalItems;++i){
            uint256 currentId= i+1;
            if(idToMarketItem[currentId].seller == msg.sender){
                MarketItem storage currentItem= idToMarketItem[currentId];
                createdItems[currentIndex]= currentItem;
                currentIndex+=1;
            }
        }
        return createdItems;
    }



}