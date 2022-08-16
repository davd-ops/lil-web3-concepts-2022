// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MintingContract is ERC721, Ownable {

    error SaleNotOpen();
    error InvalidValue();
    error MintLimitReached();
    error MaxSupplyReached();
    error WithdrawalFailed();

    /**
        * @dev This contract mints 1 token per transaction, for batch minting visit {../ERC721A}
        * Remember to change the name of the contract
        * In certain unlikely scenarios, there must be changes made to the contract
        * MAX_MINT_PER_ADDRESS must be changed to uint64 if the supply is above 255
        * MAX_SUPPLY, totalSupply must be changed to uint64 if the supply is above 4,294,967,295
        * MAX_MINT_PER_ADDRESS & uint in mintedAmountByAddress must be changed to uint64 if user is allowed to mint more than 4,294,967,295
        * MINT_PRICE must be changed to uint128 if mint price is above 18 ETH
    */
    bool public SALE_OPEN; 
    uint32 immutable public MAX_MINT_PER_ADDRESS; 
    uint32 immutable public MAX_SUPPLY; 
    uint32 public totalSupply; 
    uint64 public MINT_PRICE; 
    string internal BASE_URI;

    mapping (address => uint32) public mintedAmountByAddress; 

    /**
        * @dev intitializes contract with a `name`, `symbol`, `MAX_MINT_PER_WALLET`, 
        * `MAX_SUPPLY`, `totalSupply` and a `MINT_PRICE` variables 
    */
    constructor(
        string memory _name,
        string memory _symbol,
        uint16 _MAX_MINT_PER_ADDRESS,
        uint16 _MAX_SUPPLY,
        uint64 _MINT_PRICE
    ) 
        ERC721(_name, _symbol)
    {
        MAX_MINT_PER_ADDRESS = _MAX_MINT_PER_ADDRESS;
        MAX_SUPPLY = _MAX_SUPPLY;
        MINT_PRICE = _MINT_PRICE;
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`.
     */
    function _baseURI() internal view override returns (string memory) {
        return BASE_URI;
    }

    /**
        * @dev used for minting new tokens through a public sale
    */
    function mint() payable public {
        if (!SALE_OPEN) revert SaleNotOpen();
        if (mintedAmountByAddress[_msgSender()] >= MAX_MINT_PER_ADDRESS) revert MintLimitReached();
        if (totalSupply >= MAX_SUPPLY) revert MaxSupplyReached();
        if (msg.value != MINT_PRICE) revert InvalidValue();

        unchecked {
			++mintedAmountByAddress[_msgSender()];       
            ++totalSupply;
		}

        _safeMint(_msgSender(), totalSupply);
    }

    /**
        * @dev used for switching sale status
    */
    function switchSaleStatus() external onlyOwner {
        SALE_OPEN = SALE_OPEN ? false : true;
    }

     /**
        * @dev used for withdrawing funds
    */
    function withdraw() external onlyOwner {
        uint balance = address(this).balance;
        (bool sent, ) = msg.sender.call{value: balance}("");
        if (!sent) revert WithdrawalFailed();
    } 

    /**
     * @dev used to setup BASE_URI, which will be used for computing tokenURI
     * make sure that your URI ends up with /
     */
    function setBaseURI(string calldata _newBaseURI) external onlyOwner {
        BASE_URI = _newBaseURI;
    }
}