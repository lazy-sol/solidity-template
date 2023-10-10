// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2;

import "./OwnableToAccessControlAdapter.sol";

/**
 * @notice Ownable is a contract which is aware of its owner, that is has owner() function
 */
interface Ownable {
	/**
	 * @notice Smart contract owner
	 *
	 * @return the address of the smart contract owner
	 */
	function owner() external returns(address);
}

/**
 * @title Adapter Factory
 *
 * @notice Helper contract simplifying the deployment of the OwnableToAccessControlAdapter
 *
 * @author Basil Gorin
 */
contract AdapterFactory {
	/**
	 * @dev Fired in deployNewOwnableToAccessControlAdapter
	 *
	 * @param adapterAddress newly deployed OwnableToAccessControlAdapter address
	 * @param ownableTargetAddress OZ Ownable target contract address
	 */
	event NewOwnableToAccessControlAdapterDeployed(address indexed adapterAddress, address indexed ownableTargetAddress);

	/**
	 * @notice Deploys new OwnableToAccessControlAdapter bound to the OZ Ownable contract specified.
	 *      Can be executed only by the OZ Ownable target owner. This owner is expected to transfer
	 *      the ownership to the newly deployed OwnableToAccessControlAdapter contract address.
	 *
	 * @param targetAddress OZ Ownable target address to bind OwnableToAccessControlAdapter to
	 * @return address of the newly deployed OwnableToAccessControlAdapter contract
	 */
	function deployNewOwnableToAccessControlAdapter(address targetAddress) public returns(address) {
		// verify sender is a target owner
		require(Ownable(targetAddress).owner() == msg.sender, "not an owner");

		// deploy the OwnableToAccessControlAdapter
		// and set its ownership immediately to the tx executor (msg.sender)
		address adapterAddress = address(new OwnableToAccessControlAdapter(targetAddress, msg.sender));

		// emit an event
		emit NewOwnableToAccessControlAdapterDeployed(adapterAddress, targetAddress);

		// return address of the newly deployed OwnableToAccessControlAdapter contract
		return adapterAddress;
	}
}
