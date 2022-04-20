// ERC721: Rescue ERC20 tokens

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

// BN utils
const {
	random_bn,
} = require("../../scripts/include/bn_utils");

// deployment routines in use
const {
	erc721_deploy,
} = require("./include/deployment_routines");
const {
	erc20_deploy,
} = require("../erc20/include/deployment_routines");

// run rescue ERC20 tokens tests
contract("ERC721: rescue ERC20 tokens test", function(accounts) {
	// extract accounts to be used:
	// A0 – special default zero account accounts[0] used by Truffle, reserved
	// a0 – deployment account having all the permissions, reserved
	// H0 – initial token holder account
	// a1, a2,... – working accounts to perform tests on
	const [A0, a0, H0, a1, a2, a3] = accounts;

	// deploy the tokens
	let erc20, erc721;
	beforeEach(async function() {
		erc20 = await erc20_deploy(a0, H0);
		erc721 = await erc721_deploy(a0);
	});

	describe("once ERC20 tokens are lost in the ERC721 contract", function() {
		const value = random_bn(2, 1_000_000_000);
		let receipt;
		beforeEach(async function() {
			receipt = await erc20.transfer(erc721.address, value, {from: H0});
		});
		it('ERC20 "Transfer" event is emitted', async function() {
			expectEvent(receipt, "Transfer", {
				from: H0,
				to: erc721.address,
				value: value,
			});
		});
		it("ERC721 contract balance increases as expected", async function() {
			expect(await erc20.balanceOf(erc721.address)).to.be.bignumber.that.equals(value);
		});

		function rescue(total_value, rescue_value = total_value) {
			total_value = new BN(total_value);
			rescue_value = new BN(rescue_value);
			let receipt;
			beforeEach(async function() {
				receipt = await erc721.rescueErc20(erc20.address, a1, rescue_value, {from: a0});
			});
			it('ERC20 "Transfer" event is emitted', async function() {
				await expectEvent.inTransaction(receipt.tx, erc20, "Transfer", {
					from: erc721.address,
					to: a1,
					value: rescue_value,
				});
			});
			it("ERC721 balance decreases as expected", async function() {
				expect(await erc20.balanceOf(erc721.address)).to.be.bignumber.that.equals(total_value.sub(rescue_value));
			});
			it("token recipient balance increases as expected", async function() {
				expect(await erc20.balanceOf(a1)).to.be.bignumber.that.equals(rescue_value);
			});
		}

		describe("can rescue all the tokens", function() {
			rescue(value);
		});
		describe("can rescue some tokens", function() {
			rescue(value, value.subn(1));
		});

		it("cannot rescue more than all the tokens", async function() {
			await expectRevert(
				erc721.rescueErc20(erc20.address, a1, value.addn(1), {from: a0}),
				"ERC20: transfer amount exceeds balance"
			);
		});
		it("reverts if ERC20 transfer fails", async function() {
			await erc20.setTransferSuccessOverride(false, {from: a0});
			await expectRevert(erc721.rescueErc20(erc20.address, a1, 1, {from: a0}), "ERC20 transfer failed");
		});
	});
});
