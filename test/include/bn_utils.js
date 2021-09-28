// Both Truffle anf Hardhat with Truffle make an instance of web3 available in the global scope
// BN constants, functions to work with BN
const {web3} = require("hardhat");
const BN = web3.utils.BN;
const toBN = web3.utils.toBN;
const isBN = web3.utils.isBN;

// 2^256
const TWO256 = (new BN(2)).pow(new BN(256));

// crypto is used to get enough randomness for the random BN generation
const {randomBytes} = require('crypto');

// generates random BN in a [0, 2^256) range: r ∈ [0, 2^256)
function random_bn256() {
	// use crypto.randomBytes to generate 256 bits of randomness and wrap it into BN
	return new BN(randomBytes(32));
}

// generates random BN in a [0, 2^255) range: r ∈ [0, 2^256)
function random_bn255() {
	// use crypto.randomBytes to generate 256 bits of randomness, wrap it into BN, reduce to 255 bits
	return new BN(randomBytes(32)).divn(2);
}

// generates random BN in a [from, from + range) range: r ∈ [from, from + range)
function random_bn(from, range) {
	// convert inputs to BNs if they are not BNs
	from = new BN(from);
	range = new BN(range);

	// generate 256 bits of randomness, a random number R ∈ [0, 2^256)
	const rnd256 = new BN(randomBytes(32));

	// map the random number in a [0, 2^256) space onto [from, from + range) space:
	return from.add(range.mul(rnd256).div(TWO256)); // r = R * range / 2^256 + from
}

// sums up an array of BNs, returns BN
function sum_bn(array) {
	return array.reduce((accumulator, currentVal) => accumulator.add(new BN(currentVal)), new BN(0));
}

// user friendly big number printer
function print_amt(amt, dm = new BN(10).pow(new BN(18))) {
	// convert inputs to BNs if they are not BNs
	amt = new BN(amt);
	dm = new BN(dm);

	if(amt.isZero()) {
		return '0';
	}
	const THOUSAND = new BN(1_000);
	const MILLION = new BN(1_000_000);
	if(amt.div(dm).lt(THOUSAND)) {
		return amt.div(MILLION).toNumber() / dm.div(MILLION).toNumber() + '';
	}
	const k = amt.div(dm).toNumber() / 1000;
	return k + "k";
}

// graphically draw amounts array as a string to be printed in the consoles
// example: [..|.........|................|..........|...||...............|...........................|...|......]
function draw_amounts(amounts) {
	const total_amount = sum_bn(amounts);
	if(total_amount.isZero()) {
		return "[" + ".".repeat(100) + "]";
	}

	let s = "[";
	let remainder = new BN(0);
	for(let amount of amounts) {
		const skip = amount.add(remainder).muln(100).div(total_amount);
		remainder = amount.add(remainder).sub(skip.mul(total_amount).divn(100));
		if(!skip.isZero()) {
			for(let i = 0; i < skip.toNumber() - 1; i++) {
				s += ".";
			}
			s += "|";
		}
	}
	s += "]";
	return s;
}

// prints a value using "*" (asterisk) if its defined and is not zero, or using " " (whitespace) otherwise
function print_bool(bool) {
	return bool? "*": " ";
}
// prints values one by one, placing "*" (asterisk) instead of defined non-zero values
// and " " (whitespace) instead of undefined or zero values
function print_booleans(arr) {
	return arr.map(s => print_bool(s)).join("");
}

// prints a value using one of the following symbols:
// " " (zero),
// "^" (non-zero),
// "." (more than 10% of max),
// "+" (more than 50% of max),
// "*" (max),
// "!" (bigger than max)
function print_symbol(amt, max = amt) {
	// convert inputs to BNs if they are not BNs
	amt = new BN(amt);
	max = new BN(max);

	if(amt.isZero()) {
		return " ";
	}
	if(amt.eq(max)) {
		return "*";
	}
	if(amt.gt(max)) {
		return "!";
	}
	if(amt.lte(max.divn(10))) {
		return ".";
	}
	if(amt.lte(max.divn(2))) {
		return "+";
	}
	return "^";
}
// prints values one by one, placing " ", ".", "+", "*", or "!" instead of the values
function print_symbols(arr, arr_max = new Array(arr.length).fill(arr.reduce((a, v) => a.gte(v)? a: v, new BN(0)))) {
	return arr.map((r, i) => print_symbol(r, arr_max[i])).join("");
}

// export the constants
module.exports = {
	BN,
	toBN,
	isBN,
	TWO256,
	random_bn256,
	random_bn255,
	random_bn,
	sum_bn,
	print_amt,
	draw_amounts,
	print_booleans,
	print_symbols,
};
