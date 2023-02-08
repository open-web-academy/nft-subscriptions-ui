import React, { useCallback, useContext, useEffect, useState } from "react";
import { map, distinctUntilChanged } from "rxjs";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { providers, utils } from "near-api-js";
import getConfig from './near';
import JSBI from 'jsbi';

import * as buffer from 'buffer';
(window).Buffer = buffer.Buffer;

const WalletSelectorContext = React.createContext(null);

export const WalletSelectorContextProvider = ({ children }) => {
    const [selector, setSelector] = useState(null);
    const [modal, setModal] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const init = useCallback(async () => {
        const _selector = await setupWalletSelector({
            network: process.env.REACT_APP_NEAR_ENV,
            debug: true,
            modules: [
                setupNearWallet(),
                setupMyNearWallet(),
                setupMeteorWallet(),
                setupHereWallet(),
                setupMathWallet(),
                setupNightly(),
            ],
        });
        const _modal = setupModal(_selector, { contractId: process.env.REACT_APP_CONTRACT });
        const state = _selector.store.getState();
        setAccounts(state.accounts);
        window.selector = _selector;
        window.modal = _modal;
        setSelector(_selector);
        setModal(_modal);
    }, []);
    useEffect(() => {
        init().catch((err) => {
            console.error(err);
            alert("Failed to initialise wallet selector");
        });
    }, [init]);
    useEffect(() => {
        if (!selector) {
            return;
        }
        const subscription = selector.store.observable
            .pipe(map((state) => state.accounts), distinctUntilChanged())
            .subscribe((nextAccounts) => {
            setAccounts(nextAccounts);
        });
        return () => subscription.unsubscribe();
    }, [selector]);
    if (!selector || !modal) {
        return null;
    }
    const accountId = accounts.find((account) => account.active)?.accountId || null;
    const logged = accounts.find((account) => account.active)?.active || false;

    return (<WalletSelectorContext.Provider value={{
            selector,
            modal,
            accounts,
            accountId,
            logged,
        }}>
      {children}
    </WalletSelectorContext.Provider>);
};

export async function getAccountBalance (accountId) {
    try {
        const nearConfig = getConfig(process.env.APP_ENV || 'development')
        const provider = new providers.JsonRpcProvider({ url: nearConfig.nodeUrl })
        const state = await provider.query({
            request_type: 'view_account',
            account_id: accountId,
            finality: 'final',
        })
        const protocolConfig = await provider.experimental_protocolConfig({
            finality: 'final',
        })
        const costPerByte = JSBI.BigInt(protocolConfig.runtime_config.storage_amount_per_byte)
        const stateStaked = JSBI.multiply(JSBI.BigInt(state.storage_usage), costPerByte)
        const staked = JSBI.BigInt(state.locked)
        const totalBalance = JSBI.add(JSBI.BigInt(state.amount), staked)
        const availableBalance = JSBI.subtract(
            totalBalance,
            JSBI.greaterThan(staked, stateStaked) ? staked : stateStaked
        )
        return {
            total: totalBalance.toString(),
            stateStaked: stateStaked.toString(),
            staked: staked.toString(),
            available: availableBalance.toString(),
        }
    } catch (error) {
        return {
            total: '0',
            stateStaked: '0',
            staked: '0',
            available: '0',
        }
    }
}

export function useWalletSelector() {
    const context = useContext(WalletSelectorContext);
    if (!context) {
        throw new Error("useWalletSelector must be used within a WalletSelectorContextProvider");
    }
    return context;
}