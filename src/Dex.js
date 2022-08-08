const Web3 = require('web3')
const chalk = require('chalk')

// This class is made to only use one dex if you want to use multiple dex you need to rewrite some function
class Dex {
	constructor(info){
		this.provider = info.provider
		this.contracts = info.contracts
		this.pairs = info.pairs
		this.web3 = new Web3(this.provider)
		this.check = function(){
			this.web3.eth.net.isListening()
				.then(() => console.log('Connected to the network: SUCCESS'))
				.catch( e => console.log('Connected to the network: FAILED' + e.message))
		}
		this.map = info.map
	}
	

	rsrvRequest(contractAddress){
		let contract = new this.web3.eth.Contract(this.contracts.IPairs, contractAddress)
		return contract.methods.getReserves().call
	}

	makeRsrvRequest(calls, callFrom) {
		let batch = new this.web3.BatchRequest()
		let promises = calls.map(call => {
			return new Promise((resolve, reject) => {
				let request = call.request({from: callFrom}, (err, res) => {
					if(err) {
						reject(err)
					} else {
						resolve(res)
					}
				})
				batch.add(request)
			})
		})

		batch.execute()

		return Promise.all(promises)
	}

	findRsrv(target, token){
		let key = target + token
		let index = this.map.mpTknsIdx.get(key)
		if(target === this.pairs[index].token0.address){
			return this.pairs[index].reserve0
		} else if(target === this.pairs[index].token1.address) {
			return this.pairs[index].reserve1
		}
	}

	EA(Ra, Rb, Rb1){
		return 1000*Ra*Rb1/(1000*Rb1+997*Rb)
	}

	EB(Rb, Rb1, Rc){
		return 997*Rb*Rc/(1000*Rb1+997*Rb)
	}

	optimalInput(Ea, Eb){
		return (Math.sqrt(Ea*Eb*997*1000)-Ea*1000)/997
	}

	amountOut(input, Ea, Eb){
		return 997*input*Eb/(1000*Ea+997*input)
	}

	getP(profit){
		return parseInt(profit)/Math.pow(10, 18);
	}

	EaEb(path){
		let Ea, Eb
		let Ra, Rb, Rb1, Rc
		for(let i = 0; i < path.length; i++){
			if(i == 2){
				Ra = this.findRsrv(path[0], path[1])
				Rb = this.findRsrv(path[1], path[0])
				Rb1 = this.findRsrv(path[1], path[2])
				Rc = this.findRsrv(path[2], path[1])

				Ea = this.EA(Ra, Rb, Rb1)
				Eb = this.EB(Rb, Rb1, Rc)
			}
			else if(i > 2){
				Ra = Ea
				Rb = Eb
				Rb1 = this.findRsrv(path[i -1], path[i])
				Rc = this.findRsrv(path[i], path[i - 1])

				Ea = this.EA(Ra, Rb, Rb1)
				Eb = this.EB(Rb, Rb1, Rc)
			}
		}
		return {Ea, Eb}
	}

	svRsrv(Rsrv, Pool){
		for(let i = 0; i < Pool.length; i++){
			this.pairs[this.map.mpPoolIdx.get(Pool[i])].reserve0 = Rsrv[i].reserve0  
			this.pairs[this.map.mpPoolIdx.get(Pool[i])].reserve1 = Rsrv[i].reserve1 
		}
	}

	FindOpportunity(address){
		let paths = this.map.mpPoolPath[address]
		for(let i = 0; i < paths.length; i++){
			let {Ea, Eb} = this.EaEb(paths[i])
			//console.log(Ea, Eb)
			if(Ea && Eb && Ea < Eb){
				let possibleSwap = {}
				possibleSwap.optimalInput = this.optimalInput(Ea, Eb)
				possibleSwap.amountOut = this.amountOut(possibleSwap.optimalInput, Ea, Eb)
				possibleSwap.profit = possibleSwap.amountOut - possibleSwap.optimalInput
				possibleSwap.formatProfit = this.getP(possibleSwap.profit)
				console.log(chalk.magenta('[OPPORTUNITY]') + possibleSwap.formatProfit + 'Path :' + paths[i])
			}
		}
	} 

	async manageRequest(address, blocknumber, map){
		let request = []
		let save = []
		// je suis geekdup je monte dans l'élévateur	
		if(!map.has(address) || map.get(address) !== blocknumber){
				map.set(address, blocknumber)
				request.push(this.rsrvRequest(address))
				save.push(address)
				console.log(chalk.blue('[UPDATE RESERVE MAIN]') + ' ContractAddress: '+ address + ' BlockNumber: '+ blocknumber)
		}

		let paths = this.map.mpPoolPath[address]
	
		for(let i = 0; i < paths.length ; i++){
			for(let j = 0; j < paths[i].length - 1; j++){
				let key = paths[i][j] + paths[i][j+1]
				let pool = this.map.mpTknsPool.get(key)
				if(!map.has(pool)){
					save.push(pool)
					map.set(pool, blocknumber)
					request.push(this.rsrvRequest(pool))
					console.log(chalk.blue('[UPDATE RESERVE]') + ' ContractAddress: '+ pool + ' BlockNumber: '+ blocknumber)
				}
			}
		}

		if(request.length > 0){
			let result = await this.makeRsrvRequest(request)
			this.svRsrv(result, save)
			this.FindOpportunity(address)
		}
	}

	listenAddress(address){
		let notTwice
		let myMap = new Map()
		this.web3.eth.subscribe('logs', {address: [...address]}, (err, res) => {
			if(err) console.log(err.message)
				if(notTwice !== res.transactionHash){
					notTwice = res.transactionHash
					console.log(chalk.grey('[AN EVENT OCCURED]' + 'ContractAddress: ' + res.address + ' BlockNumber: ' + res.blockNumber))
					this.manageRequest(res.address.toLowerCase(), res.blockNumber, myMap) // return promise
				}
		})
		.on("connected", (subscribeId) => {
			console.log(subscribeId)
		})
	}
}

module.exports = {Dex}