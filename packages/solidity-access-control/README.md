# Role-based Access Control (RBAC) #
A shortcut to a modular and easily pluggable dapp architecture.

Enable the modular plug and play (PnP) architecture for your dapp by incorporating the role-based access control (RBAC)
into the smart contracts.

## Installation
```
npm i -D @lazy-sol/access-control
```

## Usage

### Creating a Restricted Function

Restricted function is a function with a `public` Solidity modifier access to which is restricted
so that only a pre-configured set of accounts can execute it.

1. Enable role-based access control (RBAC) in a new smart contract
   by inheriting the RBAC contract from the [AccessControl](./contracts/AccessControl.sol) contract:
    ```solidity
    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import "@lazy-sol/access-control/contracts/AccessControl.sol";
    
    /**
     * @title Simple ERC20 Implementation
     *
     * @notice Zeppelin based ERC20 implementation with the RBAC support
     *
     * @author Lazy Soul
     */
    contract MyERC20Token is ERC20, AccessControl {
        
        ...
        
    }
    ```

2. Define an access control role with the unique integer value:
    ```solidity
        ...
        
        /**
         * @notice Token creator is responsible for creating (minting)
         tokens to an arbitrary address
         * @dev Role ROLE_TOKEN_CREATOR allows minting tokens
         (calling `mint` function)
         */
        uint32 public constant ROLE_TOKEN_CREATOR = 0x0001_0000;
        
        ...
    ```

3. Add the `require(isSenderInRole(ROLE_TOKEN_CREATOR), "access denied")"` check into the function body:
    ```solidity
        ...
        
        /**
         * @inheritdoc ERC20
         */
        function _mint(address _to, uint256 _value) internal virtual override {
            // check if caller has sufficient permissions to mint tokens
            require(isSenderInRole(ROLE_TOKEN_CREATOR), "access denied");

            // delegate to super implementation
            super._mint(_to, _value);
        }
        
        ...
    ```

   Note: you could also use the `restrictedTo` modifier in the function declaration instead of the `require`
   in the function body if you don't need a custom error message:
    ```solidity
        ...
        
        /**
         * @inheritdoc ERC20
         */
        function _mint(address _to, uint256 _value) internal virtual override restrictedTo(ROLE_TOKEN_CREATOR) {
            // delegate to super implementation
            super._mint(_to, _value);
        }
        
        ...
    ```

Examples:
[ERC20Impl](https://raw.githubusercontent.com/vgorin/solidity-template/master/contracts/token/ERC20Impl.sol),
[ERC721Impl](https://raw.githubusercontent.com/vgorin/solidity-template/master/contracts/token/ERC721Impl.sol).

### Adopting an Already Deployed OZ Ownable Contract to the RBAC Model

[OpenZeppelin Ownable](https://docs.openzeppelin.com/contracts/2.x/access-control#ownership-and-ownable)
is one of the most popular access control models since it is very easy to understand and to use.
Many deployed contracts are using this model, and when the time comes to switch to a more flexible model,
[OwnableToAccessControlAdapter](./contracts/OwnableToAccessControlAdapter.sol) comes into play.

#### Installation Flow

Prerequisite: deployed OZ Ownable contract (target contract) address (target_address)

1. Deploy the AccessControl Adapter bound to the already deployed OZ Ownable contract
   (specify the target OZ Ownable contract address in the constructor upon the deployment)
    ```javascript
    const adapter = await (artifacts.require("OwnableToAccessControlAdapter")).new(target_address);
    ```

2. Define what Ownable-restricted public functions on the target contract you'd like to be able
   to provide access to through the adapter contract

3. Map every such function with the role required to execute it using `updateAccessRole()` function  
   For example, to be able to provide an access to the transferOwnership(address) function, you could do
    ```javascript
    const ROLE_TRANSFER_OWNERSHIP_MANAGER = 0x00010000;
    await adapter.updateAccessRole("transferOwnership(address)", ROLE_TRANSFER_OWNERSHIP_MANAGER);
   ```

4. Provide the roles to the corresponding operators as you would usually do with AccessControl  
   For example, if you wish an address 0x00000000000000000000000000000000000Ff1CE to grant an access to the
   transferOwnership(address) function on the target, you could do
    ```javascript
    const operator = "0x00000000000000000000000000000000000Ff1CE";
    await adapter.updateRole(operator, ROLE_TRANSFER_OWNERSHIP_MANAGER);
    ```

5. Transfer the ownership of the target contract to the deployed AccessControl Adapter contract  
   Note that you can also do steps 2-4 after the step 5

#### Usage Flow

Prerequisite: installed AccessControl Adapter with the access to at least one restricted target contract
function configured

To execute the restricted access function on the target contract via the AccessControl Adapter
1. Use target contract ABI to construct a low-level function call calldata  
   For example, to construct the transferOwnership() function calldata to transfer the ownership to the
   0x00000000000000000000000000000000DEAdc0De address, you could do
    ```javascript
    const to = "0x00000000000000000000000000000000DEAdc0De";
    const calldata = target.contract.methods.transferOwnership(to).encodeABI();
    ```

2. Execute a low-level function call on the AccessControl Adapter contract using the constructed calldata  
   For example, to execute the transferOwnership() function (prepared in step 1), you could do
    ```javascript
      await web3.eth.sendTransaction({
          from: operator,
          to: adapter.address,
          data: calldata,
      }
    ```

3. It is also ok to add an ether to the transaction by adding a value field to the `sendTransaction` call,
   as well as sending plain ether transfer transaction, as long as target contract has payable functions,
   and/or has a default payable receiver

## Contributing
Please see the [Contribution Guide](./CONTRIBUTING.md) document to get understanding on how to report issues,
contribute to the source code, fix bugs, introduce new features, etc.

(c) 2017–2023 Basil Gorin
