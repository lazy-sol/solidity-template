// run: npx hardhat deploy --network rinkeby --tags erc20_mint

// script is built for hardhat-deploy plugin:
// A Hardhat Plugin For Replicable Deployments And Easy Testing
// https://www.npmjs.com/package/hardhat-deploy

// BN utils
const {
	toBN,
	print_amt,
} = require("../scripts/include/bn_utils");

// deployment utils (contract state printers)
const {
	print_erc20_acl_details,
} = require("../scripts/deployment_utils");

// to be picked up and executed by hardhat-deploy plugin
module.exports = async function({deployments, getChainId, getNamedAccounts, getUnnamedAccounts}) {
	// print some useful info on the account we're using for the deployment
	const chainId = await getChainId();
	const [A0] = await web3.eth.getAccounts();
	let nonce = await web3.eth.getTransactionCount(A0);
	let balance = await web3.eth.getBalance(A0);

	// print initial debug information
	console.log("network %o %o", chainId, network.name);
	console.log("service account %o, nonce: %o, balance: %o ETH", A0, nonce, print_amt(balance));

	// ERC20
	{
		// get the v1 implementation and proxy deployments
		const proxy_deployment = await deployments.get("ERC20_v1"); // ERC20_Proxy
		const v1_deployment = await deployments.get("ERC20_v1");

		// print proxy info
		await print_erc20_acl_details(A0, v1_deployment.abi, proxy_deployment.address);

		// determine mint function params
		const to = A0;
		const value = toBN(10).pow(toBN(18));

		// prepare the mint call bytes for the proxy call
		const proxy = new web3.eth.Contract(v1_deployment.abi, proxy_deployment.address);
		const call_data = proxy.methods.mint(to, value).encodeABI();

		// mint the tokens requested
		const receipt = await deployments.rawTx({
			from: A0,
			to: proxy_deployment.address,
			data: call_data, // updateFeatures(actual_features)
		});
		console.log("ERC20_Proxy.mint(%o, %o): %o", to, print_amt(value), receipt.transactionHash);
	}

};

// Tags represent what the deployment script acts on. In general, it will be a single string value,
// the name of the contract it deploys or modifies.
// Then if another deploy script has such tag as a dependency, then when the latter deploy script has a specific tag
// and that tag is requested, the dependency will be executed first.
// https://www.npmjs.com/package/hardhat-deploy#deploy-scripts-tags-and-dependencies
module.exports.tags = ["erc20_mint"];
// module.exports.dependencies = ["v1_deploy"];
