import styles from '../styles/Home.module.css';
import {ethers} from 'ethers';
import axios from 'axios';
import Web3Modal from 'web3modal';
import {useState, useEffect} from 'react';

import{
  nftAddress,
  marketPlaceAddress
}from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';


export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState]= useState('not-loaded');

  useEffect(()=> {
    loadNfts();
  },[]);

  async function loadNfts(){
    
    const provider= new ethers.providers.JsonRpcProvider();
    const tokenContract= new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketPlace = new ethers.Contract(marketPlaceAddress, NFTMarketplace.abi,provider);

    const data= await marketPlace.fetchMarketItems();

    let items=await Promise.all(data.map(async i=>{
      const tokenURI= await tokenContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenURI);
      console.log(meta.data);

      const price= ethers.utils.formatUnits(i.price.toString(),'ether');

      let item={
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      };
      console.log(item);


      return item;
    }));

    setNfts(items);
    setLoadingState('loaded');
  
  }

  async function buyNft(nft){
    const web3Modal=  new Web3Modal();
    const connection = await web3Modal.connect();
    const provider= new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract= new ethers.Contract(marketPlaceAddress,NFTMarketplace.abi,signer);

    const price= ethers.utils.parseUnits(nft.price.toString(),'ether');


    const transaction = await contract.createMarketSale(nft.tokenId,{
      value: price
    });

    await transaction.wait();
    loadNfts();



  }


  if(loadingState == "loaded" && !nfts.length) return(
    <h1 className ="px-20 py-10 text-3xl" >No items in marketplace</h1>
  );

  console.log(nfts.length);


  const userNfts=  nfts.map((nft,i)=>{
    return(<div key={i} className="border shadow rounded-xl overflow-hidden">
      <img src={nft.image} />
      <div className='p-4'>
        <p style={{ height: '64px'}} className='text-2xl font-semibold' >{nft.name} </p>
        
        <div style={{height: '70px', overflow:'hidden'}}>
          <p className='text-gray-400' > {nft.description} </p>
        </div>
      </div>

      <div className="p-4 bg-black" >
        <p className='text-2xl mb-4 font-bold text-white' >{nft.price} Matic</p>
        <button className='w-full bg-pink-500 text-white font-bold py-2 px-12 rounded' 
         onClick={()=> buyNft(nft)}> Buy </button>
      </div>

    </div>)
  });


  return (
    <div className='flex justify-center'>
      <div className="px-4" style={{maxWidth: '1600px'}}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {
            userNfts
          }

        </div>

      </div>
    </div>
  
  );
}
