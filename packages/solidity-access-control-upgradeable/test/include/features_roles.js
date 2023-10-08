// copy and export all the features and roles constants from different contracts

// Auxiliary BN stuff
const BN = web3.utils.BN;
const TWO = new BN(2);

// Access manager is responsible for assigning the roles to users,
// enabling/disabling global features of the smart contract
const ROLE_ACCESS_MANAGER = TWO.pow(new BN(255));

// Upgrade manager is responsible for smart contract upgrades
const ROLE_UPGRADE_MANAGER = TWO.pow(new BN(254));

// Access Roles manager is responsible for assigning the access roles to functions
const ROLE_ACCESS_ROLES_MANAGER = TWO.pow(new BN(253));

// Bitmask representing all the possible permissions (super admin role)
const FULL_PRIVILEGES_MASK = TWO.pow(new BN(256)).subn(1);

// combine the role (permission set) provided
function or(...roles) {
	let roles_sum = new BN(0);
	for(let role of roles) {
		roles_sum = roles_sum.or(new BN(role));
	}
	return roles_sum;
}

// negates the role (permission set) provided
function not(...roles) {
	return FULL_PRIVILEGES_MASK.xor(or(...roles));
}

// export public module API
module.exports = {
	ROLE_ACCESS_MANAGER,
	ROLE_UPGRADE_MANAGER,
	FULL_PRIVILEGES_MASK,
	or,
	not,
};
