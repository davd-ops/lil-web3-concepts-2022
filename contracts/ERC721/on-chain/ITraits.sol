// SPDX-License-Identifier: MIT 

import "./StructLib.sol";

pragma solidity ^0.8.16;

interface ITraits {
    function transferOwnership(address) external;
    function uploadTraits(uint8, uint8[] calldata, StructLib.Trait[] calldata) external;
    function generate(uint32, uint256) external returns (StructLib.Animal memory);
    function random(uint256) external returns (uint256);
    function drawSVG(uint32) external view returns (string memory);
    function compileAttributes(uint32) external view returns (string memory);
}