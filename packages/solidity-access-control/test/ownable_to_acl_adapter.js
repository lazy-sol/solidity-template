// OwnableToAccessControlAdapter tests

// Zeppelin test helpers
const {
	BN,
	constants,
	expectEvent,
	expectRevert,
} = require("@openzeppelin/test-helpers");
const {
	assert,
	expect,
} = require("chai");
const {
	ZERO_ADDRESS,
	ZERO_BYTES32,
	MAX_UINT256,
} = constants;

// deployment routines in use
const {
	ownable_to_acl_adapter_deploy,
} = require("./include/deployment_routines");

// run OwnableToAccessControlAdapter tests
contract("OwnableToAccessControlAdapter tests", function(accounts) {
	// extract accounts to be used:
	// A0 – special default zero account accounts[0] used by Truffle, reserved
	// a0 – deployment account having all the permissions, reserved
	// H0 – initial token holder account
	// a1, a2,... – working accounts to perform tests on
	const [A0, a0, H0, a1, a2, a3] = accounts;

	describe("after the Adapter is deployed and target Ownable ownership transferred to the Adapter", function() {
		let target, adapter;
		beforeEach(async function() {
			({target, adapter} = await ownable_to_acl_adapter_deploy(a0));
		});

		it("it is impossible to send ether to the non-payable target contract via the adapter", async function() {
			await expectRevert(web3.eth.sendTransaction({
				from: a0,
				to: adapter.address,
				value: 1_000_000_000, // 1 gwei
			}), "execution failed");
		});
		it("it is impossible to execute transferOwnership function before its access role is configured", async function() {
			await expectRevert(web3.eth.sendTransaction({
				from: a0,
				to: adapter.address,
				data: target.contract.methods.transferOwnership(a2).encodeABI(),
			}), "access role not set");
		});
		describe("once transferOwnership function access control is configured", function() {
			const ROLE_OWNERSHIP_MANAGER = 0x00010000;
			let receipt;
			beforeEach(async function() {
				receipt = await adapter.updateAccessRole("transferOwnership(address)", ROLE_OWNERSHIP_MANAGER, {from: a0});
			});
			it('"AccessRoleUpdated" event is emitted', async function() {
				expectEvent(receipt, "AccessRoleUpdated", {
					selector: web3.eth.abi.encodeFunctionSignature("transferOwnership(address)"),
					role: "" + ROLE_OWNERSHIP_MANAGER,
				});
			});
			it("it is impossible to execute transferOwnership function from unauthorized account", async function() {
				await expectRevert(web3.eth.sendTransaction({
					from: a1,
					to: adapter.address,
					data: target.contract.methods.transferOwnership(a2).encodeABI(),
				}), "access denied");
			});
			describe("once an account has authorization to execute transferOwnership function", function() {
				beforeEach(async function() {
					await adapter.updateRole(a1, ROLE_OWNERSHIP_MANAGER, {from: a0});
				});
				it("execution of the transferOwnership function succeeds", async function() {
					await web3.eth.sendTransaction({
						from: a1,
						to: adapter.address,
						data: target.contract.methods.transferOwnership(a2).encodeABI(),
					});
					expect(await target.owner(), "wrong owner after ownership transfer").to.equal(a2);
				});
				it("execution of the transferOwnership non-payable function fails if ether is supplied", async function() {
					await expectRevert(web3.eth.sendTransaction({
						from: a1,
						to: adapter.address,
						data: target.contract.methods.transferOwnership(a2).encodeABI(),
						value: 1_000_000_000, // 1 gwei
					}), "execution failed");
				});
			});
		});
	});
});
