// SPDX-License-Identifier:MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract NFT is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address private contractAddress;

    constructor(address _marketplace) ERC721("Metaverse NFT","MNFT") {
        contractAddress= _marketplace;
    }

    function createToken(string memory tokenURI) public returns(uint256){
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId,tokenURI);
        setApprovalForAll(contractAddress,true);
        
        return newItemId;
    } 
}