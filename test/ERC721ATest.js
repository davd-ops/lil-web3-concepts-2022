const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('ERC721A', function () {
  const name = 'My new NFT project';
  const symbol = 'GOAT';
  const MAX_MINT_PER_ADDRESS = 5;
  const MAX_SUPPLY = 8888;
  const MINT_PRICE = 0.1; //in ether
  const MINT_PRICE_WEI = ethers.utils.parseEther(MINT_PRICE.toString());
  const BASE_URI = 'ipfs://cid/'

  beforeEach(async function () {
    contract = await ethers.getContractFactory('ERC721AMintingContract');

    provider = await ethers.provider;

    [owner, user, ...address] = await ethers.getSigners();
      
    contract = await contract.deploy(name, symbol, MAX_MINT_PER_ADDRESS, MAX_SUPPLY, MINT_PRICE_WEI);
  });

  describe('Deployment', function() {
    it('Should check everything is deployed sucessfully', async function() {
      expect(await contract.name()).to.equal(name);
      expect(await contract.symbol()).to.equal(symbol);
      expect(await contract.SALE_OPEN()).to.equal(false);
      expect(await contract.MAX_MINT_PER_ADDRESS()).to.equal(MAX_MINT_PER_ADDRESS);
      expect(await contract.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
      expect(await contract.totalSupply()).to.equal(0);
      expect(await contract.MINT_PRICE()).to.equal(MINT_PRICE_WEI);
    });
  });
  describe('Minting', function() {
    it('Should be able to switch sale status', async function() {
      expect(await contract.SALE_OPEN()).to.equal(false);
      await contract.switchSaleStatus();
      expect(await contract.SALE_OPEN()).to.equal(true);
      await contract.switchSaleStatus();
      expect(await contract.SALE_OPEN()).to.equal(false);
    });
    it('Should be able to mint one token', async function() {
      await contract.switchSaleStatus();
      await contract.mint(1,{value: MINT_PRICE_WEI});
      expect(await contract.totalSupply()).to.equal(1);
      expect(await contract.ownerOf(1)).to.equal(owner.address);
    });
    it('Should be able to transfer token', async function() {
        await contract.switchSaleStatus();
        await contract.mint(1,{value: MINT_PRICE_WEI});
        await contract.transferFrom(owner.address, user.address, 1);
        expect(await contract.totalSupply()).to.equal(1);
        expect(await contract.ownerOf(1)).to.equal(user.address);
      });
    it('Should be able to mint more tokens in one transaction', async function() {
      await contract.switchSaleStatus();
      await contract.mint(5,{value: ethers.utils.parseEther((5*MINT_PRICE).toString())});
      expect(await contract.totalSupply()).to.equal(5);
      expect(await contract.ownerOf(1)).to.equal(owner.address);
      expect(await contract.ownerOf(2)).to.equal(owner.address);
      expect(await contract.ownerOf(3)).to.equal(owner.address);
      expect(await contract.ownerOf(4)).to.equal(owner.address);
      expect(await contract.ownerOf(5)).to.equal(owner.address);
    });
    it('Should be able to mint more tokens from the same address in separate transactions ', async function() {
        await contract.switchSaleStatus();
        for (let i = 0; i<2;i++){
          await contract.connect(user).mint(2,{value: ethers.utils.parseEther((2*MINT_PRICE).toString())});
        }
        expect(await contract.totalSupply()).to.equal(4);
        expect(await contract.ownerOf(1)).to.equal(user.address);
        expect(await contract.ownerOf(2)).to.equal(user.address);
        expect(await contract.ownerOf(3)).to.equal(user.address);
        expect(await contract.ownerOf(4)).to.equal(user.address);
      });
  });
  describe('Setting up BASE_URI', function() {
    it('Should be able to setup BASE_URI', async function() {
      await contract.switchSaleStatus();
      await contract.mint(2,{value: ethers.utils.parseEther((2*MINT_PRICE).toString())});
      await contract.setBaseURI(BASE_URI);
      expect(await contract.tokenURI(1)).to.equal(BASE_URI + '1');
    });
  });
  describe('Withdrawing', function() {
    it('Should be able to withdraw funds', async function() {
      await contract.switchSaleStatus();
      await contract.mint(5,{value: ethers.utils.parseEther((5*MINT_PRICE).toString())});
      expect(await provider.getBalance(contract.address)).to.equal(ethers.utils.parseEther((5*MINT_PRICE).toString()));
      await contract.withdraw();
      expect(await provider.getBalance(contract.address)).to.equal(0);
    });
  });
});
