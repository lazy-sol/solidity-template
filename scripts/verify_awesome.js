// verify AwesomeToken(s)
//   - ZeppelinERC20Mock
//   - ZeppelinERC721Mock

// Run: npx hardhat run --network rinkeby ./scripts/verify_awesome.js

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// script entry point
async function main() {
	// Hardhat always runs the compile task when running scripts with its command
	// line interface.
	//
	// If this script is run directly using `node` you may want to call compile
	// manually to make sure everything is compiled
	// await hre.run('compile');

	// check if we're on the local hardhat test network
	if(network.name === "hardhat") {
		console.warn(
			"You are trying to deploy a contract to the Hardhat Network, which" +
			"gets automatically created and destroyed every time. Use the Hardhat" +
			" option '--network localhost'"
		);
	}

	// config file contains known deployed addresses, deployment settings
	const Config = require('./config');

	// a collection of all known addresses (smart contracts and external)
	const conf = Config(network.name);

	// submit verification tasks asynchronously
	const verification_tasks = [];
	if(conf.AwesomeToken) {
		console.log("Submitting AwesomeToken source code for verification at %o", conf.AwesomeToken);
		verification_tasks.push(hre.run("verify:verify", {
			address: conf.AwesomeToken,
			constructorArguments: ["AwesomeToken", "AWS"]
		}));
	}

	// wait for all the verifications to complete
	await Promise.all(verification_tasks);

	console.log("execution complete");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
