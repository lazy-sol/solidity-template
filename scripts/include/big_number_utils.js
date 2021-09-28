// Both Truffle anf Hardhat with Truffle make an instance of web3 available in the global scope
// BigNumber constants, functions to work with BigNumber
const {BigNumber} = require("@ethersproject/bignumber");
const ZERO = BigNumber.from(0);

// we use assert to fail fast in case of any errors
const assert = require("assert");

// generates random BN in a [0, 2^256) range: r ∈ [0, 2^256)
function random_bn256() {
	// crypto is used to get enough randomness for the random BN generation
	const {randomBytes} = require('crypto');

	// use crypto.randomBytes to generate 256 bits of randomness and wrap it into BN
	return BigNumber.from(randomBytes(32));
}

// generates random BigNumber in a [from, to) range: r ∈ [from, to)
function random_bn(
	from,
	to,
	multiplier = BigNumber.from(1),
	power = BigNumber.from(1),
	quantizer = BigNumber.from(1)
) {
	// convert inputs to BNs if they are not BNs
	multiplier = BigNumber.from(multiplier).pow(power);
	from = BigNumber.from(from).mul(multiplier);
	to = BigNumber.from(to).mul(multiplier);

	assert(from.lt(to), '"from" must not exceed "to"');

	// 2^256
	const TWO256 = BigNumber.from(2).pow(256);

	// generate 256 bits of randomness, a random number R ∈ [0, 2^256)
	const rnd256 = random_bn256();

	// map the random number in a [0, 2^256) space onto [from, from + range) space:
	return from.add(to.sub(from).mul(rnd256).div(TWO256)).div(quantizer).mul(quantizer); // r = R * range / 2^256 + from
}

// user friendly big number printer
function print_amt(amt, dm = BigNumber.from(10).pow(18)) {
	// convert inputs to BNs if they are not BNs
	amt = BigNumber.from(amt);
	dm = BigNumber.from(dm);

	if(amt.isZero()) {
		return '0';
	}
	const THOUSAND = BigNumber.from(1_000);
	const MILLION = BigNumber.from(1_000_000);
	if(amt.div(dm).lt(THOUSAND)) {
		return amt.div(MILLION).toNumber() / dm.div(MILLION).toNumber() + '';
	}
	const k = amt.div(dm).toNumber() / 1000;
	return k + "k";
}

// export the constants
module.exports = {
	ZERO,
	random_bn256,
	random_bn,
	print_amt,
};
