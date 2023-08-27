// ERC721: AccessControl (ACL) Tests

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

// ACL token features and roles
const {
	not,
	FEATURE_TRANSFERS,
	FEATURE_TRANSFERS_ON_BEHALF,
	FEATURE_OWN_BURNS,
	FEATURE_BURNS_ON_BEHALF,
	ROLE_TOKEN_CREATOR,
	ROLE_TOKEN_DESTROYER,
	ROLE_URI_MANAGER,
	ROLE_RESCUE_MANAGER,
} = require("../../scripts/include/features_roles");

// deployment routines in use
const {
	erc721_deploy_restricted,
	upgradeable_erc721_deploy_restricted,
} = require("./include/deployment_routines");
const {
	erc20_deploy,
} = require("../erc20/include/deployment_routines");

// deployment fixture routines in use
const {
	get_erc20_deployment,
	get_erc721_deployment,
	get_erc721_upgradeable_deployment,
} = require("../include/deployment_fixture_routines");

// run AccessControl (ACL) tests
contract("ERC721: AccessControl (ACL) tests", function(accounts) {
	// extract accounts to be used:
	// A0 – special default zero account accounts[0] used by Truffle, reserved
	// a0 – deployment account having all the permissions, reserved
	// H0 – initial token holder account
	// a1, a2,... – working accounts to perform tests on
	const [A0, a0, H0, a1, a2, a3] = accounts;

	// define test suite: it will be reused to test several contracts
	function acl_suite(contract_name, deployment_fn, burnable = true) {
		describe(`${contract_name}: ACL`, function() {
			// deploy token
			let token;
			beforeEach(async function() {
				// a0 is ignored when using a fixture
				token = await deployment_fn.call(this, a0);
				// disable all the features to make the deployment "restricted"
				await token.updateFeatures(0, {from: a0});
			});

			let erc20;
			beforeEach(async function() {
				// a0 and H0 are ignored when using a fixture
				erc20 = await get_erc20_deployment(a0, H0);
			});

			// run the suite
			const from = a1;
			const to = a2;
			const by = a3;
			const tokenId = 0xF001_0001;
			const nonExistentId = 0xF001_0002;
			beforeEach(async function() {
				await token.mint(from, tokenId, {from: a0})
			});
			// transfers
			describe("when FEATURE_TRANSFERS is enabled", function() {
				beforeEach(async function() {
					await token.updateFeatures(FEATURE_TRANSFERS, {from: a0});
				});
				it("direct transfer succeeds", async function() {
					await token.transferFrom(from, to, tokenId, {from});
				});
				it("safe direct transfer succeeds", async function() {
					await token.safeTransferFrom(from, to, tokenId, {from});
				});
			});
			describe("when FEATURE_TRANSFERS is disabled", function() {
				beforeEach(async function() {
					await token.updateFeatures(not(FEATURE_TRANSFERS), {from: a0});
				});
				it("direct transfer reverts", async function() {
					await expectRevert(token.transferFrom(from, to, tokenId, {from}), "transfers are disabled");
				});
				it("safe direct transfer reverts", async function() {
					await expectRevert(token.safeTransferFrom(from, to, tokenId, {from}), "transfers are disabled");
				});
			});
			// transfers on behalf
			describe("when token transfer is approved", function() {
				beforeEach(async function() {
					await token.approve(by, tokenId, {from});
				});
				describe("when FEATURE_TRANSFERS_ON_BEHALF is enabled", function() {
					beforeEach(async function() {
						await token.updateFeatures(FEATURE_TRANSFERS_ON_BEHALF, {from: a0});
					});
					it("transfer on behalf succeeds", async function() {
						await token.transferFrom(from, to, tokenId, {from: by});
					});
					it("safe transfer on behalf succeeds", async function() {
						await token.safeTransferFrom(from, to, tokenId, {from: by});
					});
				});
				describe("when FEATURE_TRANSFERS_ON_BEHALF is disabled", function() {
					beforeEach(async function() {
						await token.updateFeatures(not(FEATURE_TRANSFERS_ON_BEHALF), {from: a0});
					});
					it("transfer on behalf reverts", async function() {
						await expectRevert(token.transferFrom(from, to, tokenId, {from: by}), "transfers on behalf are disabled");
					});
					it("safe transfer on behalf reverts", async function() {
						await expectRevert(token.safeTransferFrom(from, to, tokenId, {from: by}), "transfers on behalf are disabled");
					});
				});
			});
			// transfers on behalf by operator
			describe("when transfer operator is set", function() {
				beforeEach(async function() {
					await token.setApprovalForAll(by, true, {from});
				});
				describe("when FEATURE_TRANSFERS_ON_BEHALF is enabled", function() {
					beforeEach(async function() {
						await token.updateFeatures(FEATURE_TRANSFERS_ON_BEHALF, {from: a0});
					});
					it("transfer on behalf by operator succeeds", async function() {
						await token.transferFrom(from, to, tokenId, {from: by});
					});
					it("safe transfer on behalf by operator succeeds", async function() {
						await token.safeTransferFrom(from, to, tokenId, {from: by});
					});
				});
				describe("when FEATURE_TRANSFERS_ON_BEHALF is disabled", function() {
					beforeEach(async function() {
						await token.updateFeatures(not(FEATURE_TRANSFERS_ON_BEHALF), {from: a0});
					});
					it("transfer on behalf by operator reverts", async function() {
						await expectRevert(token.transferFrom(from, to, tokenId, {from: by}), "transfers on behalf are disabled");
					});
					it("safe transfer on behalf by operator reverts", async function() {
						await expectRevert(token.safeTransferFrom(from, to, tokenId, {from: by}), "transfers on behalf are disabled");
					});
				});
			});
			if(burnable) {
				// burns
				describe("when FEATURE_OWN_BURNS is enabled", function() {
					beforeEach(async function() {
						await token.updateFeatures(FEATURE_OWN_BURNS, {from: a0});
					});
					it("burn succeeds", async function() {
						await token.burn(tokenId, {from});
					});
				});
				describe("when FEATURE_OWN_BURNS is disabled", function() {
					beforeEach(async function() {
						await token.updateFeatures(not(FEATURE_OWN_BURNS), {from: a0});
					});
					it("burn reverts", async function() {
						await expectRevert(token.burn(tokenId, {from}), "burns are disabled");
					});
				});
				// burns on behalf
				describe("when token transfer is approved", function() {
					beforeEach(async function() {
						await token.approve(by, tokenId, {from});
					});
					describe("when FEATURE_BURNS_ON_BEHALF is enabled", function() {
						beforeEach(async function() {
							await token.updateFeatures(FEATURE_BURNS_ON_BEHALF, {from: a0});
						});
						it("burn on behalf succeeds", async function() {
							await token.burn(tokenId, {from: by});
						});
					});
					describe("when FEATURE_BURNS_ON_BEHALF is disabled", function() {
						beforeEach(async function() {
							await token.updateFeatures(not(FEATURE_BURNS_ON_BEHALF), {from: a0});
						});
						it("burn on behalf reverts", async function() {
							await expectRevert(token.burn(tokenId, {from: by}), "burns on behalf are disabled");
						});
					});
				});
				// burns on behalf by operator
				describe("when transfer operator is set", function() {
					beforeEach(async function() {
						await token.setApprovalForAll(by, true, {from});
					});
					describe("when FEATURE_BURNS_ON_BEHALF is enabled", function() {
						beforeEach(async function() {
							await token.updateFeatures(FEATURE_BURNS_ON_BEHALF, {from: a0});
						});
						it("burn on behalf by operator succeeds", async function() {
							await token.burn(tokenId, {from: by});
						});
					});
					describe("when FEATURE_BURNS_ON_BEHALF is disabled", function() {
						beforeEach(async function() {
							await token.updateFeatures(not(FEATURE_BURNS_ON_BEHALF), {from: a0});
						});
						it("burn on behalf by operator reverts", async function() {
							await expectRevert(token.burn(tokenId, {from: by}), "burns on behalf are disabled");
						});
					});
				});
			}

			// mints
			describe("when sender has ROLE_TOKEN_CREATOR permission", function() {
				beforeEach(async function() {
					await token.updateRole(from, ROLE_TOKEN_CREATOR, {from: a0});
				});
				it("sender can mint a token", async function() {
					await token.mint(to, nonExistentId, {from});
				});
			});
			describe("when sender doesn't have ROLE_TOKEN_CREATOR permission", function() {
				beforeEach(async function() {
					await token.updateRole(from, not(ROLE_TOKEN_CREATOR), {from: a0});
				});
				it("sender can't mint a token", async function() {
					await expectRevert(token.mint(to, nonExistentId, {from}), "access denied");
				});
			});
			// burns by destroyer
			if(burnable) {
				describe("when sender has ROLE_TOKEN_DESTROYER permission and FEATURE_OWN_BURNS/FEATURE_BURNS_ON_BEHALF are disabled", function() {
					beforeEach(async function() {
						await token.updateRole(from, ROLE_TOKEN_DESTROYER, {from: a0});
						await token.updateFeatures(not(FEATURE_OWN_BURNS, FEATURE_BURNS_ON_BEHALF), {from: a0});
					});
					it("sender can burn own token", async function() {
						await token.burn(tokenId, {from});
					});
					const anotherTokenId = nonExistentId;
					beforeEach(async function() {
						await token.mint(to, anotherTokenId, {from: a0});
					});
					it("sender can burn someone else's token", async function() {
						await token.burn(anotherTokenId, {from});
					});
				});
				describe("when sender doesn't have ROLE_TOKEN_DESTROYER permission and FEATURE_OWN_BURNS/FEATURE_BURNS_ON_BEHALF are enabled", function() {
					beforeEach(async function() {
						await token.updateRole(from, not(ROLE_TOKEN_DESTROYER), {from: a0});
						await token.updateFeatures(FEATURE_OWN_BURNS | FEATURE_BURNS_ON_BEHALF, {from: a0});
					});
					const anotherTokenId = nonExistentId;
					beforeEach(async function() {
						await token.mint(to, anotherTokenId, {from: a0});
					});
					it("sender can't burn someone else's token", async function() {
						await expectRevert(token.burn(anotherTokenId, {from}), "access denied");
					});
				});
			}
			// URI setup
			describe("when sender has ROLE_URI_MANAGER permission", function() {
				beforeEach(async function() {
					await token.updateRole(from, ROLE_URI_MANAGER, {from: a0});
				});
				it("sender can set baseURI", async function() {
					await token.setBaseURI("abc", {from});
				});
				it("sender can set tokenURI", async function() {
					await token.setTokenURI(tokenId, "abc", {from});
				});
			});
			describe("when sender doesn't have ROLE_URI_MANAGER permission", function() {
				beforeEach(async function() {
					await token.updateRole(from, not(ROLE_URI_MANAGER), {from: a0});
				});
				it("sender can't set baseURI", async function() {
					await expectRevert(token.setBaseURI("abc", {from}), "access denied");
				});
				it("sender can't set tokenURI", async function() {
					await expectRevert(token.setTokenURI(tokenId, "abc", {from}), "access denied");
				});
			});
			// Rescuing ERC20 tokens
			{
				beforeEach(async function() {
					// when using a fixture, there is no initial token supply minted
					await erc20.mint(token.address, 1, {from: a0});
				});
				describe("when sender has ROLE_RESCUE_MANAGER permission", function() {
					beforeEach(async function() {
						await token.updateRole(from, ROLE_RESCUE_MANAGER, {from: a0});
					});
					it("sender can rescue ERC20 tokens", async function() {
						await token.rescueErc20(erc20.address, H0, 1, {from});
					});
				});
				describe("when sender doesn't have ROLE_RESCUE_MANAGER permission", function() {
					beforeEach(async function() {
						await token.updateRole(from, not(ROLE_RESCUE_MANAGER), {from: a0});
					});
					it("sender can't rescue ERC20 tokens", async function() {
						await expectRevert(token.rescueErc20(erc20.address, H0, 1, {from}), "access denied");
					});
				});
			}
		});
	}

	// run the suite
	acl_suite("ERC721Impl", get_erc721_deployment);
	acl_suite("ERC721v1.sol", get_erc721_upgradeable_deployment);
});
