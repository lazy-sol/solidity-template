// deploy: npx hardhat deploy --network goerli --tags setup-OwnableToAccessControlAdapter
// verify: npx hardhat etherscan-verify --network goerli --api-key $ETHERSCAN_KEY

// script is built for hardhat-deploy plugin:
// A Hardhat Plugin For Replicable Deployments And Easy Testing
// https://www.npmjs.com/package/hardhat-deploy

// BN utils
const {
	toBN,
	print_amt,
} = require("../scripts/include/bn_utils");

// token name and symbol
const {
	NAME,
	SYMBOL,
} = require("../scripts/include/erc20_constants");

// deployment utils (contract state printers)
const {
	print_contract_details,
} = require("../scripts/deployment_utils");

// to be picked up and executed by hardhat-deploy plugin
module.exports = async function({deployments, getChainId, getNamedAccounts, getUnnamedAccounts}) {
	// print some useful info on the account we're using for the deployment
	const chainId = await getChainId();
	const accounts = await web3.eth.getAccounts();
	// do not use the default account for tests
	const A0 = network.name === "hardhat"? accounts[1]: accounts[0];
	const nonce = await web3.eth.getTransactionCount(A0);
	const balance = await web3.eth.getBalance(A0);

	// print initial debug information
	console.log("script: %o", require("path").basename(__filename));
	console.log("network %o %o", chainId, network.name);
	console.log("accounts: %o, service account %o, nonce: %o, balance: %o ETH", accounts.length, A0, nonce, print_amt(balance));

	// TetherToken (OZ Ownable)
	{
		// get target deployment details
		const target_deployment = await deployments.get("TetherToken");
		const target_contract = new web3.eth.Contract(target_deployment.abi, target_deployment.address);

		// get adapter deployment details
		const adapter_deployment = await deployments.get("OwnableToAccessControlAdapter");
		const adapter_contract = new web3.eth.Contract(adapter_deployment.abi, adapter_deployment.address);

		// print contract details, and read the ownership info
		const {owner} = await print_contract_details(A0, target_deployment.abi, target_deployment.address);
		// verify if the ownership was transferred and transfer if required
		if(owner === A0) {
			// prepare the call bytes
			const call_data = target_contract.methods.transferOwnership(adapter_deployment.address).encodeABI();

			// low-level execute the call bytes
			const receipt = await deployments.rawTx({
				from: A0,
				to: target_deployment.address,
				data: call_data, // transferOwnership(adapter_deployment.address)
			});
			console.log("TetherToken.transferOwnership(%o): %o", adapter_deployment.address, receipt.transactionHash);
		}
		else if(owner !== target_deployment.address) {
			console.log();
			console.log("╔════════════════════════════════════════════════════════════════════════════════════════════════╗");
			console.log("║                                            WARNING!                                            ║");
			console.log("╠════════════════════════════════════════════════════════════════════════════════════════════════╣");
			console.log("║ TetherToken ownership wasn't transferred to the OwnableToAccessControlAdapter: not an owner    ║");
			console.log("║ Please transfer TetherToken ownership to the OwnableToAccessControlAdapter manually.           ║");
			console.log("╚════════════════════════════════════════════════════════════════════════════════════════════════╝");
			console.log();
		}
	}
};

// Tags represent what the deployment script acts on. In general, it will be a single string value,
// the name of the contract it deploys or modifies.
// Then if another deploy script has such tag as a dependency, then when the latter deploy script has a specific tag
// and that tag is requested, the dependency will be executed first.
// https://www.npmjs.com/package/hardhat-deploy#deploy-scripts-tags-and-dependencies
module.exports.tags = ["setup-OwnableToAccessControlAdapter", "setup"];
module.exports.dependencies = ["OwnableToAccessControlAdapter", "TetherToken"];
