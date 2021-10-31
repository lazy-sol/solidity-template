/**
 * Deploys Access Control Mock
 *
 * @param a0 smart contract deployer, owner, super admin
 * @returns AccessControl instance
 */
async function acl_mock_deploy(a0) {
	// smart contracts required
	const ACL = artifacts.require("./AccessControlMock");

	// deploy ACL and return the reference
	return await ACL.new({from: a0});
}

// export public deployment API
module.exports = {
	acl_mock_deploy,
}
