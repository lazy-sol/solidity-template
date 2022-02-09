// Hardhat configuration which uses account private key instead of mnemonic
// use --config hardhat.config-p_key.js to run hardhat with this configuration
// script expects following environment variables to be set:
//   - P_KEY1 – mainnet private key, should start with 0x
//   - P_KEY3 – ropsten private key, should start with 0x
//   - P_KEY4 – rinkeby private key, should start with 0x
//   - INFURA_KEY – Infura API key (Project ID)
//   - ETHERSCAN_KEY – Etherscan API key

// Loads env variables from .env file
require('dotenv').config()

// Enable Truffle 5 plugin for tests
// https://hardhat.org/guides/truffle-testing.html
require("@nomiclabs/hardhat-truffle5");

// enable etherscan integration
// https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html
require("@nomiclabs/hardhat-etherscan");

// enable Solidity-coverage
// https://hardhat.org/plugins/solidity-coverage.html
require("solidity-coverage");

// adds a mechanism to deploy contracts to any network,
// keeping track of them and replicating the same environment for testing
// https://www.npmjs.com/package/hardhat-deploy
require("hardhat-deploy");

// verify environment setup and display warning if required
// m/44'/60'/0'/0/0 for "test test test test test test test test test test test junk" mnemonic
const FAKE_P_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
if(!process.env.P_KEY1) {
	console.warn("P_KEY1 is not set. Mainnet deployments won't be available");
	process.env.P_KEY1 = FAKE_P_KEY;
}
else if(!process.env.P_KEY1.startsWith("0x")) {
	console.warn("P_KEY1 doesn't start with 0x. Appended 0x");
	process.env.P_KEY1 = "0x" + process.env.P_KEY1;
}
if(!process.env.P_KEY3) {
	console.warn("P_KEY3 is not set. Rinkeby deployments won't be available");
	process.env.P_KEY3 = FAKE_P_KEY;
}
else if(!process.env.P_KEY3.startsWith("0x")) {
	console.warn("P_KEY3 doesn't start with 0x. Appended 0x");
	process.env.P_KEY3 = "0x" + process.env.P_KEY3;
}
if(!process.env.P_KEY4) {
	console.warn("P_KEY4 is not set. Rinkeby deployments won't be available");
	process.env.P_KEY4 = FAKE_P_KEY;
}
else if(!process.env.P_KEY4.startsWith("0x")) {
	console.warn("P_KEY4 doesn't start with 0x. Appended 0x");
	process.env.P_KEY4 = "0x" + process.env.P_KEY4;
}
if(!process.env.INFURA_KEY) {
	console.warn("INFURA_KEY is not set. Deployments won't be available");
	process.env.INFURA_KEY = "";
}
if(!process.env.ETHERSCAN_KEY) {
	console.warn("ETHERSCAN_KEY is not set. Deployed smart contract code verification won't be available");
	process.env.ETHERSCAN_KEY = "";
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	defaultNetwork: "hardhat",
	networks: {
		// https://hardhat.org/hardhat-network/
		hardhat: {
			// set networkId to 0xeeeb04de as for all local networks
			chainId: 0xeeeb04de,
			// set the gas price to one for convenient tx costs calculations in tests
			gasPrice: 1,
			// London hard fork fix: impossible to set gas price lower than baseFeePerGas (875,000,000)
			initialBaseFeePerGas: 0,
			accounts: {
				count: 35,
			},
		},
		// https://etherscan.io/
		mainnet: {
			// url: "https://eth-mainnet.alchemyapi.io/v2/123abc123abc123abc123abc123abcde",
			url: "https://mainnet.infura.io/v3/" + process.env.INFURA_KEY, // create a key: https://infura.io/
			gasPrice: "auto",
			accounts: [
				process.env.P_KEY1, // export private key from mnemonic: https://metamask.io/
			],
		},
		// https://ropsten.etherscan.io/
		ropsten: {
			url: "https://ropsten.infura.io/v3/" + process.env.INFURA_KEY, // create a key: https://infura.io/
			gasPrice: "auto",
			accounts: [
				process.env.P_KEY3, // export private key from mnemonic: https://metamask.io/
			]
		},
		// https://rinkeby.etherscan.io/
		rinkeby: {
			url: "https://rinkeby.infura.io/v3/" + process.env.INFURA_KEY, // create a key: https://infura.io/
			gasPrice: "auto",
			accounts: [
				process.env.P_KEY4, // export private key from mnemonic: https://metamask.io/
			],
		},
	},

	// Configure Solidity compiler
	solidity: {
		// https://hardhat.org/guides/compile-contracts.html
		compilers: [
			{
				version: "0.8.11",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200
					}
				}
			},
		]
	},

	// Set default mocha options here, use special reporters etc.
	mocha: {
		// timeout: 100000,

		// disable mocha timeouts:
		// https://mochajs.org/api/mocha#enableTimeouts
		enableTimeouts: false,
		// https://github.com/mochajs/mocha/issues/3813
		timeout: false,
	},

	// Configure etherscan integration
	// https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html
	etherscan: {
		// Your API key for Etherscan
		// Obtain one at https://etherscan.io/
		apiKey: process.env.ETHERSCAN_KEY
	},

	// namedAccounts allows you to associate names to addresses and have them configured per chain
	// https://github.com/wighawag/hardhat-deploy#1-namedaccounts-ability-to-name-addresses
	namedAccounts: {
		// ALI ERC20 v2
		AliERC20v2: {
			"mainnet": "0x6B0b3a982b4634aC68dD83a4DBF02311cE324181",
			"rinkeby": "0x088effA8E63DF55F3736f04ED25581326f9798BA",
		},
	},

}
