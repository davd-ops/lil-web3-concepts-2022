// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

 library StructLib {
    // struct to store each trait's data for metadata and rendering
    struct Trait {
        string name;
        string png;
        uint8 weight;
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
}
