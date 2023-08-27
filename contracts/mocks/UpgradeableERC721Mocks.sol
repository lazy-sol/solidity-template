// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../token/upgradeable/ERC721v1.sol";

/**
 * @title Zeppelin ERC721 Mock
 *
 * @notice Zeppelin ERC721 Mock simulates an NFT token, used for testing purposes;
 *      it still has restricted access to the mint() function
 *
 * @author Basil Gorin
 */
contract ERC721v1Mock is ERC721v1 {
	/**
	 * @dev "Constructor replacement" for upgradeable, must be execute immediately after deployment
	 *      see https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#initializers
	 *
	 * @param _name token name (ERC721Metadata)
	 * @param _symbol token symbol (ERC721Metadata)
	 */
	function postConstruct(string memory _name, string memory _symbol) public virtual initializer {
		// execute all parent initializers in cascade
		super._postConstruct(_name, _symbol, msg.sender);
	}
}

/**
 * @title Zeppelin ERC721 Mock
 *
 * @notice Zeppelin ERC721 Mock simulates an NFT token, used for testing purposes;
 *      it still has restricted access to the mint() function
 *
 * @author Basil Gorin
 */
contract ERC721v2Mock is ERC721v1 {
	// add version!
	string public version;

	/**
	 * @dev "Constructor replacement" for upgradeable, must be execute immediately after deployment
	 *      see https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#initializers
	 *
	 * @param _name token name (ERC721Metadata)
	 * @param _symbol token symbol (ERC721Metadata)
	 */
	function postConstruct(string memory _name, string memory _symbol) public virtual initializer {
		// execute all parent initializers in cascade
		super._postConstruct(_name, _symbol, msg.sender);

		// set thee version!
		version = "Version 2 (Upgraded)!";
	}
}
