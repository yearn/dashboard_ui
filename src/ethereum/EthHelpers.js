import {registry, erc20, vault030, vault043, strategy,masterchef, masterchefstrat} from '../interfaces/interfaces';
//import {SpookySwapRouter, SpiritSwapRouter} from './Addresses';

import {
	Multicall
} from 'ethereum-multicall';

const {ethers} = require('ethers');

let all = [];

async function AllStrats(vault, defaultProvider){
	const multicall = new Multicall({ethersProvider: defaultProvider, tryAggregate: true});
	const contractCallContext = [
		{
			reference: 'vaultContract',
			contractAddress: vault.address.address,
			abi: vault043,
			calls: [
				{reference: 'assets', methodName: 'totalAssets', methodParameters: []},
				{reference: 'governance', methodName: 'governance', methodParameters: []},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [0]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [1]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [2]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [3]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [4]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [5]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [6]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [7]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [8]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [9]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [10]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [11]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [12]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [13]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [14]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [15]},
			]
		}
	];

	const results = await multicall.call(contractCallContext);
	let resultsArray = results.results.vaultContract.callsReturnContext;
	let res, s, gov, totalAssets;
	let strats = [];
	let con = vault.contract;
	let currentTime = Date.now()/1000;
	for(let i=0; i < resultsArray.length; i++){
		res = resultsArray[i].returnValues[0];
		if(i == 0){
			totalAssets = ethers.BigNumber.from(res);
		}
		else if(i == 1){
			gov = res;
		}
		else{
			s = res;
			if(s == '0x0000000000000000000000000000000000000000'){
				break;
			}
			strats.push(await StratInfo(con, s, defaultProvider, currentTime, totalAssets, gov));
		}
	}
	return strats;
}   

async function AllStratsFromAllVaults(vaults, defaultProvider){
	
	const multicall = new Multicall({ethersProvider: defaultProvider, tryAggregate: true});

	const contractCallContext =  vaults.map(vault => (
		{
			reference: vault.address,
			contractAddress: vault.address,
			abi: vault043,
			calls: [
				{reference: 'assets', methodName: 'totalAssets', methodParameters: []},
				{reference: 'governance', methodName: 'governance', methodParameters: []},
				{reference: 'debt', methodName: 'totalDebt', methodParameters: []},
				{reference: 'version', methodName: 'apiVersion', methodParameters: []},
				{reference: 'decimals', methodName: 'decimals', methodParameters: []},
				{reference: 'debtRatio', methodName: 'debtRatio', methodParameters: []},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [0]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [1]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [2]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [3]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [4]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [5]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [6]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [7]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [8]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [9]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [10]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [11]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [12]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [13]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [14]},
				{reference: 'queue', methodName: 'withdrawalQueue', methodParameters: [15]},
			]
		}));
	
	// console.log(contractCallContext);
	let results;
	if(defaultProvider.network.chainId === 1){
		console.log('sas');
	}

	const prom = multicall.call(contractCallContext);

	results= await prom;
	
	if(defaultProvider.network.chainId === 1){
		console.log('sas');
	}
	
	// console.log(results);
	// console.log(resultsArray);
	// let res, s, gov, totalAssets;
	let vaults_enlarged = [];


	let all_strats = [];
	

	vaults.forEach(vault => {
		let strats = [];
		let resultsArray = results.results[vault.address].callsReturnContext;
		let res, s, gov, totalAssets, totalDebt, decimals, version, debtRatio;
		// console.log(resultsArray);
		for(let i=0; i < resultsArray.length; i++){
			res = resultsArray[i].returnValues[0];
			if(!res){
				continue;
			}
			if(i == 0){
				totalAssets = ethers.BigNumber.from(res);
			}
			else if(i == 1){
				gov = res;
			}
			else if(i == 2){
				totalDebt = ethers.BigNumber.from(res);
			}
			else if(i == 3){
				version = res;
			}
			else if(i == 4){
				decimals = ethers.BigNumber.from(res).toNumber();
			}
			else if(i == 5){
				
				debtRatio = ethers.BigNumber.from(res).toNumber();
			}
			else{
				s = res;
				if(s == '0x0000000000000000000000000000000000000000'){
					break;
				}
				strats.push(s);
				all_strats.push(s);
			}
		}
		vaults_enlarged.push({
			name: vault.name,
			address: vault.address,
			chainId: defaultProvider.network.chainId,
			totalAssets: totalAssets,
			totalDebt: totalDebt,
			version: version,
			decimals: decimals,
			debtRatio: debtRatio,
			gov: gov,
			strats: strats
		});
		
	});

	// need to split into smaller pieces. too big!
	var size = 100; 
	var arrayOfArrays = [];
	for (var i=0; i<vaults_enlarged.length; i+=size) {
		arrayOfArrays.push(vaults_enlarged.slice(i,i+size));
	}

	for( let arr of arrayOfArrays){
		const contractCallContextStrats =  arr.map(vault => {
			// console.log('length of strats:', vault.strats.length);
			return {
				reference: vault.address,
				contractAddress: vault.address,
				abi: vault.version.includes('0.3.0') | vault.version.includes('0.3.1') ? vault030: vault043,
				calls: vault.strats.map(strat => ({reference: 'strategies', methodName: 'strategies', methodParameters: [strat]}))
				
			};}
		);
		// console.log(contractCallContextStrats);
		const results2 = await multicall.call(contractCallContextStrats);
		//console.log(results2);

		for( let v of vaults_enlarged){
			let x = results2.results[v.address];
			if(x != undefined){
				v.strats_detailed = x.callsReturnContext.map(ret => (StrategiesDecode(ret.methodParameters[0],v, ret.returnValues)));
			}
			
		}
	}

	
	const contractCallContextAllStrats =  all_strats.map(strat => {
		// console.log('length of strats:', vault.strats.length);
		return {
			reference: strat,
			contractAddress: strat,
			abi: strategy,
			calls: [
				{reference: 'name', methodName: 'name', methodParameters: []},
			]
		};}
	);
	// console.log(contractCallContextStrats);
	const results3 = await multicall.call(contractCallContextAllStrats);
	//console.log(results2);

	for( let v of vaults_enlarged){
		if(v.strats_detailed){
			for ( let s of v.strats_detailed){
				let x = results3.results[s.address];
				if(x != undefined){
					s.name = x.callsReturnContext[0].returnValues[0];
				}
			}
		}
		
		
	}
	

	// console.log('length of vaults:', vaults_enlarged.length);

	
	

	
	



	// let con = vault.contract;
	// let currentTime = Date.now()/1000;
	// for(let j=0; j < results.length; j++){
	// 	let resultsArray = results[j];
	// 	for(let i =0; i< resultsArray)
	//     res = resultsArray[i].returnValues[0];
	// 	if(i == 0){
	// 		totalAssets = ethers.BigNumber.from(res);
	// 	}
	// 	else if(i == 1){
	// 		gov = res;
	// 	}
	// 	else{
	// 		s = res;
	// 		if(s == '0x0000000000000000000000000000000000000000'){
	// 			break;
	// 		}
	// 		strats.push(await StratInfo(con, s, defaultProvider, currentTime, totalAssets, gov));
	// 	}
	// }
	return vaults_enlarged;
}

