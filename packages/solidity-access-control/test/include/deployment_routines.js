/**
 * Deploys USDT token, used to test non ERC20 compliant transfer function
 * (doesn't return any value on successful operation)
 *
 * @param a0 smart contract owner
 * @param H0 initial token holder address
 * @returns USDT ERC20 instance
 */
async function usdt_deploy(a0, H0 = a0) {
	// smart contracts required
	const USDTContract = artifacts.require("./TetherToken");

	// deploy the token
	const token = await USDTContract.new(0, "Tether USD", "USDT", 6, {from: a0});

	// move the initial supply if required
	if(H0 !== a0) {
		await token.transfer(H0, S0, {from: a0});
	}

	// return the reference
	return token;
}

/**
 * Deploys AccessControl contract
 *
 * @param a0 smart contract deployer, owner, super admin
 * @returns AccessControl instance
 */
async function access_control_deploy(a0) {
	// smart contracts required
	const ACL = artifacts.require("./AccessControl");

	// deploy ACL and return the reference
	return await ACL.new(a0, {from: a0});
}

/**
 * Deploys OwnableToAccessControlAdapter
 * Deploys OZ Ownable contract (TetherToken) if target is not specified
 *
 * @param a0 smart contract deployer, owner, super admin
 * @param target target OZ Ownable contract address or instance, optional
 * @returns OwnableToAccessControlAdapter instance
 */
async function ownable_to_acl_adapter_deploy(a0, target) {
	// deploy the target if required
	if(!target) {
		target = await usdt_deploy(a0);
	}
	// wrap the target into the Ownable if required
	else if(!target.address) {
		const Ownable = artifacts.require("Ownable");
		target = await Ownable.at(target);
	}

	// deploy adapter
	const OwnableToAccessControlAdapter = artifacts.require("OwnableToAccessControlAdapter");
	const adapter = await OwnableToAccessControlAdapter.new(target.address, {from: a0});

	// transfer ownership to the adapter
	await target.transferOwnership(adapter.address, {from: a0});

	// return both instances
	return {target, adapter};
}

// export public deployment API
module.exports = {
	access_control_deploy,
	ownable_to_acl_adapter_deploy,
}
