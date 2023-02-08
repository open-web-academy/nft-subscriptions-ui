import {
  keyStores,
  connect,
  WalletConnection,
  Contract,
  utils,
} from "near-api-js";
import axios from "axios";

export const storage_byte_cost = 10000000000000000000;
export const contract_name =process.env.REACT_APP_CONTRACT;
export const config = {
  testnet: {
    networkId: "testnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  },

  mainnet: {
    networkId: "mainnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://wallet.near.org",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://explorer.near.org",
  },
};
//son los metodos que tenemos en el smart contract
export const methodOptions = {
  viewMethods: [
    "nft_tokens",
    "nft_tokens_for_owner",
    "show_costs",
    "ft_balance_of"
  ],
  changeMethods: [
    "ft_transfer_call",
    "mint"
  ],
};
/**
 *hacemos el signIn con near
 */
export async function nearSignIn(URL) {
  (process.env.REACT_APP_NEAR_ENV == "mainnet" ? window.near = await connect(config.mainnet) : window.near = await connect(config.testnet))
  //window.near = await connect(config.testnet);
  window.wallet = new WalletConnection(window.near, "latina");
  window.wallet.requestSignIn(
    contract_name, // contract requesting access
    "Latin-Art", // optional,
    URL, //EXITO
    URL // FRACASO
  );
}

export async function isNearReady() {
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  //const near = await connect(config.testnet);

  // crear una wallet
  const wallet = new WalletConnection(near);
  //esta logueado ?
  return wallet.isSignedIn();
}

/**
 * nos regresa una instancia del contrato
 */
export async function getNearContract() {
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) :  await connect(config.testnet))
  //const near = await connect(config.testnet);

  // crear una wallet de
  const wallet = new WalletConnection(near);
  return new Contract(
    wallet.account(), // the account object that is connecting
    contract_name,
    {
      ...methodOptions,
      sender: wallet.account(), // account object to initialize and sign transactions.
    }
  );
}
/**
 * convierte de nears a yoctos
 *
 * */
export function fromNearToYocto(near) {
  //console.log(utils.format.parseNearAmount(near.toString()));
  return utils.format.parseNearAmount(near.toString());
}
/**
 *
 *
 * convierte de yocto a near
 */
export function fromYoctoToNear(yocto) {
  return utils.format.formatNearAmount(yocto.toString());
}
/**
 * con esta funcion obtenemos el accountid de la cartera
 * */
export async function getNearAccount() {
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  //const near = await connect(config.testnet);

  // crear una wallet de
  const wallet = new WalletConnection(near);

  return wallet.getAccountId();
}

export async function signOut() {
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  //const near = await connect(config.testnet);

  // crear una wallet de
  const wallet = new WalletConnection(near);
  wallet.signOut();
}

export async function ext_call(contract,method,args,gas,amount){
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  // crear una wallet de NEAR
  const wallet = new WalletConnection(near);
  //Realizar la ejecucion de la llamada
  const result = await wallet.account().functionCall(contract, method, args, gas, amount)
  console.log(result)
}

export async function ext_view(contract,method,args){
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  // crear una wallet de NEAR
  const wallet = new WalletConnection(near);
  //Realizar la ejecucion de la llamada
  const result = await wallet.account().viewFunction(contract,method,args)
  return result
}



export async function getNFTContractsByAccount(accountId) {
    const test = process.env.REACT_APP_NEAR_ENV === "mainnet" ? "" : "testnet-";
    const serviceUrl = `https://${test}api.kitwallet.app/account/${accountId}/likelyNFTs`;
    try {
      const result = await axios.get(serviceUrl);
      return result.data;
      } catch(e){
        console.log('err',e);
        return [];
      }
}

export async function getNFTByContract(contract_id, owner_account_id) {
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  const wallet = new WalletConnection(near);
  try {
    const contract = new Contract(wallet.account(), contract_id, {
      viewMethods: ["nft_tokens_for_owner"],
      sender: wallet.account(),
    });

    const result = await contract.nft_tokens_for_owner({
      account_id: owner_account_id,
    });
    return result;
  } catch (err) {
    console.log("err", contract_id);
    return [];
  }
}

export async function getNFTById(nft_contract_id, nft_id,owner_account_id) {
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  const wallet = new WalletConnection(near);
  const contract = new Contract(wallet.account(), nft_contract_id, {
    viewMethods: ["nft_token"],
    sender: wallet.account(),
  });

  const params = { token_id: nft_id, account_id: owner_account_id };

  try {
    let result = await contract.nft_token(params);

    return result;
  } catch (err) {
    console.log("err on getting ID on this contract", nft_contract_id);
    return [];
  }
}