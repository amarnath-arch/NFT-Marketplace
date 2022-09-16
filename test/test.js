const {expect}= require('chai');

describe('NFT Market',function(){
    it("Should be able to Create and Execute market Sales",async()=>{
        const Market = await ethers.getContractFactory("NFTMarketplace");
        const market=await Market.deploy();
        await market.deployed();
        const marketAddress= market.address;

        const NFT= await ethers.getContractFactory("NFT");
        const nft = await NFT.deploy(marketAddress);
        await nft.deployed();
        const nftContractAddress= nft.address;
        
        let listingPrice= await market.getListingPrice();
        listingPrice = listingPrice.toString();

        const auctionPrice= ethers.utils.parseUnits('100','ether');

        await nft.createToken("https:/www.mytokenlocation1.com");
        await nft.createToken("https:/www.mytokenlocation2.com");

        await market.createMarketItem(nftContractAddress, 1, auctionPrice, {value: listingPrice});
        await market.createMarketItem(nftContractAddress, 2, auctionPrice, {value: listingPrice});

        const[ _, buyerAddress]= await ethers.getSigners();

        await market.connect(buyerAddress).createMarketSale(1,{value : auctionPrice});

        let items= await market.connect(buyerAddress).fetchMyNFTS();

        items= await Promise.all(items.map(async i=>{
            const tokenUri= await nft.tokenURI(i.tokenId);
            let item= {
                price: i.price.toString(),
                seller: i.seller.toString(),
                owner: i.owner.toString(),
                tokenId: i.tokenId.toString(),
                tokenUri
            }
            return item;
        }));

        console.log('items: ',items );

    })
});