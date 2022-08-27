// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Base64.sol";
import "./StructLib.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

contract Traits is Ownable {

    //custom errors
    error MismatchedInput();
    error ContractsNotAllowed();

    using Strings for uint32;

    // mapping from trait type (index) to its name
    string[7] internal traitTypes = [
        "Fur",
        "Head",
        "Ears",
        "Eyes",
        "Nose",
        "Mouth",
        "Feet"
    ];

    constructor() {}

    // mapping from tokenId to a struct containing the token's traits
    mapping(uint32 => StructLib.Animal) internal tokenTraits;

    // mapping from hashed(tokenTrait) to the tokenId it's associated with
    // used to ensure there are no duplicates
    mapping(uint256 => uint32) internal existingCombinations;

    // storage of each traits name and base64 PNG data
    mapping(uint8 => mapping(uint8 => StructLib.Trait)) public traitData;

    // number of variations for each trait
    mapping(uint8 => uint8) public traitVariations;

    /**
        * uploades the names and images associated with each trait
        * @param _traitType the trait type to upload the traits for (see traitTypes for a mapping)
        * @param _traits the names and base64 encoded PNGs for each trait
    */
    function uploadTraits(uint8 _traitType, uint8[] calldata _traitIds, StructLib.Trait[] calldata _traits) external onlyOwner {
        if (_traitIds.length != _traits.length) revert MismatchedInput();
        for (uint i; i < _traits.length;) {
            traitData[_traitType][_traitIds[i]] = StructLib.Trait(
                _traits[i].name,
                _traits[i].png,
                _traits[i].weight
            );
            unchecked {
                ++i;
            }
        }
        unchecked {
            traitVariations[_traitType] += uint8(_traitIds.length);
        }
    }

    /**
         * generates traits for a specific token, checking to make sure it's unique
         * @param _tokenId the id of the token to generate traits for
         * @param _seed a pseudorandom 256 bit number to derive traits from
         * @return token - a struct of traits for the given token ID
         * @dev edit caption after chainlink
     */
    function generate(uint32 _tokenId, uint256 _seed) public onlyOwner returns (StructLib.Animal memory token) {
        token = selectTraits(_seed);
        if (existingCombinations[structToHash(token)] == 0) {
            tokenTraits[_tokenId] = token;
            existingCombinations[structToHash(token)] = _tokenId;
            return token;
        }
        return generate(_tokenId, random(_seed));
    }

    /**
         * selects the species and all of its traits based on the seed value
         * @param _seed a pseudorandom 256 bit number to derive traits from
         * @return token -  a struct of randomly selected traits
         * @dev edit caption after chainlink
         * @dev should add _ before params
     */
    function selectTraits(uint256 _seed) internal view returns (StructLib.Animal memory token) {   
        //do this proccess for every trait
        for (uint i; i < traitTypes.length;) {
            uint[] memory weights = new uint[](traitVariations[uint8(i)]);

            //calculate weightings for every trait variation
            for (uint j; j < traitVariations[uint8(i)];){
                if  (j != 0) {
                    weights[j] = traitData[uint8(i)][uint8(j)].weight + (weights[uint8(j-1)]);
                } else {
                    weights[j] = traitData[uint8(i)][uint8(j)].weight;
                }

                unchecked {
                    ++j;
                }
            }

            //generate random number (different for every trait)
            uint randomNum = (random(_seed) % weights[weights.length - 1]);
            _seed >>= 16;
            
            //find which trait is represented by that random number
            uint8 k;
            for (; k < weights.length;) {
                if (weights[k] > randomNum) break;

                unchecked {
                    ++k;
                }
            }
            
            //set chosen trait
            if (keccak256(abi.encodePacked(traitTypes[i])) == keccak256(abi.encodePacked('fur'))) {
                token.fur = k;
            } else if (keccak256(abi.encodePacked(traitTypes[i])) == keccak256(abi.encodePacked('head'))) {
                token.head = k;
            } else if (keccak256(abi.encodePacked(traitTypes[i])) == keccak256(abi.encodePacked('ears'))) {
                token.ears = k;
            } else if (keccak256(abi.encodePacked(traitTypes[i])) == keccak256(abi.encodePacked('eyes'))) {
                token.eyes = k;
            } else if (keccak256(abi.encodePacked(traitTypes[i])) == keccak256(abi.encodePacked('nose'))) {
                token.nose = k;
            } else if (keccak256(abi.encodePacked(traitTypes[i])) == keccak256(abi.encodePacked('mouth'))) {
                token.mouth = k;
            } else if (keccak256(abi.encodePacked(traitTypes[i])) == keccak256(abi.encodePacked('feet'))) {
                token.feet = k;
            }
            
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
    function drawTrait(StructLib.Trait memory _trait) internal pure returns (string memory) {
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
        StructLib.Animal memory token = tokenTraits[_tokenId];

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
         * @param _traitType the trait type to reference as the metadata key
         * @param _value the token's trait associated with the key
         * @return a JSON dictionary for the single attribute
     */
    function attributeForTypeAndValue(string memory _traitType, string memory _value) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{"trait_type":"',
                _traitType,
                   '","value":"',
                _value,
            '"}'
        ));
    }

    /**
         * generates an array composed of all the individual traits and values
         * @param _tokenId the ID of the token to compose the metadata for
         * @return a JSON array of all of the attributes for given token ID
     */
    function compileAttributes(uint32 _tokenId) internal view returns (string memory) {
        StructLib.Animal memory token = tokenTraits[_tokenId];
        string memory traits;
        traits = string(abi.encodePacked(
            attributeForTypeAndValue(traitTypes[0], traitData[0][token.fur].name),',',
            attributeForTypeAndValue(traitTypes[1], traitData[1][token.head].name),',',
            attributeForTypeAndValue(traitTypes[2], traitData[2][token.ears].name),',',
            attributeForTypeAndValue(traitTypes[3], traitData[3][token.eyes].name),',',
            attributeForTypeAndValue(traitTypes[4], traitData[4][token.nose].name),',',
            attributeForTypeAndValue(traitTypes[5], traitData[5][token.mouth].name),',',
            attributeForTypeAndValue(traitTypes[6], traitData[6][token.feet].name),','
        ));
        return string(abi.encodePacked(
            '[',
                traits,
            ']'
        ));
    }

    /**
         * converts a struct to a 256 bit hash to check for uniqueness
         * @param _token the struct to pack into a hash
         * @return the 256 bit hash of the struct
    */
    function structToHash(StructLib.Animal memory _token) internal pure returns (uint256) {
        return uint256(bytes32(
            abi.encodePacked(
                _token.fur,
                _token.head,
                _token.eyes,
                _token.mouth,
                _token.ears,
                _token.feet
            )
        ));
    }

    /**
        * generates a pseudorandom number
        * @param _seed a value ensure different outcomes for different sources in the same block
        * @return a pseudorandom value
        * @dev change to chainlink & edit caption after chainlink
    */
    function random(uint256 _seed) public view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
        tx.origin,
        blockhash(block.number - 1),
        block.timestamp,
        _seed
        )));
    }

    /**
         * generates a base64 encoded metadata response without referencing off-chain content
         * @param _tokenId the ID of the token to generate the metadata for
         * @return a base64 encoded JSON dictionary of the token's metadata and SVG
     */
    function tokenURI(uint32 _tokenId) external view onlyOwner returns (string memory) {
        if (tx.origin != _msgSender()) revert ContractsNotAllowed();
        
        string memory metadata = string(abi.encodePacked(
            '{"name": "',
            'Animal #',
            _tokenId.toString(),
            '", "description": "Colletion of ERC721 tokens with fully on-chain metadata.", "image": "data:image/svg+xml;base64,',
            Base64.base64(bytes(drawSVG(_tokenId))),
            '", "attributes":',
            compileAttributes(_tokenId),
            "}"
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.base64(bytes(metadata))
        ));
    }

}