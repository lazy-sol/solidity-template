// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../UpgradeableAccessControl.sol";

contract UpgradeableAccessControl1 is UpgradeableAccessControl {
	string public version1;

	function postConstruct() public virtual initializer {
		super._postConstruct(msg.sender);
		version1 = "1";
	}
}

contract UpgradeableAccessControl2 is UpgradeableAccessControl {
	string public version2;

	function postConstruct() public virtual initializer {
		super._postConstruct(msg.sender);
		version2 = "2";
	}
}
