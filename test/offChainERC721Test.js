const { expect } = require("chai");
const { ethers } = require("hardhat");

const fur = [
  {name:'White',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAGFBMVEUAAAD///8AAADfvqfU1NSgoKCyjXMTERDoC1piAAAAAXRSTlMAQObYZgAAARNJREFUKM9VkbGKwzAQRE3+YIzSyxtL19uQfs2a6430AzK4TnX5/RvLTi43DAI9Zge0aqrEi1ykeekimIAe4s97DwdAoe1BegOIVB3aGjBTKHZo8DWQlAHaKdoKZtMrQCumOhGSZcVV0QGeYCqZjG4HRxDsdg9LyXQcO86EZSzldhe6rANbQ9ziOlbd49q3zWWR5QTDIntHym8AKEds/gDYgb2BOxL6kTCWJrR/wLH0P2gJDPEA3dGR9IwMoNiRTSG7OnUKT7ATU+XhTLmykBPXaXCOlBurEVMujSe+GyqQzHSac/J17ST0xFfK4/w5KSJR5GslqGQr2yNu/md8gXV4PuLon88TxHVgamTjKRHZiyr4BfrNU9BDNuzNAAAAAElFTkSuQmCC'},
  {name:'Gray',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAFVBMVEUAAACyjXMAAADfvqeUXFl3RkwTERCfc+i4AAAAAXRSTlMAQObYZgAAAQlJREFUKM9V0UGOgzAMBdCKG3yT7mMXZl84gZG5AEr2nU3vf4T5BNppLQuJp58vES5tLJt1dnlNZ1iAAZbP9wEJgMPlkCEAknuCtECEw7FjILdAcQa4ySEN1vArwHUs7cRYojquDgUyYZFK48qUCGPc7uMmlauz8sy4zSK3u3Gln9g6KrSf29y1H+TSbbadMG22d5T6BsCFpesHYId4QzoS/pEIlhbIPySWfoMQAnqAHh3Fz8gEDjtqOGwf9eTIhF3CnY8Uzisba3FPgZSovLEWCeel8QkGGKGs3LLW0qCjcBd+pT3OP2dipmY/PaEJBA9F/p1f0E/Ph875+TxB+4mpmY3nmNle1OAPuP9KNkOoX8MAAAAASUVORK5CYII='},
  {name:'Black',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAFVBMVEUAAAAAAABUVFTfvqcnJyeyjXMTERCh6BJhAAAAAXRSTlMAQObYZgAAAQBJREFUKM9V0NFthDAQBFCuAw+x8++RG0DoCvBqG7AQ//cT+i8hYwO5y2pliefZFfI0CgF4YLrrAVYyEuH6jiwkjZZPiU6KzArzCLjrkh2dYQSiKaAuxjygumVSbaxjAtGhS+NMBkFtkKnzUgTwryfQeqd11gywtiZTt23RVqQ9beuoZ9pi1n8DFyxA3xHfQJpGvH4AO/gflDNhHwnX0sj8hqKl/yELnOmE+dwRTZEzoNIOuBG9ZivGIOjiZjqKm54MGrLiLEWqFxsRNz2aTk2oIKnqWBEFPTKqRh2v6ZIGJOB7EwzZ2/5Ke/hZb9iW45XWcBwXpG1Rag3TXQD6ogG/hxdGus2GU1IAAAAASUVORK5CYII='},
  {name:'Survivor',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAG1BMVEUAAAAAAADfvqf////U1NSgoKDaPDayjXMTERC+6f+SAAAAAXRSTlMAQObYZgAAARFJREFUKM9dzjGOwjAQBVDnBh6I19smDXX0Az2agT5SfIAIyb3TpKVbjr1jJwGJr2n89GdkU0KWqCKzpyJcgRpkt3eNHgCDu1VqAZSYe3SlIMJgZBTYUhhZCzo9oytwEz4DOoxr2XCjBMaZcQSswjUFNZ2u6RWcHE5uSEHHt0fdcUOb0uFEOmlu9Krzi5/bkpOf685UAw0bNAPlG2N4A3DXFbl94PKYFOQNlxgz8BumH5pMNaLbwVYmH/2A0SjINzD8ClSgCsJaKTc3UKGSaNedMDL38sifsHtFWDjGXZzKLdxjzlpRcSFOWqCnKUKUiDzR76xQZEnL0y/2r91hbl5P39rXawM/N9pqrdlDRPlQgX8Br1cKW3BhdQAAAABJRU5ErkJggg=='}
]

const head = [
  {name:'Beanie',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAADFBMVEUAAADesC8AAACygyzig7/6AAAAAXRSTlMAQObYZgAAADRJREFUGNNjYGBYtWrVCgYgYPoaGhqGg7EKCEAM7qtfa+MbgAz98Kvx4Q8wGXA1cF1DGwAAvHUdFaOI7ngAAAAASUVORK5CYII='},
  {name:'Blue Hat',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAFVBMVEUAAAAAxfAUPVwwY9MkUpn///8Xb+CzKPBIAAAAAXRSTlMAQObYZgAAAExJREFUKM9jAAElCFBggAImQ0EgCA0UggmoGAuCQaACmoAoXMBZEAIQAsYIAYQlCGuY3KA6hKECKolQASOoAhdnYwiA6YAbwTAK6AQA8i0NMLnMBUEAAAAASUVORK5CYII='},
  {name:'Rainbow Fro',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAFVBMVEUAAAAAAAAki0gAxfDp4iWtKZWxHRj6e/wSAAAAAXRSTlMAQObYZgAAAG1JREFUKM/tjs0NgDAIRmED8Kd3cQJDHKCGBXroBsb9R9C2Vk28e/KFCy98AGSYmJGhgmxepFWms3dmi4jqHIpxq5mIjKox5IHtFpHSwFOEl8iRa2mfI8Bo1qSzEwYodB5lQCWg+hkBHwU/H7ED9CEVeXhOdWcAAAAASUVORK5CYII='},
  {name:'Visor',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAElBMVEUAAAAAAAAAxfD///9RzuowY9OA/ye6AAAAAXRSTlMAQObYZgAAAC1JREFUKM9joBIQhAEBqICIszEE4BJgRNciGqQEAYpQBaFKUCCAbgnDKKATAADXjwhxIw22hAAAAABJRU5ErkJggg=='}
]

const ears = [
  {name:'None',png:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='},
  {name:'Diamond Bling',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEUAAAAAxfCf3fkiSJbrAAAAAXRSTlMAQObYZgAAACNJREFUGNNjoCtwABEsDAyME0AMSQYGthQQI80BJoJQM0gAANAXAu1JLL1KAAAAAElFTkSuQmCC'},
  {name:'Gold Hoop',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAADFBMVEUAAADesC/p4iWygywWMD4DAAAAAXRSTlMAQObYZgAAAC1JREFUGNNjoAdoABEcDAxMYJ4CkGEAYigDGQIghiIDAyOYIQjEDiAGC8MgAQALcAGZnwuuxQAAAABJRU5ErkJggg=='},
  {name:'STwo Gold Piercings',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEUAAADp4iXesC+/0+PiAAAAAXRSTlMAQObYZgAAABpJREFUGNNjoANgFACRggwMTAoghhJCZPADAF5gAImSV/7gAAAAAElFTkSuQmCC'}
]

const eyes = [
  {name:'Angry',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABRJREFUCNdjIBcIOAAJjgYkLk0AAG9gASkMl47GAAAAAElFTkSuQmCC'},
  {name:'Happy',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABRJREFUCNdjoAgYJAAJjwkQgiYAAM74AkGPa/xKAAAAAElFTkSuQmCC'},
  {name:'Rainbow Sunnies',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAKlBMVEUAAAD////p4iWRy2kkUpmtKZUlrjsAxfAwY9O6Rp3esC/aPDaGIiexHRjD61CUAAAAAXRSTlMAQObYZgAAADFJREFUKM9jGNqA5/YiIbPkCpFIuMguRWUG80ZXhBKgAgZkBQyMygkMjK4TGEYBEQAAmnoIPpGtZsYAAAAASUVORK5CYII='},
  {name:'Cyclops',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEUAAAAAAAD///+D3c/SAAAAAXRSTlMAQObYZgAAAB1JREFUGNNjoCkIdYDQjKsmQBhsy5bARRBqBjEAAGQRBPHyQj4NAAAAAElFTkSuQmCC'}
]

const nose = [
  {name:'Normal',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABFJREFUCNdjoDpgBRFM1DINAAK4AAgZ7pXcAAAAAElFTkSuQmCC'},
  {name:'Triangle',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABVJREFUCNdjoCZgAhHsIIK/gUpGAgArrwCZZLzKJAAAAABJRU5ErkJggg=='},
  {name:'Wide',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEUAAAAAAACyjXMCmAU+AAAAAXRSTlMAQObYZgAAABNJREFUGNNjGIRAEMZIc2AYaAAAXx4AuAHt6rEAAAAASUVORK5CYII='},
  {name:'X',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAADFBMVEUAAAAnJycAAABUVFTztD9wAAAAAXRSTlMAQObYZgAAABVJREFUGNNjGDyABcbQhTE4GAYcAAAgKAA6oPTpgwAAAABJRU5ErkJggg=='}
]

const mouth = [
  {name:'Big Smile',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEUAAAAAAAD///+D3c/SAAAAAXRSTlMAQObYZgAAACBJREFUGNNjGFKANTTUAcxgW7UKwmBctRIqFxrCQAMAAMVABIfzxX3aAAAAAElFTkSuQmCC'},
  {name:'Cigarette',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAADFBMVEUAAAAAAAD////ft1JteCeNAAAAAXRSTlMAQObYZgAAABVJREFUGNNjGAogNADKeLUEIUIfAABEGwLZXNgLagAAAABJRU5ErkJggg=='},
  {name:'Grillz',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAADFBMVEUAAAAAAAD////p4iVEM/MhAAAAAXRSTlMAQObYZgAAAB9JREFUGNNjGFKANTQUwmB7tRPCYNz1BMoIDWGgAQAAy/oEopz4M1EAAAAASUVORK5CYII='},
  {name:'Missing Tooth',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAADFBMVEUAAAAAAAD///+LK2OK52TNAAAAAXRSTlMAQObYZgAAAB9JREFUGNNjGFKANTQUwmBbvRLCYFy1BCoXGsBAAwAAjNcD/iN6+sgAAAAASUVORK5CYII='}
]

const feet = [
  {name:'Blue Sneakers',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAADFBMVEUAAAAkUpn///8UPVxkGBcRAAAAAXRSTlMAQObYZgAAAB9JREFUGNNjGLGAF0Rw9TMtUAXzHJgDwMKqDpwBSKoARRECzKMjW7YAAAAASUVORK5CYII='},
  {name:'Elf',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAACxHRiGIicAAAATERAFVo93AAAAAXRSTlMAQObYZgAAADZJREFUKM9jGAXDDAgwMDABKUUIz5hBUUDZgEmQRUkQImBkoCjALMwkCFfPLCgowGAoKIjdNAB7PwJ5dZ0C2wAAAABJRU5ErkJggg=='},
  {name:'Frozen',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAADFBMVEUAAAAAxfCf3fkAAAAF6gJPAAAAAXRSTlMAQObYZgAAACRJREFUGNNjGJnAgZGBDUSzujIGSIEY1xpMF4BlpBrYFiApBABjtARoNgJwbQAAAABJRU5ErkJggg=='},
  {name:'Snowboard',png:'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEUAAAAAAAAAxfCIUzjXAAAAAXRSTlMAQObYZgAAACRJREFUGNNjGMlABEZJhgawhjCGpjCwrXLgamBaNYGBMRQMHABaSgbvYKSrowAAAABJRU5ErkJggg=='}
]

describe('ERC721', function () {
  const name = 'My new NFT project';
  const symbol = 'GOAT';
  const MAX_MINT_PER_ADDRESS = 2;
  const MAX_SUPPLY = 8888;
  const MINT_PRICE = 0.1; //in ether
  const MINT_PRICE_WEI = ethers.utils.parseEther(MINT_PRICE.toString());
  const BASE_URI = 'ipfs://cid/'

  beforeEach(async function () {
    contract = await ethers.getContractFactory('OnChainERC721');

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
      await contract.mint({value: MINT_PRICE_WEI});
      expect(await contract.totalSupply()).to.equal(1);
      expect(await contract.mintedAmountByAddress(owner.address)).to.equal(1);
      expect(await contract.ownerOf(1)).to.equal(owner.address);
    });
    it('Should be able to transfer token', async function() {
      await contract.switchSaleStatus();
      await contract.mint({value: MINT_PRICE_WEI});
      await contract.transferFrom(owner.address, user.address, 1);
      expect(await contract.totalSupply()).to.equal(1);
      expect(await contract.ownerOf(1)).to.equal(user.address);
    });
    it('Should be able to mint more tokens from the same address ', async function() {
      await contract.switchSaleStatus();
      for (let i = 0; i<2;i++){
        await contract.mint({value: MINT_PRICE_WEI});
      }
      expect(await contract.totalSupply()).to.equal(2);
      expect(await contract.mintedAmountByAddress(owner.address)).to.equal(2);
      expect(await contract.ownerOf(1)).to.equal(owner.address);
      expect(await contract.ownerOf(2)).to.equal(owner.address);
    });
  });
  describe('Handeling metadata', function() {
    it('Should be able to setup metadata', async function() {
      await contract.uploadTraits(0,[0,1,2,3], fur);
      await contract.uploadTraits(1,[0,1,2,3], head);
      await contract.uploadTraits(2,[0,1,2,3], ears);
      await contract.uploadTraits(3,[0,1,2,3], eyes);
      await contract.uploadTraits(4,[0,1,2,3], nose);
      await contract.uploadTraits(5,[0,1,2,3], mouth);
      await contract.uploadTraits(6,[0,1,2,3], feet);
    });
    it('Should be able to draw SVG', async function() {
      await contract.uploadTraits(0,[0,1,2,3], fur);
      await contract.uploadTraits(1,[0,1,2,3], head);
      await contract.uploadTraits(2,[0,1,2,3], ears);
      await contract.uploadTraits(3,[0,1,2,3], eyes);
      await contract.uploadTraits(4,[0,1,2,3], nose);
      await contract.uploadTraits(5,[0,1,2,3], mouth);
      await contract.uploadTraits(6,[0,1,2,3], feet);

      await contract.drawSVG(0);
    });
  });
  describe('Withdrawing', function() {
    it('Should be able to withdraw funds', async function() {
      await contract.switchSaleStatus();
      await contract.mint({value: MINT_PRICE_WEI});
      expect(await provider.getBalance(contract.address)).to.equal(MINT_PRICE_WEI);
      await contract.withdraw();
      expect(await provider.getBalance(contract.address)).to.equal(0);
    });
  });
});
