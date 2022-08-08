class Pairs {
	constructor(pairs) {
		this.pairs = pairs.pairs
		this.main = pairs.main
		this.dex = pairs.dex
	}

	getMainPairs(){
		return this.pairs.filter(pair => pair.token0.address === this.main || pair.token1.address === this.main)
	}

	getOtherPairs(){
		return this.pairs.filter(pair => pair.token0.address !== this.main && pair.token1.address !== this.main)
	}

	getTokenOfMainPairs(){
		let tokenMainPairs = []
		let mainPairs = this.getMainPairs()
		mainPairs.forEach(pair => {
			if(pair.token0.address !== this.main){
				tokenMainPairs.push(pair.token0.address)
			} else {
				tokenMainPairs.push(pair.token1.address)
			}
		})
		return tokenMainPairs
	}

	p4lgth(){
		let paths = []
		let valid
		for(const pair of this.getOtherPairs()){
			valid = 0
			for(const token of this.getTokenOfMainPairs()){
				if([pair.token0.address, pair.token1.address].includes(token)){
					valid++
				}
				if(valid > 1){
					valid = 0
					paths.push([this.main, pair.token0.address, pair.token1.address, this.main])
					paths.push([this.main, pair.token1.address, pair.token0.address, this.main])
				}
			}
		}
		return paths
	}

	get paths(){
		let p4 = this.p4lgth()
		console.log(`Length for ${this.dex} paths is: ${p4.length}`)
		return p4
	}

	getContractAddress(){
		let contractsAddress = []
		this.pairs.forEach(pair => {
			contractsAddress.push(pair.pool)
		})
		return contractsAddress
	}
}

module.exports = {Pairs}