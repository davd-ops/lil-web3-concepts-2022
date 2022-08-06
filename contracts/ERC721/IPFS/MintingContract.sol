// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import"./ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CoreContract is ERC721, Ownable {

    error SaleNotOpen();
    error InvalidValue();
    error MintLimitReached();
    error MaxSupplyReached();

    /**
        * @dev This contracts mints 1 token per transaction, for batch minting visit {../ERC721A}
        * default values are 0 or false, assigning them would just waste gas
        * In certain unlikely scenarios, there must be changes made to the contract
        * MAX_MINT_PER_ADDRESS must be changed to uint16 if the supply is above 255
        * MAX_SUPPLY & totalSupply must be changed to uint32 if the supply is above 65,000
        * MINT_PRICE must be changed to uint128 if mint price is above 18 ETH
    */
    bool public SALE_OPEN; 
    uint8 immutable public MAX_MINT_PER_WALLET; 
    uint16 immutable public MAX_SUPPLY; 
    uint16 public totalSupply; 
    uint64 public MINT_PRICE; 

    mapping (address => uint) mintedAmountByAddress;

    /**
        * @dev intitializes contract with a `name`, `symbol`, `MAX_MINT_PER_WALLET`, 
        * `MAX_SUPPLY`, `totalSupply` and a `MINT_PRICE` variables 
    */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _MAX_MINT_PER_TRANSACTION,
        uint16 _MAX_SUPPLY,
        uint64 _MINT_PRICE
    ) 
        ERC721(_name, _symbol)
    {
        MAX_MINT_PER_WALLET = _MAX_MINT_PER_TRANSACTION;
        MAX_SUPPLY = _MAX_SUPPLY;
        MINT_PRICE = _MINT_PRICE;
    }

    function doSmth() public pure returns (uint64) {
        return 0.1 ether;
    }

    /**
        * @dev used for minting new tokens through a public sale
    */
    function mint(address _to, uint8 amount) payable public {
        if (!SALE_OPEN) revert SaleNotOpen();
         if (mintedAmountByAddress[_msgSender()] >= MAX_MINT_PER_WALLET) revert MintLimitReached();
        if ((totalSupply+amount) > MAX_SUPPLY) revert MaxSupplyReached();
        if (msg.value != (MINT_PRICE*amount)) revert InvalidValue();

        ++mintedAmountByAddress[_msgSender()];
        
        _safeMint(_to, amount);
    }

    /**
        * @dev used for switching sale status
    */
    function switchSaleStatus() external onlyOwner {
        SALE_OPEN = SALE_OPEN ? false : true;
    }
}