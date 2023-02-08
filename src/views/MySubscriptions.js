import React, {useEffect, useState } from "react";
import { useWalletSelector } from "../utils/walletSelector";
import { providers, utils } from "near-api-js";
import {
    Flex,
    Box,
    Image,
    Center,
    Badge,
    useColorModeValue,
    Grid,
    GridItem,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react';

const getDate = (timestamp) => {
    if (!timestamp) { return; }
    var newDate = new Date();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    newDate.setTime(timestamp.toString().substring(0, 13));
    return newDate.toLocaleDateString('es-ES', options);
}

const isActive = (timestamp) => {
    if (!timestamp) { return true; }
    var actualDate = new Date();
    var newDate = new Date();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    newDate.setTime(timestamp.toString().substring(0, 13));
    if(actualDate <= newDate){
        return true;
    }
    return false;
}

export default function MySubscriptions() {
    const { selector, modal, accounts, accountId } = useWalletSelector();
    const [allSubscriptions, setSubscriptions] = useState([]);
    const [load, setLoad] = useState(false);
    const backgroundColor = useColorModeValue('white', 'gray.800');

    useEffect(() => {
        (async () => {
            const { network } = selector.options;
            const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

            let params = {
                account_id: accountId,
                from_index: "" + 0,
                limit: 50
            };

            const tokens = await provider.query({
                request_type: "call_function",
                account_id: process.env.REACT_APP_CONTRACT,
                method_name: "nft_tokens_for_owner",
                args_base64: btoa(JSON.stringify(params)),
                finality: "optimistic",
            });

            let AllTokens = JSON.parse(
                Buffer.from(tokens.result).toString()
            );
            setSubscriptions(AllTokens)
            setLoad(true);
        })();
    }, []);

    if (allSubscriptions.length > 0 && load) {
        return (
            <Center>
                <Grid templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(1, 1fr)', md: 'repeat(2, 2fr)', lg: 'repeat(3, 3fr)', xl: 'repeat(3, 3fr)' }}>
                    {allSubscriptions.map((subscription) => (
                        <GridItem key={subscription.token_id}>
                            <Flex p={50} w="full" alignItems="center" justifyContent="center">
                                <Box
                                    bg={backgroundColor}
                                    maxW="sm"
                                    borderWidth="1px"
                                    rounded="lg"
                                    shadow="lg"
                                    position="relative">
                                    {isActive(subscription.metadata.expires_at) &&
                                        <Badge rounded="full" px="2" fontSize="0.8em" colorScheme="green" position="absolute" top={2} right={2} fontWeight="bold">
                                            Activo
                                        </Badge>
                                    }
                                    {!isActive(subscription.metadata.expires_at) &&
                                        <Badge rounded="full" px="2" fontSize="0.8em" colorScheme="red" position="absolute" top={2} right={2} fontWeight="bold">
                                            Inactivo
                                        </Badge>
                                    }
                                    
                                    <Image
                                        src={'https://cloudflare-ipfs.com/ipfs/' + subscription.metadata.media}
                                        alt={`Suscripción de ${subscription.owner_id}`}
                                        roundedTop="lg"
                                    />

                                    <Box p="6" textAlign={'center'}>
                                        <Box d="flex" alignItems="baseline">
                                            <Badge rounded="full" px="2" fontSize="0.8em" colorScheme="yellow" fontWeight="black">
                                                {subscription.metadata.title}
                                            </Badge>
                                        </Box>
                                        <br />
                                        <Box d="flex" alignItems="baseline">
                                            {subscription.metadata.starts_at &&
                                                <label>
                                                    <b>Fecha Inicio</b> <br />{getDate(subscription.metadata.starts_at)}
                                                </label>
                                            }  
                                        </Box>
                                        <br />
                                        <Box d="flex" alignItems="baseline">
                                            {subscription.metadata.expires_at &&
                                                <label>
                                                    <b>Fecha Fin</b> <br />{getDate(subscription.metadata.expires_at)}
                                                </label>
                                            }  
                                        </Box>

                                    </Box>
                                </Box>
                            </Flex>
                        </GridItem>
                    ))}
                </Grid>
            </Center>
        );
    } if (allSubscriptions.length == 0 && load) {
        return (
            <Alert
                status='warning'
                variant='subtle'
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                textAlign='center'
                height='200px'
                >
                <AlertIcon boxSize='40px' mr={0} />
                <AlertTitle mt={4} mb={1} fontSize='lg'>
                    No cuentas con ninguna suscripción
                </AlertTitle>
                <AlertDescription maxWidth='sm'>
                    Ve a la sección de comprar para adquirir una.
                </AlertDescription>
            </Alert>
        )
    }

}