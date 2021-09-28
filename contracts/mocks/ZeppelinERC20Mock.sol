// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "../token/ERC20Impl.sol";

/**
 * @title Zeppelin ERC20 Mock
 *
 * @notice Zeppelin ERC20 Mock simulates an ERC20 token, used for testing purposes;
 *      it still has restricted access to the mint() function
 *
 * @author Basil Gorin
 */
contract ZeppelinERC20Mock is ERC20Impl {
	/**
	 * @dev Creates/deploys an ERC20 Mock instance
	 *
	 * @param _name token name (ERC20Metadata)
	 * @param _symbol toke symbol (ERC20Metadata)
	 */
	constructor(string memory _name, string memory _symbol) ERC20Impl(_name, _symbol) {}

	function transferInternal(
		address from,
		address to,
		uint256 value
	) public {
		_transfer(from, to, value);
	}

	function approveInternal(
		address owner,
		address spender,
		uint256 value
	) public {
		_approve(owner, spender, value);
	}
}
