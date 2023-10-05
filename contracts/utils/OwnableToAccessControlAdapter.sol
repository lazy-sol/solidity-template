// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./AccessControl.sol";

/**
 * @title OZ Ownable to AccessControl Adapter
 *
 * @notice Helper contract allowing to change the access model of the already deployed
 *      OpenZeppelin Ownable contract to the AccessControl model
 */
contract OwnableToAccessControlAdapter is AccessControl {
	address public immutable target;

	mapping(bytes4 => uint256) public accessRoles;

	uint256 public constant ROLE_ACCESS_ROLES_MANAGER = 0x2000000000000000000000000000000000000000000000000000000000000000;

	event AccessRoleUpdated(bytes4 selector, uint256 role);
	event ExecutionComplete(bytes4 selector, bytes data, bytes result);

	constructor(address _target) AccessControl(msg.sender) {
		require(_target != address(0), "zero address");
		target = _target;
	}

	function updateAccessRole(string memory signature, uint256 role) public {
		// delegate to `updateAccessRole(bytes4, uint256)`
		updateAccessRole(bytes4(keccak256(bytes(signature))), role);
	}

	function updateAccessRole(bytes4 selector, uint256 role) public {
		// verify the access permission
		require(isSenderInRole(ROLE_ACCESS_ROLES_MANAGER), "access denied");

		// update the function access role
		accessRoles[selector] = role;

		// emit an event
		emit AccessRoleUpdated(selector, role);
	}

	function execute(bytes memory data) public payable returns(bytes memory) {
		// extract the selector (first 4 bytes as bytes4) using assembly
		bytes4 selector;
		assembly {
			// load the first word after the length field
			selector := mload(add(data, 32))
		}

		// zero data length means we're trying to execute the receive() function on
		// the target and supply some ether to the target; in this case we don't need a security check
		// if the data is present, we're executing some real function and must do a security check
		if(data.length != 0) {
			// determine the role required to access the function
			uint256 roleRequired = accessRoles[selector];

			// verify function access role was already set
			require(roleRequired != 0, "access role not set");

			// verify the access permission
			require(isSenderInRole(roleRequired), "access denied");
		}

		// execute the call on the target
		(bool success, bytes memory result) = address(target).call{value: msg.value}(data);

		// verify the execution completed successfully
		require(success, "execution failed");

		// emit an event
		emit ExecutionComplete(selector, data, result);

		// return the result
		return result;
	}

	receive() external payable {
		// delegate to `execute(bytes)`
		execute(bytes(""));
	}

	fallback() external payable {
		// msg.data contains full calldata: function selector + encoded function arguments (if any)
		// delegate to `execute(bytes)`
		execute(msg.data);
	}
}
