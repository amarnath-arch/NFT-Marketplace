import {ethers} from 'ethers';
import axios from 'axios';
import Web3Modal from 'web3modal';
import {useState, useEffect} from 'react';


import {
    nftAddress,
    marketPlaceAddress
} from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function CreatorDashboard() {
    const [nfts, setNfts] = useState([]);
    const [sold, setSold] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');

    useEffect(()=>{
        loadNfts();
    },[])

    async function loadNfts(){
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider= new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const tokenContract= new ethers.Contract(nftAddress, NFT.abi, signer);
        const marketPlace = new ethers.Contract(marketPlaceAddress, NFTMarketplace.abi,signer);

        const data= await marketPlace.fetchItemsCreated();

        let items=await Promise.all(data.map(async i=>{
        const tokenURI= await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenURI);
        const price= ethers.utils.formatUnits(i.price.toString(),'ether');

        let item={
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
            sold: i.sold
        };

        return item;
        }));

        const soldItems= items.filter(i=> i.sold);


        setSold(soldItems);
        setNfts(items);
        setLoadingState('loaded');
    }

    const userNfts= nfts.map((nft,i)=>{
        return(<div key={i} className="border shadow rounded-xl overflow-hidden">
          <img src={nft.image} className="rounded" />
          <div className="p-4 bg-black" >
            <p className='text-2xl mb-4 font-bold text-white' >{nft.price} Matic</p>
          </div>
        </div>)
      });

    
    const soldNfts= sold.map((nft,i)=>{
        return(<div key={i} className="border shadow rounded-xl overflow-hidden">
          <img src={nft.image} className="rounded" />
          <div className="p-4 bg-black" >
            <p className='text-2xl mb-4 font-bold text-white' >{nft.price} Matic</p>
          </div>
        </div>)
      });

    return(
        <div >
            <div className="p-4" >
                <h2 className='text-2xl py-2' > Items Created</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
                {
                    userNfts
                }

                </div>

            </div>
            <div className='px-4' >
                {
                    Boolean(sold.length) && (
                        <div>
                            <h2 className='text-2xl py-2'>Items Sold </h2>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
                                {
                                    soldNfts
                                }
                            </div>
                        </div>
                    )
                }
            </div> 
        </div>

    )




}