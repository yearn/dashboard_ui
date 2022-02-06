import useRPCProvider from '../context/useRpcProvider'
import {registry, erc20, vault030, vault043, strategy} from '../interfaces/interfaces';
const { ethers } = require("ethers");


let all = []
let strats = []


async function AllStrats(vault){
    
    const {defaultProvider} = useRPCProvider();
    if(strats.length >0){
        console.log("hit all " +strats.length)  
        return strats;
    }
    let currentTime = Date.now()/1000
    

    

    console.log("received ", vault)
    let con = vault.value.contract
    let totalAssets = await con.totalAssets()
    let gov = await con.governance()
    console.log("gov is", gov)


    for(let i = 0; i <20 ; i++){
        const s = await con.withdrawalQueue(i)
        if(s == '0x0000000000000000000000000000000000000000'){
            break;
        }
        strats.push(await StratInfo(con, s, defaultProvider, currentTime, totalAssets, gov))
    }

    return strats
    


}   


async function AllVaults(){

    const {defaultProvider} = useRPCProvider();
    if(all.length >0){
        console.log("hit all " +all.length)  
        return all;
    }

    let privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";

    let selectVaults = ["0xdA816459F1AB5631232FE5e97a05BBBb94970c95"]


    //let walletWithProvider = new ethers.Wallet(privateKey, tenderlyProvider);

    const regist = Registry( defaultProvider);
    //const dai = Dai(walletWithProvider)
    //console.log(await dai.balanceOf("0x6B175474E89094C44Da98b954EedeAC495271d0F"));

    /*await dai.approve("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", 100, {
        gasLimit: 0, gasPrice:0
    })*/
    
    
    console.log(regist);
    await regist.tokens(0)
    const vaults = [];

    const numTokens = await regist.numTokens();
    console.log(numTokens)
    /*for (let i = 0; i < numTokens; i++){
        /*for(let j = 0; j <20 ; j++){
            const token = await regist.tokens(i)
           
            const vault = await regist.vaults(token, j)
            if(vault == '0x0000000000000000000000000000000000000000'){
                break;
            }
            console.log(vault)
            let vaultData = await GetVaultInfo(vault, defaultProvider)
            vaults.push(vaultData)
        }/
        const token = await regist.tokens(i)
        const vault = await regist.latestVault(token)
        console.log(vault)
        let vaultData = await GetVaultInfo(vault, defaultProvider)
        vaults.push(vaultData)

        
    }*/
    for(let v of selectVaults){
        let vaultData = await GetVaultInfo(v, defaultProvider)
        vaults.push(vaultData)
    }

    all = vaults
    
    console.log(all.length)  
    return all

}

async function GetVaultInfo(vault, provider){
    let s = new ethers.Contract(vault, vault043, provider);
    let version = await s.apiVersion()
    if( version.includes("0.3.0") || version.includes("0.3.1")){
        s = new ethers.Contract(vault, vault030, provider);
    }
    let name = await s.name()

    return {
        name: name,
        contract: s,
        address: vault,
        version: version
    }
    
}

async function StratInfo(vault, strat, provider, currentTime, totalAssets, gov){
    let s = new ethers.Contract(strat, strategy, provider);
    let params = await vault.strategies(strat)
    //console.log(params)
    
    let name = await s.name()
    return {
        name: name,
        contract: s,
        address: strat,
        beforeDebt: params.totalDebt,
        beforeGain: params.totalGain,
        beforeLoss: params.totalLoss,
        debtRatio: params.debtRatio,
        lastTime: (currentTime- params.lastReport)/60/60,
        vaultAssets: totalAssets,
        governance: gov
    }
    
}

function Registry(provider){
    console.log("registering registry")
    return new ethers.Contract("0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804", registry, provider);
    //return new ethers.Contract("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", registry, provider);
    
}

function Strategy(strat, provider){
    console.log("registering strat")
    return new ethers.Contract(strat, strategy, provider);
    
}
function Dai(provider){
    console.log("registering Dai")
    return new ethers.Contract("0x6B175474E89094C44Da98b954EedeAC495271d0F", erc20, provider);
    //return new ethers.Contract("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", registry, provider);
    
}

export {AllVaults, AllStrats}