async function GetMasterchef(strats, provider, allV){
    

	let masterChefs = [];
	for(let i =0; i< strats.length; i++){
		if(allV.length == 0){
			masterChefs.push(await Masterchefinfo(strats[i], provider));
		}else{
			masterChefs[i] = await Masterchefinfo(strats[i], provider, masterChefs[i]);
		}

	}

	return masterChefs;
}  

async function Masterchefinfo(strat, provider, filled){
	let s = new ethers.Contract(strat, masterchefstrat, provider);
	let name = '';
	if(strat != '0x32aC76a38027C95662d727aee9D9Bb3028197ba7'){
		name = await s.name();
	}else{
		name = 'Scarface USDC Masterchef';
	}
	// console.log(name);
	// console.log(filled);

	let masterchef = await masterchefContract(await s.masterchef(), provider, filled);
	let pid = await s.pid();
	let emissionToken = await Erc20Info(await s.emissionToken(), provider);
	let vault =  new ethers.Contract(await s.vault(), vault043, provider);
	let token = await Erc20Info(await vault.token(), provider);

	let currentDeposits = await s.balanceOfStaked();

	let totalMasterChefDeposits = await (token.contract).balanceOf(masterchef.address);
	let price = 0;
	if(provider.network.chainId === 250){
		//fantom
		//let router = new ethers.Contract(SpookySwapRouter(), univ2router, provider);
		try{
			if( await s.useSpiritPartOne()){
				//router = new ethers.Contract(SpiritSwapRouter(), univ2router, provider);
			}
		}catch{
			//do nothing
		}
		//price = router.getAmountsOut(1 * 10 ** emissionToken.decimals, [emissionToken.address, token.address] );


        
	}

	return {
		name: name,
		url: GetUrl(strat, provider),
		address: strat,
		contract: s,
		masterchef: masterchef,
		pid: pid,
		wantToken: token,
		emissionToken: emissionToken,
		currentDeposits: currentDeposits / (10 ** token.decimals),
		totalMasterChefDeposits: totalMasterChefDeposits / (10 ** token.decimals),
		price: price

	};
    
}




