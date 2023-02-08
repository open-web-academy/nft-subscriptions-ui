import React, { useCallback, useContext, useEffect, useState } from "react";
import { useWalletSelector } from "../utils/walletSelector";
import { providers, utils } from "near-api-js";
import OWA from '../assets/img/owa.png';
import Swal from 'sweetalert2';
import {
    Flex,
    Box,
    Button,
    Image,
    Center,
    Badge,
    useColorModeValue,
    Grid,
    GridItem,
    useToast
} from '@chakra-ui/react';

import {
    estimateGas,
    fromNearToEth,
    fromNearToYocto,
    fromYoctoToNear,
    getNearAccount,
    getNearContract,
    storage_byte_cost,
} from "../utils/near_interaction";

const allSubscriptions = [
    {
        id: '1mes',
        image: OWA,
        duration: '1 Mes',
        type: 'one_month'
    },
    {
        id: '6meses',
        image: OWA,
        duration: '6 Meses',
        type: 'six_months'
    },
    {
        id: '1año',
        image: OWA,
        duration: '1 Año',
        type: 'one_year'
    },
    {
        id: 'permanente',
        image: OWA,
        duration: 'Permanente',
        type: 'permanent'
    }
]

export default function BuySubscriptions() {
    const { selector, modal, accounts, accountId } = useWalletSelector();
    const [load, setLoad] = useState(false);
    const [allSuscriptionsCosts, setSuscriptionsCosts] = useState({});
    const [balanceUSDT, setBalanceUSDT] = useState();
    const backgroundColor = useColorModeValue('white', 'gray.800');
    const toast = useToast();

    useEffect(() => {
        (async () => {
            const { network } = selector.options;
            const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

            const currentURL = window.location.href;
            if(currentURL.includes("transactionHashes=")){
                toast({
                    title: 'Compra Exitosa',
                    description: 'El NFT ah sido minado.',
                    status: 'success',
                    position: 'top-right',
                    duration: 2000,
                  });
                  setTimeout(() => {
                    window.location.href = `/mysubscriptions`;
                  }, 2300);
            }
            
            const tokens = await provider.query({
                request_type: "call_function",
                account_id: process.env.REACT_APP_CONTRACT,
                method_name: "show_costs",
                args_base64: btoa(JSON.stringify({})),
                finality: "optimistic",
            });

            let suscriptionsCosts = JSON.parse(
                Buffer.from(tokens.result).toString()
            );


            const balanceUSDT = await provider.query({
                request_type: "call_function",
                account_id: process.env.REACT_APP_USDT_CONTRACT,
                method_name: "ft_balance_of",
                args_base64: btoa(JSON.stringify({ account_id: accountId})),
                finality: "optimistic",
            });

            const balance = parseInt(Buffer.from(balanceUSDT.result).toString().replace(/['"]+/g, ''));


            setTimeout(() => {
                setBalanceUSDT(balance/1000000);
                setSuscriptionsCosts(suscriptionsCosts);
            }, 100);
            setLoad(true);
        })();
    }, []);

    const getCost = (type) => {
        switch (type) {
            case '1mes':
                return parseInt(allSuscriptionsCosts.one_month_cost)/1000000;
                break;
            case '6meses':
                return parseInt(allSuscriptionsCosts.six_months_cost)/1000000;
                break;
            case '1año':
                return parseInt(allSuscriptionsCosts.one_year_cost)/1000000;
                break;
            case 'permanente':
                return parseInt(allSuscriptionsCosts.permanent_cost)/1000000;
                break;
        };
    }

    const buy = async (type,duration,subscription) => {
        const costSubscription = await getCost(type);
        if(costSubscription > balanceUSDT){
            Swal.fire({
                width: '500',
                title: 'Balance Insuficiente',
                html: "<p style='text-align:left;'><b>Suscripción:</b> "+duration+"<br/><b>Costo:</b> "+costSubscription+" USDT <br/><b>Balance:</b> "+balanceUSDT+" USDT</p>",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                position: window.innerWidth < 1024 ? 'bottom' : 'center'
              }).then(async (result) => {
                
              });
        } else {
            Swal.fire({
                width: '500',
                title: 'Suscripción a comprar: '+duration,
                text: "¿Deseas comprar esta suscripción por "+costSubscription+" USDT?",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Comprar',
                cancelButtonText: 'Cancelar',
                position: window.innerWidth < 1024 ? 'bottom' : 'center'
              }).then(async (result) => {
                if (result.isConfirmed) {
                  // Comprar y minar token (batch transaction)
                  const transactions = [];
                  let contract = await getNearContract();
                  let amount = fromNearToYocto(0.01);
                  let amountyocto = "1";
                  
                  let usdt_params = {
                      receiver_id: process.env.REACT_APP_CONTRACT,
                      amount: ""+(costSubscription*1000000),
                      msg: "",
                  };
                    
                  transactions.push({
                      signerId: accountId,
                      receiverId: process.env.REACT_APP_USDT_CONTRACT,
                      actions: [
                        {
                          type: "FunctionCall",
                          params: {
                            methodName: "ft_transfer_call",
                            args: usdt_params,
                            gas: 300000000000000,
                            deposit: amountyocto,
                          },
                        },
                      ],
                  });
      
                  let mint_params = {
                      receiver_id: accountId,
                      type_suscription: subscription
                  };
      
                  transactions.push({
                      signerId: accountId,
                      receiverId: process.env.REACT_APP_CONTRACT,
                      actions: [
                        {
                          type: "FunctionCall",
                          params: {
                            methodName: "mint",
                            args: mint_params,
                            gas: 300000000000000,
                            deposit: amount,
                          },
                        },
                      ],
                  });
                  console.log(transactions);
                  const wallet = await selector.wallet();
                  return wallet.signAndSendTransactions({ transactions })
                  .then((res) => {
                      console.log(res);
                  });
                }
              });
        }
    }

    if(load){
        return (
            <Center>
                    <Grid templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(1, 1fr)', md: 'repeat(2, 2fr)', lg: 'repeat(3, 3fr)', xl: 'repeat(3, 3fr)' }}>
                        {allSubscriptions.map((subscription,index) => (
                            <GridItem key={subscription.id}>
                                <Flex p={50} w="full" alignItems="center" justifyContent="center">
                                    <Box
                                        bg={backgroundColor}
                                        maxW="sm"
                                        borderWidth="1px"
                                        rounded="lg"
                                        shadow="lg"
                                        position="relative">
    
                                        <Image
                                            bg='white'
                                            src={subscription.image}
                                            alt={`Suscripción de ${subscription.id}`}
                                            roundedTop="lg"
                                        />
    
                                        <Box p="6" textAlign={'center'}>
                                            <Box d="flex" alignItems="baseline">
                                                <Badge rounded="full" px="2" fontSize="0.8em" colorScheme="red">
                                                    {subscription.duration}
                                                </Badge>
                                            </Box>
                                            <br />
                                            <Box d="flex" alignItems="baseline">
                                                <label>
                                                    Costo: {getCost(subscription.id)} USDT
                                                </label>
                                            </Box>
                                            <br />
                                            <Box d="flex" alignItems="baseline">
                                                <Button colorScheme='blue' onClick={async () => { buy(subscription.id,subscription.duration,subscription.type); }}>Comprar</Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Flex>
                            </GridItem>
                        ))}
                    </Grid>
                </Center> 
        )
    } 
}
