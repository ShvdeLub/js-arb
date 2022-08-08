const fs = require('fs')
const UNIPairs = JSON.parse(fs.readFileSync('../json/uni_pairs.json', 'utf-8'))

for(let i = 0; i < UNIPairs.length; i++){
	UNIPairs[i].reserve0 = ""
	UNIPairs[i].reserve1 = ""
}

fs.writeFileSync('../json/uni_pairs.json', JSON.stringify(UNIPairs, '', 4))