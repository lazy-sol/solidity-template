# Solidity Template #
This repo contains a template for Solidity development on Ethereum.
It is Hardhat/Web3/Truffle based and includes the following components preinstalled/configured:
* Development
   * @openzeppelin/contracts – OpenZeppelin quick and dirty (but still well tested) implementations for 95%
   of the stuff one may need
* Testing:
   * @nomiclabs/hardhat-web3 – Web3 Hardhat plugin
   * @nomiclabs/hardhat-truffle5 – Truffle Hardhat plugin
   * @openzeppelin/test-helpers – OpenZeppelin test helpers, convenient for event parsing, tx revert asserts,
   balance tracking, etc.
   * chai – provides a convenient [BDD](https://devhints.io/chai) unit testing support
   * solidity-coverage – test coverage for Solidity, preconfigured in [.solcover.js](.solcover.js)
* Deployment
   * @nomiclabs/hardhat-etherscan – etherscan source code verification made easy

Note: search for "awesome" and replace with your own project name

# Yet Another Awesome Project#

The project is built using
* [Hardhat](https://hardhat.org/), a popular Ethereum development environment,
* [Web3.js](https://web3js.readthedocs.io/), a collection of libraries that allows interacting with
local or remote Ethereum node using HTTP, IPC or WebSocket, and
* [Truffle](https://www.trufflesuite.com/truffle), a popular development framework for Ethereum.

Smart contracts deployment is configured to use [Infura](https://infura.io/)
and [HD Wallet](https://www.npmjs.com/package/@truffle/hdwallet-provider)

## Repository Description ##
What's inside?

* Some Awesome Stuff

## Installation ##

Following steps were tested to work in macOS Catalina

1. Clone the repository  
    ```git clone git@github.com:vgorin/solidity-template.git```
2. Navigate into the cloned repository  
    ```cd solidity-template```
3. Install [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) – latest  
    ```brew install nvm```
4. Install [Node package manager (npm)](https://www.npmjs.com/) and [Node.js](https://nodejs.org/) – version 15.1.0  
    ```nvm install v15.1.0```
5. Activate node version installed  
    ```nvm use v15.1.0```
6. Install project dependencies  
    ```npm install```

### Troubleshooting ###
* After executing ```nvm use v15.1.0``` I get  
    ```
    nvm is not compatible with the npm config "prefix" option: currently set to "/usr/local/Cellar/nvm/0.35.3/versions/node/v15.1.0"
    Run `npm config delete prefix` or `nvm use --delete-prefix v15.1.0` to unset it.
    ```
    Fix:  
    ```
    nvm use --delete-prefix v15.1.0
    npm config delete prefix
    npm config set prefix "/usr/local/Cellar/nvm/0.35.3/versions/node/v15.1.0"
    ```
* After executing ```npm install``` I get
    ```
    npm ERR! code 127
    npm ERR! path ./game-contracts/node_modules/utf-8-validate
    npm ERR! command failed
    npm ERR! command sh -c node-gyp-build
    npm ERR! sh: node-gyp-build: command not found
    
    npm ERR! A complete log of this run can be found in:
    npm ERR!     ~/.npm/_logs/2021-08-30T07_10_23_362Z-debug.log
    ```
    Fix:  
    ```
    npm install -g node-gyp
    npm install -g node-gyp-build
    ```

## Configuration ##
1. Create or import 12-word mnemonics for
    1. Mainnet
    2. Ropsten
    3. Rinkeby
    4. Kovan

    You can use metamask to create mnemonics: https://metamask.io/

    Note: you can use same mnemonic for test networks (ropsten, rinkeby and kovan).
    Always use a separate one for mainnet, keep it secure.

    Note: you can add more configurations to connect to the networks not listed above.
    Check and add configurations required into the [hardhat.config.js](hardhat.config.js).

2. Create an infura access key at https://infura.io/

3. Create etherscan API key at https://etherscan.io/

4. Export mnemonics, infura access key, and etherscan API key as system environment variables
    (they should be available for hardhat):

    | Name         | Value             |
    |--------------|-------------------|
    | MNEMONIC1    | Mainnet mnemonic  |
    | MNEMONIC3    | Ropsten mnemonic  |
    | MNEMONIC4    | Rinkeby mnemonic  |
    | MNEMONIC42   | Kovan mnemonic    |
    | INFURA_KEY   | Infura access key |
    | ETHERSCAN_KEY| Etherscan API key |

Note:  
Read [How do I set an environment variable?](https://www.schrodinger.com/kb/1842) article for more info on how to
set up environment variables in Linux, Windows and macOS.

### Example Script: macOS Catalina ###
```
export MNEMONIC1="witch collapse practice feed shame open despair creek road again ice least"
export MNEMONIC3="someone relief rubber remove donkey jazz segment nose spray century put beach"
export MNEMONIC4="someone relief rubber remove donkey jazz segment nose spray century put beach"
export MNEMONIC42="someone relief rubber remove donkey jazz segment nose spray century put beach"
export INFURA_KEY="000ba27dfb1b3663aadfc74c3ab092ae"
export ETHERSCAN_KEY="9GEEN6VPKUR7O6ZFBJEKCWSK49YGMPUBBG"
```

## Compilation ##
Execute ```npx hardhat compile``` command to compile smart contracts.

Compilation settings are defined in [hardhat.config.js](./hardhat.config.js) ```solidity``` section.

Note: Solidity files *.sol use strict compiler version, you need to change all the headers when upgrading the
compiler to another version 

## Testing ##
Smart contract tests are built with Truffle – in JavaScript (ES6) and [web3.js](https://web3js.readthedocs.io/)

The tests are located in [test](./test) folder. 
They can be run with built-in [Hardhat Network](https://hardhat.org/hardhat-network/).

Run ```npx hardhat test``` to run all the tests or ```.npx hardhat test <test_file>``` to run individual test file.
Example: ```npx hardhat test ./test/awesome.js```

### Troubleshooting ###
* After running any test (executing ```npx hardhat test ./test/awesome.js``` for example) I get
    ```
    An unexpected error occurred:
    
    Error: This method only supports Buffer but input was: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    ```
    Fix: downgrade @nomiclabs/hardhat-truffle5 plugin to 2.0.0 (see https://issueexplorer.com/issue/nomiclabs/hardhat/1885)
    ```
    npm install -D @nomiclabs/hardhat-truffle5@2.0.0
    ```

## Deployment ##
Deployments are implemented as [hardhat scripts](https://hardhat.org/guides/deploying.html), without migrations.

Deployment scripts perform smart contracts deployment itself and their setup configuration.
Executing a script may require several transactions to complete, which may fail. To help troubleshoot
partially finished deployment, the scripts are designed to be rerunnable and execute only the transactions
which were not executed in previous run(s).

Deployment scripts are located under [scripts](./scripts) folder.

To run fresh deployment:

1. Open [scripts/config.js](./scripts/config.js)

2. For the network of interest (where the deployment is going to happen to) locate the deployed instances address(es) and
erase them. For example, if we are to deploy all the contracts into the Rinkeby network:
    ```
    ...

		// Rinkeby Configuration
		case "rinkeby":
			return {
				AwesomeToken: "",
			};

    ...
    ```

3. Run the deployment script of interest with the ```npx hardhat run``` command
    ```
    npx hardhat run --network rinkeby ./scripts/deploy_awesome.js
    ```
where ```./scripts/deploy_awesome.js``` specifies the deployment script,
and ```--network rinkeby``` specifies the network to run script for
(see [hardhat.config.js](./hardhat.config.js) for network definitions). 

To rerun the deployment script and continue partially completed script:

1. Open [scripts/config.js](./scripts/config.js)

2. For the network of interest locate the deployed instances address(es) and fill with the correct (previously deployed)
values. For example, if we already deployed some contracts into Rinkeby network, but are missing other contracts:
    ```
    ...

		// Rinkeby Configuration
		case "rinkeby":
			return {
				AwesomeToken: "0xec26a4df98f885DD15F74bc647d5fc192134A608",
			};

    ...
    ```

3. Run the deployment script with the ```npx hardhat run``` command, for example:
    ```
    npx hardhat run --network rinkeby ./scripts/deploy_awesome.js
    ```

(c) 2017–2021 Basil Gorin
