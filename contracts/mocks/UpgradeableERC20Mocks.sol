// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../token/upgradeable/ERC20v1.sol";

/**
 * @title Zeppelin ERC20 Mock
 *
 * @notice Zeppelin ERC20 Mock simulates a ERC20 token, used for testing purposes;
 *      it still has restricted access to the mint() function
 *
 * @author Basil Gorin
 */
contract ERC20v1Mock is ERC20v1 {
	/**
	 * @dev "Constructor replacement" for upgradeable, must be execute immediately after deployment
	 *      see https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#initializers
	 *
	 * @param _name token name
	 * @param _symbol token symbol
	 */
	function postConstruct(string memory _name, string memory _symbol) public virtual initializer {
		// execute all parent initializers in cascade
		super._postConstruct(_name, _symbol, msg.sender);
	}
}

/**
 * @title Zeppelin ERC20 Mock
 *
 * @notice Zeppelin ERC20 Mock simulates an NFT token, used for testing purposes;
 *      it still has restricted access to the mint() function
 *
 * @author Basil Gorin
 */
contract ERC20v2Mock is ERC20v1 {
	// add version!
	string public version;

	/**
	 * @dev "Constructor replacement" for upgradeable, must be execute immediately after deployment
	 *      see https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#initializers
	 *
	 * @param _name token name
	 * @param _symbol token symbol
	 */
	function postConstruct(string memory _name, string memory _symbol) public virtual initializer {
		// execute all parent initializers in cascade
		super._postConstruct(_name, _symbol, msg.sender);

		// set thee version!
		version = "Version 2 (Upgraded)!";
	}
}
