import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import api from '../services/api';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(!!localStorage.getItem('token'));
    const [chainId, setChainId] = useState(null);

    useEffect(() => {
        if (token) {
            fetchProfile();
        }

        // Auto-reconnect wallet if already authorized
        const checkConnection = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        await connectWallet();
                    }
                } catch (err) {
                    console.error("Connection check failed", err);
                }
            }
        };
        checkConnection();

        // Listen for account/chain changes
        if (window.ethereum) {
            const handleAccounts = (accounts) => {
                if (accounts.length > 0) connectWallet();
                else logout();
            };
            const handleChain = () => window.location.reload();

            window.ethereum.on('accountsChanged', handleAccounts);
            window.ethereum.on('chainChanged', handleChain);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccounts);
                window.ethereum.removeListener('chainChanged', handleChain);
            };
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/api/auth/me');
            setUser(res.data);
            setAccount(res.data.address);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    const switchNetwork = async () => {
        if (!window.ethereum) return;
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // 11155111 in hex (Sepolia)
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xaa36a7',
                            chainName: 'Sepolia Test Network',
                            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
                            rpcUrls: ['https://ethereum-sepolia.core.chainstack.com/91bdf46e33094e4e848bb12abca704af'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io'],
                        }],
                    });
                } catch (addError) {
                    console.error("Failed to add network", addError);
                }
            }
        }
    };

    const login = async () => {
        const { account: addr, signer: sig } = await connectWallet();
        if (!addr) return;

        try {
            const nonceRes = await api.post('/api/auth/nonce');
            const nonce = nonceRes.data.nonce;
            const signature = await sig.signMessage(nonce);

            const loginRes = await api.post('/api/auth/login', {
                address: addr,
                signature,
                nonce
            });

            localStorage.setItem('token', loginRes.data.token);
            setToken(loginRes.data.token);
            setUser(loginRes.data.user);
            return loginRes.data.user;
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setAccount(null);
        setSigner(null);
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                const _signer = await _provider.getSigner();
                const _account = await _signer.getAddress();

                const network = await _provider.getNetwork();
                setChainId(network.chainId);

                if (network.chainId !== 11155111n) {
                    console.warn("ATTENTION: MetaMask est sur le mauvais réseau! Chain ID attendu: 11155111 (Sepolia), Actuel:", network.chainId.toString());
                }

                setProvider(_provider);
                setSigner(_signer);
                setAccount(_account);

                return { account: _account, signer: _signer };
            } catch (error) {
                console.error("Wallet connection failed:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    return (
        <Web3Context.Provider value={{ account, provider, signer, user, token, chainId, connectWallet, login, logout, switchNetwork }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => useContext(Web3Context);
