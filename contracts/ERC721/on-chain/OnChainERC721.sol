// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/**
        * @dev This contract mints 1 token per transaction, for batch minting visit {../ERC721A}
        * Remember to change the name of the contract
        * In certain unlikely scenarios, there must be changes made to the contract
        * MAX_SUPPLY, totalSupply must be changed to uint64 if the supply is above 4,294,967,295
        * MAX_MINT_PER_ADDRESS & uint in mintedAmountByAddress must be changed to uint64 if user is allowed to mint more than 4,294,967,295
        * MINT_PRICE must be changed to uint128 if mint price is above 18 ETH
*/
contract OnChainERC721 is ERC721, Ownable {

    error SaleNotOpen();
    error InvalidValue();
    error MintLimitReached();
    error MaxSupplyReached();
    error WithdrawalFailed();
    error MismatchedInput();
    error TokenNotMinted();

    using Strings for uint32;

    bool public SALE_OPEN; 
    uint32 immutable public MAX_MINT_PER_ADDRESS; 
    uint32 immutable public MAX_SUPPLY; 
    uint32 public totalSupply; 
    uint64 immutable public MINT_PRICE; 
    string internal BASE_URI;

    // struct to store each trait's data for metadata and rendering
    struct Trait {
        string name;
        string png;
    }

    // struct to store each token's traits
    struct Animal {
        uint8 fur;
        uint8 head;
        uint8 ears;
        uint8 eyes;
        uint8 nose;
        uint8 mouth;
        uint8 feet;
    }

    // mapping from trait type (index) to its name
    string[7] _traitTypes = [
        "Fur",
        "Head",
        "Ears",
        "Eyes",
        "Nose",
        "Mouth",
        "Feet"
    ];

     //storage of mints executed by specific address
    mapping (address => uint32) public mintedAmountByAddress; 

    // mapping from tokenId to a struct containing the token's traits
    mapping(uint32 => Animal) internal tokenTraits;

    // mapping from hashed(tokenTrait) to the tokenId it's associated with
    // used to ensure there are no duplicates
    mapping(uint32 => uint256) public existingCombinations;

    // storage of each traits name and base64 PNG data
    mapping(uint8 => mapping(uint8 => Trait)) public traitData;

    /**
        * intitializes contract with a `name`, `symbol`, 
        * `MAX_MINT_PER_WALLET`, `MAX_SUPPLY` and a `MINT_PRICE` variables 
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
        * mints new tokens through a public sale
        * @dev add generation of metadata
    */
    function mint() payable external {
        if (!SALE_OPEN) revert SaleNotOpen();
        if (totalSupply >= MAX_SUPPLY) revert MaxSupplyReached();
        if (mintedAmountByAddress[_msgSender()] >= MAX_MINT_PER_ADDRESS) revert MintLimitReached();
        if (msg.value != MINT_PRICE) revert InvalidValue();

        unchecked {
			++mintedAmountByAddress[_msgSender()];       
            ++totalSupply;
		}

        _safeMint(_msgSender(), totalSupply);
    }

    /**
        * switches sale status
    */
    function switchSaleStatus() external onlyOwner {
        SALE_OPEN = SALE_OPEN ? false : true;
    }

     /**
        * withdraws funds
    */
    function withdraw() external onlyOwner {
        uint balance = address(this).balance;
        (bool sent, ) = msg.sender.call{value: balance}("");
        if (!sent) revert WithdrawalFailed();
    } 

    // **********
    // RENDERING PART OF THE CONTRACT
    //                     **********

    /**
        * uploades the names and images associated with each trait
        * @param _traitType the trait type to upload the traits for (see traitTypes for a mapping)
        * @param _traits the names and base64 encoded PNGs for each trait
    */
    function uploadTraits(uint8 _traitType, uint8[] calldata _traitIds, Trait[] calldata _traits) external onlyOwner {
        if (_traitIds.length != _traits.length) revert MismatchedInput();
        for (uint i = 0; i < _traits.length;) {
            traitData[_traitType][_traitIds[i]] = Trait(
                _traits[i].name,
                _traits[i].png
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
         * generates an <image> element using base64 encoded PNGs
         * @param _trait the trait storing the PNG data
         * @return the <image> element
     */
    function drawTrait(Trait memory _trait) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<image x="4" y="4" width="32" height="32" image-rendering="pixelated" preserveAspectRatio="xMidYMid" xlink:href="data:image/png;base64,',
                _trait.png,
            '"/>'
        ));
    }

     /**
        * generates an entire SVG by composing multiple <image> elements of PNGs
        * @param _tokenId the ID of the token to generate an SVG for
        * @return a valid SVG of the animal
        * @dev it is possible that there are no traits assigned now
    */
    function drawSVG(uint32 _tokenId) internal view returns (string memory) {
        Animal memory token = tokenTraits[_tokenId];

        string memory svgString = string(abi.encodePacked(
            drawTrait(traitData[0][token.fur]),
            drawTrait(traitData[1][token.head]),
            drawTrait(traitData[2][token.ears]),
            drawTrait(traitData[3][token.eyes]),
            drawTrait(traitData[4][token.nose]),
            drawTrait(traitData[5][token.mouth]),
            drawTrait(traitData[6][token.feet])
        ));

        return string(abi.encodePacked(
            '<svg id="animal" width="100%" height="100%" version="1.1" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
                svgString,
            "</svg>"
        ));
    }

    /**
         * generates an attribute for the attributes array in the ERC721 metadata standard
         * @param traitType the trait type to reference as the metadata key
         * @param value the token's trait associated with the key
         * @return a JSON dictionary for the single attribute
     */
    function attributeForTypeAndValue(string memory traitType, string memory value) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{"trait_type":"',
                traitType,
                   '","value":"',
                value,
            '"}'
        ));
    }

    /**
         * generates an array composed of all the individual traits and values
         * @param _tokenId the ID of the token to compose the metadata for
         * @return a JSON array of all of the attributes for given token ID
     */
    function compileAttributes(uint32 _tokenId) internal view returns (string memory) {
        
        Animal memory token = tokenTraits[_tokenId];
        string memory traits;
        traits = string(abi.encodePacked(
            attributeForTypeAndValue(_traitTypes[0], traitData[0][token.fur].name),',',
            attributeForTypeAndValue(_traitTypes[1], traitData[1][token.head].name),',',
            attributeForTypeAndValue(_traitTypes[2], traitData[2][token.ears].name),',',
            attributeForTypeAndValue(_traitTypes[3], traitData[3][token.eyes].name),',',
            attributeForTypeAndValue(_traitTypes[4], traitData[4][token.nose].name),',',
            attributeForTypeAndValue(_traitTypes[5], traitData[5][token.mouth].name),',',
            attributeForTypeAndValue(_traitTypes[6], traitData[6][token.feet].name),','
        ));
        return string(abi.encodePacked(
            '[',
                traits,
            ']'
        ));
    }

    /**
         * generates a base64 encoded metadata response without referencing off-chain content
         * @param _tokenId the ID of the token to generate the metadata for
         * @return a base64 encoded JSON dictionary of the token's metadata and SVG
     */
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        if (!_exists(_tokenId)) revert TokenNotMinted();

        uint32 tokenId = uint32(_tokenId);

        string memory metadata = string(abi.encodePacked(
            '{"name": "',
            'Animal #',
            tokenId.toString(),
            '", "description": "Colletion of ERC721 tokens with fully on-chain metadata.", "image": "data:image/svg+xml;base64,',
            base64(bytes(drawSVG(tokenId))),
            '", "attributes":',
            compileAttributes(tokenId),
            "}"
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            base64(bytes(metadata))
        ));
    }

    /** BASE 64 library - Written by Brech Devos */
  
    string internal constant TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    function base64(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return '';
        
        // load the table into memory
        string memory table = TABLE;

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((data.length + 2) / 3);

        // add some extra buffer at the end required for the writing
        string memory result = new string(encodedLen + 32);

        assembly {
            // set the actual output length
            mstore(result, encodedLen)
            
            // prepare the lookup table
            let tablePtr := add(table, 1)
            
            // input ptr
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))
            
            // result ptr, jump over length
            let resultPtr := add(result, 32)
            
            // run over the input, 3 bytes at a time
            for {} lt(dataPtr, endPtr) {}
            {
                dataPtr := add(dataPtr, 3)
                
                // read 3 bytes
                let input := mload(dataPtr)
                
                // write 4 characters
                mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(18, input), 0x3F)))))
                resultPtr := add(resultPtr, 1)
                mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(12, input), 0x3F)))))
                resultPtr := add(resultPtr, 1)
                mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr( 6, input), 0x3F)))))
                resultPtr := add(resultPtr, 1)
                mstore(resultPtr, shl(248, mload(add(tablePtr, and(        input,  0x3F)))))
                resultPtr := add(resultPtr, 1)
            }
            
            // padding with '='
            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
        }
        
        return result;
    }
}