require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  gasReporter: {
    currency: 'USD',
    gasPrice: 20,
    coinmarketcap: 'fcddfc03-5e54-46ef-9982-d97d460b89ec'
  }
};
