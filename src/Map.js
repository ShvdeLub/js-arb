const {Pairs} = require('../utils/Paths.js')

class PairsMap extends Pairs {

	mapTokensReserve(){
		let myMap = new Map()
		this.pairs.forEach(pair => {
			let key = pair.token0.address + pair.token1.address 
			let secondKey = pair.token1.address + pair.token0.address
			myMap.set(key, pair.reserve0)
			myMap.set(secondKey, pair.reserve1)
		})
		return myMap
	}

	mapTknsIdx(){
		let myMap = new Map()
		this.pairs.forEach((pair, index) => {
			let key = pair.token0.address + pair.token1.address 
			let secondKey = pair.token1.address + pair.token0.address
			myMap.set(key, index)
			myMap.set(secondKey, index)
		})
		return myMap
	}

	mapPoolPaths(){
		let obj = {}
		this.p4lgth().forEach(path => {
			this.pairs.forEach(pair => {
				if(path.includes(pair.token0.address) && path.includes(pair.token1.address)){
					if(!obj[pair.pool]){obj[pair.pool] = []}
					obj[pair.pool].push(path)
				}
			})
		})
		return obj
	}

	mapPoolIdx(){
		let myMap = new Map()
		this.pairs.forEach((pair, index) => {
			myMap.set(pair.pool,  index)
		})
		return myMap
	}

	mapTknPairsPool(){
		let myMap = new Map()
		this.pairs.forEach(pair => {
			let key = pair.token0.address + pair.token1.address
			let keyInvert = pair.token1.address + pair.token0.address
			myMap.set(key, pair.pool)
			myMap.set(keyInvert, pair.pool)
		})
		return myMap
	}

	get allMap(){
		return[
			this.mapPoolIdx(),
			this.mapPoolPaths(),
			this.mapTknPairsPool(),
			this.mapTknsIdx()
		]
	}
}

module.exports = {PairsMap}