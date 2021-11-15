// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./UpgradeableERC721Mock.sol";

/**
 * @title Zeppelin ERC721 Mock
 *
 * @notice Zeppelin ERC721 Mock simulates an NFT token, used for testing purposes;
 *      it still has restricted access to the mint() function
 *
 * @author Basil Gorin
 */
contract UpgradeableERC721Mock2 is UpgradeableERC721Mock {
	// add version!
	string public version;

	/**
	 * @dev An initializer, a "constructor replacement",
	 *      see https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#initializers
	 *
	 * @param _name token name (ERC721Metadata)
	 * @param _symbol token symbol (ERC721Metadata)
	 */
	function initialize(string memory _name, string memory _symbol, address _owner) public virtual override initializer {
		// execute all parent initializers in cascade
		super._initialize(_name, _symbol, _owner);

		// set thee version!
		version = "Version 2 (Upgraded)!";
	}
}
