// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./StructLib.sol";
import "./Base64.sol";
import "./ITraits.sol";

/**
        * @dev This contract mints 1 token per transaction, for batch minting visit {../ERC721A}
        * Remember to change the name of the contract
        * In certain unlikely scenarios, there must be changes made to the contract
        * NUM_OF_TRAITS must be changed to uint64 if there is more than 4,294,967,295 traits
        * MAX_SUPPLY, totalSupply must be changed to uint64 if the supply is above 4,294,967,295
        * MAX_MINT_PER_ADDRESS & uint in mintedAmountByAddress must be changed to uint64 if user is allowed to mint more than 4,294,967,295
        * MINT_PRICE must be changed to uint128 if mint price is above 18 ETH
*/
contract OnChainERC721 is ERC721, Ownable {

    //custom errors
    error SaleNotOpen();
    error InvalidValue();
    error MintLimitReached();
    error MaxSupplyReached();
    error WithdrawalFailed();
    error ContractsNotAllowed();
    error TokenNotMinted();

    using Strings for uint32;

    bool public SALE_OPEN; 
    uint32 internal NUM_OF_TRAITS;
    uint32 immutable public MAX_MINT_PER_ADDRESS; 
    uint32 immutable public MAX_SUPPLY; 
    uint32 public totalSupply; 
    uint64 immutable public MINT_PRICE; 
    string internal BASE_URI;

     //storage of mints executed by specific address
    mapping (address => uint32) public mintedAmountByAddress; 

    //traits for animals
    ITraits public traits;

    /**
        * intitializes contract with params
        * @param _name name of the contract
        * @param _symbol symbol of the contract
        * @param _MAX_MINT_PER_ADDRESS max possible number of mints per one address
        * @param _MAX_SUPPLY max possible supply allowed
        * @param _MINT_PRICE mint price of one token
        * @param _traits contract address that stores all necessarry functions and variables for trait computation
        * @dev this contract is currently O(n), can be made more gas efficient by using O(1)
    */
    constructor(
        string memory _name,
        string memory _symbol,
        uint16 _MAX_MINT_PER_ADDRESS,
        uint16 _MAX_SUPPLY,
        uint64 _MINT_PRICE,
        address _traits
    ) 
        ERC721(_name, _symbol)
    {
        MAX_MINT_PER_ADDRESS = _MAX_MINT_PER_ADDRESS;
        MAX_SUPPLY = _MAX_SUPPLY;
        MINT_PRICE = _MINT_PRICE;
        traits = ITraits(_traits);
    }

    /**
        * switches sale status
    */
    function switchSaleStatus() external onlyOwner {
        SALE_OPEN = SALE_OPEN ? false : true;
    }

    /**
        * sets new owner of Traits contract
    */
    function setNewOwnerOfTraits(address _newOwner) external onlyOwner {
        traits.transferOwnership(_newOwner);
    }

     /**
        * withdraws funds
    */
    function withdraw() external onlyOwner {
        uint balance = address(this).balance;
        (bool sent, ) = msg.sender.call{value: balance}("");
        if (!sent) revert WithdrawalFailed();
    } 

    /**
        * mints new tokens through a public sale
    */
    function mint() payable external {
        if (tx.origin != _msgSender()) revert ContractsNotAllowed();
        if (!SALE_OPEN) revert SaleNotOpen();
        if (totalSupply >= MAX_SUPPLY) revert MaxSupplyReached();
        if (mintedAmountByAddress[_msgSender()] >= MAX_MINT_PER_ADDRESS) revert MintLimitReached();
        if (msg.value != MINT_PRICE) revert InvalidValue();

        unchecked {
			++mintedAmountByAddress[_msgSender()];       
            ++totalSupply;
		}

        _safeMint(_msgSender(), totalSupply);

        uint256 seed = traits.random(totalSupply); //add chainlink
        traits.generate(totalSupply, seed);
    }

    /**
        * uploades the names and images associated with each trait
        * @param _traitType the trait type to upload the traits for (see traits.traitTypes for a mapping)
        * @param _traits the names and base64 encoded PNGs for each trait
    */
    function uploadTraits(uint8 _traitType, uint8[] calldata _traitIds, StructLib.Trait[] calldata _traits) external onlyOwner {
        traits.uploadTraits(_traitType, _traitIds, _traits);
    }

    /**
         * generates a base64 encoded metadata response without referencing off-chain content
         * @param _tokenId the ID of the token to generate the metadata for
         * @return a base64 encoded JSON dictionary of the token's metadata and SVG
     */
    function tokenURI(uint256 _tokenId) public override view returns (string memory) {
        if (!_exists(_tokenId)) revert TokenNotMinted();
        if (tx.origin != _msgSender()) revert ContractsNotAllowed();

        uint32 tokenId = uint32(_tokenId);

        string memory metadata = string(abi.encodePacked(
            '{"name": "',
            'Animal #',
            tokenId.toString(),
            '", "description": "Colletion of ERC721 tokens with fully on-chain metadata.", "image": "data:image/svg+xml;base64,',
            Base64.base64(bytes(traits.drawSVG(tokenId))),
            '", "attributes":',
            traits.compileAttributes(tokenId), 
            "}"
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.base64(bytes(metadata))
        ));
    }

}
    

