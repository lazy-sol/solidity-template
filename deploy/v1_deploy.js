// deploy: npx hardhat deploy --network rinkeby --tags v1_deploy
// verify: npx hardhat etherscan-verify --network rinkeby

// script is built for hardhat-deploy plugin:
// A Hardhat Plugin For Replicable Deployments And Easy Testing
// https://www.npmjs.com/package/hardhat-deploy

// BN utils
const {
	toBN,
	print_amt,
} = require("../scripts/include/bn_utils");

// ERC20 token name and symbol
const {
	NAME: ERC20_NAME,
	SYMBOL: ERC20_SYMBOL,
} = require("../scripts/include/erc20_constants");

// ERC721 token name and symbol
const {
	NAME: NFT_NAME,
	SYMBOL: NFT_SYMBOL,
} = require("../scripts/include/erc721_constants");

// deployment utils (contract state printers)
const {
	print_erc20_acl_details,
	print_nft_acl_details,
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

	// deploy ERC20 implementation v1 if required
	await deployments.deploy("ERC20_v1", {
		// address (or private key) that will perform the transaction.
		// you can use `getNamedAccounts` to retrieve the address you want by name.
		from: A0,
		contract: "ZeppelinERC20Mock",
		// the list of argument for the constructor (or the upgrade function in case of proxy)
		args: [ERC20_NAME, ERC20_SYMBOL],
		// if set it to true, will not attempt to deploy even if the contract deployed under the same name is different
		skipIfAlreadyDeployed: true,
		// if true, it will log the result of the deployment (tx hash, address and gas used)
		log: true,
	});
	// get ERC20 implementation v1 deployment details
	const erc20_v1_deployment = await deployments.get("ERC20_v1");
	const er20_v1_contract = new web3.eth.Contract(erc20_v1_deployment.abi, erc20_v1_deployment.address);

	// print ERC20 impl deployment details
	await print_erc20_acl_details(A0, erc20_v1_deployment.abi, erc20_v1_deployment.address);

	// deploy ERC721 implementation v1 if required
	await deployments.deploy("ERC721_v1", {
		// address (or private key) that will perform the transaction.
		// you can use `getNamedAccounts` to retrieve the address you want by name.
		from: A0,
		contract: "UpgradeableERC721Mock",
		// the list of argument for the constructor (or the upgrade function in case of proxy)
		// args: [NAME, SYMBOL],
		// if set it to true, will not attempt to deploy even if the contract deployed under the same name is different
		skipIfAlreadyDeployed: true,
		// if true, it will log the result of the deployment (tx hash, address and gas used)
		log: true,
	});
	// get ERC721 implementation v1 deployment details
	const nft_v1_deployment = await deployments.get("ERC721_v1");
	const nft_v1_contract = new web3.eth.Contract(nft_v1_deployment.abi, nft_v1_deployment.address);

	// prepare the initialization call bytes
	const nft_proxy_init_data = nft_v1_contract.methods.postConstruct(NFT_NAME, NFT_SYMBOL).encodeABI();

	// deploy ERC721 Proxy
	await deployments.deploy("ERC721_Proxy", {
		// address (or private key) that will perform the transaction.
		// you can use `getNamedAccounts` to retrieve the address you want by name.
		from: A0,
		contract: "ERC1967Proxy",
		// the list of argument for the constructor (or the upgrade function in case of proxy)
		args: [nft_v1_deployment.address, nft_proxy_init_data],
		// if set it to true, will not attempt to deploy even if the contract deployed under the same name is different
		skipIfAlreadyDeployed: true,
		// if true, it will log the result of the deployment (tx hash, address and gas used)
		log: true,
	});
	// get ERC721 proxy deployment details
	const nft_proxy_deployment = await deployments.get("ERC721_Proxy");
	// print ERC721 proxy deployment details
	await print_nft_acl_details(A0, nft_v1_deployment.abi, nft_proxy_deployment.address);
};

// Tags represent what the deployment script acts on. In general, it will be a single string value,
// the name of the contract it deploys or modifies.
// Then if another deploy script has such tag as a dependency, then when the latter deploy script has a specific tag
// and that tag is requested, the dependency will be executed first.
// https://www.npmjs.com/package/hardhat-deploy#deploy-scripts-tags-and-dependencies
module.exports.tags = ["v1_deploy", "deploy", "v1"];
