// using the BDD with chai
const {
	assert,
	expect,
} = require("chai");

// Truffle style contract testing
contract("Awesome Test!", function(accounts) {
	it("accounts exist", async function() {
		expect(accounts).to.exist;
	});
	it("got some accounts", async function() {
		expect(accounts.length).to.be.gt(0);
	});
});
