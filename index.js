const fs = require('fs')
const UNIPairs = JSON.parse(fs.readFileSync('./json/uni_pairs.json', 'utf-8'))
const IUniswapPairs = JSON.parse(fs.readFileSync('./contracts/IUniswapV2Pair.json', 'utf-8'))
const IUniswapRouter = JSON.parse(fs.readFileSync('./contracts/IUniswapV2Router.json', 'utf-8'))
const {PairsMap} = require('./src/Map.js')
const {Dex} = require('./src/Dex.js')
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

function formatContracts(Pairs, Router){
	return {
		IPairs: Pairs.abi,
		IRouter: Router.abi
	}
}

const uniswap = new PairsMap({ // Works
	pairs: UNIPairs,
	main: WETH,
	dex: 'uniswap'
})

let [mpUniPoolIdx, mpUniPoolPaths, mpUniTknsPool, mpUniTknsIdx] = uniswap.allMap // 1 mapPool to Index in Pairs // 2 mapPool to all the paths

let dexParams = {
	provider: 'wss://mainnet.infura.io/ws/v3/27a58e0dce834afc9f0fade1d97fde17',
	contracts: formatContracts(IUniswapPairs, IUniswapRouter),
	pairs: uniswap.pairs,
	map: {
		mpPoolPath : mpUniPoolPaths,
		mpPoolIdx : mpUniPoolIdx,
		mpTknsPool : mpUniTknsPool,
		mpTknsIdx : mpUniTknsIdx
	}
}

const dexUniswap = new Dex(dexParams)
const contractsAddressSub = Object.keys(mpUniPoolPaths)

/*let test = [
	dexUniswap.rsrvRequest(contractsAddressSub[0]),
	dexUniswap.rsrvRequest(contractsAddressSub[1])
]
*/

dexUniswap.listenAddress(contractsAddressSub)

/*dexUniswap.makeRsrvRequest(test).then(res => console.log(res['0'].reserve0))*/