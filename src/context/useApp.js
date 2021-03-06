import axios from 'axios';
import React, {createContext, useContext, useEffect, useState} from 'react';
import useLocalStorage from 'use-local-storage';
import useRpcProvider from './useRpcProvider';
import {AllStratsFromAllVaults} from  '../ethereum/EthHelpers';

const	AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({children}) => {
	const {defaultProvider, fantomProvider} = useRpcProvider();
	const [loading, setLoading] = useState(false);
	const [vaults, setVaults] = useState([]);
	const [strats, setStrats] = useState([]);
	const [favoriteVaults, setFavoriteVaults] = useLocalStorage('favoriteVaults', []);
	const [favoriteStrategies, setFavoriteStrategies] = useLocalStorage('favoriteStrategies', []);
	const [darkMode, setDarkMode] = useLocalStorage('darkMode', null);

	useEffect(() => {
		const providers = [defaultProvider, fantomProvider];
		if(providers.every(p => p)) {
			setLoading(true);
			const fetches = providers.map(p => { return axios.post('/api/getVaults/AllVaults', p.network); });
			Promise.all(fetches).then(results => {
				const freshVaults = [];
				providers.forEach((provider, index) => {
					freshVaults.push(...results[index].data.map(v => { 
						return {...v, provider};
					}));
				});
				
				AllStratsFromAllVaults(freshVaults.filter(v => v.provider.network.name === 'ethereum'), providers[0]).then(x => {
					setStrats(oldArray => [...oldArray, ...x]);
				});
				AllStratsFromAllVaults(freshVaults.filter(v => v.provider.network.name === 'fantom'), providers[1]).then(x => {
					setStrats(oldArray => [...oldArray, ...x]);
				});
	
				setVaults(freshVaults);
				setLoading(false);
			});
		}
	}, [defaultProvider, fantomProvider]);

	useEffect(() => {
		if(darkMode === null) {
			setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
	}, [darkMode, setDarkMode]);

	return <AppContext.Provider value={{
		loading,
		vaults,
		strats,
		favorites: {
			vaults: favoriteVaults,
			setVaults: setFavoriteVaults,
			strategies: favoriteStrategies,
			setStrategies: setFavoriteStrategies
		},
		darkMode, 
		setDarkMode
	}}>{children}</AppContext.Provider>;
};