/**
 * Deploys UpgradeableAccessControl
 *
 * @param a0 smart contract deployer, owner, super admin
 * @param version version number to deploy, optional
 * @returns UpgradeableAccessControl instance
 */
async function upgradeable_acl_deploy(a0, version = 1) {
	// smart contracts required
	const ACL = artifacts.require("UpgradeableAccessControl" + (version || ""));

	// deploy the upgradeable ACL and return
	return await ACL.new({from: a0});
}

/**
 * Deploys UpgradeableAccessControl via ERC1967Proxy
 *
 * @param a0 smart contract deployer, owner, super admin
 * @param version version number to deploy, optional
 * @returns ERC1967Proxy –> UpgradeableAccessControl instance
 */
async function upgradeable_acl_deploy_via_proxy(a0, version = 1) {
	// smart contracts required
	const ACL = artifacts.require("UpgradeableAccessControl" + (version || ""));
	const Proxy = artifacts.require("ERC1967Proxy");

	// deploy the upgradeable ACL
	const instance = await ACL.new({from: a0});

	// prepare the initialization call bytes
	const init_data = instance.contract.methods.postConstruct().encodeABI();

	// deploy proxy, and initialize the impl (inline)
	const proxy = await Proxy.new(instance.address, init_data, {from: a0});

	// wrap the proxy into the impl ABI and return both proxy and instance
	return {proxy: await ACL.at(proxy.address), implementation: instance};
}

// export public deployment API
module.exports = {
	upgradeable_acl_deploy,
	upgradeable_acl_deploy_via_proxy,
}