// eslint-disable-next-line no-unused-vars
async function AllRegistered(provider){
	const regist = Registry( provider);
	const vaults = [];
	const numTokens = await regist.numTokens();
	for (let i = 0; i < numTokens; i++){
		const token = await regist.tokens(i);
		for(let j = 0; j <20 ; j++){
           
			const vault = await regist.vaults(token, j);
			if(vault == '0x0000000000000000000000000000000000000000'){
				break;
			}
			let s = new ethers.Contract(vault, vault043, provider);
			const version = await s.apiVersion();
			const name = await s.name();
			console.log(vault);
			vaults.push({
				address: vault,
				name: name,
				want: token,
				version: version,
				chain: provider.network.chainId
			});
		}
		
	}
	return vaults;
}


async function AllVaults(vaultAddresses, defaultProvider){
	// console.log(vaultAddresses);

	if(all.length >0){
		//console.log('hit all ' +all.length)  
		return all;
	}

	// eslint-disable-next-line no-unused-vars
	return await GetVaultInfo(vaultAddresses, defaultProvider);


	//let walletWithProvider = new ethers.Wallet(privateKey, tenderlyProvider);

	// eslint-disable-next-line no-unused-vars
	//const dai = Dai(walletWithProvider)
	//console.log(await dai.balanceOf('0x6B175474E89094C44Da98b954EedeAC495271d0F'));

	/*await dai.approve('0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', 100, {
        gasLimit: 0, gasPrice:0
    })*/
    
    
    
	// const vaults = [];

	// //console.log(numTokens)
	// /*for (let i = 0; i < numTokens; i++){
	//     /*for(let j = 0; j <20 ; j++){
	//         const token = await regist.tokens(i)
           
	//         const vault = await regist.vaults(token, j)
	//         if(vault == '0x0000000000000000000000000000000000000000'){
	//             break;
	//         }
	//         console.log(vault)
	//         let vaultData = await GetVaultInfo(vault, defaultProvider)
	//         vaults.push(vaultData)
	//     }/
	//     const token = await regist.tokens(i)
	//     const vault = await regist.latestVault(token)
	//     console.log(vault)
	//     let vaultData = await GetVaultInfo(vault, defaultProvider)
	//     vaults.push(vaultData)

        
	// }*/
	// console.log(vaultAddresses);
	// for(let v of vaultAddresses){
	// 	console.log(v);
	// 	let vaultData = await GetVaultInfo(v, defaultProvider);
	// 	vaults.push(vaultData);
	// }

	// all = vaults;
    
	// //console.log(all.length)  
	// return all;

}

async function GetVaultContract(vault, provider){
	let s = new ethers.Contract(vault, vault043, provider);
	let version = await s.apiVersion();
	if( version.includes('0.3.0') || version.includes('0.3.1')){
		s = new ethers.Contract(vault, vault030, provider);
	}
	return s;
}

async function GetBasicVault(address, provider){
	let s = await GetVaultContract(address, provider);
	console.log(s);
	let name = await s.name();
	//console.log(totalAssets)
	//console.log(totalDebt)

	return {
		address: address,
		name: name,
		contract: s
	};
    
}
async function GetBasicStrat(address, provider){
	let s = new ethers.Contract(address, strategy, provider);
	console.log(s);
	let name = await s.name();
	//console.log(totalAssets)
	//console.log(totalDebt)

	return {
		address: address,
		name: name,
		contract: s
	};
    
}
async function GetVaultInfo(vault, provider){
	let s = await GetVaultContract(vault.address, provider);
	console.log(s);
	let name = await s.name();
	let debtRatio = await s.debtRatio();
	let token = await Erc20Info(vault.want, provider);
	let totalAssets = await s.totalAssets();
	let totalDebt = await s.totalDebt();
	//console.log(totalAssets)
	//console.log(totalDebt)

	return {
		name: name,
		contract: s,
		address: vault,
		version: vault.version,
		debtRatio: debtRatio,
		token: token,
		totalAssets: totalAssets,
		totalDebt: totalDebt,
		chainId: provider.network.chainId
	};
    
}

function StrategiesDecode(strat, vault, strategies_return){
	// console.log(strategies_return);

	if(vault.version.includes('0.3.0') | vault.version.includes('0.3.1')){
		return {
			address: strat,
			performanceFee: ethers.BigNumber.from(strategies_return[0]), 
			activation: ethers.BigNumber.from(strategies_return[1]), 
			debtRatio: ethers.BigNumber.from(strategies_return[2]), 
			rateLimit: ethers.BigNumber.from(strategies_return[3]), 
			lastReport: ethers.BigNumber.from(strategies_return[4]), 
			totalDebt: ethers.BigNumber.from(strategies_return[5]), 
			totalGain: ethers.BigNumber.from(strategies_return[6]), 
			totalLoss: ethers.BigNumber.from(strategies_return[7])
			
	
		};
	}else{
		return {
			address: strat,
			performanceFee: ethers.BigNumber.from(strategies_return[0]), 
			activation: ethers.BigNumber.from(strategies_return[1]), 
			debtRatio: ethers.BigNumber.from(strategies_return[2]), 
			minDebtPerHarvest: ethers.BigNumber.from(strategies_return[3]), 
			maxDebtPerHarvest: ethers.BigNumber.from(strategies_return[4]), 
			lastReport: ethers.BigNumber.from(strategies_return[5]), 
			totalDebt: ethers.BigNumber.from(strategies_return[6]), 
			totalGain: ethers.BigNumber.from(strategies_return[7]), 
			totalLoss: ethers.BigNumber.from(strategies_return[8])
			
	
		};
	}

	
	
    
}

