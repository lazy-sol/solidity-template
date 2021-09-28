// Enable Truffle 5 plugin for tests
// https://hardhat.org/guides/truffle-testing.html
require("@nomiclabs/hardhat-truffle5");

// Enable Waffle plugin for deployments
require("@nomiclabs/hardhat-waffle");

// enable etherscan integration
// https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html
require("@nomiclabs/hardhat-etherscan");

// enable Solidity-coverage
// https://hardhat.org/plugins/solidity-coverage.html
require('solidity-coverage');

// enable hardhat-gas-reporter
// https://hardhat.org/plugins/hardhat-gas-reporter.html
require("hardhat-gas-reporter");

// verify environment setup, display warning if required, replace missing values with fakes
const FAKE_MNEMONIC = "test test test test test test test test test test test junk";
if(!process.env.MNEMONIC1) {
	console.warn("MNEMONIC1 is not set. Mainnet deployments won't be available");
	process.env.MNEMONIC1 = FAKE_MNEMONIC;
}
if(!process.env.MNEMONIC3) {
	console.warn("MNEMONIC3 is not set. Ropsten deployments won't be available");
	process.env.MNEMONIC3 = FAKE_MNEMONIC;
}
if(!process.env.MNEMONIC4) {
	console.warn("MNEMONIC4 is not set. Rinkeby deployments won't be available");
	process.env.MNEMONIC4 = FAKE_MNEMONIC;
}
if(!process.env.INFURA_KEY) {
	console.warn("INFURA_KEY is not set. Deployments won't be available");
	process.env.INFURA_KEY = "";
}
if(!process.env.ETHERSCAN_KEY) {
	console.warn("ETHERSCAN_KEY is not set. Deployed smart contract code verification won't ba available");
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
			// TODO: set networkId to 0xeeeb04de as for all local networks
			// set the gas price to one for convenient tx costs calculations in tests
			//gasPrice: 1,
			accounts: {
				count: 35,
			}
		},
		// https://etherscan.io/
		mainnet: {
			// url: "https://eth-mainnet.alchemyapi.io/v2/123abc123abc123abc123abc123abcde",
			url: "https://mainnet.infura.io/v3/" + process.env.INFURA_KEY, // create a key: https://infura.io/
			gasPrice: 21000000000, // 21 Gwei
			accounts: {
				mnemonic: process.env.MNEMONIC1, // create 12 words: https://metamask.io/
			}
		},
		// https://ropsten.etherscan.io/
		ropsten: {
			url: "https://ropsten.infura.io/v3/" + process.env.INFURA_KEY, // create a key: https://infura.io/
			gasPrice: 2000000000, // 2 Gwei
			accounts: {
				mnemonic: process.env.MNEMONIC3, // create 12 words: https://metamask.io/
			}
		},
		// https://rinkeby.etherscan.io/
		rinkeby: {
			url: "https://rinkeby.infura.io/v3/" + process.env.INFURA_KEY, // create a key: https://infura.io/
			gasPrice: 2000000000, // 2 Gwei
			accounts: {
				mnemonic: process.env.MNEMONIC4, // create 12 words: https://metamask.io/
			}
		},
	},

	// Configure Solidity compiler
	solidity: {
		// https://hardhat.org/guides/compile-contracts.html
		compilers: [
			{
				version: "0.8.7",
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

	// hardhat-gas-reporter will be disabled by default, use REPORT_GAS environment variable to enable it
	// https://hardhat.org/plugins/hardhat-gas-reporter.html
	gasReporter: {
		enabled: !!(process.env.REPORT_GAS)
	},
}
