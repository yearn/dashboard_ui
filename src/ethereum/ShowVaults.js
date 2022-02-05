import { useState } from "react";
import {AllVaults} from  "../ethereum/EthHelpers"

import useRPCProvider from '../context/useRpcProvider'
import { render } from "@testing-library/react";
import SingleVaultPage from "../pages/SingleVault";
const { ethers } = require("ethers");


function ShowVault() {
    const {tenderlyProvider, initProvider, setupTenderly} = useRPCProvider();

    let [allV, setAllv] = useState([])
    let [singleVault, setSingleVault] = useState(null)

    AllVaults().then(v => { setAllv(v)})

    tenderlyProvider
    .getBlockNumber()
    .then((response) => {
        console.log(response);
      return response;
      
    })
    .then((data) => {
      console.log(data);
    });

    if(allV.length ==0){
      return(
        <div>loading...</div>
    )
    }
  
    if(singleVault != null){
      return(
        <div><div><SingleVaultPage value={singleVault} /></div>
        <div><button  onClick={() => setSingleVault(null)}>Close {singleVault.name} - {singleVault.version} - {singleVault.address}</button></div></div>
    )
    }

    const listItems = allV.map((vault) =>
    <div><button  onClick={() => setSingleVault(vault)}> {vault.name} - {vault.version} - {vault.address}</button></div>
  );



    return(
        <div>{listItems}</div>
    )

}

export default ShowVault;