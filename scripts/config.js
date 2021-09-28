// deployed smart contract addresses configuration defines which
// smart contracts require deployment and which are already deployed
// empty address means smart contract requires deployment

// a collection of all known addresses (smart contracts and external), deployment settings
const Config = ((network) => {
	switch(network) {
		// Mainnet Configuration
		case "mainnet":
			return {
				AwesomeToken: "",
			};
		// Ropsten Configuration
		case "ropsten":
			return {
				AwesomeToken: "0x165Dc2e5e46A697AfaCFF2a5718d57A0d628030D",
			};
		// Rinkeby Configuration
		case "rinkeby":
			return {
				AwesomeToken: "0xec26a4df98f885DD15F74bc647d5fc192134A608",
			};
		// any other network is not supported
		default:
			throw "unknown network " + network;
	}
});

module.exports = Config;
