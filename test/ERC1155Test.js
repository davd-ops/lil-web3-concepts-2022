const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('ERC721', function () {
  const name = 'My new NFT project';
  const symbol = 'GOAT';
  const MAX_MINT_PER_ADDRESS = 2;
  const MAX_SUPPLY = 8888;
  const MINT_PRICE = 0.1; //in ether
  const MINT_PRICE_WEI = ethers.utils.parseEther(MINT_PRICE.toString());
  const BASE_URI = 'ipfs://cid/'

  beforeEach(async function () {
    contract = await ethers.getContractFactory('ERC1155MintingContract');

    provider = await ethers.provider;

    [owner, user, ...address] = await ethers.getSigners();
      
    contract = await contract.deploy(name, symbol, MAX_MINT_PER_ADDRESS, MAX_SUPPLY, MINT_PRICE_WEI);
  });

  describe('Deployment', function() {

});
