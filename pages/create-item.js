import { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import {ethers} from "ethers";
import {create as ipfsHttpClient} from 'ipfs-http-client';
import { useRouter } from "next/router";
import { uploadFileToIPFS, uploadJSONToIPFS } from "./pinata";


// const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import{
    nftAddress,
    marketPlaceAddress
}from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { list } from "postcss";



export default function CreateItem(){

    const [fileUrl, setFileUrl]= useState(null);
    const [formInput, updateFormInput] = useState({price:'',name:'',description:''});
    const router= useRouter();

    // useEffect(()=> {
    //     // loadNfts();
    //     console.log(fileUrl);
    //   },[fileUrl]);
    

    async function onChange(e){
        const file= e.target.files[0];
        try{
            // const added= await client.add(
            //     file,
            //     {
            //         progress: (prog)=> console.log(`received: ${prog}`)
            //     }
            // )
            // const url =`https://ipfs.infura.io/ipfs/${added}`;
            const response = await uploadFileToIPFS(file);
            if(response.success === true) {
                console.log("Uploaded image to Pinata: ", response.pinataURL)
                setFileUrl(response.pinataURL);
            }
        }catch(e){
            console.log(e);
        }
    }



    async function createItem(){
        const {name,description, price} = formInput;
        if(!name || !description || !price || !fileUrl) return;

        const data= {
            name,description,image: fileUrl
        };

        try{
            const response = await uploadJSONToIPFS(data);
            console.log(fileUrl);
            if(response.success === true) {
                let tokenURI= response.pinataURL;
                // tokenURI = tokenURI.toString();
                console.log("Uploaded data to Pinata: ", tokenURI)
                createSale(tokenURI);
            }
        }catch(er){
            console.log(`Error Uploading File: ${er}`);
        }
    }

    async function createSale(url){
        const web3Modal= new Web3Modal();
        const connection = await web3Modal.connect();
        const provider= new ethers.providers.Web3Provider(connection);
        const signer= provider.getSigner();

        let tokenContract= new ethers.Contract(nftAddress,NFT.abi, signer);
        let transaction = await tokenContract.createToken(url);
        let tx= await transaction.wait();

        console.log('done');    

        let event = tx.events[0];
        let value = event.args[2];
        let tokenId= value.toNumber();

        console.log(`Here is the tokenID: ${tokenId}`);

        const price= ethers.utils.parseUnits(formInput.price, 'ether');

        let marketContract= new ethers.Contract(marketPlaceAddress,NFTMarketplace.abi,signer);
        let listingPrice= await marketContract.getListingPrice();
        listingPrice= listingPrice.toString();

        transaction= await marketContract.createMarketItem(
            nftAddress, tokenId, price, {
                value: listingPrice
            }
        );

        await transaction.wait();
        // console.log(`The no. of NFts are ${nfts.length}`);
        router.push('/');

    }

    return(
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                   placeholder="Asset Name"
                   className="mt-8 border rounded p-4"
                   onChange={e => updateFormInput({...formInput, name: e.target.value })} 
                />

                <textarea 
                    placeholder="Asset Description"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({...formInput, description: e.target.value})}
                />

                <input 
                    placeholder="Asset Price in Matic"
                    className="mt-2 border rounded p-4"
                    onChange={e=> updateFormInput({...formInput, price: e.target.value})}
                />

                <input 
                    type="file"
                    name="Asset"
                    className="my-4"
                    onChange={onChange}
                />

                {
                    fileUrl && (
                        <img className="rounded mt-4" width="350" src={fileUrl} />
                    )
                }

                <button onClick={createItem} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg" >
                    Create Digital Asset
                </button>

            </div>
        </div>
    )


}