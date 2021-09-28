// deadline (unix timestamp) which is always 5 seconds in the future (overridable)
async function default_deadline(offset = 5) {
	const block = await web3.eth.getBlock("latest");
	return block.timestamp + offset;
}

// extracts gas used from truffle/web3 transaction receipt
function extract_gas(receipt) {
	return receipt.receipt? receipt.receipt.gasUsed: receipt.gasUsed;
}

module.exports = {
	default_deadline,
	extract_gas,
}
