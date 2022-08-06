const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('ERC721', function () {
  const name = 'My new NFT project';
  const symbol = 'GOAT';
  const MAX_MINT_PER_WALLET = 1;
  const MAX_SUPPLY = 8888;
  const MINT_PRICE = 0.1; //in ether
  const MINT_PRICE_WEI = ethers.utils.parseEther(MINT_PRICE.toString());

  beforeEach(async function () {
    contract = await ethers.getContractFactory('Minting');

    const network = 'homestead'; // The mainnet
    provider = ethers.getDefaultProvider(network, {
      infura: 'b51a92ba9a4f4092aa548938d47cb402',
    });

    [owner, user, ...address] = await ethers.getSigners();
      
    contract = await contract.deploy(name, symbol, MAX_MINT_PER_WALLET, MAX_SUPPLY, MINT_PRICE_WEI);
  });

  describe('Deployment', function() {
    it('Should deploy contract sucessfully', async function() {
      expect(await contract.name()).to.equal(name);
      expect(await contract.symbol()).to.equal(symbol);
      expect(await contract.MAX_MINT_PER_ADDRESS()).to.equal(MAX_MINT_PER_WALLET);
      expect(await contract.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
      expect(await contract.totalSupply()).to.equal(0);
      expect(await contract.MINT_PRICE()).to.equal(MINT_PRICE_WEI);
    });
  });
  describe('DoSmth', function() {
    it('Should DoSmth', async function() {
      expect(await contract.MINT_PRICE()).to.equal(MINT_PRICE_WEI);
    });
  });
  describe('mint', function() {
    it('Should mint stuff', async function() {
      await contract.mint('0x5208bF687E71b00756bc52C68D0AD5DF4419dfCa',1);
      // expect(await contract.totalSupply()).to.equal(1);
    });
  });
});
