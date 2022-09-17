const { hexZeroPad } = require('ethers/lib/utils');
const { ethers } = require('hardhat');
const hre= require('hardhat');


async function main(){
    const Marketplace= await hre.ethers.getContractFactory("NFTMarketplace");
    const marketplace= await Marketplace.deploy();
    await marketplace.deployed();

    const tokenContract= await hre.ethers.getContractFactory("NFT");
    const token= await tokenContract.deploy(marketplace.address);
    await token.deployed();

    console.log(`MarketplaceAddress: ${marketplace.address} \n TokenAddress: ${token.address}`);
}

main()
    .then(()=> process.exit(0))
    .catch((error)=>{
        console.error(error);
        process.exit(1);
    })