async function StratInfo(vault, strat, provider, currentTime, totalAssets, gov){

	let s = new ethers.Contract(strat, strategy, provider);
	let params = await vault.strategies(strat);
	//console.log(params)
	// console.log('beforedebt: ', params.totalDebt/totalAssets);
	let genlender = false;
	let delegated = 0;
	try{
		delegated = await s.delegatedAssets();
	}catch(ex){
		//nothing
	}
	

    
	let name = await s.name();
	if(name.includes('StrategyLenderYieldOptimiser')){


		let status = await s.lendStatuses();
		console.log(status);



		genlender = status;
	}
	return {
		name: name,
		contract: s,
		address: strat,
		delegatedAssets: delegated,
		beforeDebt: params.totalDebt,
		beforeGain: params.totalGain,
		beforeLoss: params.totalLoss,
		debtRatio: params.debtRatio,
		lastTime: (currentTime- params.lastReport)/60/60,
		vaultAssets: totalAssets,
		governance: gov,
		genlender: genlender
	};
    
}
async function GetBalances(tokens, user, provider){

	let result = [];

	for(let token of tokens ){
		let s = await Erc20Info(token,provider);

		
		let balance = await s.contract.balanceOf(user);
		
		result.push({
			token: s,
			balance: balance / (10 ** s.decimals)
		});


		

	}

	return result;
	
    
}

async function Erc20Info(token, provider){
	let s = new ethers.Contract(token, erc20, provider);
	//console.log(params)
	let decimals = await s.decimals();
	console.log(provider);
    
	let name = await s.name();
	return {
		name: name,
		contract: s,
		address: token,
		decimals: decimals,
		url: GetUrl(token, provider),
		dexScreener: GetDexScreener(token, provider)
        
	};
    
}
async function GetCurrentBlock(provider){

	let block = await provider.getBlockNumber();
	return await provider.getBlock(block);
    
}

function GetUrl(address, provider){

	if(provider.network.chainId === 250){
		return 'https://ftmscan.com/address/' + address;
	}

	return 'https://etherscan.io/address/' + address;
    
}
function GetDexScreener(address, provider){

	if(provider.network.chainId === 250){
		return 'https://dexscreener.com/fantom/' + address;
	}

	return 'https://dexscreener.com/ethereum/' + address;
    
}

async function masterchefContract(address, provider, masterchefContract){
	let letToReturn = masterchefContract;

	let currentTime = Date.now()/1000;
	
	if(!letToReturn){
		console.log('entered');
		letToReturn = {};
		letToReturn.contract = new ethers.Contract(address, masterchef, provider);
		try{
			letToReturn.endTime = await letToReturn.contract.poolEndTime(); 
		} catch{
			letToReturn.endTime = await letToReturn.contract.endTime(); 
		}
		letToReturn.url = GetUrl(address, provider);
		letToReturn.address = address;
	}

	letToReturn.timeLeft = letToReturn.endTime > currentTime ?  (letToReturn.endTime-currentTime)/60/60 : 0;
	
    
    
	return letToReturn;
    
}




function Registry(provider){
	console.log('registering network', provider.network.name);

	if(provider._network.chainId == 250){
		return new ethers.Contract('0x727fe1759430df13655ddb0731dE0D0FDE929b04', registry, provider);
	}
	return new ethers.Contract('0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804', registry, provider);
	//return new ethers.Contract('0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', registry, provider);
    
}

// eslint-disable-next-line no-unused-vars
function Strategy(strat, provider){
	console.log('registering strat');
	return new ethers.Contract(strat, strategy, provider);
    
}
// eslint-disable-next-line no-unused-vars
function Dai(provider){
	console.log('registering Dai');
	return new ethers.Contract('0x6B175474E89094C44Da98b954EedeAC495271d0F', erc20, provider);
	//return new ethers.Contract('0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', registry, provider);
    
}

export {AllVaults,GetDexScreener, AllStratsFromAllVaults, GetBalances, GetCurrentBlock, GetBasicStrat, GetBasicVault, GetVaultContract, AllRegistered, AllStrats, StratInfo, Erc20Info, GetMasterchef};
