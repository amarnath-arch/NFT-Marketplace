/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

require('dotenv').config();

const RPC_URL= process.env.RPC_URL;
const MNEMONIC= process.env.MNEMONIC;


module.exports = {
  defaultNetwork:"hardhat",
  networks:{
    hardhat:{ },
    rinkeby:{
      url: RPC_URL,
      MNEMONIC: MNEMONIC
    }
  },
  solidity: {
    version:"0.8.9",
    settings:{
      optimizer:{
        enabled:true,
        runs:200
      }
    }
  },
};
